import { NetworkEngine } from './networkEngine';
import {
  EdrDetection,
  FleetSecurityStats,
  HostIsolationStatus,
  ThreatSeverity,
  ThreatStatus,
} from '../types/security';
import { ProcessItem } from '../types/network';

export const INITIAL_EDR_DETECTIONS: EdrDetection[] = [
  {
    id: 'DET-101',
    timestamp: '08:14:22',
    hostId: 'PC-FIN-08',
    hostname: 'pc-fin-08.corp.local',
    threatName: 'Trojan:Win32/CobaltStrike.Beacon',
    severity: 'Critical' as ThreatSeverity,
    status: 'Active' as ThreatStatus,
    processName: 'rundll32.exe',
    processId: 5820,
    fileHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    filePath: 'C:\\Windows\\System32\\rundll32.exe',
    detectedBy: 'Endpoint Behavioral Monitor',
    description: 'Cobalt Strike beacon reflective DLL injection observed establishing C2 channel.',
    remediationAction: 'isolate_host',
  },
  {
    id: 'DET-102',
    timestamp: '08:19:05',
    hostId: 'PC-ENG-05',
    hostname: 'pc-eng-05.corp.local',
    threatName: 'HackTool:Win32/Mimikatz.LSA',
    severity: 'High' as ThreatSeverity,
    status: 'Active' as ThreatStatus,
    processName: 'lsass_dump.exe',
    processId: 6240,
    fileHash: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef1',
    filePath: 'C:\\Users\\eokafor\\Downloads\\lsass_dump.exe',
    detectedBy: 'Credential Access Protection',
    description: 'Unauthorized process attempted LSASS memory handle access to extract NTLM hashes.',
    remediationAction: 'kill_process',
  },
  {
    id: 'DET-103',
    timestamp: '08:22:40',
    hostId: 'PC-MKT-02',
    hostname: 'pc-mkt-02.corp.local',
    threatName: 'Suspicious.PowerShell.EncodedCommand',
    severity: 'Medium' as ThreatSeverity,
    status: 'Active' as ThreatStatus,
    processName: 'powershell.exe',
    processId: 7112,
    fileHash: 'c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef2',
    filePath: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    detectedBy: 'Script Block Logging & Heuristics',
    description: 'Base64 encoded PowerShell command execution attempting to download staging script.',
    remediationAction: 'kill_process',
  },
  {
    id: 'DET-104',
    timestamp: '08:20:00',
    hostId: 'SQL-PROD-01',
    hostname: 'sql-prod-01.corp.local',
    threatName: 'CoinMiner.Win32/XMRig',
    severity: 'High' as ThreatSeverity,
    status: 'Active' as ThreatStatus,
    processName: 'xmrig_miner.exe',
    processId: 4812,
    fileHash: 'd4e5f6a1b2c37890123456789abcdef0123456789abcdef0123456789abcdef3',
    filePath: 'C:\\ProgramData\\xmrig_miner.exe',
    detectedBy: 'Heuristic Resource Analysis',
    description: 'Rogue cryptocurrency miner payload consuming excessive CPU cycles on database server.',
    remediationAction: 'kill_process',
  },
];

export class SecurityEngine {
  private networkEngine: NetworkEngine;
  private detections: EdrDetection[] = [];
  private isolatedHosts: Map<string, HostIsolationStatus> = new Map();
  private signatureVersion: string = '1.391.240.0';
  private lastSignatureUpdate: string = 'Today at 06:00:00';

  constructor(networkEngine: NetworkEngine) {
    this.networkEngine = networkEngine;
    this.detections = INITIAL_EDR_DETECTIONS.map((d) => ({ ...d }));

    // Ensure malicious processes are present on the target hosts in networkEngine
    this.seedProcessesToHosts();
  }

  private seedProcessesToHosts() {
    const seeds: Array<{ hostId: string; proc: ProcessItem }> = [
      {
        hostId: 'PC-FIN-08',
        proc: {
          pid: 5820,
          name: 'rundll32.exe',
          cpu: 8,
          ramMb: 45,
          user: 'jwebber',
          status: 'malicious',
          description: 'Cobalt Strike Beacon Stager (rundll32)',
          canKill: true,
        },
      },
      {
        hostId: 'PC-ENG-05',
        proc: {
          pid: 6240,
          name: 'lsass_dump.exe',
          cpu: 15,
          ramMb: 64,
          user: 'eokafor',
          status: 'malicious',
          description: 'Mimikatz LSASS Memory Dumper',
          canKill: true,
        },
      },
      {
        hostId: 'PC-MKT-02',
        proc: {
          pid: 7112,
          name: 'powershell.exe',
          cpu: 12,
          ramMb: 85,
          user: 'bhowell',
          status: 'malicious',
          description: 'Suspicious Encoded PowerShell Script',
          canKill: true,
        },
      },
      {
        hostId: 'SQL-PROD-01',
        proc: {
          pid: 4812,
          name: 'xmrig_miner.exe',
          cpu: 82,
          ramMb: 650,
          user: 'SYSTEM',
          status: 'malicious',
          description: 'Rogue Unregistered Mining Process',
          canKill: true,
        },
      },
    ];

    seeds.forEach(({ hostId, proc }) => {
      const host = this.networkEngine.getHost(hostId);
      if (host) {
        const hasProc = host.processes.some(
          (p) => p.pid === proc.pid || p.name.toLowerCase() === proc.name.toLowerCase()
        );
        if (!hasProc) {
          host.processes.push({ ...proc });
        }
      }
    });
  }

  // --- Detections API ---
  public getDetections(statusFilter?: ThreatStatus): EdrDetection[] {
    if (statusFilter) {
      return this.detections
        .filter((d) => d.status === statusFilter)
        .map((d) => ({ ...d }));
    }
    return this.detections.map((d) => ({ ...d }));
  }

  public getDetection(id: string): EdrDetection | undefined {
    const found = this.detections.find((d) => d.id === id);
    return found ? { ...found } : undefined;
  }

  public addDetection(detection: EdrDetection): void {
    this.detections.unshift({ ...detection });
  }

  // --- Host Containment & Isolation API ---
  public isolateHost(hostId: string): boolean {
    const host = this.networkEngine.getHost(hostId);
    const success = this.networkEngine.isolateHost(hostId);
    if (success || !host) {
      this.isolatedHosts.set(hostId, {
        hostId,
        isIsolated: true,
        isolatedAt: new Date().toLocaleTimeString(),
        isolatedBy: 'SecOps-Admin',
      });
      return true;
    }
    return false;
  }

  public unisolateHost(hostId: string): boolean {
    const host = this.networkEngine.getHost(hostId);
    const success = this.networkEngine.unisolateHost(hostId);
    if (success || !host) {
      this.isolatedHosts.delete(hostId);
      return true;
    }
    return false;
  }

  public isHostIsolated(hostId: string): boolean {
    if (this.isolatedHosts.has(hostId)) {
      return this.isolatedHosts.get(hostId)!.isIsolated;
    }
    return this.networkEngine.isHostIsolated(hostId);
  }

  public getIsolationStatus(hostId: string): HostIsolationStatus {
    return {
      hostId,
      isIsolated: this.isHostIsolated(hostId),
      isolatedAt: this.isolatedHosts.get(hostId)?.isolatedAt,
      isolatedBy: this.isolatedHosts.get(hostId)?.isolatedBy,
    };
  }

  public getAllIsolationStatuses(): HostIsolationStatus[] {
    const hosts = this.networkEngine.getAllHosts();
    return hosts.map((h) => this.getIsolationStatus(h.id));
  }

  // --- Threat Remediation API ---
  public terminateThreat(threatId: string): { success: boolean; message: string } {
    const threat = this.detections.find((d) => d.id === threatId);
    if (!threat) {
      return { success: false, message: `Threat '${threatId}' not found.` };
    }

    // Kill process on target host
    this.networkEngine.killProcess(threat.hostId, threat.processId);
    this.networkEngine.killProcessByName(threat.hostId, threat.processName);

    // Update detection status
    threat.status = 'Remediated';
    threat.remediationAction = 'kill_process';

    return {
      success: true,
      message: `Threat ${threat.threatName} (PID ${threat.processId}) terminated on host ${threat.hostId}. Marked as Remediated.`,
    };
  }

  public quarantineFile(threatId: string): { success: boolean; message: string } {
    const threat = this.detections.find((d) => d.id === threatId);
    if (!threat) {
      return { success: false, message: `Threat '${threatId}' not found.` };
    }

    // Kill process if still active
    this.networkEngine.killProcess(threat.hostId, threat.processId);
    this.networkEngine.killProcessByName(threat.hostId, threat.processName);

    // Update detection status
    threat.status = 'Quarantined';
    threat.remediationAction = 'quarantine_file';

    return {
      success: true,
      message: `File '${threat.filePath}' quarantined. Threat ${threat.threatName} on ${threat.hostId} neutralized.`,
    };
  }

  // --- Threat Intelligence Signatures API ---
  public updateThreatSignatures(): { updated: boolean; version: string; message: string } {
    const prevVersion = this.signatureVersion;
    const parts = prevVersion.split('.').map(Number);
    parts[2] = parts[2] + 48; // e.g. 1.391.240.0 -> 1.391.288.0
    this.signatureVersion = parts.join('.');
    this.lastSignatureUpdate = 'Just now';

    return {
      updated: true,
      version: this.signatureVersion,
      message: `Threat intelligence signatures updated successfully to version ${this.signatureVersion}.`,
    };
  }

  public getSignatureVersion(): string {
    return this.signatureVersion;
  }

  public getLastSignatureUpdate(): string {
    return this.lastSignatureUpdate;
  }

  // --- Fleet Statistics API ---
  public getFleetStats(): FleetSecurityStats {
    const allHosts = this.networkEngine.getAllHosts();
    const totalHosts = allHosts.length > 0 ? allHosts.length : 56;

    const infectedHostIds = new Set(
      this.detections
        .filter((d) => d.status === 'Active' || d.status === 'Investigating')
        .map((d) => d.hostId)
    );
    const infectedHosts = infectedHostIds.size;

    let isolatedHosts = 0;
    if (allHosts.length > 0) {
      isolatedHosts = allHosts.filter((h) => this.isHostIsolated(h.id)).length;
    } else {
      isolatedHosts = this.isolatedHosts.size;
    }

    const cleanHosts = Math.max(0, totalHosts - infectedHosts);

    return {
      totalHosts,
      cleanHosts,
      infectedHosts,
      isolatedHosts,
    };
  }
}
