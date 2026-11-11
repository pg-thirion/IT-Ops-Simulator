import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Terminal as TerminalIcon,
  Settings,
  SlidersHorizontal,
  FileText,
  Activity,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Wifi,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { TerminalEngine } from '../../simulation/terminalEngine';
import { TerminalApp } from './TerminalApp';
import { TaskManagerApp } from './TaskManagerApp';
import { DeviceManagerApp } from './DeviceManagerApp';
import { sound } from '../../utils/audio';

interface RemoteDesktopAppProps {
  initialHostId: string;
  networkEngine: NetworkEngine;
  terminalEngine: TerminalEngine;
  onRefresh?: () => void;
}

export const RemoteDesktopApp: React.FC<RemoteDesktopAppProps> = ({
  initialHostId,
  networkEngine,
  terminalEngine,
  onRefresh,
}) => {
  const [selectedHostId, setSelectedHostId] = useState<string>(initialHostId || 'PC-FIN-04');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'adapter' | 'terminal' | 'taskmgr' | 'devmgmt' | 'services' | 'logs'
  >('adapter');

  // Adapter form state
  const [ip, setIp] = useState('');
  const [subnet, setSubnet] = useState('');
  const [gateway, setGateway] = useState('');
  const [primaryDns, setPrimaryDns] = useState('');
  const [secondaryDns, setSecondaryDns] = useState('');
  const [dhcpEnabled, setDhcpEnabled] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const host = networkEngine.getHost(selectedHostId);

  useEffect(() => {
    if (initialHostId) {
      setSelectedHostId(initialHostId);
      setIsConnected(true);
    }
  }, [initialHostId]);

  useEffect(() => {
    setSaveStatus(null);
  }, [selectedHostId]);

  useEffect(() => {
    if (host) {
      setIp(host.nic.ip);
      setSubnet(host.nic.subnetMask);
      setGateway(host.nic.gateway);
      setPrimaryDns(host.nic.primaryDns);
      setSecondaryDns(host.nic.secondaryDns);
      setDhcpEnabled(host.nic.dhcpEnabled);
    }
  }, [
    selectedHostId,
    host,
    host?.nic.ip,
    host?.nic.subnetMask,
    host?.nic.gateway,
    host?.nic.primaryDns,
    host?.nic.secondaryDns,
    host?.nic.dhcpEnabled,
  ]);

  const allHosts = networkEngine.getAllHosts();

  const handleConnect = () => {
    sound.playClick();
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    sound.playClick();
    setIsConnected(false);
  };

  const handleApplyAdapterSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    networkEngine.updateHostNic(selectedHostId, {
      ip,
      subnetMask: subnet,
      gateway,
      primaryDns,
      secondaryDns,
      dhcpEnabled,
    });

    sound.playSuccess();
    setSaveStatus('Network Adapter settings saved successfully and applied to TCP/IP stack.');
    onRefresh?.();
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleToggleDhcp = (enabled: boolean) => {
    setDhcpEnabled(enabled);
    if (enabled && host) {
      networkEngine.renewDhcp(selectedHostId);
      const updated = networkEngine.getHost(selectedHostId);
      if (updated) {
        setIp(updated.nic.ip);
        setSubnet(updated.nic.subnetMask);
        setGateway(updated.nic.gateway);
        setPrimaryDns(updated.nic.primaryDns);
        setSecondaryDns(updated.nic.secondaryDns);
      }
      sound.playSuccess();
      setSaveStatus('DHCP enabled. Lease requested from domain DHCP server.');
      onRefresh?.();
    }
  };

  const handleToggleService = (serviceId: string, currentStatus: string) => {
    sound.playClick();
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running';
    networkEngine.updateServiceStatus(selectedHostId, serviceId, newStatus);
    onRefresh?.();
  };

  return (
    <div className="flex flex-col h-full bg-[#111318] text-slate-100 select-none">
      {/* Top RDP Connection Bar */}
      <div className="h-11 bg-[#1a1e27] border-b border-slate-700/60 px-3 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center space-x-2">
          <Monitor size={16} className="text-sky-400" />
          <span className="text-xs font-bold text-slate-300">Remote Desktop Connection:</span>
          <select
            value={selectedHostId}
            onChange={(e) => {
              setSelectedHostId(e.target.value);
              setIsConnected(true);
            }}
            className="bg-[#0f1117] border border-slate-700 rounded px-2 py-1 text-xs text-sky-400 focus:outline-none focus:border-sky-500 font-mono"
          >
            {allHosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.id} ({h.hostname}) - {h.department} [{h.nic.ip}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white rounded text-xs font-semibold transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold transition-colors"
            >
              Connect RDP
            </button>
          )}
        </div>
      </div>

      {/* RDP Session Status Banner */}
      {isConnected && host && (
        <div className="bg-sky-950/40 border-b border-sky-800/40 px-3 py-1 flex items-center justify-between text-[11px] text-sky-300 shrink-0">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                host.nic.isUp ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>
              Connected to <strong>{host.hostname}</strong> ({host.nic.ip})
            </span>
            <span className="text-sky-400/50">•</span>
            <span className="text-slate-400">OS: {host.os}</span>
            <span className="text-sky-400/50">•</span>
            <span className="text-slate-400">User: {host.activeDirectoryUsername || 'local admin'}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 font-mono text-[10px]">
            <span>Latency: 1ms</span>
            <span>Port: 3389</span>
            <span>Encryption: TLS 1.3</span>
          </div>
        </div>
      )}

      {/* Main Remote Desktop Client Workspace */}
      {isConnected && host ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#141720]">
          {/* Virtual Windows Nav Tabs */}
          <div className="flex items-center bg-[#181c25] border-b border-slate-700/60 px-3 pt-1 space-x-1 select-none overflow-x-auto shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('adapter');
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'adapter'
                  ? 'bg-[#141720] text-sky-400 border-t-2 border-t-sky-500 border-x border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={13} />
              <span>Adapter Properties</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('terminal');
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-[#141720] text-emerald-400 border-t-2 border-t-emerald-500 border-x border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TerminalIcon size={13} />
              <span>Remote PowerShell</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('taskmgr');
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'taskmgr'
                  ? 'bg-[#141720] text-emerald-400 border-t-2 border-t-emerald-500 border-x border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity size={13} />
              <span>Task Manager</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('devmgmt');
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'devmgmt'
                  ? 'bg-[#141720] text-blue-400 border-t-2 border-t-blue-500 border-x border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu size={13} />
              <span>Device Manager</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('services');
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-[#141720] text-purple-400 border-t-2 border-t-purple-500 border-x border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Services ({host.services.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('logs');
              }}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-[#141720] text-orange-400 border-t-2 border-t-orange-500 border-x border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText size={13} />
              <span>Event Logs ({host.logs.length})</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Tab: Network Adapter Properties */}
            {activeTab === 'adapter' && (
              <div className="max-w-xl mx-auto bg-[#1a1e28] border border-slate-700/70 rounded-xl p-5 shadow-xl select-text">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-700/60 mb-4">
                  <div className="p-2 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30">
                    <Wifi size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      Internet Protocol Version 4 (TCP/IPv4) Properties
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Adapter: {host.nic.name} | MAC: {host.nic.mac} | Interface Status:{' '}
                      <span className={host.nic.isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {host.nic.isUp ? 'UP (Connected)' : 'DOWN (Disabled)'}
                      </span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleApplyAdapterSettings} className="space-y-4 text-xs">
                  {/* DHCP toggle */}
                  <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={dhcpEnabled}
                        onChange={() => handleToggleDhcp(true)}
                        className="text-blue-500"
                      />
                      <span className="font-semibold text-slate-200">
                        Obtain an IP address automatically (DHCP)
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!dhcpEnabled}
                        onChange={() => handleToggleDhcp(false)}
                        className="text-blue-500"
                      />
                      <span className="font-semibold text-slate-200">
                        Use the following IP address:
                      </span>
                    </label>
                  </div>

                  {/* IP Fields */}
                  <div className={`space-y-2.5 pl-3 ${dhcpEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">IP address:</span>
                      <input
                        type="text"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        className="w-56 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Subnet mask:</span>
                      <input
                        type="text"
                        value={subnet}
                        onChange={(e) => setSubnet(e.target.value)}
                        className="w-56 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Default gateway:</span>
                      <input
                        type="text"
                        value={gateway}
                        onChange={(e) => setGateway(e.target.value)}
                        className="w-56 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* DNS Section */}
                  <div className="pt-3 border-t border-slate-700/60 space-y-2.5">
                    <div className="font-semibold text-slate-300">DNS Server Configuration:</div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Preferred DNS server:</span>
                      <input
                        type="text"
                        value={primaryDns}
                        onChange={(e) => setPrimaryDns(e.target.value)}
                        className={`w-56 bg-slate-900 border rounded px-2.5 py-1 text-slate-100 font-mono outline-none ${
                          primaryDns === '192.168.10.250'
                            ? 'border-rose-500 text-rose-300'
                            : 'border-slate-700 focus:border-blue-500'
                        }`}
                      />
                    </div>

                    {primaryDns === '192.168.10.250' && (
                      <div className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-800/40 p-2 rounded flex items-center space-x-1.5">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span>Warning: 192.168.10.250 does not answer DNS queries. Corporate DC is 192.168.10.200.</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Alternate DNS server:</span>
                      <input
                        type="text"
                        value={secondaryDns}
                        onChange={(e) => setSecondaryDns(e.target.value)}
                        className="w-56 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Save Status Banner */}
                  {saveStatus && (
                    <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 p-2.5 rounded text-xs flex items-center space-x-2">
                      <CheckCircle size={15} />
                      <span>{saveStatus}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-700/60">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow-md transition-colors"
                    >
                      Apply &amp; Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Remote Terminal */}
            {activeTab === 'terminal' && (
              <div className="h-full rounded-xl overflow-hidden border border-slate-800">
                <TerminalApp
                  currentHostId={selectedHostId}
                  networkEngine={networkEngine}
                  terminalEngine={terminalEngine}
                  onSelectHost={(id) => setSelectedHostId(id)}
                />
              </div>
            )}

            {/* Tab: Remote Task Manager */}
            {activeTab === 'taskmgr' && (
              <div className="h-full rounded-xl overflow-hidden border border-slate-800">
                <TaskManagerApp
                  initialHostId={selectedHostId}
                  networkEngine={networkEngine}
                  onRefresh={onRefresh}
                />
              </div>
            )}

            {/* Tab: Remote Device Manager */}
            {activeTab === 'devmgmt' && (
              <div className="h-full rounded-xl overflow-hidden border border-slate-800">
                <DeviceManagerApp
                  initialHostId={selectedHostId}
                  networkEngine={networkEngine}
                  onRefresh={onRefresh}
                />
              </div>
            )}

            {/* Tab: Remote Services */}
            {activeTab === 'services' && (
              <div className="bg-[#181c25] border border-slate-700/60 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-slate-700/60 flex items-center justify-between bg-slate-900/40">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Services on {host.hostname}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{host.services.length} services</span>
                </div>

                <div className="divide-y divide-slate-800">
                  {host.services.map((svc) => (
                    <div key={svc.id} className="p-3 flex items-center justify-between hover:bg-slate-800/30">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-slate-200">{svc.displayName}</span>
                          <span className="font-mono text-[10px] text-slate-400">({svc.name})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{svc.description}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            svc.status === 'running'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/40'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-700/40'
                          }`}
                        >
                          {svc.status}
                        </span>

                        <button
                          onClick={() => handleToggleService(svc.id, svc.status)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                            svc.status === 'running'
                              ? 'bg-slate-800 hover:bg-slate-700 text-rose-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {svc.status === 'running' ? (
                            <>
                              <Square size={11} />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Play size={11} />
                              <span>Start</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Remote Event Logs */}
            {activeTab === 'logs' && (
              <div className="bg-[#181c25] border border-slate-700/60 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-slate-700/60 bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-300">
                  Event Logs ({host.logs.length})
                </div>
                <div className="divide-y divide-slate-800">
                  {host.logs.map((log) => (
                    <div key={log.id} className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            log.level === 'Information'
                              ? 'bg-sky-950/60 text-sky-400'
                              : log.level === 'Warning'
                              ? 'bg-amber-950/60 text-amber-400'
                              : 'bg-rose-950/60 text-rose-400'
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="font-mono text-slate-400">Event ID {log.eventId} • {log.timestamp}</span>
                      </div>
                      <div className="text-xs text-slate-200 font-semibold">{log.source}</div>
                      <p className="text-xs text-slate-400 leading-relaxed font-mono">{log.message}</p>
                    </div>
                  ))}
                  {host.logs.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No critical event log entries recorded on this host.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Monitor size={48} className="opacity-30" />
          <p className="text-xs">No active RDP session. Select a host and click Connect.</p>
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold"
          >
            Connect to {selectedHostId}
          </button>
        </div>
      )}
    </div>
  );
};
