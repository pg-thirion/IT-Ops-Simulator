export type SiemLogSource = 'firewall' | 'ad_auth' | 'dns' | 'edr' | 'smb';
export type SiemSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface SiemLogEntry {
  id: string;
  timestamp: string;
  source: SiemLogSource;
  severity: SiemSeverity;
  hostId: string;
  sourceIp: string;
  username?: string;
  eventCode: string;
  message: string;
  rawPayload: string;
}

export interface SiemInvestigationCase {
  id: string;
  title: string;
  pinnedLogIds: string[];
  blockedIps: string[];
  revokedAccounts: string[];
  isResolved: boolean;
}
