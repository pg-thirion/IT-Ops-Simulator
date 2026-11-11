export type ThreatSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ThreatStatus = 'Active' | 'Investigating' | 'Remediated' | 'Quarantined';

export interface EdrDetection {
  id: string;
  timestamp: string;
  hostId: string;
  hostname: string;
  threatName: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  processName: string;
  processId: number;
  fileHash: string;
  filePath: string;
  detectedBy: string;
  description: string;
  remediationAction?: 'kill_process' | 'quarantine_file' | 'isolate_host';
}

export interface HostIsolationStatus {
  hostId: string;
  isIsolated: boolean;
  isolatedAt?: string;
  isolatedBy?: string;
}

export interface FleetSecurityStats {
  totalHosts: number;
  cleanHosts: number;
  infectedHosts: number;
  isolatedHosts: number;
}
