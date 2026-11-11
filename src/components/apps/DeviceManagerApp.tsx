import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  HardDrive,
  Monitor,
  Printer,
  Sliders,
  ChevronDown,
  ChevronRight,
  Power,
  PowerOff,
  CheckCircle,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { DeviceItem } from '../../types/network';
import { sound } from '../../utils/audio';

interface DeviceManagerAppProps {
  initialHostId?: string;
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const DeviceManagerApp: React.FC<DeviceManagerAppProps> = ({
  initialHostId = 'PC-MKT-03',
  networkEngine,
  onRefresh,
}) => {
  const [selectedHostId, setSelectedHostId] = useState<string>(initialHostId);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const allHosts = networkEngine.getAllHosts();
  const currentHost = networkEngine.getHost(selectedHostId);
  const devices = currentHost?.devices || [];

  const categories = Array.from(new Set(devices.map((d) => d.category)));

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const handleToggleStatus = (dev: DeviceItem) => {
    sound.playClick();
    const nextStatus = dev.status === 'enabled' ? 'disabled' : 'enabled';
    const ok = networkEngine.setDeviceStatus(selectedHostId, dev.id, nextStatus);
    if (ok) {
      sound.playSuccess();
      setNotice(`Device '${dev.name}' was ${nextStatus}.`);
      onRefresh?.();
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Network Adapters':
        return <Wifi size={14} className="text-sky-400" />;
      case 'Disk Drives':
        return <HardDrive size={14} className="text-amber-400" />;
      case 'Display Adapters':
        return <Monitor size={14} className="text-emerald-400" />;
      case 'Print Queues':
        return <Printer size={14} className="text-purple-400" />;
      default:
        return <Sliders size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12151c] text-slate-100 select-none font-sans text-xs">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#171b24] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <Cpu size={16} className="text-sky-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Device Manager (devmgmt.msc)
          </span>
          <span className="text-slate-500">•</span>
          <select
            value={selectedHostId}
            onChange={(e) => {
              setSelectedHostId(e.target.value);
              setSelectedDeviceId(null);
            }}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-sky-400 font-mono text-xs focus:outline-none"
          >
            {allHosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.id} ({h.hostname})
              </option>
            ))}
          </select>
        </div>

        {selectedDevice && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleStatus(selectedDevice)}
              className={`px-3 py-1 rounded font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                selectedDevice.status === 'enabled'
                  ? 'bg-rose-600/80 hover:bg-rose-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {selectedDevice.status === 'enabled' ? (
                <>
                  <PowerOff size={12} />
                  <span>Disable Device</span>
                </>
              ) : (
                <>
                  <Power size={12} />
                  <span>Enable Device</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {notice && (
        <div className="bg-emerald-950/40 border-b border-emerald-500/50 text-emerald-300 px-4 py-1.5 text-xs flex items-center space-x-2">
          <CheckCircle size={14} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Device Tree View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 flex items-center space-x-2 pb-2 border-b border-slate-800">
          <Monitor size={14} className="text-slate-300" />
          <span>
            {currentHost?.hostname} ({currentHost?.os})
          </span>
        </div>

        {categories.map((cat) => {
          const isCollapsed = collapsedCategories[cat];
          const catDevices = devices.filter((d) => d.category === cat);

          return (
            <div key={cat} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full text-left py-1 px-1.5 rounded hover:bg-slate-800/40 flex items-center space-x-2 text-slate-300 font-semibold transition-colors"
              >
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                {getCategoryIcon(cat)}
                <span>
                  {cat} ({catDevices.length})
                </span>
              </button>

              {!isCollapsed && (
                <div className="pl-6 space-y-1">
                  {catDevices.map((dev) => {
                    const isSelected = selectedDeviceId === dev.id;
                    const isDisabled = dev.status === 'disabled';

                    return (
                      <div
                        key={dev.id}
                        onClick={() => setSelectedDeviceId(dev.id)}
                        className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-600/20 border-sky-500/50 text-white'
                            : isDisabled
                            ? 'bg-amber-950/20 border-amber-800/40 text-amber-300 hover:bg-amber-950/30'
                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center space-x-2">
                            <span>{dev.name}</span>
                            {isDisabled && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950 border border-amber-600/50 text-amber-300">
                                Disabled
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Driver: {dev.driver}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(dev);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                              isDisabled
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {isDisabled ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
