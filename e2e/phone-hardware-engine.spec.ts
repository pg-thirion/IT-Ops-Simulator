import { test, expect } from '@playwright/test';
import { PhoneEngine } from '../src/simulation/phoneEngine';
import { HardwareEngine } from '../src/simulation/hardwareEngine';

test.describe('VoIP Softphone Engine & Hardware Diagnostics Workbench Engine', () => {
  let phoneEngine: PhoneEngine;
  let hardwareEngine: HardwareEngine;

  test.beforeEach(() => {
    phoneEngine = new PhoneEngine();
    hardwareEngine = new HardwareEngine();
  });

  test.describe('VoIP Softphone Engine (PhoneEngine)', () => {
    test('initial seeded calls and lookup by ID', () => {
      const calls = phoneEngine.getCalls();
      expect(calls.length).toBeGreaterThanOrEqual(3);

      const call1 = phoneEngine.getCall('CALL-01');
      expect(call1).toBeDefined();
      expect(call1?.callerName).toBe('Sarah Mitchell');
      expect(call1?.department).toBe('Finance');
      expect(call1?.callerHostId).toBe('PC-FIN-04');
      expect(call1?.linkedTicketId).toBe('INC-1042');

      const call2 = phoneEngine.getCall('CALL-02');
      expect(call2).toBeDefined();
      expect(call2?.callerName).toBe('Liam Kumar');
      expect(call2?.department).toBe('Engineering');
      expect(call2?.callerHostId).toBe('PC-ENG-02');
      expect(call2?.linkedTicketId).toBe('INC-1043');

      const call3 = phoneEngine.getCall('CALL-03');
      expect(call3).toBeDefined();
      expect(call3?.callerName).toBe('Clara Jones');
      expect(call3?.department).toBe('Marketing');
      expect(call3?.callerHostId).toBe('PC-MKT-03');
      expect(call3?.linkedTicketId).toBe('INC-1052');
    });

    test('active call detection and answering', () => {
      // CALL-01 starts as Ringing
      const activeCall = phoneEngine.getActiveCall();
      expect(activeCall).not.toBeNull();
      expect(activeCall?.id).toBe('CALL-01');
      expect(activeCall?.status).toBe('Ringing');

      // Answer CALL-01
      const answerOk = phoneEngine.answerCall('CALL-01');
      expect(answerOk).toBe(true);
      expect(phoneEngine.getCall('CALL-01')?.status).toBe('Connected');
      expect(phoneEngine.getActiveCall()?.id).toBe('CALL-01');
    });

    test('dialogue tree navigation Branch A: restart question', () => {
      phoneEngine.triggerCall('CALL-01');
      phoneEngine.answerCall('CALL-01');

      // Select Branch A: "Have you restarted?"
      const res = phoneEngine.selectDialogueChoice('CALL-01', 'c1-opt-restart');
      expect(res.nextNode).not.toBeNull();
      expect(res.nextNode?.speakerText).toBe(
        'Yes, twice! My network icon says connected but websites time out.'
      );
    });

    test('dialogue tree navigation Branch B: IP settings and clue extraction for INC-1042', () => {
      phoneEngine.triggerCall('CALL-01');
      phoneEngine.answerCall('CALL-01');

      // Select Branch B: "Can you read me your IP settings?"
      const result = phoneEngine.selectDialogueChoice('CALL-01', 'c1-opt-ip');
      expect(result.revealedClue).toBe(
        'PC-FIN-04 configured DNS resolver is 192.168.10.250 which does not answer queries.'
      );
      expect(result.linkedTicketId).toBe('INC-1042');
      expect(result.nextNode?.speakerText).toBe('My DNS server says 192.168.10.250!');

      // Verify clue is registered for INC-1042
      const clues = phoneEngine.getRevealedClues('INC-1042');
      expect(clues).toContain(
        'PC-FIN-04 configured DNS resolver is 192.168.10.250 which does not answer queries.'
      );

      // Verify ending call
      const endOk = phoneEngine.endCall('CALL-01');
      expect(endOk).toBe(true);
      expect(phoneEngine.getCall('CALL-01')?.status).toBe('Ended');
    });

    test('triggering and navigating CALL-02 (Liam Kumar - INC-1043)', () => {
      const call = phoneEngine.triggerCall('CALL-02');
      expect(call.id).toBe('CALL-02');
      expect(call.status).toBe('Ringing');

      phoneEngine.answerCall('CALL-02');
      const result = phoneEngine.selectDialogueChoice('CALL-02', 'c2-opt-what-happened');

      expect(result.revealedClue).toBe('User lkumar locked out in Active Directory.');
      expect(result.linkedTicketId).toBe('INC-1043');
      expect(result.nextNode?.speakerText).toBe(
        'I locked myself out typing the sudo password into Windows lock screen.'
      );

      const clues = phoneEngine.getRevealedClues('INC-1043');
      expect(clues).toContain('User lkumar locked out in Active Directory.');
    });

    test('triggering and navigating CALL-03 (Clara Jones - INC-1052)', () => {
      const call = phoneEngine.triggerCall('CALL-03');
      expect(call.id).toBe('CALL-03');
      expect(call.status).toBe('Ringing');

      phoneEngine.answerCall('CALL-03');
      const result = phoneEngine.selectDialogueChoice('CALL-03', 'c3-opt-check-adapter');

      expect(result.revealedClue).toBe('PC-MKT-03 network adapter disabled in Device Manager.');
      expect(result.linkedTicketId).toBe('INC-1052');
      expect(result.nextNode?.speakerText).toBe(
        'The Ethernet connection on the back was disabled in Device Manager.'
      );

      const clues = phoneEngine.getRevealedClues('INC-1052');
      expect(clues).toContain('PC-MKT-03 network adapter disabled in Device Manager.');
    });
  });

  test.describe('Hardware Diagnostics Workbench Engine (HardwareEngine)', () => {
    test('initial workbench state exhibits POST code 55 (Memory Error)', () => {
      const state = hardwareEngine.getBenchState();
      expect(state.hostId).toBe('PC-MKT-03');
      expect(state.postCode).toBe('55');
      expect(state.postMessage).toBe('Memory Not Detected / Incompatible Module');
      expect(state.components.RAM_SLOT_1.status).toBe('Defective');
      expect(state.components.RAM_SLOT_2.status).toBe('Missing');
      expect(state.thermalPasteCondition).toBe('Dried');
      expect(state.repaired).toBe(false);

      const evalResult = hardwareEngine.evaluatePost();
      expect(evalResult.code).toBe('55');
      expect(evalResult.isPassing).toBe(false);
    });

    test('workbench power controls and safety guard against hot-swapping', () => {
      expect(hardwareEngine.isPoweredOn()).toBe(true);

      // Attempt swapping component while powered on -> should be rejected
      const hotSwapOk = hardwareEngine.swapComponent('RAM_SLOT_1', 'INV-RAM-16');
      expect(hotSwapOk).toBe(false);

      // Power off system
      hardwareEngine.powerOff();
      expect(hardwareEngine.isPoweredOn()).toBe(false);

      // Swapping while powered off -> should succeed
      const coldSwapOk = hardwareEngine.swapComponent('RAM_SLOT_1', 'INV-RAM-16');
      expect(coldSwapOk).toBe(true);
    });

    test('full repair workflow: swap defective RAM, reapply thermal paste, power on to POST 00', () => {
      // 1. Initial POST code 55
      expect(hardwareEngine.getBenchState().postCode).toBe('55');

      // 2. Power off
      hardwareEngine.powerOff();
      expect(hardwareEngine.isPoweredOn()).toBe(false);

      // 3. Swap RAM module with INV-RAM-16
      const swapOk = hardwareEngine.swapComponent('RAM_SLOT_1', 'INV-RAM-16');
      expect(swapOk).toBe(true);
      expect(hardwareEngine.getBenchState().components.RAM_SLOT_1.id).toBe('INV-RAM-16');
      expect(hardwareEngine.getBenchState().components.RAM_SLOT_1.status).toBe('Good');

      // Intermediate check: powering on before thermal paste repair yields POST FF (CPU Thermal)
      const intermediatePower = hardwareEngine.powerOn();
      expect(intermediatePower.postCode).toBe('FF');
      expect(intermediatePower.postMessage).toBe('CPU Thermal Overheat / Fault');
      expect(intermediatePower.success).toBe(false);

      // 4. Power off and reapply thermal paste
      hardwareEngine.powerOff();
      const pasteOk = hardwareEngine.reapplyThermalPaste();
      expect(pasteOk).toBe(true);
      expect(hardwareEngine.getBenchState().thermalPasteCondition).toBe('Good');
      expect(hardwareEngine.getBenchState().components.CPU.status).toBe('Good');

      // 5. Power on and verify POST code 00 (Success)
      const postResult = hardwareEngine.powerOn();
      expect(postResult.postCode).toBe('00');
      expect(postResult.postMessage).toBe('Normal POST - All Hardware Verified');
      expect(postResult.success).toBe(true);

      const finalState = hardwareEngine.getBenchState();
      expect(finalState.postCode).toBe('00');
      expect(finalState.repaired).toBe(true);
    });

    test('PSU rails voltage verification', () => {
      const rails = hardwareEngine.testPsuRails();
      expect(rails.isGood).toBe(true);
      expect(rails.rail12V).toBeCloseTo(12.05, 2);
      expect(rails.rail5V).toBeCloseTo(5.02, 2);
      expect(rails.rail3V3).toBeCloseTo(3.31, 2);
    });
  });
});
