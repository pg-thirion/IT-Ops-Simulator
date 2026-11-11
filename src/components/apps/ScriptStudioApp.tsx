import React, { useState } from 'react';
import {
  Terminal,
  Play,
  CheckCircle,
  Code2,
  Layers,
} from 'lucide-react';
import { ScriptEngine } from '../../simulation/scriptEngine';
import type { ScriptTargetScope, ScriptExecutionResult } from '../../types/script';
import { sound } from '../../utils/audio';

interface ScriptStudioAppProps {
  scriptEngine: ScriptEngine;
  onStateChange: () => void;
}

const TARGET_SCOPES: ScriptTargetScope[] = [
  'OU=Engineering',
  'OU=Finance',
  'OU=Sales',
  'OU=Executive',
  'All Workstations',
  'All Servers',
];

export const ScriptStudioApp: React.FC<ScriptStudioAppProps> = ({
  scriptEngine,
  onStateChange,
}) => {
  const playbooks = scriptEngine.getPlaybooks();
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(
    playbooks[0]?.id ?? 'PLAYBOOK-ENG-REMEDIATE'
  );
  const [selectedScope, setSelectedScope] = useState<ScriptTargetScope>(
    playbooks[0]?.targetScope ?? 'OU=Engineering'
  );
  const [commandsText, setCommandsText] = useState<string>(
    (playbooks[0]?.commands ?? []).join('\n')
  );
  const [lastResult, setLastResult] = useState<ScriptExecutionResult | null>(
    scriptEngine.getExecutionHistory()[0] ?? null
  );

  const selectedPlaybook =
    playbooks.find((p) => p.id === selectedPlaybookId) ?? playbooks[0];

  const handleSelectPlaybook = (id: string) => {
    sound.playClick();
    setSelectedPlaybookId(id);
    const found = playbooks.find((p) => p.id === id);
    if (found) {
      setSelectedScope(found.targetScope);
      setCommandsText(found.commands.join('\n'));
    }
  };

  const handleExecutePlaybook = () => {
    if (!selectedPlaybook) return;
    sound.playClick();
    const customCommands = commandsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const result = scriptEngine.executePlaybook(
      selectedPlaybook.id,
      selectedScope,
      customCommands
    );
    sound.playSuccess();
    setLastResult(result);
    onStateChange();
  };

  return (
    <div className="flex flex-col h-full bg-[#0f131c] text-slate-100 select-none overflow-y-auto p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Code2 size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">
              PowerShell / Bash Fleet Automation Studio
            </h1>
            <p className="text-xs text-slate-400">
              Multi-Host Remediation Playbooks, OU Fleet Execution &amp; Live Stdout Telemetry
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Left Column: Playbook Library */}
        <div className="bg-[#161b26] border border-slate-700/60 rounded-xl p-3 space-y-2">
          <div className="flex items-center space-x-2 px-1 pb-2 border-b border-slate-800">
            <Layers size={14} className="text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Remediation Playbooks
            </span>
          </div>

          {playbooks.map((pb) => {
            const isSelected = pb.id === selectedPlaybook?.id;
            return (
              <div
                key={pb.id}
                onClick={() => handleSelectPlaybook(pb.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-mono text-[11px] font-bold text-amber-400">
                  {pb.id}
                </div>
                <div className="text-xs font-bold text-slate-100 mt-0.5">
                  {pb.name}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {pb.description}
                </p>
                <div className="mt-1.5 text-[10px] font-mono text-indigo-300">
                  Default Scope: {pb.targetScope}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Script Editor & Live Console */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <div className="bg-[#161b26] border border-slate-700/60 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="target-scope-select"
                  className="text-xs font-bold text-slate-300"
                >
                  Target Scope:
                </label>
                <select
                  id="target-scope-select"
                  aria-label="Target Scope"
                  value={selectedScope}
                  onChange={(e) =>
                    setSelectedScope(e.target.value as ScriptTargetScope)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {TARGET_SCOPES.map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExecutePlaybook}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
              >
                <Play size={14} />
                <span>Execute Playbook</span>
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Playbook Pipeline Commands
              </label>
              <textarea
                rows={4}
                value={commandsText}
                onChange={(e) => setCommandsText(e.target.value)}
                className="w-full bg-[#0b0e14] border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Live Execution Output */}
          <div className="bg-[#0b0e14] border border-slate-700/70 rounded-xl p-4 flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Terminal size={14} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Fleet Execution Stdout Console
                </span>
              </div>
              {lastResult && lastResult.allSucceeded && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center space-x-1">
                  <CheckCircle size={12} />
                  <span>Playbook Execution Succeeded</span>
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs max-h-60">
              {lastResult ? (
                lastResult.logs.map((log, idx) => (
                  <div
                    key={`${log.hostId}-${idx}`}
                    className="p-2 rounded bg-slate-900/80 border border-slate-800 text-slate-200"
                  >
                    <div className="text-[11px] text-indigo-300">
                      [{log.hostId}] $ {log.command}{' '}
                      <span className="text-emerald-400">
                        (exit {log.exitCode})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {log.stdout}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs py-8 text-center">
                  Select a playbook and click &ldquo;Execute Playbook&rdquo; to dispatch commands across target hosts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
