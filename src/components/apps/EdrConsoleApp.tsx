import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Activity,
  WifiOff,
  FileWarning,
  RefreshCw,
  AlertOctagon,
  Hash,
  Server,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
} from 'lucide-react';
import { SecurityEngine } from '../../simulation/securityEngine';
import { NetworkEngine } from '../../simulation/networkEngine';
import { OutbreakEngine } from '../../simulation/outbreakEngine';
import { EdrDetection, ThreatStatus, ThreatSeverity } from '../../types/security';
import { sound } from '../../utils/audio';

interface EdrConsoleAppProps {
  securityEngine: SecurityEngine;
  networkEngine: NetworkEngine;
  outbreakEngine?: OutbreakEngine;
  onRefresh?: () => void;
}

export const EdrConsoleApp: React.FC<EdrConsoleAppProps> = ({
  securityEngine,
  networkEngine: _networkEngine,
  outbreakEngine,
  onRefresh,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<'All' | ThreatStatus>('Active');
  const [selectedThreatId, setSelectedThreatId] = useState<string>('DET-101');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fleetStats = securityEngine.getFleetStats();
  const signatureVersion = securityEngine.getSignatureVersion();
  const lastUpdate = securityEngine.getLastSignatureUpdate();

  const allDetections = securityEngine.getDetections();
  const filteredDetections =
    selectedStatusTab === 'All'
      ? allDetections
      : allDetections.filter((d) => d.status === selectedStatusTab);

  const selectedThreat: EdrDetection | undefined =
    filteredDetections.find((d) => d.id === selectedThreatId) ||
    allDetections.find((d) => d.id === selectedThreatId) ||
    filteredDetections[0];

  const isHostCurrentlyIsolated = selectedThreat
    ? securityEngine.isHostIsolated(selectedThreat.hostId)
    : false;

  const isOutbreakActive = outbreakEngine ? outbreakEngine.isOutbreakActive() : false;

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectThreat = (threat: EdrDetection) => {
    sound.playClick();
    setSelectedThreatId(threat.id);
  };

  const handleToggleIsolation = () => {
    if (!selectedThreat) return;
    sound.playClick();
    if (isHostCurrentlyIsolated) {
      const ok = securityEngine.unisolateHost(selectedThreat.hostId);
      if (ok) {
        sound.playSuccess();
        showToast('info', `Host '${selectedThreat.hostId}' unisolated. Network connectivity restored.`);
        onRefresh?.();
      }
    } else {
      const ok = securityEngine.isolateHost(selectedThreat.hostId);
      if (ok) {
        sound.playSuccess();
        showToast('success', `Host '${selectedThreat.hostId}' quarantined & isolated at the switch port.`);
        onRefresh?.();
      }
    }
  };

  const handleTerminateThreat = () => {
    if (!selectedThreat) return;
    sound.playClick();
    const res = securityEngine.terminateThreat(selectedThreat.id);
    if (res.success) {
      sound.playSuccess();
      showToast('success', res.message);
      onRefresh?.();
    } else {
      sound.playError();
      showToast('error', res.message);
    }
  };

  const handleQuarantineFile = () => {
    if (!selectedThreat) return;
    sound.playClick();
    const res = securityEngine.quarantineFile(selectedThreat.id);
    if (res.success) {
      sound.playSuccess();
      showToast('success', res.message);
      onRefresh?.();
    } else {
      sound.playError();
      showToast('error', res.message);
    }
  };

  const handleUpdateSignatures = () => {
    sound.playClick();
    const res = securityEngine.updateThreatSignatures();
    if (res.updated) {
      sound.playSuccess();
      showToast('success', res.message);
      onRefresh?.();
    }
  };

  const handleHaltOutbreak = () => {
    if (!outbreakEngine) return;
    sound.playClick();
    outbreakEngine.stopOutbreak();
    const patientZero = outbreakEngine.getPatientZeroHost();
    if (patientZero) {
      securityEngine.isolateHost(patientZero);
      const detections = securityEngine.getDetections().filter((d) => d.hostId === patientZero);
      detections.forEach((d) => {
        securityEngine.terminateThreat(d.id);
      });
    }
    sound.playSuccess();
    showToast('success', 'Ransomware outbreak halted! Patient Zero isolated and malicious processes terminated.');
    onRefresh?.();
  };

  const getSeverityBadge = (sev: ThreatSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/25 text-red-300 border-red-500/50';
      case 'High':
        return 'bg-orange-500/25 text-orange-300 border-orange-500/50';
      case 'Medium':
        return 'bg-amber-500/25 text-amber-300 border-amber-500/50';
      case 'Low':
        return 'bg-blue-500/25 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: ThreatStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Remediated':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Quarantined':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Investigating':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
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
            <ShieldAlert size={15} className="text-indigo-400 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Outbreak Warning Banner */}
      {isOutbreakActive && (
        <div className="bg-red-950/90 border-b border-red-500/80 px-4 py-2.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5">
            <Flame size={18} className="text-red-400 animate-bounce" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-200">
                CRITICAL OUTBREAK DETECTED: Active Ransomware Spread in Progress!
              </span>
              <span className="text-[11px] text-red-300 ml-2">
                Network shares being actively encrypted. Immediate containment required.
              </span>
            </div>
          </div>
          <button
            onClick={handleHaltOutbreak}
            className="flex items-center space-x-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs uppercase tracking-wide shadow-lg border border-red-400 transition-colors"
          >
            <AlertOctagon size={14} />
            <span>Halt &amp; Clean Outbreak</span>
          </button>
        </div>
      )}

      {/* Top Header & Signature Version */}
      <div className="p-3 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert size={20} className="text-rose-400" />
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <span>Enterprise EDR &amp; Endpoint Protection</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono">
                Live Sensor Feed
              </span>
            </h1>
            <div className="text-[11px] text-slate-400">
              Signatures: <span className="font-mono text-slate-200">v{signatureVersion}</span> &bull; Updated: {lastUpdate}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpdateSignatures}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-sky-300 border border-slate-700 rounded text-xs font-medium transition-colors"
          >
            <RefreshCw size={12} />
            <span>Update Threat Signatures</span>
          </button>
          <button
            onClick={() => onRefresh?.()}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            title="Refresh EDR data"
          >
            <Activity size={14} />
          </button>
        </div>
      </div>

      {/* Fleet Health Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-900/40 border-b border-slate-700/60">
        <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
          <div className="p-2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Server size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Endpoints</div>
            <div className="text-lg font-bold font-mono text-white">{fleetStats.totalHosts}</div>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Clean Hosts</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{fleetStats.cleanHosts}</div>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
          <div className="p-2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Infected Hosts</div>
            <div className="text-lg font-bold font-mono text-rose-400">{fleetStats.infectedHosts}</div>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <WifiOff size={18} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Isolated Hosts</div>
            <div className="text-lg font-bold font-mono text-amber-400">{fleetStats.isolatedHosts}</div>
          </div>
        </div>
      </div>

      {/* Main Content: Table + Threat Inspector */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Detections Table */}
        <div className="flex-1 flex flex-col border-r border-slate-700/60 bg-[#141720]">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 p-2 border-b border-slate-700/60 bg-slate-900/60 text-xs">
            {(['Active', 'Remediated', 'Quarantined', 'All'] as const).map((tab) => {
              const count =
                tab === 'All'
                  ? allDetections.length
                  : allDetections.filter((d) => d.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    sound.playClick();
                    setSelectedStatusTab(tab);
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    selectedStatusTab === tab
                      ? 'bg-rose-600/25 text-rose-200 border border-rose-500/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detections List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {filteredDetections.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center">
                <ShieldCheck size={32} className="text-slate-600 mb-2" />
                <span>No detections found in '{selectedStatusTab}' category.</span>
              </div>
            ) : (
              filteredDetections.map((detection) => {
                const isSelected = selectedThreat?.id === detection.id;
                const isIsolated = securityEngine.isHostIsolated(detection.hostId);
                return (
                  <div
                    key={detection.id}
                    onClick={() => handleSelectThreat(detection)}
                    className={`p-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-rose-950/30 border-l-2 border-rose-500'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {detection.id}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getSeverityBadge(
                            detection.severity
                          )}`}
                        >
                          {detection.severity}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getStatusBadge(
                            detection.status
                          )}`}
                        >
                          {detection.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {detection.timestamp}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 truncate mb-1">
                      {detection.threatName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>
                        Host: <strong className="text-sky-300">{detection.hostId}</strong>
                        {isIsolated && (
                          <span className="ml-1.5 text-amber-400 font-sans font-bold">[ISOLATED]</span>
                        )}
                      </span>
                      <span>PID: {detection.processId} ({detection.processName})</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Threat Inspector */}
        <div className="w-96 flex flex-col bg-[#12151c] shrink-0 border-l border-slate-700/60">
          {selectedThreat ? (
            <>
              {/* Inspector Header */}
              <div className="p-3.5 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Incident Forensic Details
                  </div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">
                    {selectedThreat.id}
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getSeverityBadge(
                      selectedThreat.severity
                    )}`}
                  >
                    {selectedThreat.severity}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getStatusBadge(
                      selectedThreat.status
                    )}`}
                  >
                    {selectedThreat.status}
                  </span>
                </div>
              </div>

              {/* Threat Details Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Threat Name
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-slate-100 font-semibold text-xs leading-snug">
                    {selectedThreat.threatName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Behavioral Detection Summary
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 text-xs leading-relaxed">
                    {selectedThreat.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Target Host</div>
                    <div className="text-xs font-mono font-bold text-sky-300 mt-0.5">
                      {selectedThreat.hostId}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{selectedThreat.hostname}</div>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Process &amp; PID</div>
                    <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                      PID {selectedThreat.processId}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {selectedThreat.processName}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    File System Path
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-text">
                    {selectedThreat.filePath}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center space-x-1">
                    <Hash size={11} />
                    <span>SHA-256 File Hash</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-text leading-tight">
                    {selectedThreat.fileHash}
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Host Network Isolation:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isHostCurrentlyIsolated
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {isHostCurrentlyIsolated ? 'ISOLATED' : 'ONLINE'}
                  </span>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="p-3 border-t border-slate-700/60 bg-[#161922] space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  SecOps Remediation Actions
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleToggleIsolation}
                    className={`flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded text-xs font-semibold transition-colors border ${
                      isHostCurrentlyIsolated
                        ? 'bg-emerald-700/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-700/40'
                        : 'bg-amber-600/30 text-amber-300 border-amber-500/50 hover:bg-amber-600/40'
                    }`}
                  >
                    <WifiOff size={13} />
                    <span>{isHostCurrentlyIsolated ? 'Unisolate Host' : 'Isolate Host'}</span>
                  </button>

                  <button
                    onClick={handleTerminateThreat}
                    className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded bg-rose-600/30 text-rose-200 border border-rose-500/50 hover:bg-rose-600/40 text-xs font-semibold transition-colors"
                  >
                    <Zap size={13} />
                    <span>Terminate Threat</span>
                  </button>
                </div>

                <button
                  onClick={handleQuarantineFile}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  <FileWarning size={13} />
                  <span>Quarantine File Payload</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-6">
              <Shield size={36} className="text-slate-600 mb-2" />
              <span>Select a detection to inspect forensic artifact</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};