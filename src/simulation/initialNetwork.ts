import {
  NetworkHost,
  RouterConfig,
  ADUser,
  Service,
  EventLogEntry,
  ProcessItem,
  DeviceItem,
  SharedFolder,
} from '../types/network';

export const INITIAL_ROUTER_CONFIG: RouterConfig = {
  wanIp: '203.0.113.15',
  wanGateway: '203.0.113.1',
  wanDns: ['8.8.8.8', '1.1.1.1'],
  lanIp: '192.168.1.1',
  lanSubnet: '255.255.255.0',
  dhcpEnabled: true,
  dhcpRangeStart: '192.168.20.50',
  dhcpRangeEnd: '192.168.20.199',
  dhcpDnsServer: '192.168.10.200',
  dhcpLeaseHours: 24,
  dnsForwarders: ['8.8.8.8', '1.1.1.1'],
  firewallEnabled: true,
  blockedPorts: [],
  vlans: [
    { id: 10, name: 'Servers & Management', subnet: '192.168.10.0/24', gateway: '192.168.10.1' },
    { id: 20, name: 'Workstations (General)', subnet: '192.168.20.0/24', gateway: '192.168.20.1' },
    { id: 30, name: 'Engineering & R&D', subnet: '192.168.30.0/24', gateway: '192.168.30.1' },
    { id: 40, name: 'Executive Suite', subnet: '192.168.40.0/24', gateway: '192.168.40.1' },
  ],
  dhcpLeases: [],
};

export const INITIAL_SHARED_FOLDERS: SharedFolder[] = [
  {
    id: 'share_finance',
    name: 'Finance',
    path: 'D:\\Shares\\Finance',
    department: 'Finance',
    allowedGroups: ['Finance Users', 'Domain Admins'],
    isOnline: true,
    description: 'Corporate ledgers, tax returns, audits, and invoice repository.',
  },
  {
    id: 'share_engineering',
    name: 'Engineering',
    path: 'D:\\Shares\\Engineering',
    department: 'Engineering',
    allowedGroups: ['Engineering Users', 'Domain Admins'],
    isOnline: true,
    description: 'Firmware binaries, schematic CAD files, and CI artifacts.',
  },
  {
    id: 'share_payroll',
    name: 'Payroll',
    path: 'D:\\Shares\\Payroll',
    department: 'HR',
    allowedGroups: ['Payroll Access', 'Domain Admins'],
    isOnline: true,
    description: 'Confidential employee salaries, bank routing, and benefits.',
  },
  {
    id: 'share_public',
    name: 'Public',
    path: 'D:\\Shares\\Public',
    department: 'All',
    allowedGroups: ['Domain Users'],
    isOnline: true,
    description: 'General company forms, templates, branding guidelines, and newsletters.',
  },
  {
    id: 'share_executive',
    name: 'Executive',
    path: 'D:\\Shares\\Executive',
    department: 'Executive',
    allowedGroups: ['Executive Users', 'Domain Admins'],
    isOnline: true,
    description: 'Quarterly board meeting minutes, M&A filings, and investor decks.',
  },
];

export function createStandardWorkstationProcesses(username: string): ProcessItem[] {
  return [
    { pid: 4, name: 'System', cpu: 1, ramMb: 64, user: 'SYSTEM', status: 'running', description: 'NT Kernel & System', canKill: false },
    { pid: 412, name: 'smss.exe', cpu: 0, ramMb: 12, user: 'SYSTEM', status: 'running', description: 'Session Manager Subsystem', canKill: false },
    { pid: 588, name: 'csrss.exe', cpu: 1, ramMb: 24, user: 'SYSTEM', status: 'running', description: 'Client Server Runtime', canKill: false },
    { pid: 640, name: 'wininit.exe', cpu: 0, ramMb: 18, user: 'SYSTEM', status: 'running', description: 'Windows Start-Up Application', canKill: false },
    { pid: 720, name: 'services.exe', cpu: 1, ramMb: 36, user: 'SYSTEM', status: 'running', description: 'Services and Controller app', canKill: false },
    { pid: 732, name: 'lsass.exe', cpu: 1, ramMb: 48, user: 'SYSTEM', status: 'running', description: 'Local Security Authority Process', canKill: false },
    { pid: 880, name: 'svchost.exe', cpu: 2, ramMb: 120, user: 'SYSTEM', status: 'running', description: 'Host Process for Windows Services', canKill: false },
    { pid: 1420, name: 'explorer.exe', cpu: 3, ramMb: 180, user: username, status: 'running', description: 'Windows Explorer GUI', canKill: true },
    { pid: 2104, name: 'msedge.exe', cpu: 4, ramMb: 310, user: username, status: 'running', description: 'Microsoft Edge Browser', canKill: true },
    { pid: 3192, name: 'teams.exe', cpu: 2, ramMb: 240, user: username, status: 'running', description: 'Microsoft Teams Workplace Chat', canKill: true },
  ];
}

export function createStandardDevices(_hostId: string): DeviceItem[] {
  return [
    { id: 'nic0', name: 'Intel(R) Ethernet Connection I219-LM', category: 'Network Adapters', status: 'enabled', driver: 'e1d68x64.sys v12.19.2.45' },
    { id: 'disk0', name: 'Samsung NVMe SSD 980 PRO 1TB', category: 'Disk Drives', status: 'enabled', driver: 'disk.sys v10.0.22621' },
    { id: 'gpu0', name: 'Intel(R) UHD Graphics 770', category: 'Display Adapters', status: 'enabled', driver: 'igfx.sys v31.0.101.4575' },
    { id: 'prn0', name: 'Microsoft Print to PDF', category: 'Print Queues', status: 'enabled', driver: 'winprint.dll' },
    { id: 'sys0', name: 'ACPI x64-based PC Motherboard', category: 'System Devices', status: 'enabled', driver: 'acpi.sys' },
  ];
}

export function createStandardWorkstationServices(): Service[] {
  return [
    { id: 'dhcp_client', name: 'Dhcp', displayName: 'DHCP Client', status: 'running', startupType: 'automatic', description: 'Registers and updates IP addresses and DNS records.' },
    { id: 'dns_cache', name: 'Dnscache', displayName: 'DNS Client', status: 'running', startupType: 'automatic', description: 'Resolves and caches Domain Name System (DNS) names.' },
    { id: 'lanman_workstation', name: 'LanmanWorkstation', displayName: 'Workstation', status: 'running', startupType: 'automatic', description: 'Creates and maintains client network connections to remote servers.' },
    { id: 'spooler', name: 'Spooler', displayName: 'Print Spooler', status: 'running', startupType: 'automatic', description: 'Manages print queues and print communication.' },
    { id: 'wuauserv', name: 'wuauserv', displayName: 'Windows Update', status: 'running', startupType: 'automatic', description: 'Enables detection, download, and installation of updates.' },
    { id: 'windefend', name: 'WinDefend', displayName: 'Microsoft Defender Antivirus', status: 'running', startupType: 'automatic', description: 'Real-time protection against malware and ransomware.' },
    { id: 'termservice', name: 'TermService', displayName: 'Remote Desktop Services', status: 'running', startupType: 'manual', description: 'Allows users to connect interactively to a remote computer.' },
  ];
}

export function createServerServices(role: 'dc' | 'file' | 'web' | 'sql'): Service[] {
  const base = createStandardWorkstationServices();
  if (role === 'dc') {
    return [
      ...base,
      { id: 'dns', name: 'DNS', displayName: 'DNS Server', status: 'running', startupType: 'automatic', description: 'Translates domain names to IP addresses for the enterprise directory.' },
      { id: 'ntds', name: 'NTDS', displayName: 'Active Directory Domain Services', status: 'running', startupType: 'automatic', description: 'Provides authentication and directory management services.' },
      { id: 'dhcpserver', name: 'DHCPServer', displayName: 'DHCP Server', status: 'running', startupType: 'automatic', description: 'Allocates IP addresses dynamically to LAN clients.' },
      { id: 'kdc', name: 'Kdc', displayName: 'Kerberos Key Distribution Center', status: 'running', startupType: 'automatic', description: 'Manages Kerberos authentication tickets.' },
    ];
  } else if (role === 'file') {
    return [
      ...base,
      { id: 'lanmanserver', name: 'LanmanServer', displayName: 'Server (SMB/CIFS)', status: 'running', startupType: 'automatic', description: 'Supports file, print, and named-pipe sharing.' },
      { id: 'spooler', name: 'Spooler', displayName: 'Print Spooler', status: 'crashed', startupType: 'automatic', description: 'Manages enterprise network print queues.' },
    ];
  } else if (role === 'web') {
    return [
      ...base,
      { id: 'w3svc', name: 'W3SVC', displayName: 'World Wide Web Publishing Service', status: 'running', startupType: 'automatic', description: 'Provides Web connectivity and administration via HTTP/HTTPS.' },
      { id: 'iisadmin', name: 'IISADMIN', displayName: 'IIS Admin Service', status: 'running', startupType: 'automatic', description: 'Enables administration of the IIS metabase and Web services.' },
    ];
  } else {
    return [
      ...base,
      { id: 'mssqlserver', name: 'MSSQLSERVER', displayName: 'SQL Server (MSSQLSERVER)', status: 'running', startupType: 'automatic', description: 'Provides storage, processing, and security of corporate databases.' },
      { id: 'sqlbrowser', name: 'SQLBrowser', displayName: 'SQL Server Browser', status: 'running', startupType: 'automatic', description: 'Provides SQL Server connection information to client computers.' },
    ];
  }
}

// 50 Corporate Employees data with titles, OUs and assigned workstations
const EMPLOYEES_DEF = [
  // Executive (4)
  { id: 'PC-EXEC-01', user: 'rhastings', name: 'Richard Hastings', dept: 'Executive' as const, title: 'Chief Executive Officer', ou: 'Executive', ip: '192.168.40.10', vlan: 40 },
  { id: 'PC-EXEC-02', user: 'cvance', name: 'Claire Vance', dept: 'Executive' as const, title: 'Chief Operating Officer', ou: 'Executive', ip: '192.168.40.11', vlan: 40 },
  { id: 'PC-EXEC-03', user: 'msterling', name: 'Marcus Sterling', dept: 'Executive' as const, title: 'Chief Financial Officer', ou: 'Executive', ip: '192.168.40.12', vlan: 40 },
  { id: 'PC-EXEC-04', user: 'eklein', name: 'Elena Klein', dept: 'Executive' as const, title: 'Executive Assistant', ou: 'Executive', ip: '192.168.40.13', vlan: 40 },

  // Finance (8)
  { id: 'PC-FIN-01', user: 'dnovak', name: 'David Novak', dept: 'Finance' as const, title: 'Finance Director', ou: 'Finance', ip: '192.168.20.10', vlan: 20 },
  { id: 'PC-FIN-02', user: 'ajames', name: 'Amanda James', dept: 'Finance' as const, title: 'Senior Financial Analyst', ou: 'Finance', ip: '192.168.20.11', vlan: 20 },
  { id: 'PC-FIN-03', user: 'tchen', name: 'Timothy Chen', dept: 'Finance' as const, title: 'Senior Accountant', ou: 'Finance', ip: '192.168.20.12', vlan: 20 },
  { id: 'PC-FIN-04', user: 'smitchell', name: 'Sarah Mitchell', dept: 'Finance' as const, title: 'Accounts Payable Specialist', ou: 'Finance', ip: '192.168.20.13', vlan: 20 },
  { id: 'PC-FIN-05', user: 'bcooper', name: 'Brian Cooper', dept: 'Finance' as const, title: 'Payroll Manager', ou: 'Finance', ip: '192.168.20.14', vlan: 20 },
  { id: 'PC-FIN-06', user: 'lgarcia', name: 'Laura Garcia', dept: 'Finance' as const, title: 'Billing Coordinator', ou: 'Finance', ip: '192.168.20.15', vlan: 20 },
  { id: 'PC-FIN-07', user: 'kpatel', name: 'Kavita Patel', dept: 'Finance' as const, title: 'Tax Accountant', ou: 'Finance', ip: '192.168.20.16', vlan: 20 },
  { id: 'PC-FIN-08', user: 'jwebber', name: 'Jonathan Webber', dept: 'Finance' as const, title: 'Audit Specialist', ou: 'Finance', ip: '192.168.20.17', vlan: 20 },

  // Engineering & R&D (12)
  { id: 'PC-ENG-01', user: 'alovelace', name: 'Ada Lovelace', dept: 'Engineering' as const, title: 'VP of Engineering', ou: 'Engineering', ip: '192.168.30.10', vlan: 30 },
  { id: 'PC-ENG-02', user: 'lkumar', name: 'Liam Kumar', dept: 'Engineering' as const, title: 'Lead DevOps Architect', ou: 'Engineering', ip: '192.168.30.11', vlan: 30 },
  { id: 'PC-ENG-03', user: 'srossi', name: 'Sofia Rossi', dept: 'Engineering' as const, title: 'Principal Software Engineer', ou: 'Engineering', ip: '192.168.30.12', vlan: 30 },
  { id: 'PC-ENG-04', user: 'dnguyen', name: 'Daniel Nguyen', dept: 'Engineering' as const, title: 'Senior Backend Engineer', ou: 'Engineering', ip: '192.168.30.13', vlan: 30 },
  { id: 'PC-ENG-05', user: 'eokafor', name: 'Emeka Okafor', dept: 'Engineering' as const, title: 'Frontend Team Lead', ou: 'Engineering', ip: '192.168.30.14', vlan: 30 },
  { id: 'PC-ENG-06', user: 'mkowalski', name: 'Mateusz Kowalski', dept: 'Engineering' as const, title: 'Site Reliability Engineer', ou: 'Engineering', ip: '192.168.30.15', vlan: 30 },
  { id: 'PC-ENG-07', user: 'cdupont', name: 'Chloe Dupont', dept: 'Engineering' as const, title: 'Full Stack Engineer', ou: 'Engineering', ip: '192.168.30.16', vlan: 30 },
  { id: 'PC-ENG-08', user: 'mhorvat', name: 'Marek Horvat', dept: 'Engineering' as const, title: 'Cloud Infrastructure Eng', ou: 'Engineering', ip: '192.168.30.17', vlan: 30 },
  { id: 'PC-ENG-09', user: 'zali', name: 'Zainab Ali', dept: 'Engineering' as const, title: 'Security Engineer', ou: 'Engineering', ip: '192.168.30.18', vlan: 30 },
  { id: 'PC-ENG-10', user: 'twilson', name: 'Toby Wilson', dept: 'Engineering' as const, title: 'QA Automation Lead', ou: 'Engineering', ip: '192.168.30.19', vlan: 30 },
  { id: 'PC-ENG-11', user: 'hle', name: 'Hanh Le', dept: 'Engineering' as const, title: 'Data Engineer', ou: 'Engineering', ip: '192.168.30.20', vlan: 30 },
  { id: 'PC-ENG-12', user: 'rberg', name: 'Robin Berg', dept: 'Engineering' as const, title: 'Junior Developer', ou: 'Engineering', ip: '192.168.30.21', vlan: 30 },

  // Sales (12)
  { id: 'PC-SALES-01', user: 'vramirez', name: 'Victor Ramirez', dept: 'Sales' as const, title: 'VP of Global Sales', ou: 'Sales', ip: '192.168.20.30', vlan: 20 },
  { id: 'PC-SALES-02', user: 'bbrown', name: 'Brooke Brown', dept: 'Sales' as const, title: 'Enterprise Account Executive', ou: 'Sales', ip: '192.168.20.31', vlan: 20 },
  { id: 'PC-SALES-03', user: 'cjenkins', name: 'Carl Jenkins', dept: 'Sales' as const, title: 'Senior Sales Director', ou: 'Sales', ip: '192.168.20.32', vlan: 20 },
  { id: 'PC-SALES-04', user: 'jwright', name: 'Jessica Wright', dept: 'Sales' as const, title: 'Strategic Account Rep', ou: 'Sales', ip: '192.168.20.33', vlan: 20 },
  { id: 'PC-SALES-05', user: 'kmartin', name: 'Kevin Martin', dept: 'Sales' as const, title: 'Territory Sales Lead', ou: 'Sales', ip: '192.168.20.34', vlan: 20 },
  { id: 'PC-SALES-06', user: 'nmatsuda', name: 'Naomi Matsuda', dept: 'Sales' as const, title: 'Inbound Sales Rep', ou: 'Sales', ip: '192.168.20.35', vlan: 20 },
  { id: 'PC-SALES-07', user: 'pdoyle', name: 'Patrick Doyle', dept: 'Sales' as const, title: 'Business Development Rep', ou: 'Sales', ip: '192.168.20.36', vlan: 20 },
  { id: 'PC-SALES-08', user: 'sconnor', name: 'Samantha Connor', dept: 'Sales' as const, title: 'Customer Success Manager', ou: 'Sales', ip: '192.168.20.37', vlan: 20 },
  { id: 'PC-SALES-09', user: 'twilliams', name: 'Tyler Williams', dept: 'Sales' as const, title: 'Solutions Consultant', ou: 'Sales', ip: '192.168.20.38', vlan: 20 },
  { id: 'PC-SALES-10', user: 'vross', name: 'Vanessa Ross', dept: 'Sales' as const, title: 'Renewals Specialist', ou: 'Sales', ip: '192.168.20.39', vlan: 20 },
  { id: 'PC-SALES-11', user: 'ypark', name: 'Yujin Park', dept: 'Sales' as const, title: 'Sales Enablement Manager', ou: 'Sales', ip: '192.168.20.40', vlan: 20 },
  { id: 'PC-SALES-12', user: 'ztate', name: 'Zachary Tate', dept: 'Sales' as const, title: 'Commercial Account Executive', ou: 'Sales', ip: '192.168.20.41', vlan: 20 },

  // Human Resources (5)
  { id: 'PC-HR-01', user: 'hfoster', name: 'Heather Foster', dept: 'HR' as const, title: 'Head of People Operations', ou: 'HR', ip: '192.168.20.50', vlan: 20 },
  { id: 'PC-HR-02', user: 'gstone', name: 'Gregory Stone', dept: 'HR' as const, title: 'Senior Talent Acquisition', ou: 'HR', ip: '192.168.20.51', vlan: 20 },
  { id: 'PC-HR-03', user: 'mwaters', name: 'Megan Waters', dept: 'HR' as const, title: 'HR Generalist & Benefits', ou: 'HR', ip: '192.168.20.52', vlan: 20 },
  { id: 'PC-HR-04', user: 'mkelly', name: 'Michael Kelly', dept: 'HR' as const, title: 'Employee Relations Lead', ou: 'HR', ip: '192.168.20.53', vlan: 20 },
  { id: 'PC-HR-05', user: 'nbishop', name: 'Natalie Bishop', dept: 'HR' as const, title: 'People Experience Coordinator', ou: 'HR', ip: '192.168.20.54', vlan: 20 },

  // Marketing (6)
  { id: 'PC-MKT-01', user: 'amorgan', name: 'Alex Morgan', dept: 'Marketing' as const, title: 'Chief Marketing Officer', ou: 'Marketing', ip: '192.168.20.60', vlan: 20 },
  { id: 'PC-MKT-02', user: 'bhowell', name: 'Bradley Howell', dept: 'Marketing' as const, title: 'Senior Brand Strategist', ou: 'Marketing', ip: '192.168.20.61', vlan: 20 },
  { id: 'PC-MKT-03', user: 'cjones', name: 'Clara Jones', dept: 'Marketing' as const, title: 'Digital Content Lead', ou: 'Marketing', ip: '192.168.20.62', vlan: 20 },
  { id: 'PC-MKT-04', user: 'dshaffer', name: 'Derek Shaffer', dept: 'Marketing' as const, title: 'SEO & Growth Analyst', ou: 'Marketing', ip: '192.168.20.63', vlan: 20 },
  { id: 'PC-MKT-05', user: 'jfields', name: 'Julia Fields', dept: 'Marketing' as const, title: 'Creative Designer', ou: 'Marketing', ip: '192.168.20.64', vlan: 20 },
  { id: 'PC-MKT-06', user: 'owren', name: 'Oliver Wren', dept: 'Marketing' as const, title: 'Product Marketing Manager', ou: 'Marketing', ip: '192.168.20.65', vlan: 20 },

  // IT Operations (3 - includes player workstation)
  { id: 'PC-IT-ADMIN', user: 'admin', name: 'IT Admin (You)', dept: 'IT' as const, title: 'Systems Support Engineer', ou: 'IT', ip: '192.168.10.50', vlan: 10 },
  { id: 'PC-IT-02', user: 'fsimpson', name: 'Frank Simpson', dept: 'IT' as const, title: 'Senior Infrastructure Lead', ou: 'IT', ip: '192.168.10.51', vlan: 10 },
  { id: 'PC-IT-BENCH', user: 'bench', name: 'Hardware Repair Bench', dept: 'IT' as const, title: 'Diagnostic Workstation', ou: 'IT', ip: '192.168.10.52', vlan: 10 },
];

export function buildInitialActiveDirectory(): ADUser[] {
  return EMPLOYEES_DEF.map((emp) => {
    const isLiam = emp.user === 'lkumar';
    const isMarcus = emp.user === 'msterling';
    const isNatalie = emp.user === 'nbishop';

    const groups = [
      'Domain Users',
      emp.dept === 'IT' ? 'Domain Admins' : `${emp.dept} Users`,
    ];

    // Natalie is missing Payroll Access initially for ticket INC-1055
    if (emp.dept === 'HR' && !isNatalie) {
      groups.push('Payroll Access');
    }

    return {
      username: emp.user,
      displayName: emp.name,
      email: `${emp.user}@corp.local`,
      department: emp.dept,
      title: emp.title,
      ou: emp.ou,
      groups,
      isLocked: isLiam, // Liam Kumar starts locked (Incident INC-1043)
      isEnabled: true,
      passwordExpired: isLiam || isMarcus, // Marcus Sterling password expired (INC-1054)
      badPasswordCount: isLiam ? 5 : 0,
      assignedHostId: emp.id,
    };
  });
}

export function buildInitialNetworkHosts(): NetworkHost[] {
  const hosts: NetworkHost[] = [];

  // 1. Core Router / Gateway
  hosts.push({
    id: 'RTR-CORE-01',
    hostname: 'rtr-core-01.corp.local',
    type: 'router',
    department: 'Infrastructure',
    os: 'Embedded RouterOS',
    vlan: 1,
    nic: {
      name: 'eth0',
      mac: '52:54:00:1A:00:01',
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0',
      gateway: '203.0.113.1',
      primaryDns: '8.8.8.8',
      secondaryDns: '1.1.1.1',
      dhcpEnabled: false,
      isUp: true,
      speedMbps: 10000,
    },
    services: [
      { id: 'routing', name: 'RoutingDaemon', displayName: 'OSPF/BGP Daemon', status: 'running', startupType: 'automatic', description: 'Core inter-VLAN routing.' },
      { id: 'nat_firewall', name: 'Firewall', displayName: 'Stateful Packet Inspection', status: 'running', startupType: 'automatic', description: 'NAT and egress filtering.' },
    ],
    processes: [
      { pid: 1, name: 'routeros_kernel', cpu: 2, ramMb: 64, user: 'root', status: 'running', description: 'RouterOS Core Kernel', canKill: false },
      { pid: 82, name: 'routing_engine', cpu: 4, ramMb: 128, user: 'root', status: 'running', description: 'IP Routing & Packet Forwarding', canKill: false },
      { pid: 140, name: 'firewall_filter', cpu: 3, ramMb: 80, user: 'root', status: 'running', description: 'Stateful Firewall Inspection', canKill: false },
    ],
    devices: [
      { id: 'eth0', name: 'Gigabit WAN SFP+ Fiber 10G', category: 'Network Adapters', status: 'enabled', driver: 'ixgbe' },
      { id: 'lan0', name: 'Internal 802.1Q VLAN Trunk Port', category: 'Network Adapters', status: 'enabled', driver: 'bridge' },
    ],
    logs: [
      { id: 'log-rtr-1', timestamp: '08:00:12', eventId: 100, level: 'Information', source: 'Kernel', category: 'System', message: 'Core router boot sequence completed. All subnets routed.' }
    ],
    connectedSwitchId: 'SW-CORE-01',
    connectedPort: 1,
    location: 'Server Room Rack 01',
    isOnline: true,
    cpuUsage: 9,
    ramUsage: 22,
  });

  // 2. Core Switches
  const switches = [
    { id: 'SW-CORE-01', name: 'sw-core-01.corp.local', ip: '192.168.10.2' },
    { id: 'SW-DIST-01', name: 'sw-dist-01.corp.local', ip: '192.168.10.3' },
    { id: 'SW-EDGE-01', name: 'sw-edge-01.corp.local', ip: '192.168.20.2' },
  ];

  switches.forEach((sw, idx) => {
    hosts.push({
      id: sw.id,
      hostname: sw.name,
      type: 'switch',
      department: 'Infrastructure',
      os: 'Embedded RouterOS',
      vlan: 10,
      nic: {
        name: 'mgmt0',
        mac: `52:54:00:2B:00:0${idx + 1}`,
        ip: sw.ip,
        subnetMask: '255.255.255.0',
        gateway: '192.168.10.1',
        primaryDns: '192.168.10.200',
        secondaryDns: '8.8.8.8',
        dhcpEnabled: false,
        isUp: true,
        speedMbps: 10000,
      },
      services: [],
      processes: [
        { pid: 1, name: 'switch_os', cpu: 1, ramMb: 32, user: 'root', status: 'running', description: 'Switch Hardware Management', canKill: false },
      ],
      devices: [
        { id: 'sw_mgmt', name: '48-Port Managed Switch Plane', category: 'Network Adapters', status: 'enabled', driver: 'switchcore' },
      ],
      logs: [],
      connectedSwitchId: 'SW-CORE-01',
      connectedPort: idx + 2,
      location: 'MDF Communications Closet',
      isOnline: true,
      cpuUsage: 4,
      ramUsage: 14,
    });
  });

  // 3. Infrastructure Servers (VLAN 10)
  // DC-SRV-01: Primary Domain Controller & DNS/DHCP
  hosts.push({
    id: 'DC-SRV-01',
    hostname: 'dc-srv-01.corp.local',
    type: 'server',
    department: 'Infrastructure',
    os: 'Windows Server 2022',
    vlan: 10,
    nic: {
      name: 'Ethernet0',
      mac: '52:54:00:DC:01:01',
      ip: '192.168.10.200',
      subnetMask: '255.255.255.0',
      gateway: '192.168.10.1',
      primaryDns: '127.0.0.1',
      secondaryDns: '8.8.8.8',
      dhcpEnabled: false,
      isUp: true,
      speedMbps: 10000,
    },
    services: createServerServices('dc'),
    processes: [
      { pid: 4, name: 'System', cpu: 1, ramMb: 96, user: 'SYSTEM', status: 'running', description: 'NT Kernel', canKill: false },
      { pid: 512, name: 'dns.exe', cpu: 2, ramMb: 140, user: 'SYSTEM', status: 'running', description: 'Microsoft DNS Server Daemon', canKill: true },
      { pid: 618, name: 'ntds.exe', cpu: 3, ramMb: 420, user: 'SYSTEM', status: 'running', description: 'Active Directory Domain Database', canKill: false },
      { pid: 740, name: 'dhcpserver.exe', cpu: 1, ramMb: 90, user: 'SYSTEM', status: 'running', description: 'DHCP Address Allocation Service', canKill: true },
      { pid: 820, name: 'kdc.exe', cpu: 1, ramMb: 75, user: 'SYSTEM', status: 'running', description: 'Kerberos KDC Ticket Server', canKill: true },
    ],
    devices: createStandardDevices('DC-SRV-01'),
    logs: [
      { id: 'log-dc-1', timestamp: '07:45:00', eventId: 1000, level: 'Information', source: 'ActiveDirectory', category: 'Directory Services', message: 'Domain CORP.LOCAL directory services initialized.' },
      { id: 'log-dc-2', timestamp: '08:02:14', eventId: 4625, level: 'Warning', source: 'Microsoft-Windows-Security-Auditing', category: 'Logon', message: 'An account failed to log on. Account Name: lkumar. Reason: Bad password attempts exceeded threshold. Account locked.' },
    ],
    connectedSwitchId: 'SW-CORE-01',
    connectedPort: 5,
    location: 'Server Room Rack 02',
    isOnline: true,
    cpuUsage: 14,
    ramUsage: 42,
    notes: 'Active Directory Primary Domain Controller, Global Catalog, authoritative DNS server.',
  });

  // FS-SRV-01: File & Print Server
  hosts.push({
    id: 'FS-SRV-01',
    hostname: 'fs-srv-01.corp.local',
    type: 'server',
    department: 'Infrastructure',
    os: 'Windows Server 2022',
    vlan: 10,
    nic: {
      name: 'Ethernet0',
      mac: '52:54:00:FS:01:01',
      ip: '192.168.10.210',
      subnetMask: '255.255.255.0',
      gateway: '192.168.10.1', // Default gateway
      primaryDns: '192.168.10.200',
      secondaryDns: '8.8.8.8',
      dhcpEnabled: false,
      isUp: true,
      speedMbps: 10000,
    },
    services: createServerServices('file'),
    processes: [
      { pid: 4, name: 'System', cpu: 1, ramMb: 80, user: 'SYSTEM', status: 'running', description: 'NT Kernel', canKill: false },
      { pid: 540, name: 'srvsvc.dll', cpu: 3, ramMb: 320, user: 'SYSTEM', status: 'running', description: 'Server Service (SMB 3.1.1 / Shares)', canKill: false },
      { pid: 612, name: 'spoolsv.exe', cpu: 1, ramMb: 110, user: 'SYSTEM', status: 'hung', description: 'Print Spooler Subsystem (HUNG/CRASHED)', canKill: true },
    ],
    devices: createStandardDevices('FS-SRV-01'),
    logs: [
      { id: 'log-fs-1', timestamp: '08:12:00', eventId: 7034, level: 'Error', source: 'Service Control Manager', category: 'Print Spooler', message: 'The Print Spooler service terminated unexpectedly.' },
    ],
    connectedSwitchId: 'SW-CORE-01',
    connectedPort: 6,
    location: 'Server Room Rack 02',
    isOnline: true,
    cpuUsage: 8,
    ramUsage: 32,
  });

  // WEB-INTRA-01: Intranet & Wiki
  hosts.push({
    id: 'WEB-INTRA-01',
    hostname: 'web-intra-01.corp.local',
    type: 'server',
    department: 'Infrastructure',
    os: 'Ubuntu Server 22.04',
    vlan: 10,
    nic: {
      name: 'ens3',
      mac: '52:54:00:WB:01:01',
      ip: '192.168.10.220',
      subnetMask: '255.255.255.0',
      gateway: '192.168.10.1',
      primaryDns: '192.168.10.200',
      secondaryDns: '8.8.8.8',
      dhcpEnabled: false,
      isUp: true,
      speedMbps: 10000,
    },
    services: createServerServices('web'),
    processes: [
      { pid: 1, name: 'systemd', cpu: 0, ramMb: 18, user: 'root', status: 'running', description: 'Init System', canKill: false },
      { pid: 480, name: 'nginx', cpu: 2, ramMb: 68, user: 'www-data', status: 'running', description: 'Nginx Web Server Reverse Proxy', canKill: true },
      { pid: 512, name: 'node', cpu: 3, ramMb: 240, user: 'wiki', status: 'running', description: 'Internal Corporate Wiki Application', canKill: true },
    ],
    devices: createStandardDevices('WEB-INTRA-01'),
    logs: [],
    connectedSwitchId: 'SW-CORE-01',
    connectedPort: 7,
    location: 'Server Room Rack 03',
    isOnline: true,
    cpuUsage: 12,
    ramUsage: 25,
  });

  // SQL-PROD-01: Database Server (Has rogue crypto miner candidate)
  hosts.push({
    id: 'SQL-PROD-01',
    hostname: 'sql-prod-01.corp.local',
    type: 'server',
    department: 'Infrastructure',
    os: 'Windows Server 2022',
    vlan: 10,
    nic: {
      name: 'Ethernet0',
      mac: '52:54:00:SQ:01:01',
      ip: '192.168.10.230',
      subnetMask: '255.255.255.0',
      gateway: '192.168.10.1',
      primaryDns: '192.168.10.200',
      secondaryDns: '8.8.8.8',
      dhcpEnabled: false,
      isUp: true,
      speedMbps: 10000,
    },
    services: createServerServices('sql'),
    processes: [
      { pid: 4, name: 'System', cpu: 1, ramMb: 80, user: 'SYSTEM', status: 'running', description: 'NT Kernel', canKill: false },
      { pid: 1120, name: 'sqlservr.exe', cpu: 12, ramMb: 1420, user: 'MSSQLSERVER', status: 'running', description: 'Microsoft SQL Server Database Engine', canKill: false },
      { pid: 4812, name: 'xmrig_miner.exe', cpu: 82, ramMb: 650, user: 'SYSTEM', status: 'malicious', description: 'Rogue Unregistered Mining Process (Consuming 82% CPU)', canKill: true },
    ],
    devices: createStandardDevices('SQL-PROD-01'),
    logs: [
      { id: 'log-sql-1', timestamp: '08:20:00', eventId: 2004, level: 'Warning', source: 'Resource-Exhaustion-Detector', category: 'Performance', message: 'Windows successfully diagnosed a resource exhaustion condition. Process xmrig_miner.exe (PID 4812) consumed excessive CPU cycles.' },
    ],
    connectedSwitchId: 'SW-CORE-01',
    connectedPort: 8,
    location: 'Server Room Rack 03',
    isOnline: true,
    cpuUsage: 95,
    ramUsage: 78,
  });

  // 4. Network Printers
  const printers = [
    { id: 'PRN-FIN-01', hostname: 'prn-fin-01.corp.local', dept: 'Finance' as const, ip: '192.168.20.200', vlan: 20 },
    { id: 'PRN-ENG-01', hostname: 'prn-eng-01.corp.local', dept: 'Engineering' as const, ip: '192.168.30.200', vlan: 30 },
    { id: 'PRN-EXEC-01', hostname: 'prn-exec-01.corp.local', dept: 'Executive' as const, ip: '192.168.40.200', vlan: 40 },
  ];

  printers.forEach((p, idx) => {
    hosts.push({
      id: p.id,
      hostname: p.hostname,
      type: 'printer',
      department: p.dept,
      os: 'Printer Firmware',
      vlan: p.vlan,
      nic: {
        name: 'eth0',
        mac: `00:1B:A9:44:99:0${idx + 1}`,
        ip: p.ip,
        subnetMask: '255.255.255.0',
        gateway: `192.168.${p.vlan}.1`,
        primaryDns: '192.168.10.200',
        secondaryDns: '8.8.8.8',
        dhcpEnabled: false,
        isUp: true,
        speedMbps: 1000,
      },
      services: [],
      processes: [
        { pid: 1, name: 'lpd', cpu: 1, ramMb: 16, user: 'root', status: 'running', description: 'Line Printer Daemon', canKill: false },
      ],
      devices: [
        { id: 'prn_nic', name: 'HP JetDirect Gigabit Interface', category: 'Network Adapters', status: 'enabled', driver: 'jetdirect' },
      ],
      logs: [],
      connectedSwitchId: 'SW-DIST-01',
      connectedPort: 10 + idx,
      location: `${p.dept} Copy Area`,
      isOnline: true,
      cpuUsage: 2,
      ramUsage: 8,
    });
  });

  // 5. All 50 Employee Workstations
  EMPLOYEES_DEF.forEach((emp, idx) => {
    const hexIdx = idx.toString(16).padStart(2, '0').toUpperCase();
    const mac = `00:15:5D:88:${emp.vlan.toString(16).padStart(2, '0')}:${hexIdx}`;

    // Conditions:
    // Sarah Mitchell (PC-FIN-04): DNS Server = 192.168.10.250 (invalid), secondary = empty!
    const isSarahMitchell = emp.id === 'PC-FIN-04';
    const primaryDns = isSarahMitchell ? '192.168.10.250' : '192.168.10.200';
    const secondaryDns = isSarahMitchell ? '' : '8.8.8.8';

    // Clara Jones (PC-MKT-03): Network Adapter device starts DISABLED in Device Manager!
    const isClaraJones = emp.id === 'PC-MKT-03';

    // Sofia Rossi (PC-ENG-03): Static IP collision with printer PRN-ENG-01 (192.168.30.200) for INC-1044
    const isSofiaRossi = emp.id === 'PC-ENG-03';
    const ip = isSofiaRossi ? '192.168.30.200' : emp.ip;

    const devices = createStandardDevices(emp.id);
    if (isClaraJones) {
      const nicDev = devices.find((d) => d.id === 'nic0');
      if (nicDev) nicDev.status = 'disabled';
    }

    const logs: EventLogEntry[] = [
      {
        id: `log-${emp.id}-boot`,
        timestamp: '08:05:00',
        eventId: 6005,
        level: 'Information',
        source: 'EventLog',
        category: 'System',
        message: 'The Event log service was started.',
      },
    ];

    if (isSarahMitchell) {
      logs.push({
        id: `log-${emp.id}-dns-err`,
        timestamp: '08:15:32',
        eventId: 1014,
        level: 'Warning',
        source: 'Microsoft-Windows-DNS-Client',
        category: 'DNS',
        message: 'Name resolution for the name example.com timed out after none of the configured DNS servers (192.168.10.250) responded.',
      });
    }

    if (isClaraJones) {
      logs.push({
        id: `log-${emp.id}-nic-disabled`,
        timestamp: '08:10:14',
        eventId: 4202,
        level: 'Warning',
        source: 'Tcpip',
        category: 'Network',
        message: 'The network adapter Intel(R) Ethernet Connection I219-LM was disabled by user action in Device Manager.',
      });
    }

    if (isSofiaRossi) {
      logs.push({
        id: `log-${emp.id}-ip-collision`,
        timestamp: '08:18:22',
        eventId: 4199,
        level: 'Error',
        source: 'Tcpip',
        category: 'Network',
        message: 'The system detected an address conflict for IP address 192.168.30.200 with the system having network hardware address 00:1B:A9:44:99:02.',
      });
    }

    const processes = createStandardWorkstationProcesses(emp.user);
    if (emp.id === 'PC-FIN-08') {
      processes.push({
        pid: 5820,
        name: 'rundll32.exe',
        cpu: 8,
        ramMb: 45,
        user: emp.user,
        status: 'malicious',
        description: 'Cobalt Strike Beacon Stager (rundll32)',
        canKill: true,
      });
    }
    if (emp.id === 'PC-ENG-05') {
      processes.push({
        pid: 6240,
        name: 'lsass_dump.exe',
        cpu: 15,
        ramMb: 64,
        user: emp.user,
        status: 'malicious',
        description: 'Mimikatz LSASS Memory Dumper',
        canKill: true,
      });
    }
    if (emp.id === 'PC-MKT-02') {
      processes.push({
        pid: 7112,
        name: 'powershell.exe',
        cpu: 12,
        ramMb: 85,
        user: emp.user,
        status: 'malicious',
        description: 'Suspicious Encoded PowerShell Script',
        canKill: true,
      });
    }

    hosts.push({
      id: emp.id,
      hostname: `${emp.id.toLowerCase()}.corp.local`,
      type: 'workstation',
      department: emp.dept,
      os: 'Windows 11 Pro',
      vlan: emp.vlan,
      nic: {
        name: 'Ethernet',
        mac,
        ip,
        subnetMask: '255.255.255.0',
        gateway: `192.168.${emp.vlan}.1`,
        primaryDns,
        secondaryDns,
        dhcpEnabled: !isSarahMitchell && !isSofiaRossi,
        isUp: !isClaraJones, // Clara starts with adapter disabled
        speedMbps: 1000,
      },
      services: createStandardWorkstationServices(),
      processes,
      devices,
      logs,
      connectedSwitchId: emp.vlan === 30 ? 'SW-DIST-01' : 'SW-EDGE-01',
      connectedPort: (idx % 24) + 1,
      activeDirectoryUsername: emp.user,
      location: `${emp.dept} Floor Cube ${idx + 1}`,
      isOnline: true,
      cpuUsage: Math.floor(10 + Math.random() * 20),
      ramUsage: Math.floor(30 + Math.random() * 25),
    });
  });

  return hosts;
}
