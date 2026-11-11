import { NetworkEngine } from './networkEngine';
import { SecurityEngine } from './securityEngine';

export const DEFAULT_SHARE_FILES: Record<string, string[]> = {
  Finance: [
    'Q3_Financial_Audit.xlsx',
    'Tax_Ledger_2026.pdf',
    'Corporate_Budget.xlsx',
    'Invoice_Receivables.docx',
  ],
  Engineering: [
    'firmware_v2.0_source.c',
    'schematics_core.dwg',
    'build_manifest.json',
  ],
  Payroll: [
    'salaries_2026.xlsx',
    'direct_deposit_batch.csv',
    'executive_comp_plan.pdf',
  ],
  Public: [
    'company_handbook.pdf',
    'benefits_guide_2026.docx',
    'holiday_calendar.xlsx',
  ],
  Executive: [
    'board_meeting_minutes.pdf',
    'm_and_a_strategy.docx',
    'q4_investor_deck.pptx',
  ],
};

export class OutbreakEngine {
  private networkEngine: NetworkEngine;
  private securityEngine: SecurityEngine;
  private isActive: boolean = false;
  private patientZeroHostId: string | null = null;
  private encryptedShares: Set<string> = new Set();
  private shareFiles: Map<string, string[]> = new Map();
  private simulationTimer: any = null;

  constructor(networkEngine: NetworkEngine, securityEngine: SecurityEngine) {
    this.networkEngine = networkEngine;
    this.securityEngine = securityEngine;
    this.initShareFiles();
  }

  private initShareFiles() {
    this.shareFiles.clear();
    const existingShares = this.networkEngine.getSharedFolders();

    if (existingShares.length > 0) {
      existingShares.forEach((s) => {
        const defaults = DEFAULT_SHARE_FILES[s.name] || [
          `${s.name.toLowerCase()}_data.xlsx`,
          `${s.name.toLowerCase()}_archive.zip`,
          'document.pdf',
        ];
        this.shareFiles.set(s.name, [...defaults]);
      });
    } else {
      // Default department shares if none in networkEngine
      Object.entries(DEFAULT_SHARE_FILES).forEach(([name, files]) => {
        this.shareFiles.set(name, [...files]);
      });
    }
  }

  public triggerOutbreak(patientZeroHostId: string = 'PC-FIN-08'): void {
    this.isActive = true;
    this.patientZeroHostId = patientZeroHostId;

    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    const host = this.networkEngine.getHost(patientZeroHostId);
    if (host && !host.processes.some((p) => p.status === 'malicious')) {
      host.processes.push({
        pid: Math.floor(Math.random() * 4000) + 5000,
        name: 'stager.exe',
        cpu: 10,
        ramMb: 60,
        user: host.activeDirectoryUsername || 'SYSTEM',
        status: 'malicious',
        description: 'Ransomware Cryptor Stager',
        canKill: true,
      });
    }

    const ip = host?.nic.ip || '192.168.20.17';
    this.networkEngine.recordPacket(
      ip,
      '192.168.10.210',
      'SMB',
      4096,
      `ALERT: Active ransomware stager initiated on ${patientZeroHostId}`,
      'error'
    );
  }

  public stopOutbreak(): void {
    this.isActive = false;
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  public isOutbreakActive(): boolean {
    return this.isActive;
  }

  public getPatientZeroHost(): string | null {
    return this.patientZeroHostId;
  }

  public tick(): { newlyEncryptedShares: string[]; outbreakHalted: boolean } {
    if (!this.isActive) {
      return { newlyEncryptedShares: [], outbreakHalted: true };
    }

    // 1. Check if patient zero host is isolated
    const isIsolated = this.patientZeroHostId
      ? this.securityEngine.isHostIsolated(this.patientZeroHostId)
      : false;

    // 2. Check if threat on patient zero is terminated / remediated
    let threatNeutralized = false;
    if (this.patientZeroHostId) {
      const detections = this.securityEngine
        .getDetections()
        .filter((d) => d.hostId === this.patientZeroHostId);
      const hasActiveThreat = detections.some(
        (d) => d.status === 'Active' || d.status === 'Investigating'
      );
      const patientHost = this.networkEngine.getHost(this.patientZeroHostId);
      const hasMaliciousProc = patientHost
        ? patientHost.processes.some((p) => p.status === 'malicious')
        : false;

      if (!hasActiveThreat && !hasMaliciousProc) {
        threatNeutralized = true;
      }
    }

    // If host is isolated or threat terminated, outbreak halts immediately!
    if (isIsolated || threatNeutralized) {
      this.stopOutbreak();
      return { newlyEncryptedShares: [], outbreakHalted: true };
    }

    // 3. Otherwise: encrypt next department network share(s)
    const allShares = this.getAllShareNames();
    const unencrypted = allShares.filter((name) => !this.encryptedShares.has(name));

    if (unencrypted.length === 0) {
      // All shares already encrypted
      this.stopOutbreak();
      return { newlyEncryptedShares: [], outbreakHalted: true };
    }

    // Prioritize patient zero's department share if unencrypted
    let targetShareName = unencrypted[0];
    if (this.patientZeroHostId) {
      const host = this.networkEngine.getHost(this.patientZeroHostId);
      if (host && unencrypted.includes(host.department)) {
        targetShareName = host.department;
      }
    }

    this.encryptShare(targetShareName);
    return { newlyEncryptedShares: [targetShareName], outbreakHalted: false };
  }

  private getAllShareNames(): string[] {
    const shares = this.networkEngine.getSharedFolders();
    if (shares.length > 0) {
      return shares.map((s) => s.name);
    }
    return Array.from(this.shareFiles.keys());
  }

  private encryptShare(shareName: string): void {
    this.encryptedShares.add(shareName);

    const files = this.shareFiles.get(shareName) || [
      'data_record_01.xlsx',
      'archive.zip',
    ];
    const encryptedFiles = files.map((f) => (f.endsWith('.locked') ? f : `${f}.locked`));
    if (!encryptedFiles.includes('README_RESTORE_FILES.txt')) {
      encryptedFiles.unshift('README_RESTORE_FILES.txt');
    }
    this.shareFiles.set(shareName, encryptedFiles);

    const host = this.patientZeroHostId
      ? this.networkEngine.getHost(this.patientZeroHostId)
      : undefined;
    const ip = host?.nic.ip || '192.168.20.17';

    this.networkEngine.recordPacket(
      ip,
      '192.168.10.210',
      'SMB',
      4096,
      `SMB WRITE: Ransomware payload encrypted \\\\FS-SRV-01\\${shareName} with extension .locked`,
      'error'
    );
  }

  public getEncryptedShares(): string[] {
    return Array.from(this.encryptedShares);
  }

  public isShareEncrypted(shareName: string): boolean {
    const target = this.findShareNameMatch(shareName);
    return target ? this.encryptedShares.has(target) : false;
  }

  public getShareFiles(shareName: string): string[] {
    const target = this.findShareNameMatch(shareName) || shareName;
    return [...(this.shareFiles.get(target) || [])];
  }

  public restoreShare(shareName: string): boolean {
    const target = this.findShareNameMatch(shareName);
    if (!target || !this.encryptedShares.has(target)) {
      return false;
    }

    this.encryptedShares.delete(target);

    // Restore files without .locked extension
    const currentFiles = this.shareFiles.get(target) || [];
    const restored = currentFiles
      .filter((f) => f !== 'README_RESTORE_FILES.txt' && f !== 'HOW_TO_RESTORE_FILES.txt')
      .map((f) => (f.endsWith('.locked') ? f.slice(0, -7) : f));

    this.shareFiles.set(target, restored);

    this.networkEngine.recordPacket(
      '192.168.10.50',
      '192.168.10.210',
      'SMB',
      1024,
      `Administrator restored \\\\FS-SRV-01\\${target} from immutable snapshot backup`,
      'ok'
    );

    return true;
  }

  private findShareNameMatch(input: string): string | undefined {
    const lower = input.toLowerCase();
    for (const key of this.shareFiles.keys()) {
      if (key.toLowerCase() === lower || `share_${key.toLowerCase()}` === lower) {
        return key;
      }
    }
    const shares = this.networkEngine.getSharedFolders();
    const match = shares.find((s) => s.name.toLowerCase() === lower || s.id.toLowerCase() === lower);
    return match?.name;
  }
}
