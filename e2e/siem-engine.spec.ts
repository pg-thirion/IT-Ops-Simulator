import { test, expect } from '@playwright/test';
import { SiemEngine } from '../src/simulation/siemEngine';

test.describe('SiemEngine Simulation', () => {
  test('1. getLogs() returns >= 20 multi-source enterprise logs across all 5 sources', () => {
    const engine = new SiemEngine();
    const logs = engine.getLogs();

    expect(logs.length).toBeGreaterThanOrEqual(20);

    const sources = new Set(logs.map((l) => l.source));
    expect(sources.has('firewall')).toBe(true);
    expect(sources.has('ad_auth')).toBe(true);
    expect(sources.has('dns')).toBe(true);
    expect(sources.has('edr')).toBe(true);
    expect(sources.has('smb')).toBe(true);
  });

  test('2. queryLogs filters key=value tokens case-insensitively including quoted variants', () => {
    const engine = new SiemEngine();

    const unquoted = engine.queryLogs('source=ad_auth severity=CRITICAL');
    expect(unquoted.length).toBeGreaterThan(0);
    for (const entry of unquoted) {
      expect(entry.source).toBe('ad_auth');
      expect(entry.severity).toBe('CRITICAL');
    }

    const doubleQuoted = engine.queryLogs('source="ad_auth" severity="critical"');
    expect(doubleQuoted.length).toBe(unquoted.length);
    expect(doubleQuoted.map((e) => e.id)).toEqual(unquoted.map((e) => e.id));

    const singleQuoted = engine.queryLogs("SOURCE='AD_AUTH' SEVERITY='Critical'");
    expect(singleQuoted.length).toBe(unquoted.length);
    expect(singleQuoted.map((e) => e.id)).toEqual(unquoted.map((e) => e.id));
  });

  test('3. queryLogs("185.220.101.44") returns the multi-stage attack chain logs', () => {
    const engine = new SiemEngine();
    const chainLogs = engine.queryLogs('185.220.101.44');

    expect(chainLogs.length).toBeGreaterThanOrEqual(4);

    // External VPN brute force against svc_backup
    const bruteForce = chainLogs.some(
      (l) =>
        l.sourceIp === '185.220.101.44' &&
        l.username === 'svc_backup' &&
        /brute|failed|failure/i.test(l.message + ' ' + l.rawPayload)
    );
    expect(bruteForce).toBe(true);

    // Login success for svc_backup
    const loginSuccess = chainLogs.some(
      (l) =>
        l.sourceIp === '185.220.101.44' &&
        l.username === 'svc_backup' &&
        /success|authenticated|accepted|4624/i.test(l.message + ' ' + l.rawPayload + ' ' + l.eventCode)
    );
    expect(loginSuccess).toBe(true);

    // SMB lateral movement to SQL-PROD-01
    const smbLateral = chainLogs.some(
      (l) =>
        l.source === 'smb' &&
        l.hostId === 'SQL-PROD-01' &&
        l.sourceIp === '185.220.101.44'
    );
    expect(smbLateral).toBe(true);

    // Scheduled task creation: schtasks /create /tn "SysUpdate"
    const schtasks = chainLogs.some(
      (l) =>
        l.hostId === 'SQL-PROD-01' &&
        (l.message.includes('schtasks /create /tn "SysUpdate"') ||
          l.rawPayload.includes('schtasks /create /tn "SysUpdate"'))
    );
    expect(schtasks).toBe(true);
  });

  test('4. Investigation resolution requires >= 2 pinned attack chain logs, blocked IP 185.220.101.44, and revoked svc_backup', () => {
    const engine = new SiemEngine();
    const chainLogs = engine.queryLogs('185.220.101.44');
    expect(chainLogs.length).toBeGreaterThanOrEqual(2);

    expect(engine.isInvestigationResolved()).toBe(false);
    expect(engine.getCase().isResolved).toBe(false);

    // Pin 1st log only -> still false
    engine.pinLogToCase(chainLogs[0].id);
    expect(engine.getCase().pinnedLogIds).toContain(chainLogs[0].id);
    expect(engine.isInvestigationResolved()).toBe(false);

    // Pin 2nd log -> 2 pinned logs, but IP and account not yet remediated
    engine.pinLogToCase(chainLogs[1].id);
    expect(engine.getCase().pinnedLogIds.length).toBe(2);
    expect(engine.isInvestigationResolved()).toBe(false);

    // Block attacker IP -> still missing account revocation
    engine.blockAttackerIp('185.220.101.44');
    expect(engine.getCase().blockedIps).toContain('185.220.101.44');
    expect(engine.isInvestigationResolved()).toBe(false);

    // Revoke compromised account -> all 3 conditions met!
    engine.revokeCompromisedAccount('svc_backup');
    expect(engine.getCase().revokedAccounts).toContain('svc_backup');
    expect(engine.isInvestigationResolved()).toBe(true);
    expect(engine.getCase().isResolved).toBe(true);

    // Unpinning one of the two logs drops pinned attack logs below 2 -> unresolved
    engine.unpinLogFromCase(chainLogs[0].id);
    expect(engine.getCase().pinnedLogIds).not.toContain(chainLogs[0].id);
    expect(engine.isInvestigationResolved()).toBe(false);
    expect(engine.getCase().isResolved).toBe(false);

    // Re-pinning restores resolved state
    engine.pinLogToCase(chainLogs[0].id);
    expect(engine.isInvestigationResolved()).toBe(true);
    expect(engine.getCase().isResolved).toBe(true);
  });
});
