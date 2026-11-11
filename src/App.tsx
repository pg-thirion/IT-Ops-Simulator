import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket as TicketIcon,
  Terminal as TerminalIcon,
  Monitor,
  Users,
  Network,
  Router,
  SlidersHorizontal,
  FileText,
  ShoppingBag,
  HelpCircle,
  Activity,
  Cpu,
  FolderOpen,
  Radio,
  Sparkles,
  Mail,
  ShieldAlert,
  ScrollText,
  Database,
  PhoneCall,
  Wrench,
} from 'lucide-react';
import {
  DesktopWindow,
  WindowId,
  CareerStats,
  StoreItem,
  Ticket,
} from './types/game';
import { NetworkEngine } from './simulation/networkEngine';
import { TerminalEngine } from './simulation/terminalEngine';
import { MailEngine } from './simulation/mailEngine';
import { SecurityEngine } from './simulation/securityEngine';
import { OutbreakEngine } from './simulation/outbreakEngine';
import { GpoEngine } from './simulation/gpoEngine';
import { BackupEngine } from './simulation/backupEngine';
import { PhoneEngine } from './simulation/phoneEngine';
import { HardwareEngine } from './simulation/hardwareEngine';
import { RackEngine } from './simulation/rackEngine';
import { SiemEngine } from './simulation/siemEngine';
import { ChangeEngine } from './simulation/changeEngine';
import { DhcpDnsEngine } from './simulation/dhcpDnsEngine';
import { ScriptEngine } from './simulation/scriptEngine';
import { ShiftEventEngine } from './simulation/shiftEventEngine';
import {
  buildInitialNetworkHosts,
  buildInitialActiveDirectory,
  INITIAL_ROUTER_CONFIG,
  INITIAL_SHARED_FOLDERS,
} from './simulation/initialNetwork';
import { INITIAL_TICKETS, PROCEDURAL_INCIDENT_TEMPLATES } from './simulation/ticketEngine';
import { WindowFrame } from './components/desktop/WindowFrame';
import { Taskbar } from './components/desktop/Taskbar';
import { StartMenu } from './components/desktop/StartMenu';
import { ShiftReportModal } from './components/desktop/ShiftReportModal';
import { sound } from './utils/audio';

const TicketingApp = React.lazy(() =>
  import('./components/apps/TicketingApp').then((m) => ({ default: m.TicketingApp }))
);
const TerminalApp = React.lazy(() =>
  import('./components/apps/TerminalApp').then((m) => ({ default: m.TerminalApp }))
);
const RemoteDesktopApp = React.lazy(() =>
  import('./components/apps/RemoteDesktopApp').then((m) => ({ default: m.RemoteDesktopApp }))
);
const ActiveDirectoryApp = React.lazy(() =>
  import('./components/apps/ActiveDirectoryApp').then((m) => ({ default: m.ActiveDirectoryApp }))
);
const NetworkTopologyApp = React.lazy(() =>
  import('./components/apps/NetworkTopologyApp').then((m) => ({ default: m.NetworkTopologyApp }))
);
const RouterAdminApp = React.lazy(() =>
  import('./components/apps/RouterAdminApp').then((m) => ({ default: m.RouterAdminApp }))
);
const ServicesApp = React.lazy(() =>
  import('./components/apps/ServicesApp').then((m) => ({ default: m.ServicesApp }))
);
const EventViewerApp = React.lazy(() =>
  import('./components/apps/EventViewerApp').then((m) => ({ default: m.EventViewerApp }))
);
const CareerStoreApp = React.lazy(() =>
  import('./components/apps/CareerStoreApp').then((m) => ({ default: m.CareerStoreApp }))
);
const HelpDocsApp = React.lazy(() =>
  import('./components/apps/HelpDocsApp').then((m) => ({ default: m.HelpDocsApp }))
);
const TaskManagerApp = React.lazy(() =>
  import('./components/apps/TaskManagerApp').then((m) => ({ default: m.TaskManagerApp }))
);
const DeviceManagerApp = React.lazy(() =>
  import('./components/apps/DeviceManagerApp').then((m) => ({ default: m.DeviceManagerApp }))
);
const FileExplorerApp = React.lazy(() =>
  import('./components/apps/FileExplorerApp').then((m) => ({ default: m.FileExplorerApp }))
);
const PacketSnifferApp = React.lazy(() =>
  import('./components/apps/PacketSnifferApp').then((m) => ({ default: m.PacketSnifferApp }))
);
const EmailClientApp = React.lazy(() =>
  import('./components/apps/EmailClientApp').then((m) => ({ default: m.EmailClientApp }))
);
const EdrConsoleApp = React.lazy(() =>
  import('./components/apps/EdrConsoleApp').then((m) => ({ default: m.EdrConsoleApp }))
);
const GroupPolicyApp = React.lazy(() =>
  import('./components/apps/GroupPolicyApp').then((m) => ({ default: m.GroupPolicyApp }))
);
const BackupManagerApp = React.lazy(() =>
  import('./components/apps/BackupManagerApp').then((m) => ({ default: m.BackupManagerApp }))
);
const VoipPhoneApp = React.lazy(() =>
  import('./components/apps/VoipPhoneApp').then((m) => ({ default: m.VoipPhoneApp }))
);
const HardwareWorkbenchApp = React.lazy(() =>
  import('./components/apps/HardwareWorkbenchApp').then((m) => ({ default: m.HardwareWorkbenchApp }))
);
const RackRoomApp = React.lazy(() =>
  import('./components/apps/RackRoomApp').then((m) => ({ default: m.RackRoomApp }))
);
const SiemConsoleApp = React.lazy(() =>
  import('./components/apps/SiemConsoleApp').then((m) => ({ default: m.SiemConsoleApp }))
);
const ChangeControlApp = React.lazy(() =>
  import('./components/apps/ChangeControlApp').then((m) => ({ default: m.ChangeControlApp }))
);
const DhcpDnsApp = React.lazy(() =>
  import('./components/apps/DhcpDnsApp').then((m) => ({ default: m.DhcpDnsApp }))
);
const ScriptStudioApp = React.lazy(() =>
  import('./components/apps/ScriptStudioApp').then((m) => ({ default: m.ScriptStudioApp }))
);

const INITIAL_CAREER: CareerStats = {
  playerName: 'Admin (You)',
  title: 'Helpdesk Support Specialist',
  level: 1,
  xp: 0,
  xpForNextLevel: 400,
  cash: 1200,
  ticketsResolved: 0,
  ticketsFailed: 0,
  slaAdherenceRate: 100,
  currentDay: 1,
  dayTimeRemainingSeconds: 480,
  isDayActive: true,
  unlockedTools: [],
};

const INITIAL_STORE_ITEMS: StoreItem[] = [
  {
    id: 'wireshark',
    name: 'Wireshark Packet Analyzer',
    category: 'Software',
    price: 650,
    description: 'Intercepts simulated TCP/IP handshakes, DNS queries, and packet drops.',
    icon: 'terminal',
    purchased: false,
    effect: 'Enables live packet inspection in the Wireshark app',
  },
  {
    id: 'dual_monitor',
    name: 'Dual 4K Monitor Setup',
    category: 'Hardware',
    price: 1100,
    description: 'Increases desktop multitasking capability with more space for open admin tools.',
    icon: 'monitor',
    purchased: false,
    effect: 'Optimized window layouts and elevated IT comfort',
  },
  {
    id: 'espresso_machine',
    name: 'Commercial Espresso Machine',
    category: 'Perks',
    price: 850,
    description: 'Employees get free specialty coffee, increasing their patience on support tickets.',
    icon: 'coffee',
    purchased: false,
    effect: 'Adds +3 minutes to all ticket SLA response times',
  },
  {
    id: 'cable_tester',
    name: 'Fluke Enterprise Cable Tester',
    category: 'Hardware',
    price: 950,
    description: 'Instantly identifies physical and VLAN disconnects in the Network Topology Map.',
    icon: 'cpu',
    purchased: false,
    effect: 'Highlights misconfigured nodes in vibrant amber/red pulses',
  },
];

const INITIAL_WINDOWS: Record<WindowId, DesktopWindow> = {
  tickets: {
    id: 'tickets',
    title: 'Helpdesk Ticket Queue',
    icon: '🎫',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 40,
    y: 30,
    width: 920,
    height: 610,
  },
  terminal: {
    id: 'terminal',
    title: 'PowerShell Diagnostic Terminal',
    icon: '💻',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 9,
    x: 140,
    y: 80,
    width: 820,
    height: 520,
    targetHostId: 'PC-FIN-04',
  },
  'remote-desktop': {
    id: 'remote-desktop',
    title: 'Remote Desktop (RDP) Viewer',
    icon: '🖥️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 8,
    x: 100,
    y: 60,
    width: 900,
    height: 600,
    targetHostId: 'PC-FIN-04',
  },
  'task-manager': {
    id: 'task-manager',
    title: 'Task Manager (taskmgr.exe)',
    icon: '📊',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    x: 130,
    y: 75,
    width: 840,
    height: 540,
    targetHostId: 'SQL-PROD-01',
  },
  'device-manager': {
    id: 'device-manager',
    title: 'Device Manager (devmgmt.msc)',
    icon: '🔌',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    x: 150,
    y: 85,
    width: 780,
    height: 520,
    targetHostId: 'PC-MKT-03',
  },
  'active-directory': {
    id: 'active-directory',
    title: 'Active Directory Users and Computers (dsa.msc)',
    icon: '👥',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    x: 120,
    y: 70,
    width: 920,
    height: 560,
  },
  'file-explorer': {
    id: 'file-explorer',
    title: 'File Explorer & Network Shares (\\\\FS-SRV-01)',
    icon: '📁',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 6,
    x: 110,
    y: 65,
    width: 850,
    height: 540,
  },
  'network-map': {
    id: 'network-map',
    title: 'Enterprise Network Topology (61 Nodes)',
    icon: '🌐',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 6,
    x: 80,
    y: 40,
    width: 980,
    height: 620,
  },
  'packet-sniffer': {
    id: 'packet-sniffer',
    title: 'Wireshark Packet Analyzer',
    icon: '🦈',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 5,
    x: 135,
    y: 95,
    width: 880,
    height: 540,
  },
  'router-admin': {
    id: 'router-admin',
    title: 'Gateway Router & Firewall (192.168.1.1)',
    icon: '📡',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 5,
    x: 110,
    y: 65,
    width: 860,
    height: 540,
  },
  services: {
    id: 'services',
    title: 'Datacenter Services (services.msc)',
    icon: '⚙️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 4,
    x: 130,
    y: 90,
    width: 880,
    height: 520,
  },
  'event-viewer': {
    id: 'event-viewer',
    title: 'Event Viewer (eventvwr.msc)',
    icon: '📋',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 3,
    x: 150,
    y: 100,
    width: 840,
    height: 500,
  },
  'career-store': {
    id: 'career-store',
    title: 'Career Progression & IT Tech Store',
    icon: '🛍️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 2,
    x: 160,
    y: 50,
    width: 860,
    height: 580,
  },
  'help-docs': {
    id: 'help-docs',
    title: 'IT Operations Handbook & SOP',
    icon: '📖',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 90,
    y: 50,
    width: 780,
    height: 540,
  },
  'email-client': {
    id: 'email-client',
    title: 'Outlook Corporate Webmail',
    icon: '✉️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 105,
    y: 55,
    width: 900,
    height: 580,
  },
  'edr-console': {
    id: 'edr-console',
    title: 'EDR Falcon Threat Hunter',
    icon: '🛡️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 125,
    y: 65,
    width: 920,
    height: 580,
  },
  'group-policy': {
    id: 'group-policy',
    title: 'Group Policy Management (gpmc.msc)',
    icon: '📜',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 115,
    y: 75,
    width: 860,
    height: 540,
  },
  'backup-manager': {
    id: 'backup-manager',
    title: 'Veeam Backup & Disaster Recovery',
    icon: '💾',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 135,
    y: 85,
    width: 860,
    height: 540,
  },
  'voip-phone': {
    id: 'voip-phone',
    title: 'Cisco IP Communicator VoIP',
    icon: '📞',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 145,
    y: 95,
    width: 420,
    height: 600,
  },
  'hardware-bench': {
    id: 'hardware-bench',
    title: 'IT Hardware Diagnostics Workbench',
    icon: '🔧',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 95,
    y: 45,
    width: 960,
    height: 620,
  },
  'rack-room': {
    id: 'rack-room',
    title: 'Physical Server Rack & Patch Room',
    icon: '🗄️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 90,
    y: 50,
    width: 940,
    height: 600,
  },
  'siem-console': {
    id: 'siem-console',
    title: 'SIEM Log Correlation & Threat Hunter',
    icon: '📊',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 105,
    y: 60,
    width: 960,
    height: 600,
  },
  'change-control': {
    id: 'change-control',
    title: 'Change Management & CAB Console',
    icon: '📋',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 115,
    y: 65,
    width: 920,
    height: 580,
  },
  'dhcp-dns': {
    id: 'dhcp-dns',
    title: 'DHCP Scope & DNS Zone Manager',
    icon: '🌐',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 120,
    y: 70,
    width: 920,
    height: 580,
  },
  'script-studio': {
    id: 'script-studio',
    title: 'PowerShell / Bash Automation Studio',
    icon: '⚡',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    x: 125,
    y: 75,
    width: 940,
    height: 580,
  },
};

const CAREER_STORAGE_KEY = 'it_ops_simulator_career_v1';
const TICKETS_STORAGE_KEY = 'it_ops_simulator_tickets_v1';
const STORE_STORAGE_KEY = 'it_ops_simulator_store_v1';

function getInitialCareer(): CareerStats {
  try {
    const raw = localStorage.getItem(CAREER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_CAREER;
}

function getInitialTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_TICKETS;
}

function getInitialStore(): StoreItem[] {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_STORE_ITEMS;
}

export const App: React.FC = () => {
  // Engines (Semantic Singletons)
  const [networkEngine] = useState(
    () =>
      new NetworkEngine(
        buildInitialNetworkHosts(),
        buildInitialActiveDirectory(),
        INITIAL_ROUTER_CONFIG,
        INITIAL_SHARED_FOLDERS
      )
  );

  const [terminalEngine] = useState(() => new TerminalEngine(networkEngine));
  const [mailEngine] = useState(() => new MailEngine());
  const [securityEngine] = useState(() => new SecurityEngine(networkEngine));
  const [outbreakEngine] = useState(
    () => new OutbreakEngine(networkEngine, securityEngine)
  );
  const [gpoEngine] = useState(() => new GpoEngine(networkEngine));
  const [backupEngine] = useState(() => new BackupEngine(networkEngine));
  const [phoneEngine] = useState(() => new PhoneEngine());
  const [hardwareEngine] = useState(() => new HardwareEngine());
  const [rackEngine] = useState(() => new RackEngine());
  const [siemEngine] = useState(() => new SiemEngine());
  const [changeEngine] = useState(() => new ChangeEngine());
  const [dhcpDnsEngine] = useState(() => new DhcpDnsEngine());
  const [scriptEngine] = useState(() => new ScriptEngine(networkEngine));
  const [shiftEventEngine] = useState(() => new ShiftEventEngine());

  // State
  const [tickets, setTickets] = useState<Ticket[]>(getInitialTickets);
  const [career, setCareer] = useState<CareerStats>(getInitialCareer);
  const [storeItems, setStoreItems] = useState<StoreItem[]>(getInitialStore);
  const [windows, setWindows] = useState<Record<WindowId, DesktopWindow>>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>('tickets');
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [, setRefreshTrigger] = useState(0);

  // Synchronize VoIP phone revealed clues with ticket state
  const syncPhoneClues = useCallback(() => {
    setTickets((prev) =>
      prev.map((t) => {
        const clues = phoneEngine.getRevealedClues(t.id);
        if (clues && clues.length > 0) {
          const existing = t.revealedClues || [];
          const merged = Array.from(new Set([...existing, ...clues]));
          if (merged.length !== existing.length) {
            return { ...t, revealedClues: merged };
          }
        }
        return t;
      })
    );
  }, [phoneEngine]);

  const forceRefresh = () => {
    setRefreshTrigger((n) => n + 1);
    syncPhoneClues();
  };

  useEffect(() => {
    // Initial sync of clues on mount
    const timer = setTimeout(() => {
      syncPhoneClues();
    }, 100);
    return () => clearTimeout(timer);
  }, [syncPhoneClues]);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(career));
    } catch {}
  }, [career]);

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(storeItems));
    } catch {}
  }, [storeItems]);

  // In-game day clock countdown and ticket SLA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCareer((prev) => {
        if (!prev.isDayActive) return prev;
        if (prev.dayTimeRemainingSeconds <= 1) {
          return {
            ...prev,
            dayTimeRemainingSeconds: 0,
          };
        }
        return {
          ...prev,
          dayTimeRemainingSeconds: prev.dayTimeRemainingSeconds - 1,
        };
      });

      setTickets((prev) => {
        let failedDelta = 0;
        const next = prev.map((t) => {
          if (t.status === 'Resolved' || t.timeRemainingSeconds <= 0) return t;
          const remaining = t.timeRemainingSeconds - 1;
          if (remaining === 0) {
            failedDelta++;
          }
          return { ...t, timeRemainingSeconds: remaining };
        });

        if (failedDelta > 0) {
          setCareer((c) => {
            const nextFailed = c.ticketsFailed + failedDelta;
            const total = c.ticketsResolved + nextFailed;
            const rate = total > 0 ? Math.round((c.ticketsResolved / total) * 100) : 100;
            return {
              ...c,
              ticketsFailed: nextFailed,
              slaAdherenceRate: rate,
            };
          });
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const bringToFocus = (id: WindowId, targetHostId?: string) => {
    setWindows((w) => {
      const target = w[id];
      const maxZ = Math.max(...Object.values(w).map((win) => win.zIndex || 0), 10);
      const hasUniqueMaxZ =
        target.zIndex === maxZ &&
        Object.values(w).filter((win) => win.zIndex === maxZ).length === 1;
      const hostUnchanged = !targetHostId || target.targetHostId === targetHostId;

      if (target.isOpen && !target.isMinimized && hasUniqueMaxZ && hostUnchanged) {
        return w;
      }

      return {
        ...w,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
          zIndex: maxZ + 1,
          ...(targetHostId ? { targetHostId } : {}),
        },
      };
    });
    setActiveWindowId((prev) => (prev === id ? prev : id));
  };

  const handleToggleWindow = (id: WindowId) => {
    sound.playClick();
    const win = windows[id];
    if (!win.isOpen) {
      bringToFocus(id);
    } else if (win.isMinimized) {
      bringToFocus(id);
    } else if (activeWindowId === id) {
      handleMinimizeWindow(id);
    } else {
      bringToFocus(id);
    }
  };

  const handleCloseWindow = (id: WindowId) => {
    sound.playClick();
    setWindows((w) => {
      const next = {
        ...w,
        [id]: {
          ...w[id],
          isOpen: false,
          isMinimized: false,
        },
      };

      const remainingOpen = Object.values(next)
        .filter((win) => win.isOpen && !win.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);

      setActiveWindowId(remainingOpen.length > 0 ? remainingOpen[0].id : null);
      return next;
    });
  };

  const handleMinimizeWindow = (id: WindowId) => {
    sound.playClick();
    setWindows((w) => {
      const next = {
        ...w,
        [id]: {
          ...w[id],
          isMinimized: true,
        },
      };

      const remainingOpen = Object.values(next)
        .filter((win) => win.isOpen && !win.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);

      setActiveWindowId(remainingOpen.length > 0 ? remainingOpen[0].id : null);
      return next;
    });
  };

  const handleMaximizeWindow = (id: WindowId) => {
    sound.playClick();
    setWindows((w) => ({
      ...w,
      [id]: { ...w[id], isMaximized: !w[id].isMaximized },
    }));
  };

  const handleOpenRemoteDesktop = (hostId: string) => {
    bringToFocus('remote-desktop', hostId);
  };

  const handleOpenTerminal = (hostId: string) => {
    bringToFocus('terminal', hostId);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  // Ticket Resolution
  const handleResolveTicket = (ticketId: string, rewardXp: number, rewardCash: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    );

    setCareer((prev) => {
      const nextXp = prev.xp + rewardXp;
      const nextCash = prev.cash + rewardCash;
      let nextLevel = prev.level;
      let nextTitle = prev.title;
      let nextReqXp = prev.xpForNextLevel;

      if (nextXp >= prev.xpForNextLevel) {
        nextLevel += 1;
        nextReqXp = Math.floor(prev.xpForNextLevel * 1.8);
        if (nextLevel === 2) nextTitle = 'Junior Systems Administrator';
        else if (nextLevel === 3) nextTitle = 'Network Systems Engineer';
        else if (nextLevel === 4) nextTitle = 'Senior Infrastructure Architect';
        else if (nextLevel >= 5) nextTitle = 'IT Operations Director';

        setToastNotification(`PROMOTION! You reached Level ${nextLevel}: ${nextTitle}!`);
        setTimeout(() => setToastNotification(null), 5000);
      }

      const nextResolved = prev.ticketsResolved + 1;
      const total = nextResolved + prev.ticketsFailed;
      const rate = total > 0 ? Math.round((nextResolved / total) * 100) : 100;

      return {
        ...prev,
        xp: nextXp,
        cash: nextCash,
        level: nextLevel,
        title: nextTitle,
        xpForNextLevel: nextReqXp,
        ticketsResolved: nextResolved,
        slaAdherenceRate: rate,
      };
    });

    setToastNotification(`Ticket ${ticketId} Resolved! Earned +R${rewardCash} and +${rewardXp} XP.`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Advance Day / Shift
  const advanceShift = (bonusCash = 0, bonusXp = 0) => {
    sound.playTicketNotification();
    const nextDay = career.currentDay + 1;

    const templateIndex = (nextDay - 2) % PROCEDURAL_INCIDENT_TEMPLATES.length;
    const template = PROCEDURAL_INCIDENT_TEMPLATES[Math.max(0, templateIndex)];

    template.setupFault(networkEngine);

    const bonusMinutes = career.unlockedTools.includes('espresso_machine') ? 3 : 0;
    const totalSla = (template.slaMinutes + bonusMinutes) * 60;

    const newTicket: Ticket = {
      id: `INC-${1050 + nextDay}`,
      title: template.title,
      department: template.department,
      reporterName: template.reporterName,
      reporterHostId: template.reporterHostId,
      priority: template.priority,
      status: 'Open',
      category: template.category,
      description: template.description,
      initialQuote: template.quote,
      slaMinutes: template.slaMinutes + bonusMinutes,
      timeRemainingSeconds: totalSla,
      rewardXp: template.rewardXp,
      rewardCash: template.rewardCash,
      requirements: template.requirements,
      createdDay: nextDay,
    };

    setTickets((prev) => [newTicket, ...prev]);

    setCareer((prev) => ({
      ...prev,
      currentDay: nextDay,
      dayTimeRemainingSeconds: 480,
      cash: prev.cash + bonusCash,
      xp: prev.xp + bonusXp,
    }));

    setToastNotification(
      bonusCash > 0
        ? `Shift Day ${nextDay} started! Earned bonus (+R${bonusCash}, +${bonusXp} XP). New Ticket: ${newTicket.id}`
        : `Day ${nextDay} shift started! New Ticket: ${newTicket.id} (${newTicket.title})`
    );
    setTimeout(() => setToastNotification(null), 5000);
    forceRefresh();
  };

  const handleAdvanceDay = () => {
    advanceShift(0, 0);
  };

  const handleCompleteShiftReport = () => {
    const report = shiftEventEngine.calculateShiftReport(career);
    setIsShiftReportOpen(false);
    advanceShift(report.bonusCash, report.bonusXp);
  };

  const handlePurchaseStoreItem = (item: StoreItem) => {
    setCareer((prev) => ({
      ...prev,
      cash: prev.cash - item.price,
      unlockedTools: [...prev.unlockedTools, item.id],
    }));

    setStoreItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, purchased: true } : i))
    );

    if (item.id === 'espresso_machine') {
      setTickets((prev) =>
        prev.map((t) =>
          t.status === 'Open'
            ? {
                ...t,
                slaMinutes: t.slaMinutes + 3,
                timeRemainingSeconds: t.timeRemainingSeconds + 180,
              }
            : t
        )
      );
    }

    setToastNotification(`Purchased ${item.name}! Effect: ${item.effect}`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleResetGame = () => {
    try {
      localStorage.removeItem(CAREER_STORAGE_KEY);
      localStorage.removeItem(TICKETS_STORAGE_KEY);
      localStorage.removeItem(STORE_STORAGE_KEY);
    } catch {}
    window.location.reload();
  };

  const desktopIcons = [
    {
      id: 'tickets' as WindowId,
      label: 'Helpdesk Tickets',
      icon: <TicketIcon className="text-amber-400" size={30} />,
      badge: tickets.filter((t) => t.status !== 'Resolved').length,
    },
    {
      id: 'terminal' as WindowId,
      label: 'Admin Terminal',
      icon: <TerminalIcon className="text-emerald-400" size={30} />,
    },
    {
      id: 'remote-desktop' as WindowId,
      label: 'Remote Desktop (RDP)',
      icon: <Monitor className="text-sky-400" size={30} />,
    },
    {
      id: 'email-client' as WindowId,
      label: 'Email Client',
      icon: <Mail className="text-amber-400" size={30} />,
    },
    {
      id: 'edr-console' as WindowId,
      label: 'EDR Console',
      icon: <ShieldAlert className="text-rose-400" size={30} />,
    },
    {
      id: 'group-policy' as WindowId,
      label: 'Group Policy',
      icon: <ScrollText className="text-blue-400" size={30} />,
    },
    {
      id: 'backup-manager' as WindowId,
      label: 'Backup & DR',
      icon: <Database className="text-emerald-400" size={30} />,
    },
    {
      id: 'voip-phone' as WindowId,
      label: 'VoIP Softphone',
      icon: <PhoneCall className="text-purple-400" size={30} />,
    },
    {
      id: 'hardware-bench' as WindowId,
      label: 'Hardware Bench',
      icon: <Wrench className="text-orange-400" size={30} />,
    },
    {
      id: 'task-manager' as WindowId,
      label: 'Task Manager',
      icon: <Activity className="text-emerald-400" size={30} />,
    },
    {
      id: 'device-manager' as WindowId,
      label: 'Device Manager',
      icon: <Cpu className="text-blue-400" size={30} />,
    },
    {
      id: 'active-directory' as WindowId,
      label: 'Active Directory',
      icon: <Users className="text-indigo-400" size={30} />,
    },
    {
      id: 'file-explorer' as WindowId,
      label: 'File Explorer',
      icon: <FolderOpen className="text-amber-400" size={30} />,
    },
    {
      id: 'network-map' as WindowId,
      label: 'Network Topology',
      icon: <Network className="text-purple-400" size={30} />,
    },
    {
      id: 'packet-sniffer' as WindowId,
      label: 'Wireshark Sniffer',
      icon: <Radio className="text-cyan-400" size={30} />,
    },
    {
      id: 'router-admin' as WindowId,
      label: 'Router & Firewall',
      icon: <Router className="text-teal-400" size={30} />,
    },
    {
      id: 'services' as WindowId,
      label: 'Server Services',
      icon: <SlidersHorizontal className="text-cyan-400" size={30} />,
    },
    {
      id: 'event-viewer' as WindowId,
      label: 'Event Viewer',
      icon: <FileText className="text-orange-400" size={30} />,
    },
    {
      id: 'career-store' as WindowId,
      label: 'Career & Tech Store',
      icon: <ShoppingBag className="text-rose-400" size={30} />,
    },
    {
      id: 'help-docs' as WindowId,
      label: 'IT Ops Handbook',
      icon: <HelpCircle className="text-blue-300" size={30} />,
    },
  ];

  return (
    <div
      className="w-screen h-screen overflow-hidden bg-cover bg-center select-none relative"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 30%, #172138 0%, #0d1220 60%, #070911 100%)',
      }}
      onClick={() => {
        if (isStartMenuOpen) setIsStartMenuOpen(false);
      }}
    >
      {/* Subtle Matrix / Network Grid wallpaper lines */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Corporate IT Emblem watermark */}
      <div className="absolute top-6 right-10 text-right opacity-25 pointer-events-none">
        <div className="text-3xl font-black tracking-widest text-slate-400 font-mono">
          IT OPS SIMULATOR
        </div>
        <div className="text-[11px] text-sky-400 font-mono tracking-widest mt-0.5">
          ENTERPRISE DOMAIN CORP.LOCAL | 61 NODES
        </div>
      </div>

      {/* Desktop App Icons Grid */}
      <div className="absolute top-5 left-5 grid grid-flow-col grid-rows-7 gap-y-3 gap-x-5 z-0">
        {desktopIcons.map((app) => (
          <button
            key={app.id}
            onClick={() => bringToFocus(app.id)}
            className="w-24 flex flex-col items-center p-1.5 rounded-lg hover:bg-slate-800/40 border border-transparent hover:border-slate-700/60 transition-all text-center group cursor-pointer"
          >
            <div className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 group-hover:scale-105 group-hover:border-slate-500 shadow-md transition-all">
              {app.icon}
              {app.badge !== undefined && app.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-lg animate-pulse">
                  {app.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-white mt-1 leading-tight drop-shadow">
              {app.label}
            </span>
          </button>
        ))}
      </div>

      {/* Floating System Toast Notification */}
      {toastNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#161b26]/95 border border-sky-500/60 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2.5 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span className="font-semibold">{toastNotification}</span>
        </div>
      )}

      {/* Windows Layer */}
      {Object.values(windows).map((win) => {
        return (
          <WindowFrame
            key={win.id}
            window={win}
            onClose={() => handleCloseWindow(win.id)}
            onMinimize={() => handleMinimizeWindow(win.id)}
            onMaximize={() => handleMaximizeWindow(win.id)}
            onFocus={() => bringToFocus(win.id)}
          >
            {win.id === 'tickets' && (
              <TicketingApp
                tickets={tickets}
                career={career}
                networkEngine={networkEngine}
                mailEngine={mailEngine}
                securityEngine={securityEngine}
                gpoEngine={gpoEngine}
                backupEngine={backupEngine}
                hardwareEngine={hardwareEngine}
                phoneEngine={phoneEngine}
                rackEngine={rackEngine}
                siemEngine={siemEngine}
                changeEngine={changeEngine}
                dhcpDnsEngine={dhcpDnsEngine}
                scriptEngine={scriptEngine}
                shiftEventEngine={shiftEventEngine}
                onResolveTicket={handleResolveTicket}
                onOpenRemoteDesktop={handleOpenRemoteDesktop}
                onOpenTerminal={handleOpenTerminal}
                onOpenWindow={(id) => bringToFocus(id)}
                onDeductXp={(amount) => {
                  setCareer((prev) => ({
                    ...prev,
                    xp: Math.max(0, prev.xp - amount),
                  }));
                }}
              />
            )}

            {win.id === 'terminal' && (
              <TerminalApp
                currentHostId={win.targetHostId || 'PC-FIN-04'}
                networkEngine={networkEngine}
                terminalEngine={terminalEngine}
              />
            )}

            {win.id === 'remote-desktop' && (
              <RemoteDesktopApp
                initialHostId={win.targetHostId || 'PC-FIN-04'}
                networkEngine={networkEngine}
                terminalEngine={terminalEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'email-client' && (
              <EmailClientApp mailEngine={mailEngine} onRefresh={forceRefresh} />
            )}

            {win.id === 'edr-console' && (
              <EdrConsoleApp
                securityEngine={securityEngine}
                networkEngine={networkEngine}
                outbreakEngine={outbreakEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'group-policy' && (
              <GroupPolicyApp
                gpoEngine={gpoEngine}
                networkEngine={networkEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'backup-manager' && (
              <BackupManagerApp
                backupEngine={backupEngine}
                networkEngine={networkEngine}
                outbreakEngine={outbreakEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'voip-phone' && (
              <VoipPhoneApp phoneEngine={phoneEngine} onRefresh={forceRefresh} />
            )}

            {win.id === 'hardware-bench' && (
              <HardwareWorkbenchApp
                hardwareEngine={hardwareEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'task-manager' && (
              <TaskManagerApp
                initialHostId={win.targetHostId || 'SQL-PROD-01'}
                networkEngine={networkEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'device-manager' && (
              <DeviceManagerApp
                initialHostId={win.targetHostId || 'PC-MKT-03'}
                networkEngine={networkEngine}
                onRefresh={forceRefresh}
              />
            )}

            {win.id === 'active-directory' && (
              <ActiveDirectoryApp networkEngine={networkEngine} onRefresh={forceRefresh} />
            )}

            {win.id === 'file-explorer' && (
              <FileExplorerApp networkEngine={networkEngine} onRefresh={forceRefresh} />
            )}

            {win.id === 'network-map' && (
              <NetworkTopologyApp
                networkEngine={networkEngine}
                onOpenRemoteDesktop={handleOpenRemoteDesktop}
                onOpenTerminal={handleOpenTerminal}
                hasCableTester={career.unlockedTools.includes('cable_tester')}
              />
            )}

            {win.id === 'packet-sniffer' && (
              <PacketSnifferApp networkEngine={networkEngine} />
            )}

            {win.id === 'router-admin' && (
              <RouterAdminApp networkEngine={networkEngine} onRefresh={forceRefresh} />
            )}

            {win.id === 'services' && (
              <ServicesApp networkEngine={networkEngine} onRefresh={forceRefresh} />
            )}

            {win.id === 'event-viewer' && <EventViewerApp networkEngine={networkEngine} />}

            {win.id === 'career-store' && (
              <CareerStoreApp
                career={career}
                storeItems={storeItems}
                onPurchaseItem={handlePurchaseStoreItem}
              />
            )}

            {win.id === 'help-docs' && <HelpDocsApp />}

            {win.id === 'rack-room' && (
              <RackRoomApp rackEngine={rackEngine} onStateChange={forceRefresh} />
            )}

            {win.id === 'siem-console' && (
              <SiemConsoleApp siemEngine={siemEngine} onStateChange={forceRefresh} />
            )}

            {win.id === 'change-control' && (
              <ChangeControlApp
                changeEngine={changeEngine}
                shiftEventEngine={shiftEventEngine}
                onStateChange={forceRefresh}
              />
            )}

            {win.id === 'dhcp-dns' && (
              <DhcpDnsApp dhcpDnsEngine={dhcpDnsEngine} onStateChange={forceRefresh} />
            )}

            {win.id === 'script-studio' && (
              <ScriptStudioApp scriptEngine={scriptEngine} onStateChange={forceRefresh} />
            )}
          </WindowFrame>
        );
      })}

      {/* End-of-Shift Report Modal */}
      <ShiftReportModal
        report={shiftEventEngine.calculateShiftReport(career)}
        isOpen={isShiftReportOpen}
        onClose={() => setIsShiftReportOpen(false)}
        onNextShift={handleCompleteShiftReport}
      />

      {/* Start Menu Popup */}
      {isStartMenuOpen && (
        <StartMenu
          career={career}
          onOpenWindow={(id) => bringToFocus(id)}
          onClose={() => setIsStartMenuOpen(false)}
          onResetGame={handleResetGame}
        />
      )}

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        career={career}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onToggleWindow={handleToggleWindow}
        isStartMenuOpen={isStartMenuOpen}
        onToggleStartMenu={() => setIsStartMenuOpen(!isStartMenuOpen)}
        onAdvanceDay={handleAdvanceDay}
        onOpenShiftReport={() => setIsShiftReportOpen(true)}
      />
    </div>
  );
};

export default App;
