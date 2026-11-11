import { test, expect } from '@playwright/test';
import { NetworkEngine } from '../src/simulation/networkEngine';
import { GpoEngine } from '../src/simulation/gpoEngine';
import { BackupEngine } from '../src/simulation/backupEngine';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from '../src/simulation/initialNetwork';

test.describe('Group Policy Engine & Backup / Disaster Recovery Engine', () => {
  let networkEngine: NetworkEngine;
  let gpoEngine: GpoEngine;
  let backupEngine: BackupEngine;

  test.beforeEach(() => {
    networkEngine = new NetworkEngine(
      buildInitialNetworkHosts(),
      buildInitialActiveDirectory(),
      INITIAL_ROUTER_CONFIG,
      INITIAL_SHARED_FOLDERS
    );
    gpoEngine = new GpoEngine(networkEngine);
    backupEngine = new BackupEngine(networkEngine);
  });

  test.describe('Group Policy Engine (GPO)', () => {
    test('querying seeded GPOs', () => {
      const gpos = gpoEngine.getGpos();
      expect(gpos).toHaveLength(4);

      const gpoIds = gpos.map((g) => g.id);
      expect(gpoIds).toContain('GPO-01');
      expect(gpoIds).toContain('GPO-02');
      expect(gpoIds).toContain('GPO-03');
      expect(gpoIds).toContain('GPO-04');

      // GPO-01: Default Domain Policy
      const gpo1 = gpoEngine.getGpo('GPO-01');
      expect(gpo1).toBeDefined();
      expect(gpo1?.name).toBe('Default Domain Policy');
      expect(gpo1?.scope).toBe('Domain');
      expect(gpo1?.targetOu).toBe('All');

      // GPO-02: Removable Storage Restriction
      const gpo2 = gpoEngine.getGpo('GPO-02');
      expect(gpo2).toBeDefined();
      expect(gpo2?.name).toBe('Removable Storage Restriction');
      expect(gpo2?.scope).toBe('OU');
      expect(gpo2?.targetOu).toBe('Finance');
    });

    test('effective policy for PC-FIN-04 (Finance OU has USB blocked and drive mapped)', () => {
      // Sarah Mitchell's workstation is PC-FIN-04 in Finance OU
      const hostOu = gpoEngine.getHostOu('PC-FIN-04');
      expect(hostOu).toBe('Finance');

      const policy = gpoEngine.getEffectivePolicyForHost('PC-FIN-04');
      expect(policy.usbBlocked).toBe(true);
      expect(gpoEngine.isUsbBlocked('PC-FIN-04')).toBe(true);

      expect(policy.mappedDrives.length).toBeGreaterThanOrEqual(1);
      expect(policy.mappedDrives.some((d) => d.includes('Finance'))).toBe(true);
      expect(policy.mappedDrives.some((d) => d.includes('Public'))).toBe(true);
      expect(gpoEngine.getMappedDrives('PC-FIN-04')).toEqual(policy.mappedDrives);

      // Domain-level password complexity applies
      expect(policy.passwordComplexity).toBe(true);
      // Engineering script restriction should NOT apply to Finance
      expect(policy.scriptsRestricted).toBe(false);
    });

    test('effective policy for PC-ENG-02 (Engineering OU does not have USB blocked initially)', () => {
      // Liam Kumar's workstation is PC-ENG-02 in Engineering OU
      const hostOu = gpoEngine.getHostOu('PC-ENG-02');
      expect(hostOu).toBe('Engineering');

      const policy = gpoEngine.getEffectivePolicyForHost('PC-ENG-02');
      // GPO-02 targets Finance OU, so Engineering is NOT blocked initially
      expect(policy.usbBlocked).toBe(false);
      expect(gpoEngine.isUsbBlocked('PC-ENG-02')).toBe(false);

      // GPO-04 restricts script execution for Engineering
      expect(policy.scriptsRestricted).toBe(true);
      // GPO-01 password complexity applies
      expect(policy.passwordComplexity).toBe(true);
      // Finance network drives do NOT map for Engineering
      expect(policy.mappedDrives.some((d) => d.includes('Finance'))).toBe(false);
    });

    test('linking GPO-02 to Engineering OU blocks USB on PC-ENG-02 and unlinking restores access', () => {
      expect(gpoEngine.isUsbBlocked('PC-ENG-02')).toBe(false);

      // Link GPO-02 (Removable Storage Restriction) to Engineering
      const linkSuccess = gpoEngine.linkGpoToOu('GPO-02', 'Engineering');
      expect(linkSuccess).toBe(true);

      // Verify PC-ENG-02 now has USB blocked
      expect(gpoEngine.isUsbBlocked('PC-ENG-02')).toBe(true);
      const engPolicy = gpoEngine.getEffectivePolicyForHost('PC-ENG-02');
      expect(engPolicy.usbBlocked).toBe(true);

      // Verify PC-FIN-04 still has USB blocked as well
      expect(gpoEngine.isUsbBlocked('PC-FIN-04')).toBe(true);

      // Unlink GPO-02 from Engineering
      const unlinkSuccess = gpoEngine.unlinkGpoFromOu('GPO-02', 'Engineering');
      expect(unlinkSuccess).toBe(true);

      // Verify PC-ENG-02 USB is no longer blocked
      expect(gpoEngine.isUsbBlocked('PC-ENG-02')).toBe(false);
      // PC-FIN-04 remains blocked
      expect(gpoEngine.isUsbBlocked('PC-FIN-04')).toBe(true);
    });

    test('toggling GPO setting modifies effective policy', () => {
      expect(gpoEngine.isUsbBlocked('PC-FIN-04')).toBe(true);

      // Disable block_usb_storage on GPO-02
      const toggleRes = gpoEngine.toggleGpoSetting('GPO-02', 'block_usb_storage', false);
      expect(toggleRes).toBe(true);

      // PC-FIN-04 should no longer have USB blocked
      expect(gpoEngine.isUsbBlocked('PC-FIN-04')).toBe(false);

      // Re-enable block_usb_storage
      gpoEngine.toggleGpoSetting('GPO-02', 'block_usb_storage', true);
      expect(gpoEngine.isUsbBlocked('PC-FIN-04')).toBe(true);
    });
  });

  test.describe('Backup and Disaster Recovery Engine', () => {
    test('querying seeded backup snapshots', () => {
      const snapshots = backupEngine.getSnapshots();
      expect(snapshots.length).toBeGreaterThanOrEqual(3);

      const snap101 = backupEngine.getSnapshot('SNAP-101');
      expect(snap101).toBeDefined();
      expect(snap101?.hostId).toBe('FS-SRV-01');
      expect(snap101?.sizeGb).toBe(120);
      expect(snap101?.sharesIncluded).toContain('Finance');
      expect(snap101?.sharesIncluded).toContain('Payroll');

      const snap102 = backupEngine.getSnapshot('SNAP-102');
      expect(snap102).toBeDefined();
      expect(snap102?.hostId).toBe('SQL-PROD-01');
      expect(snap102?.sizeGb).toBe(45);
      expect(snap102?.databasesIncluded).toContain('ERP_Production_DB');
      expect(snap102?.databasesIncluded).toContain('Inventory_DB');

      const snap103 = backupEngine.getSnapshot('SNAP-103');
      expect(snap103).toBeDefined();
      expect(snap103?.hostId).toBe('DC-SRV-01');
      expect(snap103?.sizeGb).toBe(15);
    });

    test('filtering snapshots by hostId', () => {
      const fsSnaps = backupEngine.getSnapshots('FS-SRV-01');
      expect(fsSnaps.length).toBeGreaterThanOrEqual(1);
      expect(fsSnaps.every((s) => s.hostId.toUpperCase() === 'FS-SRV-01')).toBe(true);

      const sqlSnaps = backupEngine.getSnapshots('SQL-PROD-01');
      expect(sqlSnaps.length).toBeGreaterThanOrEqual(1);
      expect(sqlSnaps.every((s) => s.hostId.toUpperCase() === 'SQL-PROD-01')).toBe(true);
    });

    test('taking a new instant snapshot of SQL-PROD-01', () => {
      const initialCount = backupEngine.getSnapshots('SQL-PROD-01').length;

      const newSnap = backupEngine.takeSnapshot('SQL-PROD-01', 'Incremental');
      expect(newSnap).toBeDefined();
      expect(newSnap.id).toMatch(/^SNAP-\d+/);
      expect(newSnap.hostId).toBe('SQL-PROD-01');
      expect(newSnap.recoveryPointType).toBe('Incremental');
      expect(newSnap.status).toBe('Success');
      expect(newSnap.databasesIncluded).toContain('ERP_Production_DB');

      const updatedCount = backupEngine.getSnapshots('SQL-PROD-01').length;
      expect(updatedCount).toBe(initialCount + 1);

      // Verify total size calculation includes new snapshot
      const totalSize = backupEngine.getTotalBackupSizeGb();
      expect(totalSize).toBeGreaterThan(120 + 45 + 15);
    });

    test('restoring a share from SNAP-101 and handling invalid requests', () => {
      // Simulate taking Finance share offline
      networkEngine.setSharedFolderOnline('Finance', false);
      const shareBefore = networkEngine.getSharedFolders().find((s) => s.name === 'Finance');
      expect(shareBefore?.isOnline).toBe(false);

      // Restore Finance share from SNAP-101
      const restoreRes = backupEngine.restoreShare('SNAP-101', 'Finance');
      expect(restoreRes.success).toBe(true);
      expect(restoreRes.message).toContain('Finance');

      // Verify share is brought back online
      const shareAfter = networkEngine.getSharedFolders().find((s) => s.name === 'Finance');
      expect(shareAfter?.isOnline).toBe(true);

      // Test invalid share in snapshot
      const invalidShareRes = backupEngine.restoreShare('SNAP-101', 'NonExistentShare');
      expect(invalidShareRes.success).toBe(false);

      // Test invalid snapshot ID
      const invalidSnapRes = backupEngine.restoreShare('SNAP-999', 'Finance');
      expect(invalidSnapRes.success).toBe(false);
    });

    test('restoring a database from SNAP-102 and handling invalid requests', () => {
      // Restore ERP_Production_DB from SNAP-102
      const restoreRes = backupEngine.restoreDatabase('SNAP-102', 'ERP_Production_DB');
      expect(restoreRes.success).toBe(true);
      expect(restoreRes.message).toContain('ERP_Production_DB');

      // Check restore history
      const history = backupEngine.getRestoreHistory();
      expect(history.length).toBeGreaterThanOrEqual(1);
      const lastEntry = history[history.length - 1];
      expect(lastEntry.snapshotId).toBe('SNAP-102');
      expect(lastEntry.targetDatabase).toBe('ERP_Production_DB');

      // Test invalid database name
      const invalidDbRes = backupEngine.restoreDatabase('SNAP-102', 'Ghost_DB');
      expect(invalidDbRes.success).toBe(false);

      // Test invalid snapshot ID
      const invalidSnapRes = backupEngine.restoreDatabase('SNAP-999', 'ERP_Production_DB');
      expect(invalidSnapRes.success).toBe(false);
    });

    test('deleting a snapshot', () => {
      const snap = backupEngine.takeSnapshot('DC-SRV-01', 'Incremental');
      expect(backupEngine.getSnapshot(snap.id)).toBeDefined();

      const deleteRes = backupEngine.deleteSnapshot(snap.id);
      expect(deleteRes).toBe(true);
      expect(backupEngine.getSnapshot(snap.id)).toBeUndefined();

      // Deleting non-existent snapshot returns false
      expect(backupEngine.deleteSnapshot('SNAP-NONEXISTENT')).toBe(false);
    });
  });
});
