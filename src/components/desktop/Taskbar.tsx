import React from 'react';
import {
  Monitor,
  Terminal,
  Ticket,
  Users,
  Network,
  Router,
  SlidersHorizontal,
  FileText,
  ShoppingBag,
  Volume2,
  VolumeX,
  Wifi,
  Clock,
  Briefcase,
  Play,
  HelpCircle,
  Activity,
  Cpu,
  FolderOpen,
  Radio,
  Mail,
  ShieldAlert,
  ScrollText,
  Database,
  PhoneCall,
  Wrench,
  Server,
  ClipboardCheck,
  Globe,
  Code2,
  Award,
} from 'lucide-react';
import { DesktopWindow, WindowId, CareerStats } from '../../types/game';

interface TaskbarProps {
  windows: Record<WindowId, DesktopWindow>;
  activeWindowId: WindowId | null;
  career: CareerStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleWindow: (id: WindowId) => void;
  isStartMenuOpen: boolean;
  onToggleStartMenu: () => void;
  onAdvanceDay: () => void;
  onOpenShiftReport?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  career,
  soundEnabled,
  onToggleSound,
  onToggleWindow,
  isStartMenuOpen,
  onToggleStartMenu,
  onAdvanceDay,
  onOpenShiftReport,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const appIcons: { id: WindowId; icon: React.ReactNode; label: string }[] = [
    { id: 'tickets', icon: <Ticket size={17} className="text-amber-400" />, label: 'Helpdesk Tickets' },
    { id: 'terminal', icon: <Terminal size={17} className="text-emerald-400" />, label: 'Admin Terminal' },
    { id: 'remote-desktop', icon: <Monitor size={17} className="text-sky-400" />, label: 'Remote Desktop (RDP)' },
    { id: 'email-client', icon: <Mail size={17} className="text-amber-400" />, label: 'Email Client' },
    { id: 'edr-console', icon: <ShieldAlert size={17} className="text-rose-400" />, label: 'EDR Security Console' },
    { id: 'group-policy', icon: <ScrollText size={17} className="text-blue-400" />, label: 'Group Policy (GPMC)' },
    { id: 'backup-manager', icon: <Database size={17} className="text-emerald-400" />, label: 'Backup & DR' },
    { id: 'voip-phone', icon: <PhoneCall size={17} className="text-purple-400" />, label: 'VoIP Softphone' },
    { id: 'hardware-bench', icon: <Wrench size={17} className="text-orange-400" />, label: 'Hardware Workbench' },
    { id: 'rack-room', icon: <Server size={17} className="text-indigo-400" />, label: 'Server Rack Room' },
    { id: 'siem-console', icon: <ShieldAlert size={17} className="text-rose-400" />, label: 'SIEM Threat Console' },
    { id: 'change-control', icon: <ClipboardCheck size={17} className="text-cyan-400" />, label: 'Change Control (CAB)' },
    { id: 'dhcp-dns', icon: <Globe size={17} className="text-teal-400" />, label: 'DHCP & DNS Manager' },
    { id: 'script-studio', icon: <Code2 size={17} className="text-amber-400" />, label: 'Automation Script Studio' },
    { id: 'task-manager', icon: <Activity size={17} className="text-emerald-400" />, label: 'Task Manager (taskmgr.exe)' },
    { id: 'device-manager', icon: <Cpu size={17} className="text-blue-400" />, label: 'Device Manager (devmgmt.msc)' },
    { id: 'active-directory', icon: <Users size={17} className="text-indigo-400" />, label: 'Active Directory (dsa.msc)' },
    { id: 'file-explorer', icon: <FolderOpen size={17} className="text-amber-400" />, label: 'File Explorer & Network Shares' },
    { id: 'network-map', icon: <Network size={17} className="text-purple-400" />, label: 'Network Topology Map' },
    { id: 'packet-sniffer', icon: <Radio size={17} className="text-cyan-400" />, label: 'Wireshark Packet Sniffer' },
    { id: 'router-admin', icon: <Router size={17} className="text-teal-400" />, label: 'Router & Firewall Web GUI' },
    { id: 'services', icon: <SlidersHorizontal size={17} className="text-cyan-400" />, label: 'Server Services (services.msc)' },
    { id: 'event-viewer', icon: <FileText size={17} className="text-orange-400" />, label: 'Event Viewer' },
    { id: 'career-store', icon: <ShoppingBag size={17} className="text-rose-400" />, label: 'Career & Tech Store' },
    { id: 'help-docs', icon: <HelpCircle size={17} className="text-blue-300" />, label: 'IT Ops Handbook' },
  ];

  return (
    <div className="h-12 bg-[#12151b]/95 backdrop-blur-md border-t border-slate-700/60 fixed bottom-0 left-0 right-0 z-[9990] flex items-center justify-between px-3 select-none">
      {/* Left: Start button & Pin apps */}
      <div className="flex items-center space-x-1 h-full overflow-x-auto">
        {/* Start Button */}
        <button
          onClick={onToggleStartMenu}
          className={`h-9 px-3 rounded flex items-center space-x-2 transition-all shrink-0 ${
            isStartMenuOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'hover:bg-slate-800 text-slate-200'
          }`}
        >
          <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
            <span className="bg-sky-400 rounded-sm" />
            <span className="bg-sky-300 rounded-sm" />
            <span className="bg-sky-500 rounded-sm" />
            <span className="bg-blue-400 rounded-sm" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase hidden sm:inline">Start</span>
        </button>

        <div className="h-5 w-px bg-slate-700/60 mx-1 shrink-0" />

        {/* Taskbar App Icons */}
        <div className="flex items-center space-x-0.5">
          {appIcons.map((app) => {
            const win = windows[app.id];
            const isRunning = win?.isOpen;
            const isActive = isRunning && activeWindowId === app.id && !win.isMinimized;

            return (
              <button
                key={app.id}
                onClick={() => onToggleWindow(app.id)}
                title={app.label}
                className={`relative h-9 px-2 rounded flex items-center justify-center transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-700/80 text-white shadow-inner'
                    : isRunning
                    ? 'bg-slate-800/60 hover:bg-slate-700/50 text-slate-200'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {app.icon}
                {/* Running dot / underline pill */}
                {isRunning && (
                  <span
                    className={`absolute bottom-0.5 h-0.5 rounded-full transition-all ${
                      isActive ? 'w-4 bg-sky-400' : 'w-1.5 bg-slate-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Career stats & System Tray */}
      <div className="flex items-center space-x-2.5 text-xs shrink-0">
        {/* Career & Cash info */}
        <div className="hidden xl:flex items-center space-x-2.5 bg-slate-800/80 border border-slate-700/60 rounded px-2.5 py-1">
          <div className="flex items-center space-x-1 text-emerald-400 font-bold font-mono">
            <span>R{career.cash.toLocaleString()}</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="flex items-center space-x-1 text-slate-300">
            <Briefcase size={12} className="text-sky-400" />
            <span className="font-semibold text-sky-300">Lvl {career.level}</span>
            <span className="text-slate-400 text-[11px]">({career.title})</span>
          </div>
          <div className="h-3 w-px bg-slate-700" />
          <div className="w-14 bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (career.xp / career.xpForNextLevel) * 100)}%` }}
            />
          </div>
        </div>

        {/* Day & Shift Clock */}
        <div className="flex items-center space-x-2 bg-slate-800/70 border border-slate-700/50 rounded px-2 py-1 text-slate-200">
          <Clock size={12} className="text-amber-400" />
          <span className="font-semibold">Day {career.currentDay}</span>
          <span className="font-mono text-slate-400 text-[11px]">{formatTime(career.dayTimeRemainingSeconds)}</span>
          <button
            onClick={onOpenShiftReport}
            title="End Shift Report"
            className="ml-1 px-1.5 py-0.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-[10px] font-bold flex items-center space-x-0.5 transition-colors"
          >
            <Award size={9} />
            <span>End Shift</span>
          </button>
          <button
            onClick={onAdvanceDay}
            title="Advance to next in-game shift"
            className="ml-1 px-1.5 py-0.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-[10px] font-bold flex items-center space-x-0.5 transition-colors"
          >
            <Play size={9} />
            <span>Next Shift</span>
          </button>
        </div>

        {/* Audio Mute toggle */}
        <button
          onClick={onToggleSound}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-rose-400" />}
        </button>

        {/* Network indicator */}
        <div className="flex items-center text-emerald-400" title="Corporate Network: Online">
          <Wifi size={14} />
        </div>

        {/* System Time */}
        <div className="text-right pl-1 border-l border-slate-700/50 hidden sm:block">
          <div className="font-mono font-medium text-slate-200 text-[11px]">09:42 AM</div>
          <div className="text-[9px] text-slate-400">2026-11-11</div>
        </div>
      </div>
    </div>
  );
};
