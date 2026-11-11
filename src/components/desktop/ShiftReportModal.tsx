import React from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  X,
} from 'lucide-react';
import type { ShiftReportCard } from '../../types/shiftEvent';
import { sound } from '../../utils/audio';

interface ShiftReportModalProps {
  report: ShiftReportCard;
  isOpen: boolean;
  onClose: () => void;
  onNextShift: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onNextShift,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-testid="shift-report-modal"
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className="w-full max-w-lg bg-[#141824] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-950/90 to-slate-900 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                End of Shift Report — Day {report.day}
              </h2>
              <p className="text-xs text-slate-400">
                NOC Shift Post-Mortem &amp; SLA Performance Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close Shift Report"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Grade Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Overall Shift SLA Rating
              </div>
              <div className="text-sm text-slate-300 mt-0.5">
                Evaluated on ticket throughput, zero-violation changes &amp; node uptime
              </div>
            </div>
            <div
              data-testid="shift-grade-badge"
              className="px-4 py-2 rounded-xl bg-indigo-600/25 border border-indigo-400/50 text-indigo-300 font-mono text-xl font-extrabold"
            >
              Grade {report.grade}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2
                size={18}
                className="mx-auto text-emerald-400 mb-1"
              />
              <div className="text-lg font-bold font-mono text-white">
                {report.ticketsResolved}
              </div>
              <div className="text-[11px] text-slate-400">Tickets Resolved</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck size={18} className="mx-auto text-sky-400 mb-1" />
              <div className="text-lg font-bold font-mono text-white">
                {report.slaAdherenceRate}%
              </div>
              <div className="text-[11px] text-slate-400">SLA Adherence</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <TrendingUp size={18} className="mx-auto text-amber-400 mb-1" />
              <div className="text-lg font-bold font-mono text-white">
                {report.uptimePercent}%
              </div>
              <div className="text-[11px] text-slate-400">
                Infrastructure Uptime
              </div>
            </div>
          </div>

          {/* Bonus Payouts */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Shift Performance Bonus Rewards
            </span>
            <div className="flex items-center space-x-3 font-mono text-sm font-bold text-emerald-300">
              <span>+R{report.bonusCash}</span>
              <span>+{report.bonusXp} XP</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Close Report
          </button>
          <button
            onClick={() => {
              sound.playSuccess();
              onNextShift();
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-colors"
          >
            <span>Start Next Shift</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
