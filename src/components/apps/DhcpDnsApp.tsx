import React, { useState } from 'react';
import {
  Globe,
  Network,
  Trash2,
  PlusCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { DhcpDnsEngine } from '../../simulation/dhcpDnsEngine';
import { sound } from '../../utils/audio';

interface DhcpDnsAppProps {
  dhcpDnsEngine: DhcpDnsEngine;
  onStateChange: () => void;
}

export const DhcpDnsApp: React.FC<DhcpDnsAppProps> = ({
  dhcpDnsEngine,
  onStateChange,
}) => {
  const [activeTab, setActiveTab] = useState<'dhcp' | 'dns'>('dhcp');
  const [selectedScopeId, setSelectedScopeId] = useState<string>('SCOPE-VLAN40');
  const [resIp, setResIp] = useState<string>('192.168.10.250');
  const [resMac, setResMac] = useState<string>('00:1A:2B:3C:4D:5E');
  const [resHost, setResHost] = useState<string>('PRN-FIN-01');
  const [recordEdits, setRecordEdits] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const scopes = dhcpDnsEngine.getScopes();
  const selectedScope =
    scopes.find((s) => s.id === selectedScopeId) ?? scopes[0];
  const dnsZone = dhcpDnsEngine.getDnsZone();

  const refresh = () => {
    setTick((t) => t + 1);
    onStateChange();
  };

  const handlePurgeRogue = (scopeId: string) => {
    sound.playClick();
    const res = dhcpDnsEngine.purgeRogueLeases(scopeId);
    sound.playSuccess();
    setBanner(
      `Purged ${res.purgedCount} rogue DHCP leases from ${scopeId}. Pool utilization restored.`
    );
    refresh();
  };

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScope || !resIp.trim() || !resMac.trim() || !resHost.trim()) {
      return;
    }
    sound.playClick();
    dhcpDnsEngine.addLeaseReservation(
      selectedScope.id,
      resIp,
      resMac,
      resHost
    );
    sound.playSuccess();
    setBanner(
      `Added static MAC reservation ${resHost} (${resIp} -> ${resMac}) in ${selectedScope.id}.`
    );
    refresh();
  };

  const handleUpdateRecord = (recordId: string, value: string) => {
    sound.playClick();
    const updated = dhcpDnsEngine.updateDnsRecord(recordId, value);
    if (updated) {
      sound.playSuccess();
      setBanner(
        `Updated DNS record ${updated.name} (${updated.type}) -> ${updated.value}. SOA serial incremented.`
      );
      refresh();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#11151e] text-slate-100 select-none overflow-y-auto p-5 space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
            <Globe size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100">
              DHCP Scope &amp; DNS Zone Manager (dhcpmgmt.msc / dnsmgmt.msc)
            </h1>
            <p className="text-xs text-slate-400">
              Enterprise IPAM Lease Pools, Static MAC Reservations &amp; Authoritative DNS Zone Editor
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('dhcp');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'dhcp'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            DHCP Scopes
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('dns');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'dns'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            DNS Zone (corp.local)
          </button>
        </div>
      </div>

      {banner && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle size={15} className="shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      {activeTab === 'dhcp' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {/* Scope Selector */}
          <div className="bg-[#161a25] border border-slate-700/60 rounded-xl p-3 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">
              VLAN DHCP Scopes
            </div>
            {scopes.map((scope) => {
              const pct = Math.round(
                (scope.leases.length / scope.totalAddresses) * 100
              );
              const hasRogue = scope.leases.some((l) => l.isRogue);
              return (
                <div
                  key={scope.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedScopeId(scope.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedScope?.id === scope.id
                      ? 'bg-indigo-600/20 border-indigo-500/60'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {scope.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        pct >= 90 || hasRogue
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {scope.leases.length}/{scope.totalAddresses} ({pct}%)
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    VLAN {scope.vlanId} — {scope.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {scope.subnet}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scope Details & Leases */}
          {selectedScope && (
            <div className="md:col-span-2 bg-[#161a25] border border-slate-700/60 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-100">
                    {selectedScope.id}: {selectedScope.name} ({selectedScope.subnet})
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Pool Range: {selectedScope.rangeStart} - {selectedScope.rangeEnd} | Active Leases: {selectedScope.leases.length} / {selectedScope.totalAddresses}
                  </p>
                </div>

                <button
                  onClick={() => handlePurgeRogue(selectedScope.id)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Purge Rogue Leases</span>
                </button>
              </div>

              {/* Add MAC Reservation Form */}
              <form
                onSubmit={handleAddReservation}
                className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-wrap items-center gap-2"
              >
                <span className="text-xs font-bold text-slate-300 mr-1">
                  Add MAC Reservation:
                </span>
                <input
                  type="text"
                  value={resHost}
                  onChange={(e) => setResHost(e.target.value)}
                  placeholder="Hostname"
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 w-28"
                />
                <input
                  type="text"
                  value={resIp}
                  onChange={(e) => setResIp(e.target.value)}
                  placeholder="IP Address"
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 w-32"
                />
                <input
                  type="text"
                  value={resMac}
                  onChange={(e) => setResMac(e.target.value)}
                  placeholder="MAC Address"
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 w-36"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center space-x-1"
                >
                  <PlusCircle size={12} />
                  <span>Add MAC Reservation</span>
                </button>
              </form>

              {/* Lease Table */}
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                      <th className="py-1.5 px-2">IP Address</th>
                      <th className="py-1.5 px-2">MAC Address</th>
                      <th className="py-1.5 px-2">Hostname</th>
                      <th className="py-1.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedScope.leases.map((lease) => (
                      <tr key={lease.ip}>
                        <td className="py-1.5 px-2 text-sky-300">{lease.ip}</td>
                        <td className="py-1.5 px-2 text-slate-300">
                          {lease.mac}
                        </td>
                        <td className="py-1.5 px-2 text-slate-200">
                          {lease.hostname}
                        </td>
                        <td className="py-1.5 px-2">
                          {lease.isRogue ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              ROGUE LEASE
                            </span>
                          ) : lease.isReservation ? (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                              RESERVED
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                              DYNAMIC
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* DNS Zone Tab */
        <div className="bg-[#161a25] border border-slate-700/60 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Network size={16} className="text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-100">
                Authoritative Forward Lookup Zone: {dnsZone.domain}
              </h2>
            </div>
            <span className="text-xs font-mono text-amber-300">
              SOA Serial: {dnsZone.soaSerial}
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                <th className="py-2 px-2.5">Record Name</th>
                <th className="py-2 px-2.5">Type</th>
                <th className="py-2 px-2.5">TTL</th>
                <th className="py-2 px-2.5">Target / Value</th>
                <th className="py-2 px-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {dnsZone.records.map((rec) => {
                const currentVal = recordEdits[rec.id] ?? rec.value;
                return (
                  <tr
                    key={rec.id}
                    data-testid={`dns-row-${rec.id}`}
                    className={rec.isCorrupted ? 'bg-rose-950/30' : ''}
                  >
                    <td className="py-2 px-2.5 text-slate-200 font-bold">
                      {rec.name}
                    </td>
                    <td className="py-2 px-2.5 text-indigo-300">{rec.type}</td>
                    <td className="py-2 px-2.5 text-slate-400">{rec.ttl}s</td>
                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        aria-label={`DNS Value for ${rec.name}`}
                        value={currentVal}
                        onChange={(e) =>
                          setRecordEdits((prev) => ({
                            ...prev,
                            [rec.id]: e.target.value,
                          }))
                        }
                        className={`bg-slate-900 border rounded px-2.5 py-1 text-xs font-mono w-64 ${
                          rec.isCorrupted
                            ? 'border-rose-500 text-rose-300'
                            : 'border-slate-700 text-emerald-300'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-2.5 text-right space-x-2">
                      {rec.id === 'REC-PORTAL' && rec.isCorrupted && (
                        <button
                          onClick={() => {
                            setRecordEdits((prev) => ({
                              ...prev,
                              [rec.id]: '192.168.10.202',
                            }));
                            handleUpdateRecord(rec.id, '192.168.10.202');
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-sans font-bold inline-flex items-center space-x-1"
                        >
                          <RefreshCw size={11} />
                          <span>Fix Record -&gt; 192.168.10.202</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateRecord(rec.id, currentVal)}
                        aria-label={`Update Record ${rec.name}`}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-sans font-bold"
                      >
                        Update Record
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
