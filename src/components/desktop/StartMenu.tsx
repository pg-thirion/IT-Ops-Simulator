import React, { useState } from 'react';
import {
  Ticket,
  Terminal,
  Monitor,
  Users,
  Network,
  Router,
  SlidersHorizontal,
  FileText,
  ShoppingBag,
  HelpCircle,
  Search,
  Power,
  ShieldAlert,
  Activity,
  Cpu,
  FolderOpen,
  Radio,
  Mail,
  ScrollText,
  Database,
  PhoneCall,
  Wrench,
  Server,
  ClipboardCheck,
  Globe,
  Code2,
} from 'lucide-react';
import { WindowId, CareerStats } from '../../types/game';

interface StartMenuProps {
  career: CareerStats;
  onOpenWindow: (id: WindowId) => void;
  onClose: () => void;
  onResetGame: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  career,
  onOpenWindow,
  onClose,
  onResetGame,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const tools: { id: WindowId; title: string; category: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'tickets',
      title: 'Helpdesk Tickets',
      category: 'Operations',
      icon: <Ticket className="text-amber-400" size={20} />,
      desc: 'Active trouble tickets, employee complaints, SLAs and diagnostic verification',
    },
    {
      id: 'terminal',
      title: 'PowerShell / Terminal',
      category: 'Diagnostics',
      icon: <Terminal className="text-emerald-400" size={20} />,
      desc: 'ipconfig, ping, nslookup, tracert, arp -a, taskkill, Get-Service',
    },
    {
      id: 'remote-desktop',
      title: 'Remote Desktop (RDP)',
      category: 'Support',
      icon: <Monitor className="text-sky-400" size={20} />,
      desc: 'Remote session into any employee PC or datacenter server rack',
    },
    {
      id: 'email-client',
      title: 'Outlook Corporate Webmail',
      category: 'Communications',
      icon: <Mail className="text-amber-400" size={20} />,
      desc: 'Inspect email headers, SPF/DKIM verification, attachments, and quarantine phishing',
    },
    {
      id: 'edr-console',
      title: 'EDR Falcon Threat Hunter',
      category: 'Security',
      icon: <ShieldAlert className="text-rose-400" size={20} />,
      desc: 'Live fleet behavioral monitoring, host network containment, and process termination',
    },
    {
      id: 'group-policy',
      title: 'Group Policy Management (gpmc.msc)',
      category: 'Administration',
      icon: <ScrollText className="text-blue-400" size={20} />,
      desc: 'Domain and OU GPO linkage, USB storage restrictions, and drive mapping policies',
    },
    {
      id: 'backup-manager',
      title: 'Veeam Backup & Disaster Recovery',
      category: 'Storage',
      icon: <Database className="text-emerald-400" size={20} />,
      desc: 'Point-in-time VM, database, and file share snapshots and bare-metal disaster recovery',
    },
    {
      id: 'voip-phone',
      title: 'Cisco IP Communicator VoIP',
      category: 'Communications',
      icon: <PhoneCall className="text-purple-400" size={20} />,
      desc: 'Interactive phone dialogue simulation, audio ringers, and caller clue extraction',
    },
    {
      id: 'hardware-bench',
      title: 'Hardware Diagnostics Workbench',
      category: 'Hardware',
      icon: <Wrench className="text-orange-400" size={20} />,
      desc: 'Motherboard POST hex codes, DIMM RAM swaps, CPU thermal paste, and PSU rail testing',
    },
    {
      id: 'rack-room',
      title: 'Server Rack Room',
      category: 'Infrastructure',
      icon: <Server className="text-indigo-400" size={20} />,
      desc: '42U server rack, Cat6A patch panel TDR cable tester, SAS/NVMe RAID hot-swap bays, and UPS telemetry',
    },
    {
      id: 'siem-console',
      title: 'SIEM Threat Console',
      category: 'Security',
      icon: <ShieldAlert className="text-rose-400" size={20} />,
      desc: 'Centralized log correlation query engine, multi-host attack chain investigation, and IOC blocking',
    },
    {
      id: 'change-control',
      title: 'Change Control (CAB)',
      category: 'Operations',
      icon: <ClipboardCheck className="text-cyan-400" size={20} />,
      desc: 'ITIL Change Advisory Board approvals, HA failover pre-flight checks, and PKI TLS certificate renewal',
    },
    {
      id: 'dhcp-dns',
      title: 'DHCP & DNS Manager',
      category: 'Networking',
      icon: <Globe className="text-teal-400" size={20} />,
      desc: 'VLAN DHCP scope lease pools, static MAC reservations, and authoritative corp.local DNS zone editor',
    },
    {
      id: 'script-studio',
      title: 'Automation Script Studio',
      category: 'Administration',
      icon: <Code2 className="text-amber-400" size={20} />,
      desc: 'PowerShell and Bash multi-host fleet remediation playbooks with live OU stdout execution',
    },
    {
      id: 'task-manager',
      title: 'Task Manager (taskmgr.exe)',
      category: 'Diagnostics',
      icon: <Activity className="text-emerald-400" size={20} />,
      desc: 'View CPU/RAM usage across hosts, terminate rogue and runaway processes',
    },
    {
      id: 'device-manager',
      title: 'Device Manager (devmgmt.msc)',
      category: 'Hardware',
      icon: <Cpu className="text-blue-400" size={20} />,
      desc: 'Enable or disable network adapters, disk controllers, and hardware devices',
    },
    {
      id: 'active-directory',
      title: 'Active Directory Users',
      category: 'Administration',
      icon: <Users className="text-indigo-400" size={20} />,
      desc: 'Manage domain users, unlock accounts, reset passwords, manage security groups',
    },
    {
      id: 'file-explorer',
      title: 'File Explorer & Network Shares',
      category: 'Storage',
      icon: <FolderOpen className="text-amber-400" size={20} />,
      desc: 'Browse \\\\FS-SRV-01 network shares (Finance, Payroll, Engineering) & ACL permissions',
    },
    {
      id: 'network-map',
      title: 'Network Topology Map',
      category: 'Infrastructure',
      icon: <Network className="text-purple-400" size={20} />,
      desc: 'Live interactive diagram of all 61 hosts, switches, and VLANs with health states',
    },
    {
      id: 'packet-sniffer',
      title: 'Wireshark Packet Analyzer',
      category: 'Diagnostics',
      icon: <Radio className="text-cyan-400" size={20} />,
      desc: 'Capture and inspect simulated TCP/IP, DNS, ICMP, and ARP packet streams',
    },
    {
      id: 'router-admin',
      title: 'Gateway Router & Firewall',
      category: 'Networking',
      icon: <Router className="text-teal-400" size={20} />,
      desc: 'Web GUI at 192.168.1.1 (DHCP pool, DNS forwarders, firewall port filtering)',
    },
    {
      id: 'services',
      title: 'Services Console (services.msc)',
      category: 'Administration',
      icon: <SlidersHorizontal className="text-cyan-400" size={20} />,
      desc: 'Start, stop, and restart services across datacenter servers',
    },
    {
      id: 'event-viewer',
      title: 'Windows Event Viewer',
      category: 'Diagnostics',
      icon: <FileText className="text-orange-400" size={20} />,
      desc: 'System, Application, and Security audit logs across all 50 workstations',
    },
    {
      id: 'career-store',
      title: 'Career & Tech Store',
      category: 'Progression',
      icon: <ShoppingBag className="text-rose-400" size={20} />,
      desc: 'Promotions, rank unlocks, hardware tools, and diagnostic gear upgrades',
    },
    {
      id: 'help-docs',
      title: 'IT Ops Handbook',
      category: 'Documentation',
      icon: <HelpCircle className="text-blue-300" size={20} />,
      desc: 'Cheat sheet for subnetting, DNS resolution, Active Directory, and diagnostic CLI',
    },
  ];

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="start-menu-panel" className="fixed bottom-14 left-3 w-96 max-w-[calc(100vw-24px)] bg-[#181c24]/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl z-[9995] flex flex-col overflow-hidden text-slate-100 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Top Search bar */}
      <div className="p-3 border-b border-slate-700/60 bg-slate-900/40">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search IT tools, apps, and settings..."
            className="w-full bg-slate-800/80 border border-slate-700/70 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      </div>

      {/* App List */}
      <div className="p-3 max-h-[380px] overflow-y-auto space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
          Enterprise IT Suite ({filtered.length} Applications)
        </div>
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onOpenWindow(item.id);
              onClose();
            }}
            className="w-full text-left p-2 rounded-lg hover:bg-slate-800/70 flex items-start space-x-3 transition-colors group cursor-pointer"
          >
            <div className="p-2 rounded bg-slate-900/60 border border-slate-700/50 group-hover:border-slate-600 transition-colors shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  {item.title}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Profile / Quick Actions */}
      <div className="p-3 bg-slate-900/80 border-t border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-xs text-blue-300">
            AD
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">{career.playerName}</div>
            <div className="text-[10px] text-slate-400">{career.title} (Lvl {career.level})</div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              if (window.confirm('Reset network and start simulation from Day 1?')) {
                onResetGame();
                onClose();
              }
            }}
            title="Reset Simulation State"
            className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <ShieldAlert size={16} />
          </button>
          <button
            onClick={onClose}
            title="Close Menu"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
