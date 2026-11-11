import React, { useState } from 'react';
import {
  Network,
  Server,
  Monitor,
  Printer,
  Router,
  Search,
  Filter,
  AlertCircle,
  Terminal,
  Layers,
} from 'lucide-react';
import { NetworkHost, Department } from '../../types/network';
import { NetworkEngine } from '../../simulation/networkEngine';
import { sound } from '../../utils/audio';

interface NetworkTopologyAppProps {
  networkEngine: NetworkEngine;
  onOpenRemoteDesktop: (hostId: string) => void;
  onOpenTerminal: (hostId: string) => void;
  hasCableTester?: boolean;
}

export const NetworkTopologyApp: React.FC<NetworkTopologyAppProps> = ({
  networkEngine,
  onOpenRemoteDesktop,
  onOpenTerminal,
  hasCableTester,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedHostId, setSelectedHostId] = useState<string | null>('PC-FIN-04');
  const [searchTerm, setSearchTerm] = useState('');

  const hosts = networkEngine.getAllHosts();

  const departments: (Department | 'All')[] = [
    'All',
    'Infrastructure',
    'Executive',
    'Finance',
    'Engineering',
    'Sales',
    'HR',
    'Marketing',
    'IT',
  ];

  const filteredHosts = hosts.filter((h) => {
    const matchesDept = selectedDept === 'All' || h.department === selectedDept;
    const matchesSearch =
      h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.nic.ip.includes(searchTerm);
    return matchesDept && matchesSearch;
  });

  const selectedHost = hosts.find((h) => h.id === selectedHostId);

  const getHostIcon = (type: NetworkHost['type'], className = 'w-4 h-4') => {
    switch (type) {
      case 'router':
      case 'firewall':
        return <Router className={className} />;
      case 'switch':
        return <Layers className={className} />;
      case 'server':
        return <Server className={className} />;
      case 'printer':
        return <Printer className={className} />;
      default:
        return <Monitor className={className} />;
    }
  };

  const getHostStatusColor = (host: NetworkHost) => {
    if (!host.isOnline || !host.nic.isUp) return 'border-rose-500 bg-rose-950/40 text-rose-300';
    // Check for known misconfigurations
    if (host.nic.primaryDns === '192.168.10.250' || host.nic.ip.startsWith('169.254.')) {
      return 'border-amber-500 bg-amber-950/40 text-amber-300 animate-pulse';
    }
    return 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300';
  };

  return (
    <div className="flex h-full bg-[#0d1017] text-slate-100 select-none overflow-hidden">
      {/* Left Area: Visual Map & Controls */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Filter Bar */}
        <div className="p-3 bg-[#151922] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-2">
            <Network size={16} className="text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Enterprise Network Graph (50+ Nodes)
            </span>
            {hasCableTester && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
                <span>Fluke Tester: TDR Telemetry Enabled</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find node or IP..."
                className="bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono w-40"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700/80 rounded p-0.5 text-xs">
              <Filter size={12} className="text-slate-400 ml-1.5" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none pr-1 py-0.5 cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-slate-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Network Diagram Grid Canvas */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Infrastructure Tier (Router & Core Switches & Servers) */}
          {(selectedDept === 'All' || selectedDept === 'Infrastructure') && (
            <div className="bg-[#131722]/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
                <span>VLAN 10: Infrastructure, Core Switches &amp; Datacenter Servers</span>
                <span className="font-mono text-[10px] text-slate-400">Gateway: 192.168.10.1</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {hosts
                  .filter((h) => h.vlan === 10 || h.type === 'router')
                  .map((node) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        sound.playClick();
                        setSelectedHostId(node.id);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedHostId === node.id
                          ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20'
                          : ''
                      } ${getHostStatusColor(node)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        {getHostIcon(node.type, 'w-4 h-4')}
                        <span className="text-[9px] font-mono opacity-80">{node.nic.ip}</span>
                      </div>
                      <div className="text-xs font-bold truncate text-slate-100">{node.id}</div>
                      <div className="text-[10px] text-slate-400 truncate">{node.hostname}</div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Workstations Tier */}
          <div className="bg-[#131722]/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
              <span>Enterprise Workstations ({filteredHosts.filter((h) => h.type === 'workstation').length} Nodes)</span>
              <span className="font-mono text-[10px] text-slate-400">VLAN 20 / 30 / 40</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredHosts
                .filter((h) => h.type === 'workstation' || h.type === 'printer')
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedHostId(node.id);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all relative ${
                      selectedHostId === node.id
                        ? 'ring-2 ring-sky-500 shadow-lg shadow-sky-500/20'
                        : ''
                    } ${getHostStatusColor(node)}`}
                  >
                    {/* Misconfig badge */}
                    {node.nic.primaryDns === '192.168.10.250' && (
                      <div className="absolute top-1.5 right-1.5 text-amber-400" title="DNS Configuration Alert">
                        <AlertCircle size={12} />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      {getHostIcon(node.type, 'w-3.5 h-3.5')}
                      <span className="text-[9px] font-mono opacity-80">{node.nic.ip}</span>
                    </div>
                    <div className="text-xs font-bold truncate text-slate-100">{node.id}</div>
                    <div className="text-[10px] text-slate-400 truncate">{node.department}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Node Details Panel */}
      <div className="w-80 border-l border-slate-700/60 bg-[#151821] p-4 flex flex-col overflow-y-auto select-text">
        {selectedHost ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-mono font-bold text-sky-400">{selectedHost.id}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                    {selectedHost.type}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedHost.hostname}</h3>
                <div className="text-xs text-slate-400">{selectedHost.department} Department</div>
              </div>

              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col space-y-2 pt-2 border-t border-slate-700/60">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRemoteDesktop(selectedHost.id);
                }}
                className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-md"
              >
                <Monitor size={14} />
                <span>Remote Desktop (RDP)</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenTerminal(selectedHost.id);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Terminal size={14} className="text-emerald-400" />
                <span>Open Terminal</span>
              </button>
            </div>

            {/* Network Specs */}
            <div className="space-y-2.5 pt-3 border-t border-slate-700/60 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Network Adapter Configuration
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">IPv4 Address:</span>
                  <span className="text-slate-200 font-bold">{selectedHost.nic.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subnet Mask:</span>
                  <span className="text-slate-200">{selectedHost.nic.subnetMask}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateway:</span>
                  <span className="text-slate-200">{selectedHost.nic.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary DNS:</span>
                  <span
                    className={
                      selectedHost.nic.primaryDns === '192.168.10.250'
                        ? 'text-rose-400 font-bold'
                        : 'text-slate-200'
                    }
                  >
                    {selectedHost.nic.primaryDns}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MAC Address:</span>
                  <span className="text-slate-400">{selectedHost.nic.mac}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VLAN ID:</span>
                  <span className="text-purple-300">VLAN {selectedHost.vlan}</span>
                </div>
              </div>
            </div>

            {/* Active Services */}
            <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Host Telemetry
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CPU Load</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedHost.cpuUsage}%</span>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">RAM Usage</span>
                  <span className="font-mono text-sky-400 font-bold">{selectedHost.ramUsage}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Network size={36} className="opacity-30 mb-2" />
            <p className="text-xs">Click a node on the map to inspect properties</p>
          </div>
        )}
      </div>
    </div>
  );
};
