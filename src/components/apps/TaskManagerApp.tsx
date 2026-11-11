import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Search,
  Trash2,
  AlertOctagon,
  CheckCircle,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { ProcessItem } from '../../types/network';
import { sound } from '../../utils/audio';

interface TaskManagerAppProps {
  initialHostId?: string;
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({
  initialHostId = 'SQL-PROD-01',
  networkEngine,
  onRefresh,
}) => {
  const [selectedHostId, setSelectedHostId] = useState<string>(initialHostId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const allHosts = networkEngine.getAllHosts();
  const currentHost = networkEngine.getHost(selectedHostId);
  const processes = currentHost?.processes || [];

  const filtered = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pid.toString().includes(searchTerm)
  );

  const selectedProcess = processes.find((p) => p.pid === selectedPid);

  const handleKill = (p: ProcessItem) => {
    sound.playClick();
    if (!p.canKill) {
      sound.playError();
      setNotice(`Cannot terminate protected system process '${p.name}'. Access denied.`);
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    const ok = networkEngine.killProcess(selectedHostId, p.pid);
    if (ok) {
      sound.playSuccess();
      setNotice(`Process '${p.name}' (PID ${p.pid}) terminated successfully.`);
      setSelectedPid(null);
      onRefresh?.();
      setTimeout(() => setNotice(null), 3500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12151c] text-slate-100 select-none font-sans text-xs">
      {/* Top Controls Bar */}
      <div className="p-3 bg-[#171b24] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Activity size={16} className="text-emerald-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Task Manager (taskmgr.exe)
          </span>
          <span className="text-slate-500">•</span>
          <select
            value={selectedHostId}
            onChange={(e) => {
              setSelectedHostId(e.target.value);
              setSelectedPid(null);
            }}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-sky-400 font-mono text-xs focus:outline-none"
          >
            {allHosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.id} ({h.hostname}) - {h.cpuUsage}% CPU
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter processes..."
              className="bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-36"
            />
          </div>

          {selectedProcess && (
            <button
              onClick={() => handleKill(selectedProcess)}
              disabled={!selectedProcess.canKill}
              className={`px-3 py-1 rounded font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                selectedProcess.canKill
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Trash2 size={12} />
              <span>End Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-1.5 text-xs flex items-center space-x-2 text-sky-300">
          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Telemetry Spark Cards */}
      {currentHost && (
        <div className="p-3 bg-slate-900/50 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#181c26] border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center space-x-1">
                <Cpu size={12} className="text-emerald-400" />
                <span>CPU Utilization</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">{currentHost.cpuUsage}%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentHost.cpuUsage > 80 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
                style={{ width: `${currentHost.cpuUsage}%` }}
              />
            </div>
          </div>

          <div className="bg-[#181c26] border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center space-x-1">
                <Layers size={12} className="text-sky-400" />
                <span>Memory</span>
              </span>
              <span className="font-mono text-sky-400 font-bold">{currentHost.ramUsage}%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentHost.ramUsage}%` }}
              />
            </div>
          </div>

          <div className="bg-[#181c26] border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Total Processes</div>
            <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
              {processes.length} Active
            </div>
          </div>

          <div className="bg-[#181c26] border border-slate-800 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-400">Target Host</div>
            <div className="text-xs font-mono text-indigo-300 font-bold truncate mt-0.5">
              {currentHost.id} ({currentHost.nic.ip})
            </div>
          </div>
        </div>
      )}

      {/* Process Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0">
              <th className="p-2.5">Name</th>
              <th className="p-2.5">PID</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">CPU %</th>
              <th className="p-2.5">Memory</th>
              <th className="p-2.5">User</th>
              <th className="p-2.5">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
            {filtered.map((proc) => {
              const isSelected = selectedPid === proc.pid;
              const isRogue = proc.status === 'malicious';

              return (
                <tr
                  key={proc.pid}
                  onClick={() => setSelectedPid(proc.pid)}
                  className={`cursor-pointer transition-colors ${
                    isRogue
                      ? 'bg-rose-950/40 text-rose-300 font-bold hover:bg-rose-950/60'
                      : isSelected
                      ? 'bg-emerald-600/20 text-white font-semibold'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="p-2.5 font-bold flex items-center space-x-1.5">
                    {isRogue && <AlertOctagon size={13} className="text-rose-400 shrink-0" />}
                    <span>{proc.name}</span>
                  </td>
                  <td className="p-2.5 text-slate-400">{proc.pid}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                        proc.status === 'running'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                      }`}
                    >
                      {proc.status}
                    </span>
                  </td>
                  <td className={`p-2.5 ${proc.cpu > 50 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}`}>
                    {proc.cpu}%
                  </td>
                  <td className="p-2.5 text-slate-300">{proc.ramMb} MB</td>
                  <td className="p-2.5 text-slate-400">{proc.user}</td>
                  <td className="p-2.5 text-slate-400 font-sans text-xs truncate max-w-xs">
                    {proc.description}
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
