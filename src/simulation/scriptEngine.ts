import { NetworkEngine } from './networkEngine';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from './initialNetwork';
import type {
  AutomationPlaybook,
  ScriptTargetScope,
  ScriptExecutionLog,
  ScriptExecutionResult,
} from '../types/script';
import type { NetworkHost } from '../types/network';

const INITIAL_PLAYBOOKS: AutomationPlaybook[] = [
  {
    id: 'PLAYBOOK-ENG-REMEDIATE',
    name: 'Engineering Subnet DNS & Token Remediation',
    description:
      'Flushes stale DNS client caches across Engineering workstations, refreshes Group Policy computer tokens, resets CI service credentials, and verifies domain controller reachability.',
    targetScope: 'OU=Engineering',
    commands: [
      'Clear-DnsClientCache -Scope Engineering',
      'Invoke-GPUpdate -Force',
      'Reset-ServiceToken -Account svc_eng_ci',
      'Test-NetConnection -ComputerName dc-srv-01.corp.local',
    ],
  },
  {
    id: 'PLAYBOOK-AD-BULK-UNLOCK',
    name: 'Bulk AD Account Unlock & Kerberos Ticket Purge',
    description:
      'Queries Active Directory for locked user accounts in the target OU, unlocks affected identities, and purges stale Kerberos TGT/TGS tickets.',
    targetScope: 'OU=Finance',
    commands: [
      'Search-ADAccount -LockedOut | Unlock-ADAccount',
      'klist purge -li 0x3e7',
    ],
  },
  {
    id: 'PLAYBOOK-FLEET-SPOOLER',
    name: 'Server Fleet Print Spooler & Service Health Reset',
    description:
      'Restarts the Print Spooler service across enterprise servers and validates running status of core directory and DNS daemons.',
    targetScope: 'All Servers',
    commands: [
      'Restart-Service -Name Spooler -Force',
      'Get-Service -Name Spooler,DNS,NTDS | Verify-Running',
    ],
  },
];

export class ScriptEngine {
  private networkEngine: NetworkEngine;
  private playbooks: AutomationPlaybook[];
  private executionHistory: ScriptExecutionResult[] = [];

  constructor(networkEngine?: NetworkEngine) {
    if (networkEngine && networkEngine.getAllHosts().length > 0) {
      this.networkEngine = networkEngine;
    } else {
      this.networkEngine = new NetworkEngine(
        buildInitialNetworkHosts(),
        buildInitialActiveDirectory(),
        INITIAL_ROUTER_CONFIG,
        INITIAL_SHARED_FOLDERS
      );
    }
    this.playbooks = INITIAL_PLAYBOOKS.map((p) => ({
      ...p,
      commands: [...p.commands],
    }));
  }

  public getPlaybooks(): AutomationPlaybook[] {
    return this.playbooks.map((p) => ({
      ...p,
      commands: [...p.commands],
    }));
  }

  private getTargetHosts(targetScope: ScriptTargetScope): NetworkHost[] {
    const allHosts = this.networkEngine.getAllHosts();

    switch (targetScope) {
      case 'OU=Finance':
        return allHosts.filter((h) => h.department === 'Finance');
      case 'OU=Engineering':
        return allHosts.filter((h) => h.department === 'Engineering');
      case 'OU=Sales':
        return allHosts.filter((h) => h.department === 'Sales');
      case 'OU=Executive':
        return allHosts.filter((h) => h.department === 'Executive');
      case 'All Workstations':
        return allHosts.filter((h) => h.type === 'workstation');
      case 'All Servers':
        return allHosts.filter((h) => h.type === 'server');
      default:
        return [];
    }
  }

  private executeCommandOnHost(host: NetworkHost, command: string): ScriptExecutionLog {
    const cmdLower = command.toLowerCase();

    if (cmdLower.includes('clear-dnsclientcache')) {
      return {
        hostId: host.id,
        command,
        stdout: `[${host.id}] Successfully flushed the DNS Resolver Cache (${host.nic.ip}).`,
        exitCode: 0,
      };
    }

    if (cmdLower.includes('invoke-gpupdate')) {
      return {
        hostId: host.id,
        command,
        stdout: `[${host.id}] Computer Policy update has completed successfully. User Policy update has completed successfully.`,
        exitCode: 0,
      };
    }

    if (cmdLower.includes('reset-servicetoken')) {
      return {
        hostId: host.id,
        command,
        stdout: `[${host.id}] Service token rotated and Kerberos ticket refreshed for svc_eng_ci.`,
        exitCode: 0,
      };
    }

    if (cmdLower.includes('test-netconnection')) {
      return {
        hostId: host.id,
        command,
        stdout: `[${host.id}] ComputerName: dc-srv-01.corp.local | RemoteAddress: 192.168.10.200 | PingSucceeded: True | PingReplyDetails (RTT): 1 ms`,
        exitCode: 0,
      };
    }

    if (cmdLower.includes('unlock-adaccount')) {
      if (host.activeDirectoryUsername) {
        this.networkEngine.unlockADUser(host.activeDirectoryUsername);
      }
      return {
        hostId: host.id,
        command,
        stdout: `[${host.id}] Active Directory lockout state cleared for ${host.activeDirectoryUsername ?? 'machine account'}.`,
        exitCode: 0,
      };
    }

    if (cmdLower.includes('restart-service') && cmdLower.includes('spooler')) {
      this.networkEngine.updateServiceStatus(host.id, 'spooler', 'running');
      return {
        hostId: host.id,
        command,
        stdout: `[${host.id}] Service 'Print Spooler (Spooler)' restarted and transitioned to Running.`,
        exitCode: 0,
      };
    }

    return {
      hostId: host.id,
      command,
      stdout: `[${host.id}] Command '${command}' executed with exit code 0.`,
      exitCode: 0,
    };
  }

  public executePlaybook(
    playbookId: string,
    targetScope: ScriptTargetScope,
    customCommands?: string[]
  ): ScriptExecutionResult {
    const playbook = this.playbooks.find((p) => p.id === playbookId);
    const commands =
      customCommands && customCommands.length > 0
        ? customCommands
        : playbook
        ? playbook.commands
        : ['Echo-Status -Health OK'];

    const targetHosts = this.getTargetHosts(targetScope);
    const logs: ScriptExecutionLog[] = [];

    for (const host of targetHosts) {
      for (const cmd of commands) {
        logs.push(this.executeCommandOnHost(host, cmd));
      }
    }

    const allSucceeded =
      logs.length > 0 && logs.every((log) => log.exitCode === 0);

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const result: ScriptExecutionResult = {
      playbookId,
      targetScope,
      timestamp,
      logs,
      allSucceeded,
    };

    this.executionHistory.unshift(result);
    return {
      ...result,
      logs: result.logs.map((l) => ({ ...l })),
    };
  }

  public getExecutionHistory(): ScriptExecutionResult[] {
    return this.executionHistory.map((res) => ({
      ...res,
      logs: res.logs.map((l) => ({ ...l })),
    }));
  }

  public hasExecutedPlaybookOnScope(
    playbookId: string,
    targetScope: ScriptTargetScope
  ): boolean {
    return this.executionHistory.some(
      (res) =>
        res.playbookId === playbookId &&
        res.targetScope === targetScope &&
        res.allSucceeded
    );
  }
}
