import React, { useState } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  FileText,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { ChangeEngine } from '../../simulation/changeEngine';
import { ShiftEventEngine } from '../../simulation/shiftEventEngine';
import { sound } from '../../utils/audio';

interface ChangeControlAppProps {
  changeEngine: ChangeEngine;
  shiftEventEngine: ShiftEventEngine;
  onStateChange: () => void;
}

export const ChangeControlApp: React.FC<ChangeControlAppProps> = ({
  changeEngine,
  shiftEventEngine,
  onStateChange,
}) => {
  const [selectedId, setSelectedId] = useState<string>('CR-202');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [, setTick] = useState(0);

  const requests = changeEngine.getChangeRequests();
  const selectedReq =
    changeEngine.getChangeRequest(selectedId) ?? requests[0];
  const sslValid = shiftEventEngine.isSslValid('WEB-INTRA-01');

  const refresh = () => {
    setTick((t) => t + 1);
    onStateChange();
  };

  const handleToggleFailover = () => {
    if (!selectedReq) return;
    sound.playClick();
    const updated = changeEngine.toggleFailoverReplica(
      selectedReq.id,
      !selectedReq.isFailoverActive
    );
    if (updated) {
      sound.playSuccess();
      setFeedback({
        type: 'success',
        message: updated.cabNotes,
      });
      refresh();
    }
  };

  const handleAttachRollback = () => {
    if (!selectedReq) return;
    sound.playClick();
    const updated = changeEngine.attachRollbackPlan(selectedReq.id);
    if (updated) {
      sound.playSuccess();
      setFeedback({
        type: 'success',
        message: updated.cabNotes,
      });
      refresh();
    }
  };

  const handleRequestCab = () => {
    if (!selectedReq) return;
    sound.playClick();
    const res = changeEngine.requestCabApproval(selectedReq.id);
    if (res.success) {
      sound.playSuccess();
      setFeedback({ type: 'success', message: res.message });
    } else {
      sound.playError();
      setFeedback({ type: 'error', message: res.message });
    }
    refresh();
  };

  const handleExecuteMaintenance = () => {
    if (!selectedReq) return;
    sound.playClick();
    const res = changeEngine.executeChangeMaintenance(selectedReq.id);
    if (res.success) {
      sound.playSuccess();
      setFeedback({ type: 'success', message: res.message });
    } else {
      sound.playError();
      setFeedback({ type: 'error', message: res.message });
    }
    refresh();
  };

  const handleRenewSsl = () => {
    sound.playClick();
    const res = shiftEventEngine.renewSslCertificate('WEB-INTRA-01');
    if (res.success) {
      sound.playSuccess();
      setFeedback({ type: 'success', message: res.message });
      refresh();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#11151e] text-slate-100 select-none overflow-y-auto p-5 space-y-5">
      {/* Top Card: PKI / TLS Certificate Operations */}
      <div className="bg-[#171c28] border border-slate-700/70 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-lg border ${
              sslValid
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            }`}
          >
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                PKI / TLS Certificate Operations — WEB-INTRA-01 (portal.corp.local)
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  sslValid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {sslValid ? 'Valid TLS 1.3 Certificate' : 'EXPIRED CERTIFICATE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              X.509 Wildcard Certificate (*.corp.local) bound to Nginx 443 on WEB-INTRA-01
            </p>
          </div>
        </div>

        <button
          onClick={handleRenewSsl}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
        >
          <RefreshCw size={14} />
          <span>Renew TLS Certificate</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle size={15} className="shrink-0" />
          ) : (
            <AlertTriangle size={15} className="shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Content: Change Request List + Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Left List */}
        <div className="bg-[#161a25] border border-slate-700/60 rounded-xl p-3 space-y-2">
          <div className="flex items-center space-x-2 px-1 pb-2 border-b border-slate-800">
            <ClipboardCheck size={15} className="text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              ITIL Change Request Queue
            </span>
          </div>

          <div className="space-y-2">
            {requests.map((req) => {
              const isSelected = req.id === selectedReq?.id;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedId(req.id);
                    setFeedback(null);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/60'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {req.id}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        req.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : req.status === 'Approved'
                          ? 'bg-sky-500/20 text-sky-300'
                          : req.status === 'Violated'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {req.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Target: {req.targetHostId} | Risk: {req.riskLevel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail View */}
        {selectedReq && (
          <div className="md:col-span-2 bg-[#161a25] border border-slate-700/60 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-indigo-400">
                    {selectedReq.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                    Target: {selectedReq.targetHostId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold">
                    Risk: {selectedReq.riskLevel}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-1">
                  {selectedReq.title}
                </h2>
              </div>

              <span
                data-testid="selected-cr-status"
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedReq.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : selectedReq.status === 'Approved'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : selectedReq.status === 'Violated'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {selectedReq.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedReq.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">
                  Maintenance Window
                </span>
                <span className="text-slate-200 font-semibold">
                  {selectedReq.maintenanceWindow}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">
                  HA Failover Replica
                </span>
                <span
                  className={
                    selectedReq.isFailoverActive
                      ? 'text-emerald-400 font-bold'
                      : 'text-amber-400 font-bold'
                  }
                >
                  {selectedReq.isFailoverActive ? 'ACTIVE (SYNCED)' : 'INACTIVE'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">
                  Rollback Snapshot Plan
                </span>
                <span
                  className={
                    selectedReq.hasRollbackPlan
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {selectedReq.hasRollbackPlan ? 'ATTACHED' : 'MISSING'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                CAB Review Notes
              </span>
              <span className="text-slate-200 font-mono">
                {selectedReq.cabNotes}
              </span>
            </div>

            {/* Workflow Controls */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleToggleFailover}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <ShieldCheck size={14} className="text-sky-400" />
                <span>Enable HA Failover Replica</span>
              </button>

              <button
                onClick={handleAttachRollback}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <FileText size={14} className="text-amber-400" />
                <span>Attach Rollback Plan</span>
              </button>

              <button
                onClick={handleRequestCab}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
              >
                <ClipboardCheck size={14} />
                <span>Request CAB Approval</span>
              </button>

              <button
                onClick={handleExecuteMaintenance}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
              >
                <Play size={14} />
                <span>Execute Maintenance</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
