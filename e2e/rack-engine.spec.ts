import { test, expect } from '@playwright/test';
import { RackEngine } from '../src/simulation/rackEngine';

test.describe('RackEngine Simulation', () => {
  test('1. Initial CBL-104 fails TDR test with Crosstalk and high attenuation', () => {
    const engine = new RackEngine();
    const result = engine.runCableTdrTest('CBL-104');

    expect(result.passed).toBe(false);
    expect(result.cable.id).toBe('CBL-104');
    expect(result.cable.panelPort).toBe('PP-01 Port 18');
    expect(result.cable.switchId).toBe('SW-EDGE-01');
    expect(result.cable.switchPort).toBe('Gi0/18');
    expect(result.cable.targetHostId).toBe('PC-SALES-02');
    expect(result.cable.status).toBe('Crosstalk');
    expect(result.cable.attenuationDb).toBeGreaterThan(40);
    expect(result.diagnosticMessage.length).toBeGreaterThan(0);
  });

  test('2. Replacing and patching CBL-104 to Gi0/18 repairs TDR and wrong switchPort fails ticket check', () => {
    const engine = new RackEngine();

    // First hot-swap the drive so only cable determines ticket health
    engine.hotSwapRaidDrive('FS-SRV-01', 2);

    // Patching to wrong port does NOT satisfy isRackHealthyForTicket
    const wrongPatch = engine.replaceAndPatchCable('CBL-104', 'Gi0/99');
    expect(wrongPatch).toBeDefined();
    expect(wrongPatch?.status).toBe('Good');
    expect(wrongPatch?.switchPort).toBe('Gi0/99');
    expect(engine.isRackHealthyForTicket()).toBe(false);

    // Patching to Gi0/18 satisfies TDR and ticket health
    const updated = engine.replaceAndPatchCable('CBL-104', 'Gi0/18');
    expect(updated).toBeDefined();
    expect(updated?.status).toBe('Good');
    expect(updated?.attenuationDb).toBe(3.2);
    expect(updated?.switchPort).toBe('Gi0/18');

    const tdr = engine.runCableTdrTest('CBL-104');
    expect(tdr.passed).toBe(true);
    expect(engine.isRackHealthyForTicket()).toBe(true);
  });

  test('3. Initial FS-SRV-01 RAID-5 array is Degraded with bayIndex 2 Faulty', () => {
    const engine = new RackEngine();
    const arrays = engine.getRaidArrays();
    const fsRaid = arrays.find((a) => a.serverId === 'FS-SRV-01');

    expect(fsRaid).toBeDefined();
    expect(fsRaid?.raidLevel).toBe('RAID-5');
    expect(fsRaid?.status).toBe('Degraded');

    const faultyBay = fsRaid?.bays.find((b) => b.bayIndex === 2);
    expect(faultyBay).toBeDefined();
    expect(faultyBay?.status).toBe('Faulty');
    expect(faultyBay?.smartErrors).toBeGreaterThan(0);
  });

  test('4. Hot-swapping FS-SRV-01 bay 2 restores array to Healthy and satisfies ticket with CBL-104 repaired', () => {
    const engine = new RackEngine();
    expect(engine.isRackHealthyForTicket()).toBe(false);

    engine.replaceAndPatchCable('CBL-104', 'Gi0/18');
    expect(engine.isRackHealthyForTicket()).toBe(false);

    const updatedArray = engine.hotSwapRaidDrive('FS-SRV-01', 2);
    expect(updatedArray).toBeDefined();
    expect(updatedArray?.status).toBe('Healthy');

    const swappedBay = updatedArray?.bays.find((b) => b.bayIndex === 2);
    expect(swappedBay?.status).toBe('Online');
    expect(swappedBay?.smartErrors).toBe(0);

    expect(engine.isRackHealthyForTicket()).toBe(true);
  });

  test('5. UPS state and toggleUpsBypass switch mode between Battery Bypass and Online', () => {
    const engine = new RackEngine();
    const initialUps = engine.getUpsState();
    expect(initialUps.model).toBe('APC-UPS-3000VA');
    expect(initialUps.mode).toBe('Online');

    const bypassed = engine.toggleUpsBypass(true);
    expect(bypassed.mode).toBe('Battery Bypass');
    expect(engine.getUpsState().mode).toBe('Battery Bypass');

    const onlineAgain = engine.toggleUpsBypass(false);
    expect(onlineAgain.mode).toBe('Online');
    expect(engine.getUpsState().mode).toBe('Online');
  });
});
