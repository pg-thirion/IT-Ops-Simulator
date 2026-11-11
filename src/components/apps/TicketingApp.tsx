import React, { useState } from 'react';
import {
  Ticket as TicketIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Terminal,
  User,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Filter,
  Search,
  Activity,
  Cpu,
  FolderOpen,
  Mail,
  ShieldAlert,
  ScrollText,
  Database,
  PhoneCall,
  Wrench,
  HelpCircle,
  Server,
  ClipboardCheck,
  Globe,
  Code2,
} from 'lucide-react';
import { Ticket, CareerStats, WindowId } from '../../types/game';
import { NetworkEngine } from '../../simulation/networkEngine';
import { validateTicket, ValidationEngines } from '../../simulation/ticketEngine';
import type { RackEngine } from '../../simulation/rackEngine';
import type { SiemEngine } from '../../simulation/siemEngine';
import type { ChangeEngine } from '../../simulation/changeEngine';
import type { DhcpDnsEngine } from '../../simulation/dhcpDnsEngine';
import type { ScriptEngine } from '../../simulation/scriptEngine';
import type { ShiftEventEngine } from '../../simulation/shiftEventEngine';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface TicketingAppProps {
  tickets: Ticket[];
  career: CareerStats;
  networkEngine: NetworkEngine;
  mailEngine?: any;
  securityEngine?: any;
  gpoEngine?: any;
  backupEngine?: any;
  hardwareEngine?: any;
  phoneEngine?: any;
  rackEngine?: RackEngine;
  siemEngine?: SiemEngine;
  changeEngine?: ChangeEngine;
  dhcpDnsEngine?: DhcpDnsEngine;
  scriptEngine?: ScriptEngine;
  shiftEventEngine?: ShiftEventEngine;
  onResolveTicket: (ticketId: string, rewardXp: number, rewardCash: number) => void;
  onOpenRemoteDesktop: (hostId: string) => void;
  onOpenTerminal: (hostId: string) => void;
  onOpenWindow: (id: WindowId) => void;
  onDeductXp?: (amount: number) => void;
}

export const TicketingApp: React.FC<TicketingAppProps> = ({
  tickets,
  career,
  networkEngine,
  mailEngine,
  securityEngine,
  gpoEngine,
  backupEngine,
  hardwareEngine,
  phoneEngine,
  rackEngine,
  siemEngine,
  changeEngine,
  dhcpDnsEngine,
  scriptEngine,
  shiftEventEngine,
  onResolveTicket,
  onOpenRemoteDesktop,
  onOpenTerminal,
  onOpenWindow,
  onDeductXp,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [validationResult, setValidationResult] = useState<{
    ticketId: string;
    passed: boolean;
    message: string;
  } | null>(null);

  const filteredTickets = tickets.filter((t) => {
    const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reporterHostId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedTicket =
    filteredTickets.find((t) => t.id === selectedTicketId) ||
    tickets.find((t) => t.id === selectedTicketId) ||
    filteredTickets[0];

  const handleRequestSeniorClue = (ticketId: string) => {
    if (revealedHints[ticketId]) return;
    if (career.xp < 25) {
      sound.playError();
      return;
    }
    sound.playClick();
    onDeductXp?.(25);
    setRevealedHints((prev) => ({ ...prev, [ticketId]: true }));
  };

  const handleVerify = () => {
    if (!selectedTicket || selectedTicket.status === 'Resolved') return;

    sound.playClick();
    const engines: ValidationEngines = {
      mailEngine,
      securityEngine,
      gpoEngine,
      backupEngine,
      hardwareEngine,
      phoneEngine,
      rackEngine,
      siemEngine,
      changeEngine,
      dhcpDnsEngine,
      scriptEngine,
      shiftEventEngine,
    };
    const result = validateTicket(selectedTicket, networkEngine, engines);
    setValidationResult({
      ticketId: selectedTicket.id,
      passed: result.passed,
      message: result.message,
    });

    if (result.passed) {
      sound.playSuccess();
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
      });
      onResolveTicket(selectedTicket.id, selectedTicket.rewardXp, selectedTicket.rewardCash);
    } else {
      sound.playError();
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="flex h-full select-none text-slate-100">
      {/* Left Column: Ticket Queue */}
      <div className="w-80 border-r border-slate-700/60 bg-[#161922] flex flex-col shrink-0">
        {/* Queue Header & Filters */}
        <div className="p-3 border-b border-slate-700/60 space-y-2 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TicketIcon size={16} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Queue ({tickets.filter((t) => t.status !== 'Resolved').length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total: {tickets.length}</span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-1 text-[11px]">
              <Filter size={11} className="text-slate-400 ml-0.5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Network">Network</option>
                <option value="Active Directory">Active Directory</option>
                <option value="Servers">Servers</option>
                <option value="Hardware">Hardware</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredTickets.map((t) => {
            const isSelected = t.id === selectedTicketId;
            const isResolved = t.status === 'Resolved';

            return (
              <div
                key={t.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTicketId(t.id);
                  setValidationResult(null);
                }}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-600/15 border-l-4 border-l-blue-500'
                    : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-xs font-bold text-slate-300">{t.id}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold uppercase">
                      {t.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getPriorityBadge(
                      t.priority
                    )}`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                  {t.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[130px]">{t.reporterName}</span>
                  {isResolved ? (
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <CheckCircle size={12} />
                      <span>Resolved</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-slate-400 font-mono">
                      <Clock size={11} className="text-amber-400" />
                      <span>{t.slaMinutes}m SLA</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No tickets matching current filters.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Ticket Details & Action Console */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#13161c] flex flex-col">
        {selectedTicket ? (
          <div className="max-w-3xl space-y-5">
            {/* Ticket Header Banner */}
            <div className="bg-[#1a1e27] border border-slate-700/60 rounded-xl p-4 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-extrabold text-blue-400">
                    {selectedTicket.id}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityBadge(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority} Priority
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {selectedTicket.category}
                  </span>
                  {selectedTicket.status === 'Resolved' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2 py-0.5 rounded font-semibold flex items-center space-x-1">
                      <CheckCircle size={12} />
                      <span>Closed / Resolved</span>
                    </span>
                  )}
                </div>

                {/* Reward pill */}
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded font-bold">
                    +R{selectedTicket.rewardCash}
                  </span>
                  <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 rounded font-bold">
                    +{selectedTicket.rewardXp} XP
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-100">{selectedTicket.title}</h2>

              {/* Reporter Info Row */}
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <User size={14} className="text-slate-400" />
                  <span>
                    Reported by: <strong className="text-slate-100">{selectedTicket.reporterName}</strong>
                  </span>
                </div>
                <div className="text-slate-500">•</div>
                <div>
                  Department: <strong className="text-slate-100">{selectedTicket.department}</strong>
                </div>
                <div className="text-slate-500">•</div>
                <div className="flex items-center space-x-1">
                  <Monitor size={14} className="text-sky-400" />
                  <span>
                    Machine:{' '}
                    <strong className="text-sky-300 font-mono">
                      {selectedTicket.reporterHostId}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* User Quote Card */}
            <div className="bg-blue-950/20 border-l-4 border-l-blue-500 border border-slate-700/50 rounded-r-xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                Caller Problem Statement
              </div>
              <p className="text-sm italic text-slate-200">{selectedTicket.initialQuote}</p>
            </div>

            {/* Description & Diagnostic Clues */}
            <div className="bg-[#181c25] border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <AlertTriangle size={14} className="text-amber-400" />
                <span>Incident Scope &amp; Requirements</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedTicket.description}
              </p>

              {/* Requirements Checklist */}
              <div className="space-y-1.5 pt-2">
                {selectedTicket.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 text-xs bg-slate-900/50 p-2 rounded border border-slate-800"
                  >
                    <ArrowRight size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300">{req.description}</span>
                  </div>
                ))}
              </div>

              {/* Discovered Call Clues Card */}
              {selectedTicket.revealedClues && selectedTicket.revealedClues.length > 0 && (
                <div className="bg-sky-950/25 border border-sky-600/40 rounded-xl p-3.5 space-y-2 mt-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                    <PhoneCall size={14} className="text-sky-400" />
                    <span>Discovered Call Clues (VoIP Softphone)</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedTicket.revealedClues.map((clue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2 text-xs bg-slate-900/60 p-2 rounded border border-slate-800/80 text-sky-200"
                      >
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{clue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Senior Sysadmin Clue (Hidden by default, costs 25 XP) */}
              {selectedTicket.userHint && (
                <div className="pt-2">
                  {revealedHints[selectedTicket.id] ? (
                    <div className="text-xs text-amber-300/90 bg-amber-950/25 border border-amber-800/50 p-3 rounded-lg flex items-start space-x-2 animate-in fade-in duration-200">
                      <HelpCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block mb-0.5">Senior Sysadmin Clue:</span>
                        <span className="text-amber-200/90">{selectedTicket.userHint}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRequestSeniorClue(selectedTicket.id)}
                        disabled={career.xp < 25}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                          career.xp >= 25
                            ? 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-700/50 text-amber-300 hover:text-amber-200 cursor-pointer shadow-sm'
                            : 'bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <HelpCircle size={14} className="text-amber-400" />
                        <span>Request Senior Sysadmin Clue (-25 XP)</span>
                      </button>
                      {career.xp < 25 && (
                        <span className="text-[11px] text-slate-500 font-mono">(Requires 25 XP)</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons Bar */}
            <div className="bg-[#1a1e27] border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              {/* Quick Launch Buttons tailored to ticket */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenRemoteDesktop(selectedTicket.reporterHostId);
                  }}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-sky-600/20"
                >
                  <Monitor size={14} />
                  <span>Remote Desktop ({selectedTicket.reporterHostId})</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenTerminal(selectedTicket.reporterHostId);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Terminal size={14} className="text-emerald-400" />
                  <span>Terminal</span>
                </button>

                {selectedTicket.category === 'Active Directory' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('active-directory');
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Active Directory</span>
                  </button>
                )}

                {selectedTicket.category === 'Servers' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('services');
                    }}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Services Console</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1058' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('task-manager');
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Activity size={14} />
                    <span>Open Task Manager</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1052' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('device-manager');
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Cpu size={14} />
                    <span>Open Device Manager</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1055' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('file-explorer');
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <FolderOpen size={14} />
                    <span>View Network Shares</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1060' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('email-client');
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Mail size={14} />
                    <span>Open Email Client</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1061' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('edr-console');
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ShieldAlert size={14} />
                    <span>Open EDR Falcon Console</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1062' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('group-policy');
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ScrollText size={14} />
                    <span>Open Group Policy (GPMC)</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1063' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('backup-manager');
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Database size={14} />
                    <span>Open Backup &amp; DR</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1064' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('hardware-bench');
                    }}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Wrench size={14} />
                    <span>Open Hardware Workbench</span>
                  </button>
                )}

                {selectedTicket.id === 'INC-1065' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      phoneEngine?.triggerCall('CALL-04');
                      onOpenWindow('voip-phone');
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <PhoneCall size={14} />
                    <span>Open VoIP Softphone</span>
                  </button>
                )}

                {selectedTicket.requirements.some((r) => r.type === 'rack_repaired') && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('rack-room');
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Server size={14} />
                    <span>Open Server Rack Room</span>
                  </button>
                )}

                {selectedTicket.requirements.some((r) => r.type === 'siem_ioc_blocked') && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('siem-console');
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ShieldAlert size={14} />
                    <span>Open SIEM Console</span>
                  </button>
                )}

                {selectedTicket.requirements.some(
                  (r) => r.type === 'change_completed' || r.type === 'ssl_renewed'
                ) && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('change-control');
                    }}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ClipboardCheck size={14} />
                    <span>Open Change Control</span>
                  </button>
                )}

                {selectedTicket.requirements.some((r) => r.type === 'dhcp_dns_fixed') && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('dhcp-dns');
                    }}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Globe size={14} />
                    <span>Open DHCP &amp; DNS Manager</span>
                  </button>
                )}

                {selectedTicket.requirements.some((r) => r.type === 'script_executed') && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenWindow('script-studio');
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Code2 size={14} />
                    <span>Open Script Studio</span>
                  </button>
                )}
              </div>

              {/* Verify & Resolve Button */}
              {selectedTicket.status !== 'Resolved' ? (
                <button
                  onClick={handleVerify}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold tracking-wide flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <ShieldCheck size={16} />
                  <span>Verify Network &amp; Resolve Ticket</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs bg-emerald-950/40 border border-emerald-700/50 px-4 py-2 rounded-lg">
                  <Award size={16} />
                  <span>Ticket Verified &amp; Closed</span>
                </div>
              )}
            </div>

            {/* Live Diagnostic Verification Test Output */}
            {validationResult && validationResult.ticketId === selectedTicket.id && (
              <div
                className={`p-4 rounded-xl border flex items-start space-x-3 transition-all animate-in fade-in duration-200 ${
                  validationResult.passed
                    ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/60 text-rose-200'
                }`}
              >
                {validationResult.passed ? (
                  <Sparkles size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    {validationResult.passed
                      ? 'Network Verification Successful!'
                      : 'Verification Test Failed'}
                  </div>
                  <div className="text-xs mt-1 leading-relaxed font-mono">{validationResult.message}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <TicketIcon size={40} className="mb-2 opacity-40" />
            <p className="text-xs">Select a ticket from the queue to investigate</p>
          </div>
        )}
      </div>
    </div>
  );
};
