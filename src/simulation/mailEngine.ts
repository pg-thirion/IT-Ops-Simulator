import { EmailMessage } from '../types/mail';

export const SEED_EMAILS: EmailMessage[] = [
  {
    id: 'MSG-101',
    from: 'billing@partner-corp.com',
    fromName: 'Partner Corp Billing',
    to: 'finance-team@corp.local',
    subject: 'URGENT: Outstanding Vendor Invoice #9841',
    date: '2026-11-11 08:15',
    body: `Attention Accounts Payable,

Please find attached overdue invoice #9841 for services rendered in Q3. This balance is 30 days past due. Immediate remittance is required to prevent service disruption to corporate supply channels.

Please review the attached spreadsheet (invoice_march.xlsm) and execute remittance instructions immediately. Note that macros must be enabled to view accounting validation hashes.

Regards,
Billing & Remittance Department
Partner Corp LLC`,
    folder: 'inbox',
    isRead: false,
    isPhishing: true,
    spfStatus: 'fail',
    dkimStatus: 'neutral',
    dmarcStatus: 'fail',
    originatingIp: '198.51.100.44',
    headers: [
      { name: 'Received', value: 'from mail.attacker-vps.org (198.51.100.44) by mx01.corp.local with ESMTP; Wed, 11 Nov 2026 08:15:12 +0000' },
      { name: 'Authentication-Results', value: 'mx01.corp.local; spf=fail (sender IP 198.51.100.44 is not authorized by partner-corp.com); dkim=neutral (no signature found); dmarc=fail action=none' },
      { name: 'From', value: '"Partner Corp Billing" <billing@partner-corp.com>' },
      { name: 'To', value: '<finance-team@corp.local>' },
      { name: 'Subject', value: 'URGENT: Outstanding Vendor Invoice #9841' },
      { name: 'Date', value: 'Wed, 11 Nov 2026 08:15:00 +0000' },
      { name: 'Message-ID', value: '<20261111081500.9841.invoice@partner-corp.com>' },
      { name: 'X-Originating-IP', value: '198.51.100.44' },
      { name: 'Return-Path', value: '<spoof-bounce@unverified-relay.net>' },
    ],
    attachments: [
      {
        id: 'att-101',
        filename: 'invoice_march.xlsm',
        sizeBytes: 154624,
        isMalicious: true,
        fileExtension: '.xlsm',
      },
    ],
    quarantined: false,
  },
  {
    id: 'MSG-102',
    from: 'ceo-direct@exec-corp.net',
    fromName: 'David Sterling (CEO)',
    to: 'sarah.mitchell@corp.local',
    subject: 'Quick request from mobile - buy Apple gift cards',
    date: '2026-11-11 08:30',
    body: `Are you at your desk?

I am currently in an unexpected closed-door executive partner meeting and cannot take calls. I need you to purchase 10 Apple Store gift cards ($200 each) as surprise retention gifts for our guest attendees right now.

Please charge it to the department reserve card, scratch the verification codes on the back, and send clear photo scans of the PINs directly to this address as soon as possible. I will approve and sign off on the expense reimbursement form the moment I am out of the meeting.

Sent from my iPhone`,
    folder: 'inbox',
    isRead: false,
    isPhishing: true,
    spfStatus: 'fail',
    dkimStatus: 'fail',
    dmarcStatus: 'fail',
    originatingIp: '203.0.113.88',
    headers: [
      { name: 'Received', value: 'from outbox.exec-corp.net (203.0.113.88) by mx01.corp.local with ESMTP; Wed, 11 Nov 2026 08:30:45 +0000' },
      { name: 'Authentication-Results', value: 'mx01.corp.local; spf=fail (domain exec-corp.net does not designate 203.0.113.88 as permitted sender); dkim=fail (signature verification failed); dmarc=fail' },
      { name: 'From', value: '"David Sterling" <ceo-direct@exec-corp.net>' },
      { name: 'Reply-To', value: '<executive-desk772@securemail-drop.cc>' },
      { name: 'To', value: '<sarah.mitchell@corp.local>' },
      { name: 'Subject', value: 'Quick request from mobile - buy Apple gift cards' },
      { name: 'Date', value: 'Wed, 11 Nov 2026 08:30:00 +0000' },
      { name: 'X-Originating-IP', value: '203.0.113.88' },
    ],
    attachments: [],
    quarantined: false,
  },
  {
    id: 'MSG-103',
    from: 'hr@corp.local',
    fromName: 'Corporate HR',
    to: 'all-employees@corp.local',
    subject: 'Annual Health Insurance Open Enrollment',
    date: '2026-11-11 07:00',
    body: `Hello All,

This is a reminder that our Annual Health & Benefits Open Enrollment window for the upcoming calendar year begins next Monday, November 16th, and closes on Friday, December 4th at 5:00 PM EST.

During this window, you may:
- Elect or adjust medical, dental, and vision coverage
- Enroll or modify Flexible Spending Account (FSA) and Health Savings Account (HSA) contributions
- Review and update designated life insurance beneficiaries

Please review the attached Benefits Summary Guide 2027 and complete your elections on the intranet HR portal (https://portal.corp.local/hr/benefits).

Human Resources Department
Corp Headquarters, Suite 400`,
    folder: 'inbox',
    isRead: true,
    isPhishing: false,
    spfStatus: 'pass',
    dkimStatus: 'pass',
    dmarcStatus: 'pass',
    originatingIp: '192.168.20.50',
    headers: [
      { name: 'Received', value: 'from hr-srv01.corp.local (192.168.20.50) by mx01.corp.local with ESMTP; Wed, 11 Nov 2026 07:00:10 +0000' },
      { name: 'Authentication-Results', value: 'mx01.corp.local; spf=pass (corp.local designates 192.168.20.50 as permitted sender); dkim=pass (v=1 header.d=corp.local); dmarc=pass' },
      { name: 'From', value: '"Corporate HR" <hr@corp.local>' },
      { name: 'To', value: '<all-employees@corp.local>' },
      { name: 'Subject', value: 'Annual Health Insurance Open Enrollment' },
      { name: 'Date', value: 'Wed, 11 Nov 2026 07:00:00 +0000' },
      { name: 'X-Originating-IP', value: '192.168.20.50' },
    ],
    attachments: [
      {
        id: 'att-103',
        filename: 'benefits_summary_2027.pdf',
        sizeBytes: 2450190,
        isMalicious: false,
        fileExtension: '.pdf',
      },
    ],
    quarantined: false,
  },
  {
    id: 'MSG-104',
    from: 'it-alerts@corp.local',
    fromName: 'IT Infrastructure Alerts',
    to: 'all-staff@corp.local',
    subject: 'Scheduled Datacenter Maintenance This Weekend',
    date: '2026-11-11 06:30',
    body: `Notice of Scheduled Datacenter Maintenance:

The IT Operations team will perform essential firmware upgrades and redundant core switch reboots on Saturday starting at 02:00 AM UTC. Maintenance is expected to conclude by 06:00 AM UTC.

Expected Impact:
- Internal network shares (\\\\storage.corp.local) will experience intermittent 5-minute outages.
- Local domain controller replication will briefly switch to secondary nodes.
- Cloud services, VPN, and corporate email will remain fully operational.

If you have critical batch jobs scheduled during this window, please notify the IT Helpdesk by 4:00 PM Friday.

IT Operations Desk
it-alerts@corp.local`,
    folder: 'inbox',
    isRead: false,
    isPhishing: false,
    spfStatus: 'pass',
    dkimStatus: 'pass',
    dmarcStatus: 'pass',
    originatingIp: '192.168.10.15',
    headers: [
      { name: 'Received', value: 'from it-ops01.corp.local (192.168.10.15) by mx01.corp.local with ESMTP; Wed, 11 Nov 2026 06:30:05 +0000' },
      { name: 'Authentication-Results', value: 'mx01.corp.local; spf=pass (corp.local designates 192.168.10.15 as permitted sender); dkim=pass (v=1 header.d=corp.local); dmarc=pass' },
      { name: 'From', value: '"IT Infrastructure Alerts" <it-alerts@corp.local>' },
      { name: 'To', value: '<all-staff@corp.local>' },
      { name: 'Subject', value: 'Scheduled Datacenter Maintenance This Weekend' },
      { name: 'Date', value: 'Wed, 11 Nov 2026 06:30:00 +0000' },
      { name: 'X-Originating-IP', value: '192.168.10.15' },
    ],
    attachments: [],
    quarantined: false,
  },
];

export const INITIAL_EMAILS = SEED_EMAILS;

export class MailEngine {
  private emails: EmailMessage[] = [];
  private blockedDomains: Set<string> = new Set();

  constructor(initialEmails?: EmailMessage[]) {
    this.reset(initialEmails);
  }

  public reset(initialEmails?: EmailMessage[]): void {
    const source = initialEmails || SEED_EMAILS;
    this.emails = source.map((msg) => ({
      ...msg,
      headers: [...msg.headers.map((h) => ({ ...h }))],
      attachments: [...msg.attachments.map((a) => ({ ...a }))],
    }));
    this.blockedDomains.clear();
  }

  public getEmails(folder?: 'inbox' | 'junk' | 'quarantine'): EmailMessage[] {
    if (folder) {
      return this.emails.filter((email) => email.folder === folder);
    }
    return [...this.emails];
  }

  public getEmail(id: string): EmailMessage | undefined {
    return this.emails.find((email) => email.id === id);
  }

  public markAsRead(id: string): void {
    const email = this.getEmail(id);
    if (email) {
      email.isRead = true;
    }
  }

  public quarantineEmail(id: string): boolean {
    const email = this.getEmail(id);
    if (!email) {
      return false;
    }
    email.folder = 'quarantine';
    email.quarantined = true;
    return true;
  }

  public releaseEmail(id: string): boolean {
    const email = this.getEmail(id);
    if (!email) {
      return false;
    }
    email.folder = 'inbox';
    email.quarantined = false;
    return true;
  }

  public blockSenderDomain(domain: string): boolean {
    if (!domain) {
      return false;
    }
    let clean = domain.trim().toLowerCase();
    if (clean.includes('@')) {
      clean = clean.split('@')[1];
    }
    clean = clean.replace(/^@/, '');
    if (!clean || this.blockedDomains.has(clean)) {
      return false;
    }
    this.blockedDomains.add(clean);
    return true;
  }

  public getBlockedDomains(): string[] {
    return Array.from(this.blockedDomains);
  }

  public verifyHeaders(id: string): {
    spf: string;
    dkim: string;
    dmarc: string;
    isSpoofed: boolean;
    summary: string;
  } {
    const email = this.getEmail(id);
    if (!email) {
      return {
        spf: 'unknown',
        dkim: 'unknown',
        dmarc: 'unknown',
        isSpoofed: false,
        summary: 'Message not found.',
      };
    }

    const spf = email.spfStatus;
    const dkim = email.dkimStatus;
    const dmarc = email.dmarcStatus;
    const isSpoofed = spf === 'fail' || dkim === 'fail' || dmarc === 'fail' || email.isPhishing;

    let summary = '';
    if (isSpoofed) {
      summary = `Authentication failed: SPF is ${spf}, DKIM is ${dkim}, DMARC is ${dmarc}. Sender IP ${email.originatingIp} is not designated as authorized. Potential email spoofing / phishing detected.`;
    } else {
      summary = `All authentication checks passed: SPF is ${spf}, DKIM is ${dkim}, DMARC is ${dmarc}. Originating IP ${email.originatingIp} is authenticated.`;
    }

    return {
      spf,
      dkim,
      dmarc,
      isSpoofed,
      summary,
    };
  }

  public reportPhishing(id: string): {
    success: boolean;
    rewardXp: number;
    message: string;
  } {
    const email = this.getEmail(id);
    if (!email) {
      return {
        success: false,
        rewardXp: 0,
        message: 'Message not found.',
      };
    }

    if (email.isPhishing) {
      this.quarantineEmail(id);
      return {
        success: true,
        rewardXp: 50,
        message: 'Phishing threat successfully identified and isolated! Security score increased.',
      };
    }

    return {
      success: false,
      rewardXp: 0,
      message: 'False positive: Reported email is legitimate corporate communication.',
    };
  }
}

export const mailEngine = new MailEngine();
