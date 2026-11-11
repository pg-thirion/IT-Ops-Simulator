import { NetworkEngine } from './networkEngine';
import { BackupSnapshot, BackupStatus, RestoreTarget } from '../types/backup';

export const INITIAL_BACKUP_SNAPSHOTS: BackupSnapshot[] = [
  {
    id: 'SNAP-101',
    hostId: 'FS-SRV-01',
    serverName: 'fs-srv-01.corp.local',
    timestamp: '2026-11-10T02:00:00.000Z',
    sizeGb: 120,
    status: 'Success' as BackupStatus,
    recoveryPointType: 'Full',
    sharesIncluded: ['Finance', 'Engineering', 'Public', 'Payroll'],
    databasesIncluded: [],
  },
  {
    id: 'SNAP-102',
    hostId: 'SQL-PROD-01',
    serverName: 'sql-prod-01.corp.local',
    timestamp: '2026-11-10T03:30:00.000Z',
    sizeGb: 45,
    status: 'Success' as BackupStatus,
    recoveryPointType: 'Full',
    sharesIncluded: [],
    databasesIncluded: ['ERP_Production_DB', 'Inventory_DB'],
  },
  {
    id: 'SNAP-103',
    hostId: 'DC-SRV-01',
    serverName: 'dc-srv-01.corp.local',
    timestamp: '2026-11-10T01:00:00.000Z',
    sizeGb: 15,
    status: 'Success' as BackupStatus,
    recoveryPointType: 'Full',
    sharesIncluded: ['SYSVOL', 'NETLOGON'],
    databasesIncluded: ['ActiveDirectory.dit'],
  },
];

export class BackupEngine {
  private networkEngine: NetworkEngine;
  private snapshots: BackupSnapshot[] = [];
  private restoreHistory: RestoreTarget[] = [];
  private nextSnapshotCounter = 104;

  constructor(
    networkEngine: NetworkEngine,
    initialSnapshots: BackupSnapshot[] = INITIAL_BACKUP_SNAPSHOTS
  ) {
    this.networkEngine = networkEngine;
    this.snapshots = initialSnapshots.map((s) => ({
      ...s,
      sharesIncluded: [...s.sharesIncluded],
      databasesIncluded: s.databasesIncluded ? [...s.databasesIncluded] : [],
    }));
  }

  public getSnapshots(hostId?: string): BackupSnapshot[] {
    if (hostId) {
      return this.snapshots
        .filter((s) => s.hostId.toLowerCase() === hostId.toLowerCase())
        .map((s) => ({
          ...s,
          sharesIncluded: [...s.sharesIncluded],
          databasesIncluded: s.databasesIncluded ? [...s.databasesIncluded] : [],
        }));
    }
    return this.snapshots.map((s) => ({
      ...s,
      sharesIncluded: [...s.sharesIncluded],
      databasesIncluded: s.databasesIncluded ? [...s.databasesIncluded] : [],
    }));
  }

  public getSnapshot(id: string): BackupSnapshot | undefined {
    const snap = this.snapshots.find((s) => s.id.toLowerCase() === id.toLowerCase());
    if (!snap) return undefined;
    return {
      ...snap,
      sharesIncluded: [...snap.sharesIncluded],
      databasesIncluded: snap.databasesIncluded ? [...snap.databasesIncluded] : [],
    };
  }

  public takeSnapshot(
    hostId: string,
    recoveryPointType: 'Full' | 'Incremental' = 'Full'
  ): BackupSnapshot {
    const host = this.networkEngine.getHost(hostId);
    const serverName = host ? host.hostname : `${hostId.toLowerCase()}.corp.local`;
    const snapshotId = `SNAP-${this.nextSnapshotCounter++}`;

    let sharesIncluded: string[] = [];
    let databasesIncluded: string[] = [];
    let baseSizeGb = 30;

    const normalizedHost = hostId.toUpperCase();
    if (normalizedHost === 'FS-SRV-01') {
      const activeShares = this.networkEngine.getSharedFolders().map((s) => s.name);
      sharesIncluded = activeShares.length > 0 ? activeShares : ['Finance', 'Engineering', 'Public', 'Payroll'];
      baseSizeGb = 120;
    } else if (normalizedHost === 'SQL-PROD-01') {
      databasesIncluded = ['ERP_Production_DB', 'Inventory_DB'];
      baseSizeGb = 45;
    } else if (normalizedHost === 'DC-SRV-01') {
      sharesIncluded = ['SYSVOL', 'NETLOGON'];
      databasesIncluded = ['ActiveDirectory.dit'];
      baseSizeGb = 15;
    } else {
      sharesIncluded = ['C$'];
    }

    const sizeGb = recoveryPointType === 'Incremental' ? Math.max(5, Math.round(baseSizeGb * 0.15)) : baseSizeGb;

    const newSnapshot: BackupSnapshot = {
      id: snapshotId,
      hostId,
      serverName,
      timestamp: new Date().toISOString(),
      sizeGb,
      status: 'Success',
      recoveryPointType,
      sharesIncluded,
      databasesIncluded,
    };

    this.snapshots.unshift(newSnapshot);
    return {
      ...newSnapshot,
      sharesIncluded: [...newSnapshot.sharesIncluded],
      databasesIncluded: newSnapshot.databasesIncluded ? [...newSnapshot.databasesIncluded] : [],
    };
  }

  public restoreShare(
    snapshotId: string,
    shareName: string
  ): { success: boolean; message: string } {
    const snap = this.snapshots.find((s) => s.id.toLowerCase() === snapshotId.toLowerCase());
    if (!snap) {
      return { success: false, message: `Backup snapshot '${snapshotId}' was not found.` };
    }

    const matchedShare = snap.sharesIncluded.find(
      (s) => s.toLowerCase() === shareName.toLowerCase()
    );
    if (!matchedShare) {
      return {
        success: false,
        message: `Share '${shareName}' is not included in snapshot '${snapshotId}'. Available shares: ${snap.sharesIncluded.join(', ') || 'None'}.`,
      };
    }

    // Bring share online in NetworkEngine if it was offline
    this.networkEngine.setSharedFolderOnline(matchedShare, true);

    const record: RestoreTarget = {
      snapshotId: snap.id,
      targetHostId: snap.hostId,
      targetShare: matchedShare,
      restoredAt: new Date().toISOString(),
    };
    this.restoreHistory.push(record);

    return {
      success: true,
      message: `Share '${matchedShare}' on '${snap.serverName}' successfully restored from snapshot '${snap.id}'.`,
    };
  }

  public restoreDatabase(
    snapshotId: string,
    databaseName: string
  ): { success: boolean; message: string } {
    const snap = this.snapshots.find((s) => s.id.toLowerCase() === snapshotId.toLowerCase());
    if (!snap) {
      return { success: false, message: `Backup snapshot '${snapshotId}' was not found.` };
    }

    const matchedDb = (snap.databasesIncluded || []).find(
      (d) => d.toLowerCase() === databaseName.toLowerCase()
    );
    if (!matchedDb) {
      return {
        success: false,
        message: `Database '${databaseName}' is not included in snapshot '${snapshotId}'. Available databases: ${(snap.databasesIncluded || []).join(', ') || 'None'}.`,
      };
    }

    const record: RestoreTarget = {
      snapshotId: snap.id,
      targetHostId: snap.hostId,
      targetDatabase: matchedDb,
      restoredAt: new Date().toISOString(),
    };
    this.restoreHistory.push(record);

    return {
      success: true,
      message: `Database '${matchedDb}' on '${snap.serverName}' successfully restored to point-in-time from snapshot '${snap.id}'.`,
    };
  }

  public deleteSnapshot(id: string): boolean {
    const index = this.snapshots.findIndex((s) => s.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return false;
    this.snapshots.splice(index, 1);
    return true;
  }

  public getRestoreHistory(): RestoreTarget[] {
    return [...this.restoreHistory];
  }

  public getTotalBackupSizeGb(): number {
    return this.snapshots.reduce((acc, curr) => acc + curr.sizeGb, 0);
  }
}
