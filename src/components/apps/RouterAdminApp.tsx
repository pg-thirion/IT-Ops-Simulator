import React, { useState } from 'react';
import {
  Globe,
  Shield,
  Layers,
  Save,
  CheckCircle,
  Radio,
  Plus,
  Trash2,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { sound } from '../../utils/audio';

interface RouterAdminAppProps {
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const RouterAdminApp: React.FC<RouterAdminAppProps> = ({ networkEngine, onRefresh }) => {
  const routerConfig = networkEngine.getRouterConfig();

  const [activeTab, setActiveTab] = useState<'dhcp' | 'dns' | 'firewall' | 'vlans'>('dhcp');
  const [dhcpEnabled, setDhcpEnabled] = useState(routerConfig.dhcpEnabled);
  const [dhcpStart, setDhcpStart] = useState(routerConfig.dhcpRangeStart);
  const [dhcpEnd, setDhcpEnd] = useState(routerConfig.dhcpRangeEnd);
  const [dhcpDns, setDhcpDns] = useState(routerConfig.dhcpDnsServer);
  const [dnsForwarders, setDnsForwarders] = useState(routerConfig.dnsForwarders.join(', '));
  const [firewallEnabled, setFirewallEnabled] = useState(routerConfig.firewallEnabled);
  const [blockedPorts, setBlockedPorts] = useState<number[]>(routerConfig.blockedPorts);
  const [newPortToBlock, setNewPortToBlock] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    networkEngine.updateRouterConfig({
      dhcpEnabled,
      dhcpRangeStart: dhcpStart,
      dhcpRangeEnd: dhcpEnd,
      dhcpDnsServer: dhcpDns,
      dnsForwarders: dnsForwarders.split(',').map((s) => s.trim()).filter(Boolean),
      firewallEnabled,
      blockedPorts,
    });

    sound.playSuccess();
    setStatusMessage('Gateway Router configuration saved and daemons reloaded successfully.');
    onRefresh?.();
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUnblockPort = (port: number) => {
    sound.playClick();
    const updated = blockedPorts.filter((p) => p !== port);
    setBlockedPorts(updated);
    networkEngine.updateRouterConfig({ blockedPorts: updated });
    sound.playSuccess();
    setStatusMessage(`Port ${port} removed from firewall block list. Outbound traffic restored.`);
    onRefresh?.();
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleBlockPort = () => {
    const p = parseInt(newPortToBlock.trim(), 10);
    if (!isNaN(p) && !blockedPorts.includes(p)) {
      sound.playClick();
      const updated = [...blockedPorts, p];
      setBlockedPorts(updated);
      networkEngine.updateRouterConfig({ blockedPorts: updated });
      setNewPortToBlock('');
      setStatusMessage(`Port ${p} added to firewall block list.`);
      onRefresh?.();
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12141a] text-slate-100 select-none">
      {/* Fake Browser Chrome Header */}
      <div className="bg-[#1b1f2b] border-b border-slate-700/60 p-2 flex items-center space-x-3 select-none">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
        </div>

        {/* Address bar */}
        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 flex items-center space-x-2 text-xs font-mono">
          <Shield size={13} className="text-emerald-400" />
          <span className="text-emerald-400 font-semibold">https://</span>
          <span className="text-slate-200">192.168.1.1</span>
          <span className="text-slate-500">/admin/network-settings</span>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-2">RouterOS v7.14 Enterprise</div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav */}
        <div className="w-56 border-r border-slate-700/60 bg-[#161a24] p-3 space-y-1 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Router Administration
          </div>

          <button
            onClick={() => setActiveTab('dhcp')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'dhcp'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Radio size={14} />
            <span>DHCP Server Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('dns')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'dns'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Globe size={14} />
            <span>DNS &amp; Forwarders</span>
          </button>

          <button
            onClick={() => setActiveTab('firewall')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'firewall'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Shield size={14} />
            <span>Firewall &amp; Port Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('vlans')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              activeTab === 'vlans'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>VLAN Trunking &amp; Routing</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#12151d] select-text">
          <div className="max-w-2xl space-y-5">
            {statusMessage && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle size={16} className="shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Tab: DHCP */}
            {activeTab === 'dhcp' && (
              <form onSubmit={handleSave} className="bg-[#191d28] border border-slate-700/60 rounded-xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">DHCP Server Configuration</h3>
                    <p className="text-[11px] text-slate-400">
                      Dynamic host configuration pool for corporate client subnets.
                    </p>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dhcpEnabled}
                      onChange={(e) => setDhcpEnabled(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                    <span className="font-semibold text-slate-200">DHCP Service Enabled</span>
                  </label>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-sans">Pool Range Start IP:</span>
                    <input
                      type="text"
                      value={dhcpStart}
                      onChange={(e) => setDhcpStart(e.target.value)}
                      className="w-64 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-sans">Pool Range End IP:</span>
                    <input
                      type="text"
                      value={dhcpEnd}
                      onChange={(e) => setDhcpEnd(e.target.value)}
                      className="w-64 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-sans">DHCP Option 006 (DNS Server):</span>
                    <input
                      type="text"
                      value={dhcpDns}
                      onChange={(e) => setDhcpDns(e.target.value)}
                      className="w-64 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Save size={13} />
                    <span>Save &amp; Restart DHCP Service</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab: DNS */}
            {activeTab === 'dns' && (
              <form onSubmit={handleSave} className="bg-[#191d28] border border-slate-700/60 rounded-xl p-5 space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-700/60">
                  <h3 className="text-sm font-bold text-slate-100">DNS Upstream Forwarders</h3>
                  <p className="text-[11px] text-slate-400">
                    Public recursive resolvers queried when internal DNS server forwards WAN queries.
                  </p>
                </div>

                <div className="space-y-3 font-mono">
                  <div>
                    <label className="text-slate-300 font-sans block mb-1">
                      Upstream DNS Resolvers (comma separated):
                    </label>
                    <input
                      type="text"
                      value={dnsForwarders}
                      onChange={(e) => setDnsForwarders(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-slate-400 font-sans mt-1 block">
                      Recommended: 8.8.8.8 (Google Public DNS), 1.1.1.1 (Cloudflare)
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <Save size={13} />
                    <span>Save DNS Configuration</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Firewall */}
            {activeTab === 'firewall' && (
              <div className="bg-[#191d28] border border-slate-700/60 rounded-xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Stateful Firewall &amp; Port Filtering</h3>
                    <p className="text-[11px] text-slate-400">Packet filtering and egress port control.</p>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={firewallEnabled}
                      onChange={(e) => setFirewallEnabled(e.target.checked)}
                      className="rounded text-blue-500"
                    />
                    <span className="font-semibold text-slate-200">Firewall Enabled</span>
                  </label>
                </div>

                {/* Blocked Ports Management */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-200 block">Blocked Outbound Egress Ports:</span>
                  <div className="flex flex-wrap gap-2">
                    {blockedPorts.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono font-bold flex items-center space-x-2"
                      >
                        <span>Port {p} {p === 443 ? '(HTTPS)' : p === 53 ? '(DNS)' : ''}</span>
                        <button
                          onClick={() => handleUnblockPort(p)}
                          className="hover:text-white transition-colors"
                          title="Unblock port"
                        >
                          <Trash2 size={11} />
                        </button>
                      </span>
                    ))}
                    {blockedPorts.length === 0 && (
                      <span className="text-slate-400 italic text-[11px]">
                        No ports currently blocked. All egress allowed.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="number"
                      value={newPortToBlock}
                      onChange={(e) => setNewPortToBlock(e.target.value)}
                      placeholder="Add port (e.g. 443, 53)..."
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono text-xs w-44 focus:outline-none"
                    />
                    <button
                      onClick={handleBlockPort}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-200 font-semibold text-xs flex items-center space-x-1"
                    >
                      <Plus size={12} />
                      <span>Block Port</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300 font-mono text-[11px] pt-3 border-t border-slate-800">
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex justify-between">
                    <span>RULE 01: ALLOW ESTABLISHED, RELATED (WAN -&gt; LAN)</span>
                    <span className="text-emerald-400 font-bold">ACCEPT</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex justify-between">
                    <span>RULE 02: NAT MASQUERADE (LAN 192.168.0.0/16 -&gt; WAN)</span>
                    <span className="text-sky-400 font-bold">MASQUERADE</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex justify-between">
                    <span>RULE 03: DROP INVALID PACKETS</span>
                    <span className="text-rose-400 font-bold">DROP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: VLANs */}
            {activeTab === 'vlans' && (
              <div className="bg-[#191d28] border border-slate-700/60 rounded-xl p-5 space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-700/60">
                  <h3 className="text-sm font-bold text-slate-100">Virtual LAN (VLAN) Interfaces</h3>
                  <p className="text-[11px] text-slate-400">Inter-VLAN 802.1Q routing tables.</p>
                </div>

                <div className="space-y-2">
                  {routerConfig.vlans.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">
                          VLAN {v.id}: {v.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Subnet: {v.subnet} | Gateway: {v.gateway}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/40 text-[10px] font-bold">
                        ACTIVE ROUTED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
