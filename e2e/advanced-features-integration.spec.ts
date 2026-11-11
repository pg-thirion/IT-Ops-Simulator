import { test, expect } from '@playwright/test';
import { NetworkEngine } from '../src/simulation/networkEngine';
import { MailEngine } from '../src/simulation/mailEngine';
import { SecurityEngine } from '../src/simulation/securityEngine';
import { GpoEngine } from '../src/simulation/gpoEngine';
import { BackupEngine } from '../src/simulation/backupEngine';
import { PhoneEngine } from '../src/simulation/phoneEngine';
import { HardwareEngine } from '../src/simulation/hardwareEngine';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from '../src/simulation/initialNetwork';
import { INITIAL_TICKETS, validateTicket } from '../src/simulation/ticketEngine';

test.describe('Task 7: Advanced Features Desktop & Ticketing Integration', () => {
  test.describe('Engine Ticket Validation for INC-1060 to INC-1065', () => {
    let networkEngine: NetworkEngine;
    let mailEngine: MailEngine;
    let securityEngine: SecurityEngine;
    let gpoEngine: GpoEngine;
    let backupEngine: BackupEngine;
    let phoneEngine: PhoneEngine;
    let hardwareEngine: HardwareEngine;

    test.beforeEach(() => {
      networkEngine = new NetworkEngine(
        buildInitialNetworkHosts(),
        buildInitialActiveDirectory(),
        INITIAL_ROUTER_CONFIG,
        INITIAL_SHARED_FOLDERS
      );
      mailEngine = new MailEngine();
      securityEngine = new SecurityEngine(networkEngine);
      gpoEngine = new GpoEngine(networkEngine);
      backupEngine = new BackupEngine(networkEngine);
      phoneEngine = new PhoneEngine();
      hardwareEngine = new HardwareEngine();
    });

    test('INC-1060: Phishing email header inspection and quarantine validation', () => {
      const ticket = INITIAL_TICKETS.find((t) => t.id === 'INC-1060');
      expect(ticket).toBeDefined();

      // Before quarantine: validation fails
      const checkBefore = validateTicket(ticket!, networkEngine, { mailEngine });
      expect(checkBefore.passed).toBe(false);
      expect(checkBefore.message).toContain('quarantined');

      // Quarantine MSG-101
      mailEngine.quarantineEmail('MSG-101');
      expect(mailEngine.getEmail('MSG-101')?.quarantined).toBe(true);

      // After quarantine: validation passes
      const checkAfter = validateTicket(ticket!, networkEngine, { mailEngine });
      expect(checkAfter.passed).toBe(true);
    });

    test('INC-1061: EDR host isolation and beacon process termination validation', () => {
      const ticket = INITIAL_TICKETS.find((t) => t.id === 'INC-1061');
      expect(ticket).toBeDefined();

      // Before isolation & kill: validation fails
      const checkBefore = validateTicket(ticket!, networkEngine, { securityEngine });
      expect(checkBefore.passed).toBe(false);

      // Isolate PC-FIN-08
      securityEngine.isolateHost('PC-FIN-08');
      expect(securityEngine.isHostIsolated('PC-FIN-08')).toBe(true);

      // Process still running: validation still fails
      const checkMid = validateTicket(ticket!, networkEngine, { securityEngine });
      expect(checkMid.passed).toBe(false);
      expect(checkMid.message).toContain('rundll32.exe');

      // Terminate threat process on PC-FIN-08
      securityEngine.terminateThreat('DET-101');
      expect(securityEngine.getDetection('DET-101')?.status).toBe('Remediated');

      // After both isolation and kill: validation passes
      const checkAfter = validateTicket(ticket!, networkEngine, { securityEngine });
      expect(checkAfter.passed).toBe(true);
    });

    test('INC-1062: Group Policy removable storage restriction validation', () => {
      const ticket = INITIAL_TICKETS.find((t) => t.id === 'INC-1062');
      expect(ticket).toBeDefined();

      // GPO-02 is linked to Finance OU and has block_usb_storage enabled
      const check = validateTicket(ticket!, networkEngine, { gpoEngine });
      expect(check.passed).toBe(true);

      // If GPO-02 is unlinked or disabled, validation fails
      gpoEngine.setGpoEnabled('GPO-02', false);
      const checkDisabled = validateTicket(ticket!, networkEngine, { gpoEngine });
      expect(checkDisabled.passed).toBe(false);
      expect(checkDisabled.message).toContain('GPO-02');
    });

    test('INC-1063: Backup Manager database restore validation', () => {
      const ticket = INITIAL_TICKETS.find((t) => t.id === 'INC-1063');
      expect(ticket).toBeDefined();

      // Before restore: validation fails
      const checkBefore = validateTicket(ticket!, networkEngine, { backupEngine });
      expect(checkBefore.passed).toBe(false);
      expect(checkBefore.message).toContain('ERP_Production_DB');

      // Restore ERP_Production_DB from SNAP-102
      const res = backupEngine.restoreDatabase('SNAP-102', 'ERP_Production_DB');
      expect(res.success).toBe(true);

      // After restore: validation passes
      const checkAfter = validateTicket(ticket!, networkEngine, { backupEngine });
      expect(checkAfter.passed).toBe(true);
    });

    test('INC-1064: Hardware Workbench RAM swap POST 55 to 00 validation', () => {
      const ticket = INITIAL_TICKETS.find((t) => t.id === 'INC-1064');
      expect(ticket).toBeDefined();

      // Before repair: POST 55 -> validation fails
      const checkBefore = validateTicket(ticket!, networkEngine, { hardwareEngine });
      expect(checkBefore.passed).toBe(false);
      expect(checkBefore.message).toContain('55');

      // Execute repair workflow
      hardwareEngine.powerOff();
      hardwareEngine.swapComponent('RAM_SLOT_1', 'INV-RAM-16');
      hardwareEngine.reapplyThermalPaste();
      hardwareEngine.powerOn();
      expect(hardwareEngine.getBenchState().postCode).toBe('00');

      // After repair: validation passes
      const checkAfter = validateTicket(ticket!, networkEngine, { hardwareEngine });
      expect(checkAfter.passed).toBe(true);
    });

    test('INC-1065: VoIP phone dialogue clue extraction validation', () => {
      const ticket = INITIAL_TICKETS.find((t) => t.id === 'INC-1065');
      expect(ticket).toBeDefined();

      // Before call: validation fails
      const checkBefore = validateTicket(ticket!, networkEngine, { phoneEngine });
      expect(checkBefore.passed).toBe(false);
      expect(checkBefore.message).toContain('clues');

      // Trigger and navigate CALL-04
      phoneEngine.triggerCall('CALL-04');
      phoneEngine.answerCall('CALL-04');
      const choiceRes = phoneEngine.selectDialogueChoice('CALL-04', 'c4-opt-port');
      expect(choiceRes.revealedClue).toBeDefined();
      expect(phoneEngine.getRevealedClues('INC-1065').length).toBeGreaterThan(0);

      // After clue revealed: validation passes
      const checkAfter = validateTicket(ticket!, networkEngine, { phoneEngine });
      expect(checkAfter.passed).toBe(true);
    });
  });

  test.describe('Desktop UI Integration', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
    });

    test('Desktop taskbar, start menu, and all 6 new apps launch properly', async ({ page }) => {
      // Verify page title and header watermark
      await expect(page.locator('text=IT OPS SIMULATOR')).toBeVisible();

      // Verify desktop icons grid contains all 6 new apps
      const desktopGrid = page.locator('.grid');
      await expect(desktopGrid.locator('button:has-text("Email Client")')).toBeVisible();
      await expect(desktopGrid.locator('button:has-text("EDR Console")')).toBeVisible();
      await expect(desktopGrid.locator('button:has-text("Group Policy")')).toBeVisible();
      await expect(desktopGrid.locator('button:has-text("Backup & DR")')).toBeVisible();
      await expect(desktopGrid.locator('button:has-text("VoIP Softphone")')).toBeVisible();
      await expect(desktopGrid.locator('button:has-text("Hardware Bench")')).toBeVisible();

      // Open Email Client via taskbar
      await page.locator('button[title="Email Client"]').click();
      const mailWin = page.locator('div[data-window-id="email-client"]');
      await expect(mailWin).toBeVisible();
      await expect(mailWin.locator('text=Corporate Webmail').first()).toBeVisible();

      // Open EDR Falcon Console via taskbar
      await page.locator('button[title="EDR Security Console"]').click();
      const edrWin = page.locator('div[data-window-id="edr-console"]');
      await expect(edrWin).toBeVisible();
      await expect(edrWin.locator('text=EDR Falcon Threat Hunter').first()).toBeVisible();

      // Open Group Policy via taskbar
      await page.locator('button[title="Group Policy (GPMC)"]').click();
      const gpoWin = page.locator('div[data-window-id="group-policy"]');
      await expect(gpoWin).toBeVisible();
      await expect(gpoWin.locator('text=Group Policy Management').first()).toBeVisible();

      // Open Backup & DR via taskbar
      await page.locator('button[title="Backup & DR"]').click();
      const backupWin = page.locator('div[data-window-id="backup-manager"]');
      await expect(backupWin).toBeVisible();
      await expect(backupWin.locator('text=Disaster Recovery').first()).toBeVisible();

      // Open VoIP Softphone via taskbar
      await page.locator('button[title="VoIP Softphone"]').click();
      const phoneWin = page.locator('div[data-window-id="voip-phone"]');
      await expect(phoneWin).toBeVisible();
      await expect(phoneWin.locator('text=Cisco IP Communicator').first()).toBeVisible();

      // Open Hardware Workbench via taskbar
      await page.locator('button[title="Hardware Workbench"]').click();
      const hwWin = page.locator('div[data-window-id="hardware-bench"]');
      await expect(hwWin).toBeVisible();
      await expect(hwWin.locator('text=POST Code:').first()).toBeVisible();
    });

    test('HelpDocsApp displays authentic technical manual without spoilers', async ({ page }) => {
      // Open IT Ops Handbook from taskbar
      await page.locator('button[title="IT Ops Handbook"]').click();
      const helpWin = page.locator('div[data-window-id="help-docs"]');
      await expect(helpWin).toBeVisible();

      // Check for OSI Layer section
      await expect(helpWin.locator('text=OSI 7-Layer Troubleshooting Methodology')).toBeVisible();
      await expect(helpWin.locator('text=Layer 1 — Physical Layer')).toBeVisible();
      await expect(helpWin.locator('text=Layer 2 — Data Link Layer')).toBeVisible();

      // Check for Transport Ports reference
      await expect(helpWin.locator('text=Standard Transport Ports Reference').first()).toBeVisible();
      await expect(helpWin.locator('text=Kerberos').first()).toBeVisible();
      await expect(helpWin.locator('text=3389').first()).toBeVisible();

      // Check for BIOS POST table
      await expect(helpWin.locator('text=Motherboard BIOS POST Diagnostic Codes')).toBeVisible();
      await expect(helpWin.locator('text=Memory not detected, unseated DIMM')).toBeVisible();
    });

    test('TicketingApp anti-spoiler senior clue button and ticket queue verification', async ({ page }) => {
      // Helpdesk Ticket Queue is open by default
      const ticketsWin = page.locator('div[data-window-id="tickets"]');
      await expect(ticketsWin).toBeVisible();

      // Verify new tickets exist in the queue
      await expect(ticketsWin.locator('text=INC-1060')).toBeVisible();
      await expect(ticketsWin.locator('text=INC-1061')).toBeVisible();
      await expect(ticketsWin.locator('text=INC-1062')).toBeVisible();
      await expect(ticketsWin.locator('text=INC-1063')).toBeVisible();
      await expect(ticketsWin.locator('text=INC-1064')).toBeVisible();
      await expect(ticketsWin.locator('text=INC-1065')).toBeVisible();

      // Select INC-1042 from queue list
      await ticketsWin.locator('.divide-y div:has-text("INC-1042")').first().click();

      // Verify that auto-displayed "IT Handbook Hint:" is NOT present (no spoilers!)
      await expect(ticketsWin.locator('text=IT Handbook Hint:')).not.toBeVisible();

      // Verify "Request Senior Sysadmin Clue (-25 XP)" button is present
      const clueBtn = ticketsWin.locator('button:has-text("Request Senior Sysadmin Clue (-25 XP)")');
      await expect(clueBtn).toBeVisible();
    });
  });
});
