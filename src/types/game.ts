import { Department } from './network';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Failed';

export interface TicketRequirement {
  type: 
    | 'service_running' 
    | 'dns_resolved' 
    | 'ip_pingable' 
    | 'ad_user_unlocked' 
    | 'ad_password_reset' 
    | 'ad_group_added'
    | 'gateway_correct' 
    | 'router_port_unblocked' 
    | 'dhcp_renewed'
    | 'process_killed'
    | 'device_enabled'
    | 'share_accessible'
    | 'vlan_corrected'
    | 'email_quarantined'
    | 'host_isolated'
    | 'gpo_linked'
    | 'database_restored'
    | 'hardware_repaired'
    | 'call_clues_extracted'
    | 'rack_repaired'
    | 'siem_ioc_blocked'
    | 'change_completed'
    | 'dhcp_dns_fixed'
    | 'script_executed'
    | 'ssl_renewed';
  targetHostId?: string;
  targetUsername?: string;
  targetServiceId?: string;
  expectedValue?: string;
  description: string;
}

export interface Ticket {
  id: string; // e.g. 'INC-1042'
  title: string;
  department: Department;
  reporterName: string;
  reporterHostId: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  initialQuote: string;
  slaMinutes: number;
  timeRemainingSeconds: number;
  rewardXp: number;
  rewardCash: number; // in ZAR / R
  requirements: TicketRequirement[];
  createdDay: number;
  category: 'Network' | 'Active Directory' | 'Servers' | 'Hardware' | 'Security';
  resolutionNotes?: string;
  userHint?: string;
  revealedClues?: string[];
}

export interface CareerStats {
  playerName: string;
  title: string; // e.g. 'Helpdesk Technician', 'Junior SysAdmin', 'Senior Network Engineer', 'IT Operations Director'
  level: number;
  xp: number;
  xpForNextLevel: number;
  cash: number; // in Rands (R)
  ticketsResolved: number;
  ticketsFailed: number;
  slaAdherenceRate: number;
  currentDay: number;
  dayTimeRemainingSeconds: number;
  isDayActive: boolean;
  unlockedTools: string[];
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'Software' | 'Hardware' | 'Certifications' | 'Perks';
  price: number;
  description: string;
  icon: string;
  purchased: boolean;
  effect: string;
}

export type WindowId = 
  | 'tickets'
  | 'terminal'
  | 'remote-desktop'
  | 'active-directory'
  | 'network-map'
  | 'router-admin'
  | 'services'
  | 'event-viewer'
  | 'career-store'
  | 'help-docs'
  | 'task-manager'
  | 'device-manager'
  | 'file-explorer'
  | 'packet-sniffer'
  | 'email-client'
  | 'edr-console'
  | 'group-policy'
  | 'backup-manager'
  | 'voip-phone'
  | 'hardware-bench'
  | 'rack-room'
  | 'siem-console'
  | 'change-control'
  | 'dhcp-dns'
  | 'script-studio';

export interface DesktopWindow {
  id: WindowId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  targetHostId?: string; // used for Remote Desktop or targeted terminal
}
