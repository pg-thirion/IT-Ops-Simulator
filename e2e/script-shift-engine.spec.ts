import { test, expect } from '@playwright/test';
import { ScriptEngine } from '../src/simulation/scriptEngine';
import { ShiftEventEngine } from '../src/simulation/shiftEventEngine';
import { NetworkEngine } from '../src/simulation/networkEngine';
import { CareerStats } from '../src/types/game';

test.describe('ScriptEngine & ShiftEventEngine Simulation', () => {
  test('1. ScriptEngine playbooks & scope execution targets only selected scope', () => {
    const net = new NetworkEngine();
    const scriptEngine = new ScriptEngine(net);

    const playbooks = scriptEngine.getPlaybooks();
    expect(playbooks.length).toBeGreaterThanOrEqual(3);

    const engPlaybook = playbooks.find((p) => p.id === 'PLAYBOOK-ENG-REMEDIATE');
    expect(engPlaybook).toBeDefined();
    expect(engPlaybook?.name).toBe('Engineering Subnet DNS & Token Remediation');
    expect(engPlaybook?.targetScope).toBe('OU=Engineering');

    expect(
      scriptEngine.hasExecutedPlaybookOnScope('PLAYBOOK-ENG-REMEDIATE', 'OU=Engineering')
    ).toBe(false);

    const result = scriptEngine.executePlaybook('PLAYBOOK-ENG-REMEDIATE', 'OU=Engineering');
    expect(result.playbookId).toBe('PLAYBOOK-ENG-REMEDIATE');
    expect(result.targetScope).toBe('OU=Engineering');
    expect(result.allSucceeded).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);

    for (const log of result.logs) {
      expect(log.exitCode).toBe(0);
      expect(log.hostId.startsWith('PC-ENG-') || log.hostId.startsWith('PRN-ENG-')).toBe(true);
    }

    expect(
      scriptEngine.hasExecutedPlaybookOnScope('PLAYBOOK-ENG-REMEDIATE', 'OU=Engineering')
    ).toBe(true);
    expect(
      scriptEngine.hasExecutedPlaybookOnScope('PLAYBOOK-ENG-REMEDIATE', 'OU=Finance')
    ).toBe(false);

    const history = scriptEngine.getExecutionHistory();
    expect(history.length).toBe(1);
    expect(history[0].playbookId).toBe('PLAYBOOK-ENG-REMEDIATE');
  });

  test('2. ShiftEventEngine TLS/SSL certificate renewal & live events', () => {
    const shiftEngine = new ShiftEventEngine();

    const events = shiftEngine.getEvents();
    const sslEvent = events.find((e) => e.id === 'EVT-SSL-EXPIRED');
    const upsEvent = events.find((e) => e.id === 'EVT-UPS-BROWNOUT');

    expect(sslEvent).toBeDefined();
    expect(sslEvent?.targetHostId).toBe('WEB-INTRA-01');
    expect(upsEvent).toBeDefined();

    expect(shiftEngine.isSslValid('WEB-INTRA-01')).toBe(false);

    const renewal = shiftEngine.renewSslCertificate('WEB-INTRA-01');
    expect(renewal.success).toBe(true);
    expect(shiftEngine.isSslValid('WEB-INTRA-01')).toBe(true);

    const updatedSslEvent = shiftEngine
      .getEvents()
      .find((e) => e.id === 'EVT-SSL-EXPIRED');
    expect(updatedSslEvent?.isResolved).toBe(true);

    const triggeredUps = shiftEngine.triggerEvent('EVT-UPS-BROWNOUT');
    expect(triggeredUps).toBeDefined();
    expect(triggeredUps?.isActive).toBe(true);
  });

  test('3. ShiftEventEngine end-of-shift report card calculation', () => {
    const shiftEngine = new ShiftEventEngine();

    const baseCareer: CareerStats = {
      playerName: 'Admin',
      title: 'SysAdmin',
      level: 2,
      xp: 500,
      xpForNextLevel: 1000,
      cash: 1500,
      ticketsResolved: 4,
      ticketsFailed: 0,
      slaAdherenceRate: 98,
      currentDay: 1,
      dayTimeRemainingSeconds: 0,
      isDayActive: false,
      unlockedTools: [],
    };

    const reportS = shiftEngine.calculateShiftReport(baseCareer);
    expect(reportS.grade).toBe('S');
    expect(reportS.bonusCash).toBeGreaterThan(0);
    expect(reportS.bonusXp).toBeGreaterThan(0);

    const reportA = shiftEngine.calculateShiftReport({
      ...baseCareer,
      ticketsResolved: 2,
      ticketsFailed: 0,
      slaAdherenceRate: 88,
    });
    expect(reportA.grade).toBe('A');
    expect(reportA.bonusCash).toBeGreaterThan(0);
    expect(reportA.bonusXp).toBeGreaterThan(0);

    const reportB = shiftEngine.calculateShiftReport({
      ...baseCareer,
      ticketsResolved: 2,
      ticketsFailed: 1,
      slaAdherenceRate: 75,
    });
    expect(reportB.grade).toBe('B');

    const reportC = shiftEngine.calculateShiftReport({
      ...baseCareer,
      ticketsResolved: 1,
      ticketsFailed: 1,
      slaAdherenceRate: 55,
    });
    expect(reportC.grade).toBe('C');

    const reportF = shiftEngine.calculateShiftReport({
      ...baseCareer,
      ticketsResolved: 0,
      ticketsFailed: 3,
      slaAdherenceRate: 30,
    });
    expect(reportF.grade).toBe('F');
  });
});
