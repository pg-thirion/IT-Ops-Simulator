import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  Square,
  RotateCw,
  Search,
  CheckCircle,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { sound } from '../../utils/audio';

interface ServicesAppProps {
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const ServicesApp: React.FC<ServicesAppProps> = ({ networkEngine, onRefresh }) => {
  const [selectedServerId, setSelectedServerId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const servers = networkEngine.getAllHosts().filter((h) => h.type === 'server');

  const allServicesWithHost = servers.flatMap((srv) =>
    srv.services.map((svc) => ({
      hostId: srv.id,
      hostName: srv.hostname,
      ...svc,
    }))
  );

  const filtered = allServicesWithHost.filter((s) => {
    const matchServer = selectedServerId === 'ALL' || s.hostId === selectedServerId;
    const matchSearch =
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.hostId.toLowerCase().includes(search.toLowerCase());
    return matchServer && matchSearch;
  });

  const handleAction = (hostId: string, svcId: string, action: 'start' | 'stop' | 'restart') => {
    sound.playClick();
    const newStatus = action === 'stop' ? 'stopped' : 'running';
    networkEngine.updateServiceStatus(hostId, svcId, newStatus);
    sound.playSuccess();
    setFeedback(`Service ${svcId} on ${hostId} was ${action}ed.`);
    onRefresh?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-[#13161c] text-slate-100 select-none">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#181c25] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal size={16} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Datacenter Services Console (services.msc)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Server Filter */}
          <select
            value={selectedServerId}
            onChange={(e) => setSelectedServerId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-sky-400 focus:outline-none"
          >
            <option value="ALL">All Datacenter Servers ({servers.length})</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} ({s.hostname})
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter service..."
              className="bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-36"
            />
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      {feedback && (
        <div className="bg-emerald-950/40 border-b border-emerald-500/50 text-emerald-300 px-4 py-1.5 text-xs flex items-center space-x-2">
          <CheckCircle size={14} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
              <th className="p-3">Host Server</th>
              <th className="p-3">Display Name / Service Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Startup</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.map((svc) => (
              <tr key={`${svc.hostId}-${svc.id}`} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-mono text-sky-400 font-semibold">{svc.hostId}</td>
                <td className="p-3">
                  <div className="font-semibold text-slate-200">{svc.displayName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{svc.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 max-w-md">{svc.description}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      svc.status === 'running'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/40'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-700/40'
                    }`}
                  >
                    {svc.status}
                  </span>
                </td>
                <td className="p-3 capitalize text-slate-400">{svc.startupType}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {svc.status !== 'running' ? (
                      <button
                        onClick={() => handleAction(svc.hostId, svc.id, 'start')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                      >
                        <Play size={11} />
                        <span>Start</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(svc.hostId, svc.id, 'restart')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-300 rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <RotateCw size={11} />
                          <span>Restart</span>
                        </button>
                        <button
                          onClick={() => handleAction(svc.hostId, svc.id, 'stop')}
                          className="px-2 py-1 hover:bg-rose-600/20 text-rose-400 rounded text-xs transition-colors"
                          title="Stop Service"
                        >
                          <Square size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
