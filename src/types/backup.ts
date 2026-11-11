export type BackupStatus = 'Success' | 'Failed' | 'Running' | 'Degraded';

export interface BackupSnapshot {
  id: string;
  hostId: string;
  serverName: string;
  timestamp: string;
  sizeGb: number;
  status: BackupStatus;
  recoveryPointType: 'Full' | 'Incremental';
  sharesIncluded: string[];
  databasesIncluded?: string[];
}

export interface RestoreTarget {
  snapshotId: string;
  targetHostId: string;
  targetShare?: string;
  targetDatabase?: string;
  restoredAt?: string;
}
