import { Ticket } from '../types/game';
import { NetworkEngine } from './networkEngine';
import type { RackEngine } from './rackEngine';
import type { SiemEngine } from './siemEngine';
import type { ChangeEngine } from './changeEngine';
import type { DhcpDnsEngine } from './dhcpDnsEngine';
import type { ScriptEngine } from './scriptEngine';
import type { ShiftEventEngine } from './shiftEventEngine';
import type { ScriptTargetScope } from '../types/script';

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'INC-1042',
    title: 'Finance department has no internet',
    department: 'Finance',
    reporterName: 'Sarah Mitchell',
    reporterHostId: 'PC-FIN-04',
    priority: 'High',
    status: 'Open',
    category: 'Network',
    description: 'The user reports being unable to open external websites or browse intranet links, despite the network status tray icon showing as connected. Raw IP pings work, but domain resolution fails.',
    initialQuote: '"My computer says it\'s connected to the network, but I can\'t open any websites. I\'ve restarted twice already. Please help."',
    slaMinutes: 10,
    timeRemainingSeconds: 600,
    rewardXp: 150,
    rewardCash: 350,
    createdDay: 1,
    requirements: [
      {
        type: 'dns_resolved',
        targetHostId: 'PC-FIN-04',
        expectedValue: '192.168.10.200',
        description: 'Configure PC-FIN-04 with active DNS server (192.168.10.200) and verify "nslookup example.com" resolves.',
      },
    ],
    userHint: 'Verify whether the DNS server configured on PC-FIN-04 is responsive to name resolution queries.',
  },
  {
    id: 'INC-1043',
    title: 'DevOps Lead locked out after password attempts',
    department: 'Engineering',
    reporterName: 'Liam Kumar',
    reporterHostId: 'PC-ENG-02',
    priority: 'High',
    status: 'Open',
    category: 'Active Directory',
    description: 'User returned from annual leave and entered an outdated password repeatedly. Workstation is locked out by domain security policy.',
    initialQuote: '"I came back from vacation and after trying my password a few times my account is completely locked. I need to push a hotfix to production immediately."',
    slaMinutes: 8,
    timeRemainingSeconds: 480,
    rewardXp: 120,
    rewardCash: 280,
    createdDay: 1,
    requirements: [
      {
        type: 'ad_user_unlocked',
        targetUsername: 'lkumar',
        description: 'Unlock user lkumar in Active Directory Users & Computers or via "net user lkumar /active:yes"',
      },
    ],
    userHint: 'Inspect account status for user lkumar in Active Directory Users and Computers.',
  },
  {
    id: 'INC-1044',
    title: 'Engineering IP collision with network printer',
    department: 'Engineering',
    reporterName: 'Sofia Rossi',
    reporterHostId: 'PC-ENG-03',
    priority: 'High',
    status: 'Open',
    category: 'Network',
    description: 'User workstation detected a duplicate IP conflict on VLAN 30. Both PC-ENG-03 and PRN-ENG-01 are attempting to bind 192.168.30.200.',
    initialQuote: '"Windows gave me a popup: "There is an IP address conflict with another system on the network". My terminal and git pushes keep dropping."',
    slaMinutes: 11,
    timeRemainingSeconds: 660,
    rewardXp: 175,
    rewardCash: 400,
    createdDay: 1,
    requirements: [
      {
        type: 'dhcp_renewed',
        targetHostId: 'PC-ENG-03',
        description: 'Renew PC-ENG-03 DHCP lease or assign non-conflicting IP off 192.168.30.200.',
      },
    ],
    userHint: 'Address conflicts on local VLANs can often be resolved by renewing the workstation DHCP lease.',
  },
  {
    id: 'INC-1048',
    title: 'Executive board packet printing failing',
    department: 'Executive',
    reporterName: 'Elena Klein',
    reporterHostId: 'PC-EXEC-04',
    priority: 'Critical',
    status: 'Open',
    category: 'Servers',
    description: 'Executive printers are not responding and print jobs are queueing without error details. The central Print Spooler daemon on FS-SRV-01 has terminated unexpectedly.',
    initialQuote: '"The CEO needs board packs printed in 10 minutes. The executive printer PRN-EXEC-01 shows offline on all executive laptops."',
    slaMinutes: 7,
    timeRemainingSeconds: 420,
    rewardXp: 220,
    rewardCash: 500,
    createdDay: 1,
    requirements: [
      {
        type: 'service_running',
        targetHostId: 'FS-SRV-01',
        targetServiceId: 'spooler',
        description: 'Restart the Print Spooler service on FS-SRV-01.',
      },
    ],
    userHint: 'Verify the state of background server daemons associated with print queues on FS-SRV-01.',
  },
  {
    id: 'INC-1052',
    title: 'Marketing PC network adapter shows disconnected',
    department: 'Marketing',
    reporterName: 'Clara Jones',
    reporterHostId: 'PC-MKT-03',
    priority: 'Medium',
    status: 'Open',
    category: 'Hardware',
    description: 'User reports their computer shows a red X over the network tray icon. The physical patch cable is plugged in, but the Intel Gigabit NIC was disabled in Device Manager.',
    initialQuote: '"My internet died right in the middle of a design upload. The cable in the back has lights, but Windows says media disconnected."',
    slaMinutes: 12,
    timeRemainingSeconds: 720,
    rewardXp: 160,
    rewardCash: 340,
    createdDay: 1,
    requirements: [
      {
        type: 'device_enabled',
        targetHostId: 'PC-MKT-03',
        expectedValue: 'nic0',
        description: 'Enable the Intel Ethernet Network Adapter in Device Manager for PC-MKT-03.',
      },
    ],
    userHint: 'Check the physical hardware device adapter states on PC-MKT-03 in Device Manager.',
  },
  {
    id: 'INC-1054',
    title: 'CFO domain password expired',
    department: 'Executive',
    reporterName: 'Marcus Sterling',
    reporterHostId: 'PC-EXEC-03',
    priority: 'Medium',
    status: 'Open',
    category: 'Active Directory',
    description: 'Executive user is blocked by 90-day password aging policy. Requires administrator password reset and expiration flag clearance.',
    initialQuote: '"I got a warning saying "Your password has expired and must be changed". I cannot logon to review quarterly financial filings."',
    slaMinutes: 10,
    timeRemainingSeconds: 600,
    rewardXp: 130,
    rewardCash: 300,
    createdDay: 1,
    requirements: [
      {
        type: 'ad_password_reset',
        targetUsername: 'msterling',
        description: 'Reset password for Marcus Sterling (msterling) in Active Directory.',
      },
    ],
    userHint: 'Account password lifecycle attributes can be updated in Active Directory Users and Computers.',
  },
  {
    id: 'INC-1055',
    title: 'New HR Specialist missing Payroll share permission',
    department: 'HR',
    reporterName: 'Natalie Bishop',
    reporterHostId: 'PC-HR-05',
    priority: 'Medium',
    status: 'Open',
    category: 'Active Directory',
    description: 'New hire in Human Resources needs access to \\\\FS-SRV-01\\Payroll, but cannot open the network share due to missing security group membership.',
    initialQuote: '"I tried opening the Payroll share folder on the file server, but it says "Access is denied". My manager said I should have access."',
    slaMinutes: 14,
    timeRemainingSeconds: 840,
    rewardXp: 160,
    rewardCash: 380,
    createdDay: 1,
    requirements: [
      {
        type: 'ad_group_added',
        targetUsername: 'nbishop',
        expectedValue: 'Payroll Access',
        description: 'Add user nbishop to the "Payroll Access" security group in Active Directory.',
      },
    ],
    userHint: 'Inspect Active Directory security group memberships required for the file share ACL.',
  },
  {
    id: 'INC-1058',
    title: 'CRITICAL: Database server CPU pegged at 95%',
    department: 'Infrastructure',
    reporterName: 'Monitoring Alert (SIEM)',
    reporterHostId: 'SQL-PROD-01',
    priority: 'Critical',
    status: 'Open',
    category: 'Security',
    description: 'Automated telemetry alert: Production SQL Server SQL-PROD-01 CPU usage exceeds 90%. Inspection reveals an unauthorized cryptocurrency mining binary executing in the background.',
    initialQuote: '"AUTOMATED MONITORING ALERT: Host SQL-PROD-01 CPU usage sustained at 95% for >15 minutes. High thermal threshold warning."',
    slaMinutes: 6,
    timeRemainingSeconds: 360,
    rewardXp: 260,
    rewardCash: 600,
    createdDay: 1,
    requirements: [
      {
        type: 'process_killed',
        targetHostId: 'SQL-PROD-01',
        expectedValue: 'xmrig_miner.exe',
        description: 'Locate and terminate rogue process xmrig_miner.exe on SQL-PROD-01 using Task Manager or taskkill.',
      },
    ],
    userHint: 'Inspect active processes and abnormal CPU utilization on SQL-PROD-01 via Task Manager.',
  },
  {
    id: 'INC-1060',
    title: 'Executive reported suspicious vendor wire update email',
    department: 'Executive',
    reporterName: 'David Sterling',
    reporterHostId: 'PC-EXEC-01',
    priority: 'Critical',
    status: 'Open',
    category: 'Security',
    description: 'The CEO received an urgent email demanding immediate payment to an updated vendor banking wire account with macro-enabled spreadsheet attachment. The email displays authentication warnings.',
    initialQuote: '"I received an email claiming to be partner billing requesting urgent wire payment. Something feels off about the domain headers and attachment."',
    slaMinutes: 10,
    timeRemainingSeconds: 600,
    rewardXp: 200,
    rewardCash: 450,
    createdDay: 1,
    requirements: [
      {
        type: 'email_quarantined',
        expectedValue: 'MSG-101',
        description: 'Inspect email headers in Email Client and quarantine the spoofed phishing email (MSG-101).',
      },
    ],
    userHint: 'Inspect incoming messages in Outlook Webmail for SPF/DKIM verification failures and quarantine the spoofed sender.',
  },
  {
    id: 'INC-1061',
    title: 'Workstation flagged with credential dumping beacon',
    department: 'Finance',
    reporterName: 'Jonathan Webber',
    reporterHostId: 'PC-FIN-08',
    priority: 'Critical',
    status: 'Open',
    category: 'Security',
    description: 'EDR behavioral sensors flagged a suspected Cobalt Strike beacon reflective injection on PC-FIN-08 attempting memory dumping. The host requires immediate network containment and process termination.',
    initialQuote: '"My workstation became sluggish and my security tray icon turned red. IT Security contacted me about suspicious beacon activity."',
    slaMinutes: 8,
    timeRemainingSeconds: 480,
    rewardXp: 250,
    rewardCash: 500,
    createdDay: 1,
    requirements: [
      {
        type: 'host_isolated',
        targetHostId: 'PC-FIN-08',
        expectedValue: 'rundll32.exe',
        description: 'Isolate PC-FIN-08 from corporate network via EDR Falcon Console and terminate the malicious rundll32.exe beacon process.',
      },
    ],
    userHint: 'Use the EDR Falcon Console to isolate the affected endpoint and terminate active malicious beacons.',
  },
  {
    id: 'INC-1062',
    title: 'Finance contractors plugging unauthorized flash drives',
    department: 'Finance',
    reporterName: 'David Novak',
    reporterHostId: 'PC-FIN-01',
    priority: 'High',
    status: 'Open',
    category: 'Active Directory',
    description: 'Internal audit reports that contractors in the Finance department have been connecting unencrypted USB flash drives. Group Policy must enforce removable storage device restrictions across the Finance OU.',
    initialQuote: '"Security audit flagged unauthorized USB drives in the finance wing. We need domain policy enforced so flash drives cannot mount."',
    slaMinutes: 12,
    timeRemainingSeconds: 720,
    rewardXp: 180,
    rewardCash: 400,
    createdDay: 1,
    requirements: [
      {
        type: 'gpo_linked',
        targetHostId: 'Finance',
        expectedValue: 'GPO-02',
        description: 'Ensure "Removable Storage Restriction" GPO is linked to Finance OU and enabled in Group Policy Management.',
      },
    ],
    userHint: 'Verify that removable storage device restriction policies are linked and enabled for the targeted Organizational Unit in GPMC.',
  },
  {
    id: 'INC-1063',
    title: 'Accounting database corrupt after power surge',
    department: 'Finance',
    reporterName: 'Timothy Chen',
    reporterHostId: 'SQL-PROD-01',
    priority: 'Critical',
    status: 'Open',
    category: 'Servers',
    description: 'A voltage spike caused dirty shutdown on SQL-PROD-01, leaving the ERP_Production_DB database in a suspect corrupted state. Restore the database from the most recent verified backup snapshot.',
    initialQuote: '"The accounting software threw a database corruption error after the server rebooted. Our payroll and invoice tables will not mount."',
    slaMinutes: 15,
    timeRemainingSeconds: 900,
    rewardXp: 260,
    rewardCash: 550,
    createdDay: 1,
    requirements: [
      {
        type: 'database_restored',
        targetHostId: 'SQL-PROD-01',
        expectedValue: 'ERP_Production_DB',
        description: 'Restore ERP_Production_DB on SQL-PROD-01 from backup snapshot SNAP-102 in Backup Manager.',
      },
    ],
    userHint: 'Review point-in-time recovery points in Backup & Disaster Recovery Manager to restore the affected database.',
  },
  {
    id: 'INC-1066',
    title: 'Storage array degraded alert & Sales drop on Port 18',
    department: 'Sales',
    reporterName: 'Hannah Brooks',
    reporterHostId: 'PC-SALES-02',
    priority: 'Critical',
    status: 'Open',
    category: 'Hardware',
    description:
      'S.M.A.R.T. monitoring reports a degraded RAID-5 volume on FS-SRV-01, while Sales workstation PC-SALES-02 experiences severe Layer-1 packet loss on patch panel port 18.',
    initialQuote:
      '"Our shared drive keeps freezing and my desktop connection drops every few seconds whenever large files transfer."',
    slaMinutes: 14,
    timeRemainingSeconds: 840,
    rewardXp: 250,
    rewardCash: 550,
    createdDay: 1,
    requirements: [
      {
        type: 'rack_repaired',
        targetHostId: 'FS-SRV-01',
        description:
          'Replace degraded patch cable CBL-104 on Gi0/18 and hot-swap faulty RAID drive bay on FS-SRV-01.',
      },
    ],
    userHint:
      'Run a TDR cable test on patch panel runs serving Sales and inspect the RAID bay status lights on FS-SRV-01 in the Server Rack Room.',
  },
  {
    id: 'INC-1067',
    title: 'SIEM Alert: Off-hours brute force and lateral movement',
    department: 'Executive',
    reporterName: 'SOC Automated Alert',
    reporterHostId: 'SQL-PROD-01',
    priority: 'Critical',
    status: 'Open',
    category: 'Security',
    description:
      'Centralized log ingestion flagged a burst of authentication failures followed by anomalous SMB lateral movement and scheduled task creation on a core database server.',
    initialQuote:
      '"Automated SIEM correlation rule triggered: Multiple failed VPN authentications followed by privileged lateral session creation."',
    slaMinutes: 12,
    timeRemainingSeconds: 720,
    rewardXp: 280,
    rewardCash: 620,
    createdDay: 1,
    requirements: [
      {
        type: 'siem_ioc_blocked',
        targetHostId: 'SQL-PROD-01',
        description:
          'Correlate the attack chain in SIEM Console, pin >= 2 attack logs, block the external attacker IP, and revoke the compromised service account.',
      },
    ],
    userHint:
      'Query critical AD authentication and SMB events in SIEM Console to identify the external source IP and compromised service account.',
  },
  {
    id: 'INC-1068',
    title: 'Emergency SQL cluster kernel maintenance window (CR-202)',
    department: 'Finance',
    reporterName: 'Change Advisory Board',
    reporterHostId: 'SQL-PROD-01',
    priority: 'High',
    status: 'Open',
    category: 'Servers',
    description:
      'SQL-PROD-01 requires an emergency kernel security patch and reboot under Change Request CR-202. Production SLA mandates zero-downtime failover and CAB sign-off prior to execution.',
    initialQuote:
      '"Please complete Change Request CR-202 for SQL-PROD-01 without causing an unscheduled database outage for Finance."',
    slaMinutes: 15,
    timeRemainingSeconds: 900,
    rewardXp: 240,
    rewardCash: 520,
    createdDay: 1,
    requirements: [
      {
        type: 'change_completed',
        targetHostId: 'SQL-PROD-01',
        expectedValue: 'CR-202',
        description:
          'Enable HA replica failover, attach rollback plan, obtain CAB approval, and execute CR-202 in Change Control Console.',
      },
    ],
    userHint:
      'Review CR-202 pre-flight requirements in Change Control before executing the maintenance window.',
  },
  {
    id: 'INC-1069',
    title: 'Sales VLAN DHCP lease exhaustion & dead intranet portal DNS',
    department: 'Sales',
    reporterName: 'Marcus Vance',
    reporterHostId: 'PC-SALES-01',
    priority: 'High',
    status: 'Open',
    category: 'Network',
    description:
      'New laptops joining the Sales floor receive 169.254.x.x APIPA addresses due to DHCP scope exhaustion, and portal.corp.local fails to reach the intranet web server.',
    initialQuote:
      '"Nobody in Sales can get an IP address this morning, and typing portal.corp.local in the browser times out."',
    slaMinutes: 13,
    timeRemainingSeconds: 780,
    rewardXp: 230,
    rewardCash: 490,
    createdDay: 1,
    requirements: [
      {
        type: 'dhcp_dns_fixed',
        targetHostId: 'WEB-INTRA-01',
        description:
          'Purge rogue DHCP leases on Sales VLAN 40 and update the corrupted portal.corp.local A record to point to WEB-INTRA-01 (192.168.10.202).',
      },
    ],
    userHint:
      'Check scope utilization on VLAN 40 and verify the A record target for portal.corp.local in DHCP & DNS Manager.',
  },
  {
    id: 'INC-1070',
    title: 'Engineering fleet stale DNS cache & locked CI service tokens',
    department: 'Engineering',
    reporterName: 'Liam Kumar',
    reporterHostId: 'PC-ENG-01',
    priority: 'High',
    status: 'Open',
    category: 'Active Directory',
    description:
      'Following a domain controller policy sync, workstations across the Engineering OU have stale resolver caches and expired CI service tokens.',
    initialQuote:
      '"Half the Engineering floor has broken build pipelines from stale DNS entries and locked CI tokens. Doing this box-by-box will take hours."',
    slaMinutes: 12,
    timeRemainingSeconds: 720,
    rewardXp: 240,
    rewardCash: 510,
    createdDay: 1,
    requirements: [
      {
        type: 'script_executed',
        targetHostId: 'PC-ENG-01',
        expectedValue: 'PLAYBOOK-ENG-REMEDIATE',
        description:
          'Run the Engineering Subnet DNS & Token Remediation playbook (PLAYBOOK-ENG-REMEDIATE) against OU=Engineering in Script Studio.',
      },
    ],
    userHint:
      'Use PowerShell / Bash Automation Studio to execute the Engineering remediation playbook across OU=Engineering.',
  },
  {
    id: 'INC-1071',
    title: 'Intranet HTTPS login blocked by expired TLS certificate',
    department: 'Executive',
    reporterName: 'Elena Klein',
    reporterHostId: 'WEB-INTRA-01',
    priority: 'Critical',
    status: 'Open',
    category: 'Security',
    description:
      'Browsers across the domain display NET::ERR_CERT_DATE_INVALID when accessing the internal corporate portal hosted on WEB-INTRA-01.',
    initialQuote:
      '"Every executive laptop gets a giant red security warning saying the certificate for WEB-INTRA-01 has expired!"',
    slaMinutes: 10,
    timeRemainingSeconds: 600,
    rewardXp: 210,
    rewardCash: 460,
    createdDay: 1,
    requirements: [
      {
        type: 'ssl_renewed',
        targetHostId: 'WEB-INTRA-01',
        description:
          'Renew and deploy the X.509 TLS 1.3 certificate for WEB-INTRA-01 in Change Control Console.',
      },
    ],
    userHint:
      'Check the PKI / TLS Certificate Operations panel inside Change Control Console for WEB-INTRA-01.',
  },
  {
    id: 'INC-1064',
    title: 'Marketing PC fails to boot with repeated beeps',
    department: 'Marketing',
    reporterName: 'Clara Jones',
    reporterHostId: 'PC-MKT-03',
    priority: 'High',
    status: 'Open',
    category: 'Hardware',
    description: 'PC-MKT-03 fails to complete Power-On Self-Test (POST code 55: Memory Error) and emits continuous error beeps. Workstation requires physical memory replacement and thermal service on the Hardware Workbench.',
    initialQuote: '"When I hit power on my computer, the fans spin at 100% and it makes three loud beeps. Nothing displays on the monitors at all."',
    slaMinutes: 12,
    timeRemainingSeconds: 720,
    rewardXp: 210,
    rewardCash: 450,
    createdDay: 1,
    requirements: [
      {
        type: 'hardware_repaired',
        targetHostId: 'PC-MKT-03',
        expectedValue: '00',
        description: 'Troubleshoot PC-MKT-03 on Hardware Workbench: replace defective RAM module and boot machine to POST 00.',
      },
    ],
    userHint: 'Check motherboard diagnostic POST codes on the workbench to identify failing hardware components.',
  },
  {
    id: 'INC-1065',
    title: 'Reception phone consultation regarding intermittent connectivity',
    department: 'Executive',
    reporterName: 'Elena Klein',
    reporterHostId: 'PC-EXEC-04',
    priority: 'Medium',
    status: 'Open',
    category: 'Network',
    description: 'The front desk receptionist reported frequent connection drops on the lobby terminal. Conduct a telephone consultation via VoIP Softphone to diagnose physical port and switch configuration details.',
    initialQuote: '"The visitor sign-in iPad and desk terminal keep losing connection to the intranet. Could you give me a call so we can check the port?"',
    slaMinutes: 10,
    timeRemainingSeconds: 600,
    rewardXp: 160,
    rewardCash: 350,
    createdDay: 1,
    requirements: [
      {
        type: 'call_clues_extracted',
        targetHostId: 'PC-EXEC-04',
        expectedValue: 'INC-1065',
        description: 'Answer VoIP phone call from Elena Klein and extract diagnostic clues regarding the reception network drop.',
      },
    ],
    userHint: 'Call back or answer the phone consultation in VoIP Softphone to gather diagnostic information from the user.',
  },
];

// Procedural Pool for Infinite Shift Progression
export const PROCEDURAL_INCIDENT_TEMPLATES = [
  {
    title: 'Core DNS Daemon Hung on Domain Controller',
    department: 'Infrastructure' as const,
    category: 'Servers' as const,
    reporterName: 'Claire Vance (COO)',
    reporterHostId: 'PC-EXEC-02',
    priority: 'Critical' as const,
    description: 'Corporate-wide DNS failure. Workstations across all subnets cannot resolve intranet or external hosts.',
    quote: '"Nobody can access any company services. Did someone unplug the server rack?"',
    slaMinutes: 6,
    rewardXp: 300,
    rewardCash: 750,
    setupFault: (engine: NetworkEngine) => {
      engine.updateServiceStatus('DC-SRV-01', 'dns', 'crashed');
    },
    requirements: [
      {
        type: 'service_running' as const,
        targetHostId: 'DC-SRV-01',
        targetServiceId: 'dns',
        description: 'Restart the DNS Server service on DC-SRV-01',
      },
    ],
  },
  {
    title: 'Sales Rep APIPA 169.254.x.x autoconfig failure',
    department: 'Sales' as const,
    category: 'Network' as const,
    reporterName: 'Naomi Matsuda',
    reporterHostId: 'PC-SALES-06',
    priority: 'Medium' as const,
    description: 'Workstation failed DHCP lease renewal and dropped to link-local APIPA address.',
    quote: '"My screen has a yellow triangle over the network icon. I have a client demo in 20 minutes!"',
    slaMinutes: 10,
    rewardXp: 140,
    rewardCash: 300,
    setupFault: (engine: NetworkEngine) => {
      engine.releaseDhcp('PC-SALES-06');
    },
    requirements: [
      {
        type: 'dhcp_renewed' as const,
        targetHostId: 'PC-SALES-06',
        description: 'Renew DHCP lease on PC-SALES-06 (ipconfig /renew)',
      },
    ],
  },
  {
    title: 'Marketing Director account locked after phishing simulation',
    department: 'Marketing' as const,
    category: 'Active Directory' as const,
    reporterName: 'Alex Morgan',
    reporterHostId: 'PC-MKT-01',
    priority: 'Low' as const,
    description: 'CMO entered credentials into security training portal too many times.',
    quote: '"I tried resetting my password three times this morning and now it says contact system administrator."',
    slaMinutes: 15,
    rewardXp: 100,
    rewardCash: 200,
    setupFault: (engine: NetworkEngine) => {
      const user = engine.getADUser('amorgan');
      if (user) {
        user.isLocked = true;
        user.badPasswordCount = 4;
      }
    },
    requirements: [
      {
        type: 'ad_user_unlocked' as const,
        targetUsername: 'amorgan',
        description: 'Unlock Alex Morgan (amorgan) in Active Directory',
      },
    ],
  },
  {
    title: 'Firewall blocking outgoing HTTPS Port 443',
    department: 'Sales' as const,
    category: 'Network' as const,
    reporterName: 'Victor Ramirez',
    reporterHostId: 'PC-SALES-01',
    priority: 'High' as const,
    description: 'A rule on the border firewall was accidentally enabled blocking port 443 egress.',
    quote: '"None of our sales reps can connect to customer SaaS dashboards over HTTPS."',
    slaMinutes: 9,
    rewardXp: 240,
    rewardCash: 550,
    setupFault: (engine: NetworkEngine) => {
      const cfg = engine.getRouterConfig();
      if (!cfg.blockedPorts.includes(443)) {
        cfg.blockedPorts.push(443);
        engine.updateRouterConfig({ blockedPorts: cfg.blockedPorts });
      }
    },
    requirements: [
      {
        type: 'router_port_unblocked' as const,
        expectedValue: '443',
        description: 'Unblock port 443 in the Gateway Router & Firewall Web GUI.',
      },
    ],
  },
];

export interface ValidationEngines {
  mailEngine?: any;
  securityEngine?: any;
  gpoEngine?: any;
  backupEngine?: any;
  hardwareEngine?: any;
  phoneEngine?: any;
  rackEngine?: RackEngine;
  siemEngine?: SiemEngine;
  changeEngine?: ChangeEngine;
  dhcpDnsEngine?: DhcpDnsEngine;
  scriptEngine?: ScriptEngine;
  shiftEventEngine?: ShiftEventEngine;
}

export type TicketValidationContext = ValidationEngines;

export function validateTicket(
  ticket: Ticket,
  networkEngine: NetworkEngine,
  engines?: ValidationEngines
): { passed: boolean; message: string } {
  for (const req of ticket.requirements) {
    switch (req.type) {
      case 'service_running': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host) return { passed: false, message: `Target host ${req.targetHostId} not found.` };
        const svc = host.services.find((s) => s.id === req.targetServiceId);
        if (!svc || svc.status !== 'running') {
          return {
            passed: false,
            message: `Service '${svc?.displayName || req.targetServiceId}' on ${host.id} is still ${
              svc?.status || 'missing'
            }.`,
          };
        }
        break;
      }

      case 'dns_resolved': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host) return { passed: false, message: `Host ${req.targetHostId} not found.` };
        // Check primary DNS configuration
        if (
          host.nic.primaryDns !== '192.168.10.200' &&
          host.nic.primaryDns !== '8.8.8.8' &&
          host.nic.primaryDns !== '1.1.1.1'
        ) {
          return {
            passed: false,
            message: `${host.id} primary DNS is set to ${host.nic.primaryDns}, which is not an active DNS server.`,
          };
        }
        // Test real resolution from this host
        const res = networkEngine.nslookup(host.id, 'example.com');
        if (!res.success) {
          return {
            passed: false,
            message: `DNS resolution test for example.com failed: ${res.errorMessage}`,
          };
        }
        break;
      }

      case 'ad_user_unlocked': {
        const user = networkEngine.getADUser(req.targetUsername || '');
        if (!user) return { passed: false, message: `User ${req.targetUsername} not found.` };
        if (user.isLocked) {
          return { passed: false, message: `User account '${user.username}' is still locked out.` };
        }
        break;
      }

      case 'ad_password_reset': {
        const user = networkEngine.getADUser(req.targetUsername || '');
        if (!user) return { passed: false, message: `User ${req.targetUsername} not found.` };
        if (user.passwordExpired) {
          return {
            passed: false,
            message: `Password for '${user.username}' is still marked as expired.`,
          };
        }
        break;
      }

      case 'ad_group_added': {
        const user = networkEngine.getADUser(req.targetUsername || '');
        if (!user) return { passed: false, message: `User ${req.targetUsername} not found.` };
        if (!user.groups.includes(req.expectedValue || '')) {
          return {
            passed: false,
            message: `User '${user.username}' is not a member of '${req.expectedValue}' group.`,
          };
        }
        break;
      }

      case 'ip_pingable': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host || !host.isOnline) return { passed: false, message: `Host ${req.targetHostId} is offline.` };
        const pingTest = networkEngine.ping('PC-IT-ADMIN', host.nic.ip);
        if (!pingTest.success) {
          return {
            passed: false,
            message: `Host ${host.id} (${host.nic.ip}) does not respond to ping: ${pingTest.errorMessage}`,
          };
        }
        break;
      }

      case 'dhcp_renewed': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host) return { passed: false, message: `Host ${req.targetHostId} not found.` };
        if (host.nic.ip.startsWith('169.254.') || host.nic.ip === '0.0.0.0') {
          return {
            passed: false,
            message: `Host ${host.id} still has APIPA/unassigned IP address (${host.nic.ip}).`,
          };
        }
        // Also check if collision still exists on 192.168.30.200
        if (host.id === 'PC-ENG-03' && host.nic.ip === '192.168.30.200') {
          return {
            passed: false,
            message: `Host ${host.id} is still conflicting with Printer PRN-ENG-01 on 192.168.30.200.`,
          };
        }
        break;
      }

      case 'device_enabled': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host) return { passed: false, message: `Host ${req.targetHostId} not found.` };
        const dev = host.devices.find((d) => d.id === req.expectedValue);
        if (!dev || dev.status !== 'enabled') {
          return {
            passed: false,
            message: `Device '${dev?.name || req.expectedValue}' on ${host.id} is still disabled.`,
          };
        }
        if (!host.nic.isUp) {
          return {
            passed: false,
            message: `Network interface for ${host.id} is still down.`,
          };
        }
        break;
      }

      case 'process_killed': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host) return { passed: false, message: `Host ${req.targetHostId} not found.` };
        const proc = host.processes.find(
          (p) => p.name.toLowerCase() === (req.expectedValue || '').toLowerCase()
        );
        if (proc) {
          return {
            passed: false,
            message: `Rogue process '${proc.name}' (PID ${proc.pid}) is still executing on ${host.id}.`,
          };
        }
        break;
      }

      case 'router_port_unblocked': {
        const cfg = networkEngine.getRouterConfig();
        const portNum = parseInt(req.expectedValue || '0', 10);
        if (cfg.blockedPorts.includes(portNum)) {
          return {
            passed: false,
            message: `Port ${portNum} is still in the router firewall blocked ports table.`,
          };
        }
        break;
      }

      case 'gateway_correct': {
        const host = networkEngine.getHost(req.targetHostId || '');
        if (!host) return { passed: false, message: `Host ${req.targetHostId} not found.` };
        if (host.nic.gateway !== req.expectedValue) {
          return {
            passed: false,
            message: `Default gateway on ${host.id} is ${host.nic.gateway}, expected ${req.expectedValue}.`,
          };
        }
        break;
      }

      case 'email_quarantined': {
        const msgId = req.expectedValue || 'MSG-101';
        const mailEngine = engines?.mailEngine;
        if (!mailEngine) return { passed: false, message: 'Email engine unavailable.' };
        const email = mailEngine.getEmail(msgId);
        if (!email || !email.quarantined) {
          return {
            passed: false,
            message: `Phishing email ${msgId} has not been quarantined in Email Client.`,
          };
        }
        break;
      }

      case 'host_isolated': {
        const hostId = req.targetHostId || 'PC-FIN-08';
        const securityEngine = engines?.securityEngine;
        if (!securityEngine) return { passed: false, message: 'EDR Security engine unavailable.' };
        if (!securityEngine.isHostIsolated(hostId)) {
          return {
            passed: false,
            message: `Host ${hostId} is not isolated from the corporate network. Isolate host in EDR Falcon Console.`,
          };
        }
        const procName = req.expectedValue || 'rundll32.exe';
        const activeThreat = securityEngine
          .getDetections()
          .some(
            (d: any) =>
              d.hostId === hostId &&
              d.processName.toLowerCase() === procName.toLowerCase() &&
              d.status === 'Active'
          );
        const host = networkEngine.getHost(hostId);
        const hostProc = host?.processes.some(
          (p: any) => p.name.toLowerCase() === procName.toLowerCase()
        );
        if (activeThreat || hostProc) {
          return {
            passed: false,
            message: `Malicious process '${procName}' is still active on ${hostId}. Terminate threat via EDR Falcon Console.`,
          };
        }
        break;
      }

      case 'gpo_linked': {
        const gpoEngine = engines?.gpoEngine;
        if (!gpoEngine) return { passed: false, message: 'Group Policy engine unavailable.' };
        const hostOu = req.targetHostId || 'Finance';
        const gpoId = req.expectedValue || 'GPO-02';
        const gpo = gpoEngine.getGpo(gpoId);
        if (!gpo || !gpo.enabled || gpo.targetOu !== hostOu) {
          return {
            passed: false,
            message: `GPO '${gpoId}' must be enabled and linked to ${hostOu} OU in Group Policy Management.`,
          };
        }
        const usbSetting = gpo.settings.find((s: any) => s.id === 'block_usb_storage');
        if (!usbSetting || !usbSetting.enabled) {
          return {
            passed: false,
            message: `GPO '${gpoId}' must have 'Block Removable Storage Devices' setting enabled.`,
          };
        }
        break;
      }

      case 'database_restored': {
        const backupEngine = engines?.backupEngine;
        if (!backupEngine) return { passed: false, message: 'Backup & DR engine unavailable.' };
        const dbName = req.expectedValue || 'ERP_Production_DB';
        const history = backupEngine.getRestoreHistory();
        const restored = history.some(
          (r: any) =>
            r.targetDatabase?.toLowerCase() === dbName.toLowerCase() ||
            r.targetHostId === (req.targetHostId || 'SQL-PROD-01')
        );
        if (!restored) {
          return {
            passed: false,
            message: `Database '${dbName}' has not been restored from a verified backup snapshot in Backup Manager.`,
          };
        }
        break;
      }

      case 'hardware_repaired': {
        const hardwareEngine = engines?.hardwareEngine;
        if (!hardwareEngine) return { passed: false, message: 'Hardware Workbench engine unavailable.' };
        const state = hardwareEngine.getBenchState();
        const postCode = state.postCode;
        const expected = req.expectedValue || '00';
        if (postCode !== expected) {
          return {
            passed: false,
            message: `Hardware POST code is currently '${postCode}' (${state.postMessage}). Replace defective RAM and reach POST '${expected}'.`,
          };
        }
        break;
      }

      case 'call_clues_extracted': {
        const phoneEngine = engines?.phoneEngine;
        const ticketId = req.expectedValue || ticket.id;
        const clues = phoneEngine ? phoneEngine.getRevealedClues(ticketId) : [];
        const ticketClues = ticket.revealedClues || [];
        if (clues.length === 0 && ticketClues.length === 0) {
          return {
            passed: false,
            message: 'No caller clues extracted yet. Open VoIP Softphone and conduct telephone consultation.',
          };
        }
        break;
      }

      case 'rack_repaired': {
        if (engines?.rackEngine?.isRackHealthyForTicket() !== true) {
          return {
            passed: false,
            message:
              'Rack layer-1 / RAID health check failed. Replace degraded patch cable CBL-104 on Gi0/18 and hot-swap faulty RAID drive bay on FS-SRV-01.',
          };
        }
        break;
      }

      case 'siem_ioc_blocked': {
        if (engines?.siemEngine?.isInvestigationResolved() !== true) {
          return {
            passed: false,
            message:
              'SIEM investigation incomplete. Pin >= 2 correlated attack logs, block attacker IP 185.220.101.44, and revoke compromised account svc_backup.',
          };
        }
        break;
      }

      case 'change_completed': {
        const crId = req.expectedValue || 'CR-202';
        if (engines?.changeEngine?.isChangeCompletedCleanly(crId) !== true) {
          return {
            passed: false,
            message: `Change Request ${crId} has not been completed cleanly. Enable HA failover replica, attach rollback plan, obtain CAB approval, and execute maintenance.`,
          };
        }
        break;
      }

      case 'dhcp_dns_fixed': {
        if (engines?.dhcpDnsEngine?.isDhcpAndDnsHealthy() !== true) {
          return {
            passed: false,
            message:
              'DHCP or DNS health check failed. Purge rogue DHCP leases on Sales VLAN 40 and update portal.corp.local A record to 192.168.10.202.',
          };
        }
        break;
      }

      case 'script_executed': {
        const pbId = req.expectedValue || 'PLAYBOOK-ENG-REMEDIATE';
        const scope: ScriptTargetScope = 'OU=Engineering';
        if (engines?.scriptEngine?.hasExecutedPlaybookOnScope(pbId, scope) !== true) {
          return {
            passed: false,
            message: `Playbook ${pbId} has not been executed across ${scope} in Script Studio.`,
          };
        }
        break;
      }

      case 'ssl_renewed': {
        const targetHost = req.targetHostId || 'WEB-INTRA-01';
        if (engines?.shiftEventEngine?.isSslValid(targetHost) !== true) {
          return {
            passed: false,
            message: `TLS certificate on ${targetHost} is still expired. Renew and deploy certificate in Change Control Console.`,
          };
        }
        break;
      }

      default:
        break;
    }
  }

  return { passed: true, message: 'All diagnostic checks passed! Network state is healthy.' };
}

export const verifyTicketResolution = validateTicket;
