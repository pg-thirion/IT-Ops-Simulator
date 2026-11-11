import React, { useState } from 'react';
import {
  Activity,
  Trash2,
  Search,
  Layers,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { PacketRecord } from '../../types/network';
import { sound } from '../../utils/audio';

interface PacketSnifferAppProps {
  networkEngine: NetworkEngine;
}

export const PacketSnifferApp: React.FC<PacketSnifferAppProps> = ({ networkEngine }) => {
  const [filterProto, setFilterProto] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedPktId, setSelectedPktId] = useState<string | null>(null);

  const packets = networkEngine.getPacketLog();

  const filtered = packets.filter((p) => {
    const matchProto = filterProto === 'ALL' || p.protocol === filterProto;
    const matchSearch =
      p.sourceIp.includes(search) ||
      p.destIp.includes(search) ||
      p.info.toLowerCase().includes(search.toLowerCase());
    return matchProto && matchSearch;
  });

  const selectedPacket = packets.find((p) => p.id === selectedPktId) || filtered[0];

  const getProtoColor = (proto: PacketRecord['protocol']) => {
    switch (proto) {
      case 'DNS':
        return 'text-sky-400 bg-sky-950/60 border-sky-600/40';
      case 'ICMP':
        return 'text-amber-400 bg-amber-950/60 border-amber-600/40';
      case 'DHCP':
        return 'text-purple-400 bg-purple-950/60 border-purple-600/40';
      case 'HTTP':
      case 'HTTPS':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-600/40';
      case 'ARP':
        return 'text-orange-400 bg-orange-950/60 border-orange-600/40';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#101218] text-slate-100 select-none font-sans text-xs">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#161a23] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Activity size={16} className="text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Wireshark Packet Analyzer
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/40">
            CAPTURING eth0
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Protocol Filter */}
          <select
            value={filterProto}
            onChange={(e) => setFilterProto(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="ALL">All Protocols</option>
            <option value="DNS">DNS</option>
            <option value="ICMP">ICMP</option>
            <option value="DHCP">DHCP</option>
            <option value="ARP">ARP</option>
            <option value="HTTP">HTTP/HTTPS</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search IP or payload..."
              className="bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-36"
            />
          </div>

          <button
            onClick={() => {
              sound.playClick();
              networkEngine.clearPacketLog();
            }}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Buffer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Split: Top Packet List, Bottom Inspector */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0">
                <th className="p-2 w-16">Time</th>
                <th className="p-2 w-32">Source</th>
                <th className="p-2 w-32">Destination</th>
                <th className="p-2 w-20">Protocol</th>
                <th className="p-2 w-16">Length</th>
                <th className="p-2">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((pkt) => {
                const isSelected = selectedPacket?.id === pkt.id;
                const isError = pkt.status === 'error';

                return (
                  <tr
                    key={pkt.id}
                    onClick={() => setSelectedPktId(pkt.id)}
                    className={`cursor-pointer transition-colors ${
                      isError
                        ? 'bg-rose-950/40 text-rose-300 font-semibold'
                        : isSelected
                        ? 'bg-cyan-600/25 text-white font-semibold'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="p-2 text-slate-400">{pkt.timestamp}</td>
                    <td className="p-2 font-bold text-sky-300">{pkt.sourceIp}</td>
                    <td className="p-2 font-bold text-slate-200">{pkt.destIp}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getProtoColor(
                          pkt.protocol
                        )}`}
                      >
                        {pkt.protocol}
                      </span>
                    </td>
                    <td className="p-2 text-slate-400">{pkt.length} B</td>
                    <td className="p-2 truncate max-w-md">{pkt.info}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Packet Frame Inspector */}
        {selectedPacket && (
          <div className="h-44 border-t border-slate-700/60 bg-[#141722] p-3 overflow-y-auto font-mono text-xs select-text">
            <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1 flex items-center space-x-1.5 font-sans">
              <Layers size={13} />
              <span>Packet Frame Breakdown</span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
              <div>&gt; Frame: {selectedPacket.length} bytes on wire ({selectedPacket.length * 8} bits) captured</div>
              <div>&gt; Ethernet II, Src: 52:54:00:xx:xx:xx, Dst: 52:54:00:yy:yy:yy</div>
              <div>&gt; Internet Protocol Version 4, Src: {selectedPacket.sourceIp}, Dst: {selectedPacket.destIp}</div>
              <div>&gt; Transport Layer Protocol ({selectedPacket.protocol}): {selectedPacket.info}</div>
              {selectedPacket.status === 'error' && (
                <div className="text-rose-400 font-bold">&gt; [Expert Info (Warning/Error): Packet transit failure or dropped by firewall]</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
