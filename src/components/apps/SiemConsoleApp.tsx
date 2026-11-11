import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Pin,
  Ban,
  UserX,
  CheckCircle,
  Filter,
  AlertOctagon,
} from 'lucide-react';
import { SiemEngine } from '../../simulation/siemEngine';
import { sound } from '../../utils/audio';

interface SiemConsoleAppProps {
  siemEngine: SiemEngine;
  onStateChange: () => void;
}

export const SiemConsoleApp: React.FC<SiemConsoleAppProps> = ({
  siemEngine,
  onStateChange,
}) => {
  const [query, setQuery] = useState<string>('');
  const [ipInput, setIpInput] = useState<string>('185.220.101.44');
  const [accountInput, setAccountInput] = useState<string>('svc_backup');
  const [notice, setNotice] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const logs = siemEngine.queryLogs(query);
  const caseState = siemEngine.getCase();
  const isResolved = siemEngine.isInvestigationResolved();

  const refresh = () => {
    setTick((t) => t + 1);
    onStateChange();
  };

  const handleTogglePin = (logId: string) => {
    sound.playClick();
    if (caseState.pinnedLogIds.includes(logId)) {
      siemEngine.unpinLogFromCase(logId);
      setNotice(`Removed ${logId} from investigation case.`);
    } else {
      siemEngine.pinLogToCase(logId);
      sound.playSuccess();
      setNotice(`Pinned ${logId} as correlated attack evidence.`);
    }
    refresh();
  };

  const handleBlockIp = (ipToBlock: string) => {
    if (!ipToBlock.trim()) return;
    sound.playClick();
    siemEngine.blockAttackerIp(ipToBlock.trim());
    sound.playSuccess();
    setNotice(`Blocked malicious source IP ${ipToBlock.trim()} at edge firewall.`);
    refresh();
  };

  const handleRevokeAccount = (userToRevoke: string) => {
    if (!userToRevoke.trim()) return;
    sound.playClick();
    siemEngine.revokeCompromisedAccount(userToRevoke.trim());
    sound.playSuccess();
    setNotice(
      `Revoked Kerberos/NTLM sessions and disabled compromised account '${userToRevoke.trim()}'.`
    );
    refresh();
  };

  return (
    <div className="flex flex-col h-full bg-[#0f131a] text-slate-100 select-none overflow-hidden">
      {/* Top Bar: Case Summary & IOC Remediation */}
      <div className="p-4 border-b border-slate-700/70 bg-[#151a24] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100">
                SIEM Log Correlation &amp; Threat Hunting Console
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                {caseState.id}: {caseState.title} | Pinned Evidence Logs:{' '}
                <span className="text-indigo-300 font-bold">
                  {caseState.pinnedLogIds.length}
                </span>
              </p>
            </div>
          </div>

          <div>
            {isResolved ? (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
                <CheckCircle size={14} />
                <span>Incident Contained &amp; IOCs Blocked</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center space-x-1.5">
                <AlertOctagon size={14} />
                <span>Active Investigation (Pin &ge;2 Attack Logs, Block IP &amp; Revoke Account)</span>
              </span>
            )}
          </div>
        </div>

        {notice && (
          <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/40 text-indigo-200 text-xs flex items-center space-x-2">
            <CheckCircle size={13} className="shrink-0 text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* IOC Remediation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-[160px]">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                aria-label="Attacker IP to Block"
                placeholder="Attacker IP..."
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 w-36 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => handleBlockIp(ipInput)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Ban size={12} />
                <span>Block IP</span>
              </button>
              <button
                onClick={() => handleBlockIp('185.220.101.44')}
                className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800/70 border border-rose-500/40 text-rose-200 rounded text-[11px] font-mono font-semibold transition-colors"
              >
                Block Attacker IP (185.220.101.44)
              </button>
            </div>
            {caseState.blockedIps.length > 0 && (
              <span className="text-[11px] font-mono text-emerald-400">
                Blocked: {caseState.blockedIps.join(', ')}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-[160px]">
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                aria-label="Compromised Account to Revoke"
                placeholder="Account username..."
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 w-32 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleRevokeAccount(accountInput)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <UserX size={12} />
                <span>Revoke Account</span>
              </button>
              <button
                onClick={() => handleRevokeAccount('svc_backup')}
                className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800/70 border border-amber-500/40 text-amber-200 rounded text-[11px] font-mono font-semibold transition-colors"
              >
                Revoke Account (svc_backup)
              </button>
            </div>
            {caseState.revokedAccounts.length > 0 && (
              <span className="text-[11px] font-mono text-emerald-400">
                Revoked: {caseState.revokedAccounts.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="relative flex-1 min-w-[260px]">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search logs (e.g. source=ad_auth severity=CRITICAL or 185.220.101.44)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={13} className="text-slate-400 mr-1" />
            <button
              onClick={() => setQuery('')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
            >
              All Logs
            </button>
            <button
              onClick={() => setQuery('severity=CRITICAL')}
              className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-[11px] font-semibold"
            >
              Critical Only
            </button>
            <button
              onClick={() => setQuery('185.220.101.44')}
              className="px-2.5 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono font-semibold"
            >
              Attacker IP 185.220.101.44
            </button>
            <button
              onClick={() => setQuery('source=ad_auth')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono"
            >
              AD Auth
            </button>
          </div>
        </div>
      </div>

      {/* Log Stream Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700/80 text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th className="py-2 px-2.5">Time (UTC)</th>
              <th className="py-2 px-2.5">Source</th>
              <th className="py-2 px-2.5">Severity</th>
              <th className="py-2 px-2.5">Host</th>
              <th className="py-2 px-2.5">Source IP</th>
              <th className="py-2 px-2.5">User</th>
              <th className="py-2 px-2.5">Event</th>
              <th className="py-2 px-2.5">Message</th>
              <th className="py-2 px-2.5 text-right">Case Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-mono">
            {logs.map((log) => {
              const isPinned = caseState.pinnedLogIds.includes(log.id);
              return (
                <tr
                  key={log.id}
                  className={`transition-colors ${
                    isPinned
                      ? 'bg-indigo-950/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-2 px-2.5 text-[11px] text-slate-400 whitespace-nowrap">
                    {log.timestamp.replace('2026-11-11T', '').replace('Z', '')}
                  </td>
                  <td className="py-2 px-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-sky-300">
                      {log.source}
                    </span>
                  </td>
                  <td className="py-2 px-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : log.severity === 'WARN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-700/40 text-slate-300'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-[11px] text-slate-200 whitespace-nowrap">
                    {log.hostId}
                  </td>
                  <td className="py-2 px-2.5 text-[11px] text-amber-300 whitespace-nowrap">
                    {log.sourceIp}
                  </td>
                  <td className="py-2 px-2.5 text-[11px] text-slate-300 whitespace-nowrap">
                    {log.username ?? '-'}
                  </td>
                  <td className="py-2 px-2.5 text-[11px] text-indigo-300 whitespace-nowrap">
                    {log.eventCode}
                  </td>
                  <td className="py-2 px-2.5 text-[11px] text-slate-200 font-sans">
                    {log.message}
                  </td>
                  <td className="py-2 px-2.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePin(log.id)}
                      aria-label={isPinned ? `Pinned ${log.id}` : `Pin Log ${log.id}`}
                      className={`px-2 py-1 rounded text-[11px] font-sans font-bold inline-flex items-center space-x-1 transition-colors ${
                        isPinned
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Pin size={11} />
                      <span>{isPinned ? 'Pinned' : 'Pin Log'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
