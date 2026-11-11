import { test, expect } from '@playwright/test';
import { ChangeEngine } from '../src/simulation/changeEngine';
import { DhcpDnsEngine } from '../src/simulation/dhcpDnsEngine';

test.describe('ChangeEngine & DhcpDnsEngine Simulation', () => {
  test('1. ChangeEngine violation guard: executing CR-202 before CAB approval or without failover active triggers violation', () => {
    const engine = new ChangeEngine();
    const requests = engine.getChangeRequests();
    expect(requests.length).toBe(4);

    const cr202 = engine.getChangeRequest('CR-202');
    expect(cr202).toBeDefined();
    expect(cr202?.targetHostId).toBe('SQL-PROD-01');
    expect(cr202?.riskLevel).toBe('Critical');
    expect(cr202?.status).toBe('Draft');
    expect(cr202?.requiresFailover).toBe(true);
    expect(cr202?.isFailoverActive).toBe(false);
    expect(cr202?.hasRollbackPlan).toBe(false);

    // CAB approval fails when failover is inactive or rollback plan is missing
    const cabNoPrechecks = engine.requestCabApproval('CR-202');
    expect(cabNoPrechecks.success).toBe(false);

    engine.toggleFailoverReplica('CR-202', true);
    const cabNoRollback = engine.requestCabApproval('CR-202');
    expect(cabNoRollback.success).toBe(false);

    engine.toggleFailoverReplica('CR-202', false);
    engine.attachRollbackPlan('CR-202');
    const cabNoFailover = engine.requestCabApproval('CR-202');
    expect(cabNoFailover.success).toBe(false);

    // Executing before CAB approval and without failover active violates SLA/Change policy
    const execResult = engine.executeChangeMaintenance('CR-202');
    expect(execResult.success).toBe(false);
    expect(execResult.violated).toBe(true);
    expect(execResult.request?.status).toBe('Violated');
    expect(engine.getChangeRequest('CR-202')?.status).toBe('Violated');
    expect(engine.isChangeCompletedCleanly('CR-202')).toBe(false);
  });

  test('2. ChangeEngine clean execution workflow: failover + rollback + CAB approval + execute completes CR-202 cleanly', () => {
    const engine = new ChangeEngine();
    expect(engine.isChangeCompletedCleanly('CR-202')).toBe(false);

    const afterFailover = engine.toggleFailoverReplica('CR-202', true);
    expect(afterFailover?.isFailoverActive).toBe(true);

    const afterRollback = engine.attachRollbackPlan('CR-202');
    expect(afterRollback?.hasRollbackPlan).toBe(true);

    const cabApproval = engine.requestCabApproval('CR-202');
    expect(cabApproval.success).toBe(true);
    expect(cabApproval.request?.status).toBe('Approved');
    expect(engine.getChangeRequest('CR-202')?.status).toBe('Approved');

    const execResult = engine.executeChangeMaintenance('CR-202');
    expect(execResult.success).toBe(true);
    expect(execResult.violated).toBe(false);
    expect(execResult.request?.status).toBe('Completed');
    expect(engine.getChangeRequest('CR-202')?.status).toBe('Completed');
    expect(engine.isChangeCompletedCleanly('CR-202')).toBe(true);
  });

  test('3. DhcpDnsEngine DHCP lease exhaustion & reservation on SCOPE-VLAN40 and SCOPE-VLAN10', () => {
    const engine = new DhcpDnsEngine();
    const scopes = engine.getScopes();
    expect(scopes.length).toBe(4);

    const vlan40 = scopes.find((s) => s.id === 'SCOPE-VLAN40');
    expect(vlan40).toBeDefined();
    expect(vlan40?.subnet).toBe('192.168.40.0/24');
    expect(vlan40?.totalAddresses).toBe(16);
    expect(vlan40?.leases.length).toBe(vlan40?.totalAddresses);

    const rogueLeases = vlan40?.leases.filter((l) => l.isRogue) ?? [];
    expect(rogueLeases.length).toBe(12);
    for (const rogue of rogueLeases) {
      expect(rogue.mac.startsWith('00:DE:AD:BE:EF:')).toBe(true);
    }

    expect(engine.isDhcpAndDnsHealthy()).toBe(false);

    // Purge rogue leases on SCOPE-VLAN40
    const purgeResult = engine.purgeRogueLeases('SCOPE-VLAN40');
    expect(purgeResult.purgedCount).toBeGreaterThan(0);
    expect(purgeResult.purgedCount).toBe(12);
    expect(purgeResult.scope).toBeDefined();

    const remainingLeases = purgeResult.scope!.leases;
    expect(remainingLeases.some((l) => l.isRogue)).toBe(false);
    const utilization = remainingLeases.length / purgeResult.scope!.totalAddresses;
    expect(utilization).toBeLessThan(0.5);

    // Add reservation on SCOPE-VLAN10
    const updatedVlan10 = engine.addLeaseReservation(
      'SCOPE-VLAN10',
      '192.168.10.250',
      '00:1A:2B:3C:4D:5E',
      'PRN-FIN-01'
    );
    expect(updatedVlan10).toBeDefined();
    const reservation = updatedVlan10?.leases.find(
      (l) => l.ip === '192.168.10.250' && l.hostname === 'PRN-FIN-01'
    );
    expect(reservation).toBeDefined();
    expect(reservation?.mac).toBe('00:1A:2B:3C:4D:5E');
    expect(reservation?.isReservation).toBe(true);
    expect(reservation?.isRogue).toBe(false);
  });

  test('4. DhcpDnsEngine DNS zone editor & SOA serial increment resolves isDhcpAndDnsHealthy()', () => {
    const engine = new DhcpDnsEngine();
    const initialZone = engine.getDnsZone();
    expect(initialZone.domain).toBe('corp.local');
    expect(initialZone.soaSerial).toBe(2026111101);

    const portalRec = initialZone.records.find((r) => r.id === 'REC-PORTAL');
    expect(portalRec).toBeDefined();
    expect(portalRec?.name).toBe('portal.corp.local');
    expect(portalRec?.type).toBe('A');
    expect(portalRec?.value).toBe('192.168.10.99');
    expect(portalRec?.isCorrupted).toBe(true);

    // Purge rogue leases first; DNS is still broken so isDhcpAndDnsHealthy is false
    engine.purgeRogueLeases('SCOPE-VLAN40');
    expect(engine.isDhcpAndDnsHealthy()).toBe(false);

    // Update REC-PORTAL to 192.168.10.202
    const updatedRec = engine.updateDnsRecord('REC-PORTAL', '192.168.10.202');
    expect(updatedRec).toBeDefined();
    expect(updatedRec?.value).toBe('192.168.10.202');
    expect(updatedRec?.isCorrupted).toBe(false);

    const updatedZone = engine.getDnsZone();
    expect(updatedZone.soaSerial).toBe(initialZone.soaSerial + 1);

    // Now both SCOPE-VLAN40 rogue leases are purged and REC-PORTAL points to 192.168.10.202
    expect(engine.isDhcpAndDnsHealthy()).toBe(true);
  });
});
