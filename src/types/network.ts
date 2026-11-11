export type HostType = 'workstation' | 'server' | 'router' | 'switch' | 'printer' | 'firewall';
export type Department = 'Executive' | 'Finance' | 'Sales' | 'Engineering' | 'HR' | 'Marketing' | 'IT' | 'Infrastructure';
export type OS = 'Windows 11 Pro' | 'Windows Server 2022' | 'Ubuntu Server 22.04' | 'Embedded RouterOS' | 'Printer Firmware';

export interface Service {
  id: string;
  name: string;
  displayName: string;
  status: 'running' | 'stopped' | 'crashed' | 'hung';
  startupType: 'automatic' | 'manual' | 'disabled';
  description: string;
}

export interface NetworkInterface {
  name: string;
  mac: string;
  ip: string;
  subnetMask: string;
  gateway: string;
  primaryDns: string;
  secondaryDns: string;
  dhcpEnabled: boolean;
  isUp: boolean;
  speedMbps: number;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  eventId: number;
  level: 'Information' | 'Warning' | 'Error' | 'Critical';
  source: string;
  category: string;
  message: string;
}

export interface ADUser {
  username: string;
  displayName: string;
  email: string;
  department: Department;
  title: string;
  ou: string;
  groups: string[];
  isLocked: boolean;
  isEnabled: boolean;
  passwordExpired: boolean;
  badPasswordCount: number;
  assignedHostId: string;
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpu: number;
  ramMb: number;
  user: string;
  status: 'running' | 'hung' | 'malicious';
  description: string;
  canKill: boolean;
}

export interface DeviceItem {
  id: string;
  name: string;
  category: 'Network Adapters' | 'Disk Drives' | 'Display Adapters' | 'Print Queues' | 'System Devices';
  status: 'enabled' | 'disabled' | 'error';
  driver: string;
}

export interface SharedFolder {
  id: string;
  name: string;
  path: string;
  department: Department | 'All';
  allowedGroups: string[];
  isOnline: boolean;
  description: string;
}

export interface NetworkHost {
  id: string; // e.g. 'PC-FIN-04', 'DC-SRV-01'
  hostname: string;
  type: HostType;
  department: Department;
  os: OS;
  vlan: number;
  nic: NetworkInterface;
  services: Service[];
  processes: ProcessItem[];
  devices: DeviceItem[];
  logs: EventLogEntry[];
  connectedSwitchId: string;
  connectedPort: number;
  activeDirectoryUsername?: string;
  location: string;
  isOnline: boolean;
  cpuUsage: number;
  ramUsage: number;
  notes?: string;
  isIsolated?: boolean;
}

export interface DHCPEntry {
  ip: string;
  mac: string;
  hostname: string;
  leaseExpires: string;
}

export interface RouterConfig {
  wanIp: string;
  wanGateway: string;
  wanDns: string[];
  lanIp: string;
  lanSubnet: string;
  dhcpEnabled: boolean;
  dhcpRangeStart: string;
  dhcpRangeEnd: string;
  dhcpDnsServer: string;
  dhcpLeaseHours: number;
  dnsForwarders: string[];
  firewallEnabled: boolean;
  blockedPorts: number[];
  vlans: {
    id: number;
    name: string;
    subnet: string;
    gateway: string;
  }[];
  dhcpLeases: DHCPEntry[];
}

export interface PingResult {
  host: string;
  ipResolved: string;
  success: boolean;
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number;
  timesMs: number[];
  errorMessage?: string;
  ttl?: number;
}

export interface NslookupResult {
  query: string;
  dnsServerUsed: string;
  success: boolean;
  resolvedIp?: string;
  errorMessage?: string;
}

export interface TracertHop {
  hop: number;
  ip: string;
  hostname?: string;
  timeMs: number;
  timeout?: boolean;
}

export interface TracertResult {
  target: string;
  hops: TracertHop[];
  completed: boolean;
}

export interface PacketRecord {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  protocol: 'DNS' | 'ICMP' | 'HTTP' | 'HTTPS' | 'TCP' | 'ARP' | 'SMB' | 'DHCP';
  length: number;
  info: string;
  status: 'ok' | 'error' | 'warning';
}
