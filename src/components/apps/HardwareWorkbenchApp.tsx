import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Zap,
  Power,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  Sparkles,
  Thermometer,
  Gauge,
  Box,
} from 'lucide-react';
import { HardwareEngine } from '../../simulation/hardwareEngine';
import { HardwareWorkbenchState, HardwareComponent, PsuRails } from '../../types/hardware';
import { sound } from '../../utils/audio';

interface HardwareWorkbenchAppProps {
  hardwareEngine: HardwareEngine;
  onRefresh?: () => void;
}

export const HardwareWorkbenchApp: React.FC<HardwareWorkbenchAppProps> = ({
  hardwareEngine,
  onRefresh,
}) => {
  const [benchState, setBenchState] = useState<HardwareWorkbenchState>(
    hardwareEngine.getBenchState()
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('RAM_SLOT_1');
  const [psuRailReadings, setPsuRailReadings] = useState<PsuRails | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const refreshState = () => {
    setBenchState(hardwareEngine.getBenchState());
    onRefresh?.();
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleTogglePower = () => {
    sound.playClick();
    if (benchState.poweredOn) {
      hardwareEngine.powerOff();
      setPsuRailReadings(null);
      refreshState();
    } else {
      const res = hardwareEngine.powerOn();
      if (res.success) {
        sound.playSuccess();
        showToast('success', `POST PASSED: Code ${res.postCode} - All hardware verified! Host functional.`);
      } else {
        sound.playError();
        showToast('error', `POST FAILED: Code ${res.postCode} - ${res.postMessage}`);
      }
      refreshState();
    }
  };

  const handleApplyPaste = () => {
    sound.playClick();
    if (benchState.poweredOn) {
      sound.playError();
      showToast('error', 'Safety Hazard: Power off the workstation before servicing the CPU socket!');
      return;
    }
    const ok = hardwareEngine.reapplyThermalPaste();
    if (ok) {
      sound.playSuccess();
      showToast('success', 'Applied fresh Thermal Grizzly Kryonaut compound. CPU thermal transfer restored.');
      refreshState();
    }
  };

  const handleInstallPart = (invPart: HardwareComponent) => {
    sound.playClick();
    if (benchState.poweredOn) {
      sound.playError();
      showToast('error', 'Short Circuit Risk: Turn off the main PSU switch before swapping components!');
      return;
    }

    if (invPart.id === 'INV-PASTE-01') {
      handleApplyPaste();
      return;
    }

    // Determine target slot
    let targetSlot: 'RAM_SLOT_1' | 'RAM_SLOT_2' | 'NVME' | 'PSU' | 'NIC' = 'RAM_SLOT_1';
    if (invPart.slot === 'RAM_SLOT_1' || invPart.slot === 'RAM_SLOT_2') {
      // If user selected slot 2 or slot 1 is good, prioritize slot 2 or selected
      if (selectedSlot === 'RAM_SLOT_2') {
        targetSlot = 'RAM_SLOT_2';
      } else {
        targetSlot = 'RAM_SLOT_1';
      }
    } else if (invPart.slot === 'NVME') {
      targetSlot = 'NVME';
    } else if (invPart.slot === 'PSU') {
      targetSlot = 'PSU';
    } else if (invPart.slot === 'NIC') {
      targetSlot = 'NIC';
    }

    const ok = hardwareEngine.swapComponent(targetSlot, invPart.id);
    if (ok) {
      sound.playSuccess();
      showToast('success', `Installed '${invPart.name}' into ${targetSlot}.`);
      setSelectedSlot(targetSlot);
      refreshState();
    } else {
      sound.playError();
      showToast('error', 'Failed to install component.');
    }
  };

  const handleTestPsuRails = () => {
    sound.playClick();
    if (!benchState.poweredOn) {
      sound.playError();
      showToast('error', 'Multimeter reading failed: PSU is powered off.');
      return;
    }
    const rails = hardwareEngine.testPsuRails();
    setPsuRailReadings(rails);
    if (rails.isGood) {
      sound.playSuccess();
      showToast('success', 'PSU ATX 12V / 5V / 3.3V power rails are operating within nominal tolerance.');
    } else {
      sound.playError();
      showToast('error', 'PSU rails out of spec! Low voltage delivery detected.');
    }
  };

  const selectedComponent: HardwareComponent | undefined =
    selectedSlot === 'THERMAL_PASTE'
      ? undefined
      : benchState.components[selectedSlot];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Defective':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Unseated':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Overheating':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Missing':
        return 'bg-slate-700 text-slate-400 border-slate-600';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-full select-none text-slate-100 bg-[#12151c] relative overflow-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`absolute top-3 right-4 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-md shadow-lg border text-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500/60 text-indigo-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : notification.type === 'error' ? (
            <XCircle size={15} className="text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle size={15} className="text-indigo-400 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Top Header & Workstation Banner */}
      <div className="p-3 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <Wrench size={20} className="text-amber-400" />
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <span>Hardware Diagnostic &amp; Assembly Workbench</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                LGA1700 ATX
              </span>
            </h1>
            <div className="text-[11px] text-slate-400">
              Host Under Test: <strong className="text-white font-mono">{benchState.hostId}</strong> ({benchState.hostname})
            </div>
          </div>
        </div>

        {/* Master Power Switch & LED Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-700">
            <span
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                benchState.poweredOn
                  ? benchState.postCode === '00'
                    ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                    : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                  : 'bg-slate-700'
              }`}
            />
            <span className="text-xs font-mono font-bold">
              {benchState.poweredOn ? 'POWER: ON' : 'POWER: OFF'}
            </span>
          </div>

          <button
            onClick={handleTogglePower}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow ${
              benchState.poweredOn
                ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
            }`}
          >
            <Power size={14} />
            <span>{benchState.poweredOn ? 'Power Off' : 'Power On'}</span>
          </button>
        </div>
      </div>

      {/* POST Code Header HUD */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          {/* 7-Segment Digital Display */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              POST Code:
            </span>
            <div
              className={`px-3 py-1 rounded bg-black border font-mono text-xl font-bold tracking-widest shadow-inner ${
                !benchState.poweredOn
                  ? 'text-slate-800 border-slate-900'
                  : benchState.postCode === '00'
                  ? 'text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              }`}
            >
              {benchState.poweredOn ? benchState.postCode : '--'}
            </div>
          </div>

          {/* Diagnostic Message */}
          <div className="text-xs font-mono">
            {benchState.poweredOn ? (
              benchState.postCode === '00' ? (
                <span className="text-emerald-300 font-bold flex items-center space-x-1">
                  <CheckCircle2 size={14} />
                  <span>{benchState.postMessage}</span>
                </span>
              ) : (
                <span className="text-rose-300 font-bold flex items-center space-x-1">
                  <AlertTriangle size={14} />
                  <span>{benchState.postMessage}</span>
                </span>
              )
            ) : (
              <span className="text-slate-500">System standby. Power on to run POST hardware evaluation.</span>
            )}
          </div>
        </div>

        {benchState.repaired && (
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase flex items-center space-x-1 animate-pulse">
            <Sparkles size={13} />
            <span>Hardware Repaired! Ready for deployment</span>
          </span>
        )}
      </div>

      {/* Main Content: Motherboard Schematic + Inspector + Inventory Shelf */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Interactive Motherboard Schematic */}
        <div className="flex-1 flex flex-col p-4 bg-[#141720] overflow-y-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Motherboard Physical Topography (Click socket to inspect)</span>
            <span className="text-slate-500">Form Factor: ATX 305x244mm</span>
          </div>

          {/* Motherboard PCB Board Container */}
          <div className="relative flex-1 min-h-[380px] bg-[#0c1c14] border-2 border-emerald-900/60 rounded-xl p-4 shadow-2xl flex flex-col justify-between">
            {/* PCB Traces visual subtle lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#14532d_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none rounded-xl" />

            {/* Top Row: CPU Socket & RAM Slots */}
            <div className="grid grid-cols-12 gap-4 relative z-10">
              {/* CPU Socket */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedSlot('CPU');
                }}
                className={`col-span-5 p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSlot === 'CPU'
                    ? 'border-amber-400 bg-emerald-950/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'border-emerald-700/60 bg-emerald-950/40 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Cpu size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      LGA1700 Socket
                    </span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${getStatusBadge(
                      benchState.components['CPU']?.status || 'Good'
                    )}`}
                  >
                    {benchState.components['CPU']?.status}
                  </span>
                </div>

                <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                  {benchState.components['CPU']?.name}
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-emerald-900/60">
                  <span>Paste:</span>
                  <span
                    className={`font-bold font-mono ${
                      benchState.thermalPasteCondition === 'Good'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {benchState.thermalPasteCondition.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* RAM Slot 1 & RAM Slot 2 */}
              <div className="col-span-7 grid grid-cols-2 gap-2">
                {/* DIMM Slot 1 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedSlot('RAM_SLOT_1');
                  }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedSlot === 'RAM_SLOT_1'
                      ? 'border-amber-400 bg-emerald-950/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'border-emerald-700/60 bg-emerald-950/40 hover:border-emerald-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-white uppercase">DIMM Slot 1</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase ${getStatusBadge(
                          benchState.components['RAM_SLOT_1']?.status || 'Missing'
                        )}`}
                      >
                        {benchState.components['RAM_SLOT_1']?.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-200 line-clamp-2 leading-tight">
                      {benchState.components['RAM_SLOT_1']?.name}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-2">DDR5 Channel A</div>
                </div>

                {/* DIMM Slot 2 */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedSlot('RAM_SLOT_2');
                  }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    selectedSlot === 'RAM_SLOT_2'
                      ? 'border-amber-400 bg-emerald-950/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'border-emerald-700/60 bg-emerald-950/40 hover:border-emerald-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-white uppercase">DIMM Slot 2</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold uppercase ${getStatusBadge(
                          benchState.components['RAM_SLOT_2']?.status || 'Missing'
                        )}`}
                      >
                        {benchState.components['RAM_SLOT_2']?.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-200 line-clamp-2 leading-tight">
                      {benchState.components['RAM_SLOT_2']?.name}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-2">DDR5 Channel B</div>
                </div>
              </div>
            </div>

            {/* Middle Row: NVMe M.2 Slot & PCIe Bus */}
            <div className="grid grid-cols-12 gap-4 my-3 relative z-10">
              {/* NVMe M.2 */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedSlot('NVME');
                }}
                className={`col-span-8 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSlot === 'NVME'
                    ? 'border-amber-400 bg-emerald-950/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'border-emerald-700/60 bg-emerald-950/40 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <HardDrive size={15} className="text-sky-400" />
                    <span className="text-[11px] font-bold text-white uppercase">M.2 NVMe PCIe 4.0 x4</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${getStatusBadge(
                      benchState.components['NVME']?.status || 'Good'
                    )}`}
                  >
                    {benchState.components['NVME']?.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-200 truncate">
                  {benchState.components['NVME']?.name}
                </div>
              </div>

              {/* NIC */}
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedSlot('NIC');
                }}
                className={`col-span-4 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSlot === 'NIC'
                    ? 'border-amber-400 bg-emerald-950/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                    : 'border-emerald-700/60 bg-emerald-950/40 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-white uppercase">Integrated NIC</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${getStatusBadge(
                      benchState.components['NIC']?.status || 'Good'
                    )}`}
                  >
                    {benchState.components['NIC']?.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  {benchState.components['NIC']?.name}
                </div>
              </div>
            </div>

            {/* Bottom Row: ATX Power Supply Unit */}
            <div
              onClick={() => {
                sound.playClick();
                setSelectedSlot('PSU');
              }}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all relative z-10 ${
                selectedSlot === 'PSU'
                  ? 'border-amber-400 bg-emerald-950/80 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'border-emerald-700/60 bg-emerald-950/40 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Zap size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase">
                    ATX 24-Pin Main Power Delivery
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${getStatusBadge(
                      benchState.components['PSU']?.status || 'Good'
                    )}`}
                  >
                    {benchState.components['PSU']?.status}
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-200">
                {benchState.components['PSU']?.name} &bull; {benchState.components['PSU']?.specs}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Component Inspector & Inventory Parts Shelf */}
        <div className="w-96 flex flex-col bg-[#12151c] border-l border-slate-700/60 shrink-0">
          {/* Component Inspector Header */}
          <div className="p-3.5 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Slot Inspector: <span className="text-amber-400 font-mono">{selectedSlot}</span>
            </h3>
            {selectedComponent && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getStatusBadge(
                  selectedComponent.status
                )}`}
              >
                {selectedComponent.status}
              </span>
            )}
          </div>

          {/* Inspector Body */}
          <div className="p-4 space-y-3.5 border-b border-slate-700/60 text-xs">
            {selectedComponent ? (
              <>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                    Hardware Specification
                  </div>
                  <div className="font-semibold text-slate-100 text-xs">{selectedComponent.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">
                    {selectedComponent.specs}
                  </div>
                </div>

                {/* CPU Specific Controls: Thermal Paste */}
                {selectedSlot === 'CPU' && (
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                        <Thermometer size={14} className="text-amber-400" />
                        <span>Thermal Paste Condition:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          benchState.thermalPasteCondition === 'Good'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {benchState.thermalPasteCondition}
                      </span>
                    </div>

                    <button
                      onClick={handleApplyPaste}
                      className="w-full py-1.5 px-2 bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/50 rounded text-xs font-semibold transition-colors"
                    >
                      Re-apply Thermal Paste Compound
                    </button>
                  </div>
                )}

                {/* PSU Specific Controls: Multimeter Rail Readings */}
                {selectedSlot === 'PSU' && (
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                        <Gauge size={14} className="text-amber-400" />
                        <span>PSU Rail Multimeter:</span>
                      </span>
                      <button
                        onClick={handleTestPsuRails}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-[10px] font-mono"
                      >
                        Test Rails
                      </button>
                    </div>

                    {psuRailReadings ? (
                      <div className="grid grid-cols-3 gap-1.5 text-center pt-1 font-mono">
                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-[9px] text-slate-400">+12V Rail</div>
                          <div
                            className={`text-xs font-bold ${
                              psuRailReadings.rail12V > 11.4 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {psuRailReadings.rail12V}V
                          </div>
                        </div>

                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-[9px] text-slate-400">+5V Rail</div>
                          <div
                            className={`text-xs font-bold ${
                              psuRailReadings.rail5V > 4.75 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {psuRailReadings.rail5V}V
                          </div>
                        </div>

                        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                          <div className="text-[9px] text-slate-400">+3.3V Rail</div>
                          <div
                            className={`text-xs font-bold ${
                              psuRailReadings.rail3V3 > 3.13 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {psuRailReadings.rail3V3}V
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic">
                        Power on system and click "Test Rails" for live voltage metrics.
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500 italic">No component selected.</div>
            )}
          </div>

          {/* Spare Parts Shelf */}
          <div className="flex-1 flex flex-col p-4 bg-[#141720] overflow-y-auto">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
              <Box size={13} className="text-amber-400" />
              <span>Technician Parts Inventory Shelf</span>
            </div>

            <div className="space-y-2 flex-1">
              {benchState.inventoryParts.length === 0 ? (
                <div className="text-xs text-slate-500 italic">Inventory shelf is empty.</div>
              ) : (
                benchState.inventoryParts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInstallPart(item)}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all group flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{item.specs}</div>
                    </div>

                    <button
                      disabled={benchState.poweredOn}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase font-mono shrink-0 transition-colors ${
                        benchState.poweredOn
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          : 'bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      Install
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};