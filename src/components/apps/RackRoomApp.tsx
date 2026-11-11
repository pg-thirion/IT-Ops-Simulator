import React, { useState } from 'react';
import {
  Server,
  Cable,
  HardDrive,
  BatteryCharging,
  Activity,
  CheckCircle,
  Wrench,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { RackEngine } from '../../simulation/rackEngine';
import { sound } from '../../utils/audio';

interface RackRoomAppProps {
  rackEngine: RackEngine;
  onStateChange: () => void;
}

export const RackRoomApp: React.FC<RackRoomAppProps> = ({
  rackEngine,
  onStateChange,
}) => {
  const [tdrMessages, setTdrMessages] = useState<
    Record<string, { passed: boolean; message: string }>
  >({});
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const cables = rackEngine.getCables();
  const raidArrays = rackEngine.getRaidArrays();
  const ups = rackEngine.getUpsState();

  const refreshView = () => {
    setTick((t) => t + 1);
    onStateChange();
  };

  const handleRunTdr = (cableId: string) => {
    sound.playClick();
    const res = rackEngine.runCableTdrTest(cableId);
    setTdrMessages((prev) => ({
      ...prev,
      [cableId]: { passed: res.passed, message: res.diagnosticMessage },
    }));
  };

  const handleReplaceCable = (cableId: string, switchPort: string) => {
    sound.playClick();
    const updated = rackEngine.replaceAndPatchCable(cableId, switchPort);
    if (updated) {
      sound.playSuccess();
      const res = rackEngine.runCableTdrTest(cableId);
      setTdrMessages((prev) => ({
        ...prev,
        [cableId]: { passed: res.passed, message: res.diagnosticMessage },
      }));
      setActionBanner(
        `Replaced ${cableId} with certified Cat6A patch cord and patched into ${updated.switchId} ${updated.switchPort}.`
      );
      refreshView();
    }
  };

  const handleHotSwap = (serverId: string, bayIndex: number) => {
    sound.playClick();
    const updated = rackEngine.hotSwapRaidDrive(serverId, bayIndex);
    if (updated) {
      sound.playSuccess();
      setActionBanner(
        `Hot-swapped Drive Bay ${bayIndex + 1} on ${serverId}. RAID rebuild completed — array status: ${updated.status}.`
      );
      refreshView();
    }
  };

  const handleToggleUpsBypass = () => {
    sound.playClick();
    const enableBypass = ups.mode !== 'Battery Bypass';
    const nextUps = rackEngine.toggleUpsBypass(enableBypass);
    sound.playSuccess();
    setActionBanner(
      `APC UPS switched to ${nextUps.mode} mode (${nextUps.outputVoltage.toFixed(1)}V AC output).`
    );
    refreshView();
  };

  return (
    <div className="flex flex-col h-full bg-[#11141c] text-slate-100 select-none overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <Server size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100">
              42U Data Center Server Rack &amp; Patch Panel Room
            </h1>
            <p className="text-xs text-slate-400">
              Layer-1 Cat6A Patch Matrix, TDR Fluke Cable Diagnostics, SAS/NVMe RAID Hot-Swap Bays &amp; APC UPS Telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded-full border font-bold ${
              rackEngine.isRackHealthyForTicket()
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
            }`}
          >
            {rackEngine.isRackHealthyForTicket()
              ? 'RACK TELEMETRY: NOMINAL'
              : 'RACK ALERT: LAYER-1 / RAID DEGRADED'}
          </span>
        </div>
      </div>

      {actionBanner && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle size={15} className="shrink-0" />
          <span>{actionBanner}</span>
        </div>
      )}

      {/* Section 1: Patch Panel & Cable TDR Tester */}
      <div className="bg-[#161a24] border border-slate-700/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cable size={16} className="text-sky-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Patch Panel PP-01 &amp; Fluke Cable TDR Tester
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            TIA/EIA-568 Cat6 Max Attenuation: &le; 15.0 dB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cables.map((cable) => {
            const isHealthy = cable.status === 'Good' && cable.attenuationDb <= 15;
            const tdr = tdrMessages[cable.id];
            return (
              <div
                key={cable.id}
                data-testid={`cable-card-${cable.id}`}
                className={`p-3 rounded-lg border transition-all ${
                  isHealthy
                    ? 'bg-slate-900/60 border-slate-700/60'
                    : 'bg-rose-950/20 border-rose-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {cable.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {cable.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      isHealthy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {cable.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono mb-2.5">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Patch Port</span>
                    <span className="text-slate-200">{cable.panelPort}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Switch Port</span>
                    <span className="text-indigo-300">
                      {cable.switchId} {cable.switchPort}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Attenuation</span>
                    <span
                      className={
                        cable.attenuationDb > 15
                          ? 'text-rose-400 font-bold'
                          : 'text-emerald-400'
                      }
                    >
                      {cable.attenuationDb} dB ({cable.lengthMeters}m)
                    </span>
                  </div>
                </div>

                {tdr && (
                  <div
                    className={`mb-2.5 p-2 rounded text-[11px] font-mono border ${
                      tdr.passed
                        ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                        : 'bg-rose-950/50 border-rose-600/50 text-rose-300'
                    }`}
                  >
                    {tdr.message}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunTdr(cable.id)}
                    aria-label={`Run TDR Test ${cable.id}`}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-[11px] font-semibold text-slate-200 flex items-center space-x-1 transition-colors"
                  >
                    <Activity size={12} className="text-sky-400" />
                    <span>Run TDR Test</span>
                  </button>

                  {!isHealthy && (
                    <button
                      onClick={() =>
                        handleReplaceCable(cable.id, cable.switchPort)
                      }
                      aria-label={`Replace & Patch Cable ${cable.id}`}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center space-x-1 shadow transition-colors"
                    >
                      <Wrench size={12} />
                      <span>Replace &amp; Patch Cable</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Server RAID Hot-Swap Bays */}
      <div className="bg-[#161a24] border border-slate-700/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <HardDrive size={16} className="text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Server Storage Arrays &amp; SAS/NVMe RAID Hot-Swap Bays
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {raidArrays.map((array) => {
            const isHealthy = array.status === 'Healthy';
            return (
              <div
                key={array.serverId}
                data-testid={`raid-array-${array.serverId}`}
                className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-700/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-100">
                      {array.serverId}
                    </span>
                    <span className="ml-2 text-xs font-mono text-indigo-400">
                      ({array.raidLevel})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      isHealthy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {array.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {array.bays.map((bay) => {
                    const isFaulty = bay.status === 'Faulty';
                    const bayNumber = bay.bayIndex + 1;
                    return (
                      <div
                        key={bay.bayIndex}
                        className={`p-2.5 rounded border text-xs flex flex-col justify-between ${
                          isFaulty
                            ? 'bg-rose-950/30 border-rose-500/60'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-200">
                            Bay {bayNumber}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              isFaulty
                                ? 'bg-rose-500/25 text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {bay.status}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                          <div>SN: {bay.serial}</div>
                          <div>
                            Cap: {bay.capacityTb} TB | S.M.A.R.T. Errors:{' '}
                            <span
                              className={
                                bay.smartErrors > 0
                                  ? 'text-rose-400 font-bold'
                                  : 'text-emerald-400'
                              }
                            >
                              {bay.smartErrors}
                            </span>
                          </div>
                        </div>

                        {isFaulty && (
                          <button
                            onClick={() =>
                              handleHotSwap(array.serverId, bay.bayIndex)
                            }
                            className="mt-2 w-full px-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold flex items-center justify-center space-x-1 shadow transition-colors"
                          >
                            <RefreshCw size={11} />
                            <span>Hot-Swap Drive Bay {bayNumber}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: APC UPS Telemetry */}
      <div className="bg-[#161a24] border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <BatteryCharging size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {ups.model} Smart-UPS Telemetry
              </h2>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold">
                Mode: {ups.mode}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs font-mono text-slate-300">
              <span>Input: {ups.inputVoltage.toFixed(1)}V AC</span>
              <span>Output: {ups.outputVoltage.toFixed(1)}V AC</span>
              <span>Battery: {ups.batteryChargePercent}%</span>
              <span>Load: {ups.loadPercent}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleUpsBypass}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
        >
          <Zap size={14} />
          <span>Toggle UPS Bypass</span>
        </button>
      </div>
    </div>
  );
};
