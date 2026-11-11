import { test, expect } from '@playwright/test';
import { MailEngine } from '../src/simulation/mailEngine';

test.describe('Email & Phishing Simulation Engine (MailEngine)', () => {
  let engine: MailEngine;

  test.beforeEach(() => {
    engine = new MailEngine();
  });

  test('Listing emails and verifying initial seeds', async () => {
    const allEmails = engine.getEmails();
    expect(allEmails).toHaveLength(4);

    const emailIds = allEmails.map((e) => e.id);
    expect(emailIds).toEqual(['MSG-101', 'MSG-102', 'MSG-103', 'MSG-104']);

    // Check inbox initial state
    const inboxEmails = engine.getEmails('inbox');
    expect(inboxEmails).toHaveLength(4);

    const quarantineEmails = engine.getEmails('quarantine');
    expect(quarantineEmails).toHaveLength(0);

    // Verify MSG-101 (Finance forwarded phishing)
    const msg101 = engine.getEmail('MSG-101');
    expect(msg101).toBeDefined();
    expect(msg101?.subject).toBe('URGENT: Outstanding Vendor Invoice #9841');
    expect(msg101?.from).toBe('billing@partner-corp.com');
    expect(msg101?.originatingIp).toBe('198.51.100.44');
    expect(msg101?.spfStatus).toBe('fail');
    expect(msg101?.dkimStatus).toBe('neutral');
    expect(msg101?.isPhishing).toBe(true);
    expect(msg101?.attachments).toHaveLength(1);
    expect(msg101?.attachments[0].filename).toBe('invoice_march.xlsm');
    expect(msg101?.attachments[0].isMalicious).toBe(true);

    // Verify MSG-102 (CEO Fraud)
    const msg102 = engine.getEmail('MSG-102');
    expect(msg102).toBeDefined();
    expect(msg102?.subject).toBe('Quick request from mobile - buy Apple gift cards');
    expect(msg102?.from).toBe('ceo-direct@exec-corp.net');
    expect(msg102?.spfStatus).toBe('fail');
    expect(msg102?.isPhishing).toBe(true);

    // Verify MSG-103 (Legitimate HR Announcement)
    const msg103 = engine.getEmail('MSG-103');
    expect(msg103).toBeDefined();
    expect(msg103?.subject).toBe('Annual Health Insurance Open Enrollment');
    expect(msg103?.from).toBe('hr@corp.local');
    expect(msg103?.originatingIp).toBe('192.168.20.50');
    expect(msg103?.spfStatus).toBe('pass');
    expect(msg103?.dkimStatus).toBe('pass');
    expect(msg103?.isPhishing).toBe(false);

    // Verify MSG-104 (Legitimate IT Infrastructure Notification)
    const msg104 = engine.getEmail('MSG-104');
    expect(msg104).toBeDefined();
    expect(msg104?.subject).toBe('Scheduled Datacenter Maintenance This Weekend');
    expect(msg104?.from).toBe('it-alerts@corp.local');
    expect(msg104?.spfStatus).toBe('pass');
    expect(msg104?.dkimStatus).toBe('pass');
    expect(msg104?.isPhishing).toBe(false);
  });

  test('Inspecting MSG-101 raw headers and detecting SPF failure / spoofing', async () => {
    const msg101 = engine.getEmail('MSG-101');
    expect(msg101).toBeDefined();

    const headers = msg101?.headers || [];
    expect(headers.length).toBeGreaterThan(3);

    const authHeader = headers.find((h) => h.name === 'Authentication-Results');
    expect(authHeader).toBeDefined();
    expect(authHeader?.value).toContain('spf=fail');

    const receivedHeader = headers.find((h) => h.name === 'Received');
    expect(receivedHeader?.value).toContain('198.51.100.44');

    // Run header verification analysis
    const verification = engine.verifyHeaders('MSG-101');
    expect(verification.spf).toBe('fail');
    expect(verification.dkim).toBe('neutral');
    expect(verification.dmarc).toBe('fail');
    expect(verification.isSpoofed).toBe(true);
    expect(verification.summary).toContain('Authentication failed');
    expect(verification.summary).toContain('spoofing');

    // Compare with legitimate email verification
    const legitVerification = engine.verifyHeaders('MSG-103');
    expect(legitVerification.spf).toBe('pass');
    expect(legitVerification.dkim).toBe('pass');
    expect(legitVerification.dmarc).toBe('pass');
    expect(legitVerification.isSpoofed).toBe(false);
    expect(legitVerification.summary).toContain('All authentication checks passed');
  });

  test('Quarantining MSG-101 and verifying it moves to quarantine folder', async () => {
    // Initial state check
    expect(engine.getEmail('MSG-101')?.folder).toBe('inbox');
    expect(engine.getEmail('MSG-101')?.quarantined).toBe(false);

    // Quarantine MSG-101
    const quarantined = engine.quarantineEmail('MSG-101');
    expect(quarantined).toBe(true);

    // Verify folder change
    const msg101 = engine.getEmail('MSG-101');
    expect(msg101?.folder).toBe('quarantine');
    expect(msg101?.quarantined).toBe(true);

    // Verify in quarantine list and removed from inbox
    const quarantineList = engine.getEmails('quarantine');
    expect(quarantineList.map((e) => e.id)).toContain('MSG-101');

    const inboxList = engine.getEmails('inbox');
    expect(inboxList.map((e) => e.id)).not.toContain('MSG-101');

    // Release email back to inbox
    const released = engine.releaseEmail('MSG-101');
    expect(released).toBe(true);
    expect(engine.getEmail('MSG-101')?.folder).toBe('inbox');
    expect(engine.getEmail('MSG-101')?.quarantined).toBe(false);
  });

  test('Blocking sender domain partner-corp.com and verifying list', async () => {
    expect(engine.getBlockedDomains()).toEqual([]);

    // Block partner-corp.com
    const blocked = engine.blockSenderDomain('partner-corp.com');
    expect(blocked).toBe(true);
    expect(engine.getBlockedDomains()).toContain('partner-corp.com');

    // Avoid duplicate block
    const duplicateBlocked = engine.blockSenderDomain('partner-corp.com');
    expect(duplicateBlocked).toBe(false);

    // Block from email address format
    const blockedFromEmail = engine.blockSenderDomain('malicious-sender@bad-domain.net');
    expect(blockedFromEmail).toBe(true);
    expect(engine.getBlockedDomains()).toContain('bad-domain.net');
    expect(engine.getBlockedDomains()).toHaveLength(2);
  });

  test('Reporting phishing and receiving reward', async () => {
    // Report actual phishing email MSG-101
    const reportPhish = engine.reportPhishing('MSG-101');
    expect(reportPhish.success).toBe(true);
    expect(reportPhish.rewardXp).toBe(50);
    expect(reportPhish.message).toContain('Phishing threat successfully identified');

    // Verify it automatically quarantined the reported email
    expect(engine.getEmail('MSG-101')?.folder).toBe('quarantine');

    // Report another phishing email MSG-102
    const reportPhish2 = engine.reportPhishing('MSG-102');
    expect(reportPhish2.success).toBe(true);
    expect(reportPhish2.rewardXp).toBe(50);
    expect(engine.getEmail('MSG-102')?.folder).toBe('quarantine');

    // False positive report on legitimate email MSG-103
    const falseReport = engine.reportPhishing('MSG-103');
    expect(falseReport.success).toBe(false);
    expect(falseReport.rewardXp).toBe(0);
    expect(falseReport.message).toContain('False positive');
    expect(engine.getEmail('MSG-103')?.folder).toBe('inbox');

    // Non-existent message report
    const notFoundReport = engine.reportPhishing('INVALID-999');
    expect(notFoundReport.success).toBe(false);
    expect(notFoundReport.rewardXp).toBe(0);
  });

  test('Marking emails as read', async () => {
    expect(engine.getEmail('MSG-101')?.isRead).toBe(false);
    engine.markAsRead('MSG-101');
    expect(engine.getEmail('MSG-101')?.isRead).toBe(true);
  });
});
