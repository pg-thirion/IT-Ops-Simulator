import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  AlertOctagon,
  Info,
  Search,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { EventLogEntry } from '../../types/network';

interface EventViewerAppProps {
  networkEngine: NetworkEngine;
}

export const EventViewerApp: React.FC<EventViewerAppProps> = ({ networkEngine }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const allHosts = networkEngine.getAllHosts();
  const allLogs: (EventLogEntry & { hostId: string })[] = allHosts.flatMap((h) =>
    h.logs.map((log) => ({ ...log, hostId: h.id }))
  );

  const filteredLogs = allLogs.filter((log) => {
    const matchLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchSearch =
      log.source.toLowerCase().includes(search.toLowerCase()) ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.hostId.toLowerCase().includes(search.toLowerCase()) ||
      log.eventId.toString().includes(search);
    return matchLevel && matchSearch;
  });

  const selectedLog = filteredLogs.find((l) => l.id === selectedLogId) || filteredLogs[0];

  const getLevelBadge = (level: EventLogEntry['level']) => {
    switch (level) {
      case 'Critical':
      case 'Error':
        return (
          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold flex items-center space-x-1 text-[10px]">
            <AlertOctagon size={11} />
            <span>{level}</span>
          </span>
        );
      case 'Warning':
        return (
          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold flex items-center space-x-1 text-[10px]">
            <AlertTriangle size={11} />
            <span>Warning</span>
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-500/50 text-sky-300 font-bold flex items-center space-x-1 text-[10px]">
            <Info size={11} />
            <span>Information</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12151c] text-slate-100 select-none">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#171b24] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Event Viewer (eventvwr.msc)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Event Levels</option>
            <option value="Critical">Critical</option>
            <option value="Error">Error</option>
            <option value="Warning">Warning</option>
            <option value="Information">Information</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event ID, host..."
              className="bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 w-44"
            />
          </div>
        </div>
      </div>

      {/* Main Split: Top Table, Bottom Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Table View */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 sticky top-0">
                <th className="p-2.5">Level</th>
                <th className="p-2.5">Date and Time</th>
                <th className="p-2.5">Source</th>
                <th className="p-2.5">Event ID</th>
                <th className="p-2.5">Task Category</th>
                <th className="p-2.5">Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-600/20 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="p-2.5">{getLevelBadge(log.level)}</td>
                    <td className="p-2.5 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="p-2.5 font-semibold text-slate-200">{log.source}</td>
                    <td className="p-2.5 font-mono text-sky-400 font-bold">{log.eventId}</td>
                    <td className="p-2.5 text-slate-400">{log.category}</td>
                    <td className="p-2.5 font-mono text-slate-400">{log.hostId}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Detail Pane */}
        {selectedLog && (
          <div className="h-44 border-t border-slate-700/60 bg-[#161922] p-4 overflow-y-auto select-text font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/40 text-[11px] font-sans">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200">{selectedLog.source}</span>
                <span className="text-slate-400">• Event ID {selectedLog.eventId}</span>
                <span className="text-slate-400">• Host: {selectedLog.hostId}</span>
              </div>
              <span className="text-slate-500">{selectedLog.timestamp}</span>
            </div>
            <p className="mt-2 text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedLog.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
