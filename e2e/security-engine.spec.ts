import { test, expect } from '@playwright/test';
import { NetworkEngine } from '../src/simulation/networkEngine';
import { SecurityEngine } from '../src/simulation/securityEngine';
import { OutbreakEngine } from '../src/simulation/outbreakEngine';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from '../src/simulation/initialNetwork';

test.describe('EDR Fleet Telemetry Engine & Outbreak Simulation Engine', () => {
  let networkEngine: NetworkEngine;
  let securityEngine: SecurityEngine;
  let outbreakEngine: OutbreakEngine;

  test.beforeEach(() => {
    networkEngine = new NetworkEngine(
      buildInitialNetworkHosts(),
      buildInitialActiveDirectory(),
      INITIAL_ROUTER_CONFIG,
      INITIAL_SHARED_FOLDERS
    );
    securityEngine = new SecurityEngine(networkEngine);
    outbreakEngine = new OutbreakEngine(networkEngine, securityEngine);
  });

  test('Detecting threats and calculating fleet stats', async () => {
    // 1. Check all 4 seeded detections exist
    const detections = securityEngine.getDetections();
    expect(detections).toHaveLength(4);

    const ids = detections.map((d) => d.id);
    expect(ids).toContain('DET-101');
    expect(ids).toContain('DET-102');
    expect(ids).toContain('DET-103');
    expect(ids).toContain('DET-104');

    // DET-101: Trojan:Win32/CobaltStrike.Beacon on PC-FIN-08, rundll32.exe, Critical
    const det101 = securityEngine.getDetection('DET-101');
    expect(det101).toBeDefined();
    expect(det101?.threatName).toBe('Trojan:Win32/CobaltStrike.Beacon');
    expect(det101?.hostId).toBe('PC-FIN-08');
    expect(det101?.processName).toBe('rundll32.exe');
    expect(det101?.severity).toBe('Critical');
    expect(det101?.status).toBe('Active');

    // DET-102: HackTool:Win32/Mimikatz.LSA on PC-ENG-05, lsass_dump.exe, High
    const det102 = securityEngine.getDetection('DET-102');
    expect(det102).toBeDefined();
    expect(det102?.threatName).toBe('HackTool:Win32/Mimikatz.LSA');
    expect(det102?.hostId).toBe('PC-ENG-05');
    expect(det102?.processName).toBe('lsass_dump.exe');
    expect(det102?.severity).toBe('High');
    expect(det102?.status).toBe('Active');

    // DET-103: Suspicious.PowerShell.EncodedCommand on PC-MKT-02, Medium
    const det103 = securityEngine.getDetection('DET-103');
    expect(det103).toBeDefined();
    expect(det103?.threatName).toBe('Suspicious.PowerShell.EncodedCommand');
    expect(det103?.hostId).toBe('PC-MKT-02');
    expect(det103?.severity).toBe('Medium');
    expect(det103?.status).toBe('Active');

    // DET-104: CoinMiner.Win32/XMRig on SQL-PROD-01, xmrig_miner.exe, High
    const det104 = securityEngine.getDetection('DET-104');
    expect(det104).toBeDefined();
    expect(det104?.threatName).toBe('CoinMiner.Win32/XMRig');
    expect(det104?.hostId).toBe('SQL-PROD-01');
    expect(det104?.processName).toBe('xmrig_miner.exe');
    expect(det104?.severity).toBe('High');
    expect(det104?.status).toBe('Active');

    // 2. Status filtering
    const activeDets = securityEngine.getDetections('Active');
    expect(activeDets).toHaveLength(4);

    const remediatedDets = securityEngine.getDetections('Remediated');
    expect(remediatedDets).toHaveLength(0);

    // 3. Fleet stats calculation
    const stats = securityEngine.getFleetStats();
    const allHosts = networkEngine.getAllHosts();
    expect(stats.totalHosts).toBe(allHosts.length);
    expect(stats.totalHosts).toBeGreaterThan(50);
    expect(stats.infectedHosts).toBe(4);
    expect(stats.isolatedHosts).toBe(0);
    expect(stats.cleanHosts).toBe(stats.totalHosts - 4);

    // 4. Updating threat signatures
    const updateRes = securityEngine.updateThreatSignatures();
    expect(updateRes.updated).toBe(true);
    expect(updateRes.version).toBe('1.391.288.0');
    expect(securityEngine.getSignatureVersion()).toBe('1.391.288.0');
  });

  test('Isolating PC-FIN-08 and verifying isolation status and network containment', async () => {
    expect(securityEngine.isHostIsolated('PC-FIN-08')).toBe(false);
    expect(networkEngine.isHostIsolated('PC-FIN-08')).toBe(false);

    // Isolate host
    const isolated = securityEngine.isolateHost('PC-FIN-08');
    expect(isolated).toBe(true);

    expect(securityEngine.isHostIsolated('PC-FIN-08')).toBe(true);
    expect(networkEngine.isHostIsolated('PC-FIN-08')).toBe(true);

    const stats = securityEngine.getFleetStats();
    expect(stats.isolatedHosts).toBe(1);

    // Ping outside admin subnet is blocked by EDR containment
    const pingInternet = networkEngine.ping('PC-FIN-08', '8.8.8.8');
    expect(pingInternet.success).toBe(false);
    expect(pingInternet.errorMessage).toContain('isolated from network');

    const pingPeer = networkEngine.ping('PC-FIN-08', '192.168.30.14'); // PC-ENG-05
    expect(pingPeer.success).toBe(false);
    expect(pingPeer.errorMessage).toContain('isolated from network');

    // Ping to IT Admin management subnet (192.168.10.50) is allowed for remediation
    const pingAdmin = networkEngine.ping('PC-FIN-08', '192.168.10.50');
    expect(pingAdmin.success).toBe(true);

    // Peer non-admin workstation attempting to reach isolated host is blocked
    const peerToIsolated = networkEngine.ping('PC-ENG-05', '192.168.20.17'); // PC-FIN-08 IP
    expect(peerToIsolated.success).toBe(false);
    expect(peerToIsolated.errorMessage).toContain('network-isolated');
  });

  test('Terminating threat on PC-FIN-08, verifying process removed and threat marked Remediated', async () => {
    // Verify malicious process exists initially on PC-FIN-08
    const host = networkEngine.getHost('PC-FIN-08');
    expect(host).toBeDefined();
    const rundllProc = host?.processes.find((p) => p.name === 'rundll32.exe');
    expect(rundllProc).toBeDefined();
    expect(rundllProc?.status).toBe('malicious');

    // Terminate threat
    const res = securityEngine.terminateThreat('DET-101');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Remediated');

    // Verify detection status updated
    const det = securityEngine.getDetection('DET-101');
    expect(det?.status).toBe('Remediated');
    expect(det?.remediationAction).toBe('kill_process');

    // Verify process removed from host's running processes in network engine
    const updatedHost = networkEngine.getHost('PC-FIN-08');
    const removedProc = updatedHost?.processes.find((p) => p.name === 'rundll32.exe');
    expect(removedProc).toBeUndefined();

    // Fleet stats reflect remediation
    const stats = securityEngine.getFleetStats();
    expect(stats.infectedHosts).toBe(3);
    expect(stats.cleanHosts).toBe(stats.totalHosts - 3);
  });

  test('Unisolating host restores connectivity', async () => {
    // Isolate first
    securityEngine.isolateHost('PC-FIN-08');
    expect(securityEngine.isHostIsolated('PC-FIN-08')).toBe(true);
    expect(securityEngine.getFleetStats().isolatedHosts).toBe(1);

    // Unisolate
    const unisolated = securityEngine.unisolateHost('PC-FIN-08');
    expect(unisolated).toBe(true);

    expect(securityEngine.isHostIsolated('PC-FIN-08')).toBe(false);
    expect(networkEngine.isHostIsolated('PC-FIN-08')).toBe(false);
    expect(securityEngine.getFleetStats().isolatedHosts).toBe(0);

    // Connectivity to other subnets restored
    const pingPeer = networkEngine.ping('PC-FIN-08', '192.168.30.14');
    expect(pingPeer.success).toBe(true);
  });

  test('Quarantining threat on PC-ENG-05 marks status Quarantined and kills process', async () => {
    const host = networkEngine.getHost('PC-ENG-05');
    expect(host?.processes.some((p) => p.name === 'lsass_dump.exe')).toBe(true);

    const res = securityEngine.quarantineFile('DET-102');
    expect(res.success).toBe(true);

    const det = securityEngine.getDetection('DET-102');
    expect(det?.status).toBe('Quarantined');
    expect(det?.remediationAction).toBe('quarantine_file');

    const updatedHost = networkEngine.getHost('PC-ENG-05');
    expect(updatedHost?.processes.some((p) => p.name === 'lsass_dump.exe')).toBe(false);
  });

  test('OutbreakEngine: trigger outbreak, tick spreads infection, isolating host halts propagation, restore share clears encrypted state', async () => {
    // 1. Trigger active ransomware outbreak
    outbreakEngine.triggerOutbreak('PC-FIN-08');
    expect(outbreakEngine.isOutbreakActive()).toBe(true);
    expect(outbreakEngine.getPatientZeroHost()).toBe('PC-FIN-08');
    expect(outbreakEngine.getEncryptedShares()).toHaveLength(0);

    // 2. First tick encrypts department share (Finance)
    const tick1 = outbreakEngine.tick();
    expect(tick1.outbreakHalted).toBe(false);
    expect(tick1.newlyEncryptedShares).toContain('Finance');
    expect(outbreakEngine.getEncryptedShares()).toContain('Finance');
    expect(outbreakEngine.isShareEncrypted('Finance')).toBe(true);

    // Files have .locked extension
    const financeFiles = outbreakEngine.getShareFiles('Finance');
    expect(financeFiles.some((f) => f.endsWith('.locked'))).toBe(true);
    expect(financeFiles).toContain('README_RESTORE_FILES.txt');

    // 3. Second tick without isolating spreads to another share
    const tick2 = outbreakEngine.tick();
    expect(tick2.outbreakHalted).toBe(false);
    expect(tick2.newlyEncryptedShares.length).toBe(1);
    expect(outbreakEngine.getEncryptedShares()).toHaveLength(2);

    // 4. Isolating patient zero host halts propagation!
    securityEngine.isolateHost('PC-FIN-08');
    expect(securityEngine.isHostIsolated('PC-FIN-08')).toBe(true);

    const tick3 = outbreakEngine.tick();
    expect(tick3.outbreakHalted).toBe(true);
    expect(tick3.newlyEncryptedShares).toHaveLength(0);
    expect(outbreakEngine.isOutbreakActive()).toBe(false);

    // Subsequent ticks stay halted
    const tick4 = outbreakEngine.tick();
    expect(tick4.outbreakHalted).toBe(true);

    // 5. Restoring shares clears encrypted state
    const encryptedShares = outbreakEngine.getEncryptedShares();
    expect(encryptedShares.length).toBeGreaterThan(0);

    for (const share of encryptedShares) {
      const restored = outbreakEngine.restoreShare(share);
      expect(restored).toBe(true);
      expect(outbreakEngine.isShareEncrypted(share)).toBe(false);
      const files = outbreakEngine.getShareFiles(share);
      expect(files.some((f) => f.endsWith('.locked'))).toBe(false);
      expect(files).not.toContain('README_RESTORE_FILES.txt');
    }

    expect(outbreakEngine.getEncryptedShares()).toHaveLength(0);

    // Restoring an already clean share returns false
    expect(outbreakEngine.restoreShare('Finance')).toBe(false);
  });

  test('OutbreakEngine: remediating threat on patient zero also halts propagation', async () => {
    outbreakEngine.triggerOutbreak('PC-FIN-08');
    expect(outbreakEngine.isOutbreakActive()).toBe(true);

    // Terminate threat on patient zero
    securityEngine.terminateThreat('DET-101');

    // Next tick recognizes threat is terminated and halts outbreak
    const tick = outbreakEngine.tick();
    expect(tick.outbreakHalted).toBe(true);
    expect(outbreakEngine.isOutbreakActive()).toBe(false);
  });
});
