export type ScriptTargetScope =
  | 'OU=Finance'
  | 'OU=Engineering'
  | 'OU=Sales'
  | 'OU=Executive'
  | 'All Workstations'
  | 'All Servers';

export interface AutomationPlaybook {
  id: string;
  name: string;
  description: string;
  targetScope: ScriptTargetScope;
  commands: string[];
}

export interface ScriptExecutionLog {
  hostId: string;
  command: string;
  stdout: string;
  exitCode: number;
}

export interface ScriptExecutionResult {
  playbookId: string;
  targetScope: ScriptTargetScope;
  timestamp: string;
  logs: ScriptExecutionLog[];
  allSucceeded: boolean;
}
