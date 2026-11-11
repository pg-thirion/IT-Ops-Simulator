import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOff,
  User,
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { PhoneEngine } from '../../simulation/phoneEngine';
import { PhoneCall, DialogueNode, DialogueChoice } from '../../types/phone';
import { sound } from '../../utils/audio';

interface VoipPhoneAppProps {
  phoneEngine: PhoneEngine;
  onRefresh?: () => void;
}

export const VoipPhoneApp: React.FC<VoipPhoneAppProps> = ({
  phoneEngine,
  onRefresh,
}) => {
  const [dialedNumber, setDialedNumber] = useState<string>('');
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [clueNotification, setClueNotification] = useState<string | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState<number>(100);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  // Poll active call from engine or default to first call
  const activeCall: PhoneCall | null =
    (selectedCallId ? phoneEngine.getCall(selectedCallId) : null) ||
    phoneEngine.getActiveCall() ||
    phoneEngine.getCalls()[0] ||
    null;

  const isConnected = activeCall?.status === 'Connected';

  // Duration timer effect when connected
  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isConnected, activeCall?.id]);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleDialDigit = (digit: string) => {
    sound.playClick();
    if (dialedNumber.length < 12) {
      setDialedNumber((prev) => prev + digit);
    }
  };

  const handleAnswer = () => {
    if (!activeCall) return;
    sound.playClick();
    setCallDurationSeconds(0);
    const ok = phoneEngine.answerCall(activeCall.id);
    if (ok) {
      sound.playSuccess();
      onRefresh?.();
    }
  };

  const handleEndCall = () => {
    if (!activeCall) return;
    sound.playClick();
    setCallDurationSeconds(0);
    phoneEngine.endCall(activeCall.id);
    sound.playError();
    onRefresh?.();
  };

  const handleSelectChoice = (choice: DialogueChoice) => {
    if (!activeCall) return;
    sound.playClick();

    const result = phoneEngine.selectDialogueChoice(activeCall.id, choice.id);

    if (choice.satisfactionDelta > 0) {
      sound.playSuccess();
      setSatisfactionScore((prev) => Math.min(100, prev + choice.satisfactionDelta));
    } else if (choice.satisfactionDelta < 0) {
      sound.playError();
      setSatisfactionScore((prev) => Math.max(0, prev + choice.satisfactionDelta));
    }

    if (result.revealedClue) {
      setClueNotification(result.revealedClue);
      setTimeout(() => setClueNotification(null), 5000);
    }

    onRefresh?.();
  };

  const handleCallFromHistory = (callId: string) => {
    sound.playClick();
    setSelectedCallId(callId);
    setCallDurationSeconds(0);
    phoneEngine.triggerCall(callId);
    onRefresh?.();
  };

  const currentNode: DialogueNode | undefined =
    activeCall && activeCall.dialogueTree
      ? activeCall.dialogueTree[activeCall.currentDialogueNodeId]
      : undefined;

  const callsList = phoneEngine.getCalls();

  return (
    <div className="flex h-full select-none text-slate-100 bg-[#12151c] relative overflow-hidden font-sans">
      {/* Clue Revealed Notification Banner */}
      {clueNotification && (
        <div className="absolute top-3 right-4 z-50 flex items-start space-x-2.5 p-3 rounded-lg shadow-xl bg-amber-950/90 border border-amber-500/80 text-amber-100 max-w-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Technical Clue Discovered!
            </div>
            <div className="text-[11px] text-amber-200 mt-0.5 leading-snug">
              {clueNotification}
            </div>
          </div>
        </div>
      )}

      {/* Left Column: Dialpad & Extension Directory */}
      <div className="w-72 border-r border-slate-700/60 bg-[#161922] flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone size={16} className="text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              VoIP Softphone 3.2
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            Ext: 1000
          </span>
        </div>

        {/* Dialed Display */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="font-mono text-base font-bold text-white tracking-widest truncate min-h-[1.5rem]">
            {dialedNumber || <span className="text-slate-600 font-sans text-xs">Dial extension...</span>}
          </div>
          {dialedNumber && (
            <button
              onClick={() => {
                sound.playClick();
                setDialedNumber('');
              }}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* 3x4 Dialpad Grid */}
        <div className="p-4 grid grid-cols-3 gap-2 bg-[#141720]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
            <button
              key={key}
              onClick={() => handleDialDigit(key)}
              className="h-11 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-mono text-base font-semibold border border-slate-700/60 flex items-center justify-center transition-colors active:scale-95 shadow-sm"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Speed Dial / Call History List */}
        <div className="flex-1 overflow-y-auto p-2 border-t border-slate-700/60 space-y-1 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
            Department Speed Dial / History
          </div>

          {callsList.map((call) => (
            <button
              key={call.id}
              onClick={() => handleCallFromHistory(call.id)}
              className="w-full text-left p-2 rounded hover:bg-slate-800/60 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-700"
            >
              <div className="truncate pr-2">
                <div className="font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                  {call.callerName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {call.department} &bull; {call.callerHostId}
                </div>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  call.status === 'Ringing'
                    ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                    : call.status === 'Connected'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {call.status}
              </span>
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="p-3 border-t border-slate-700/60 bg-slate-900/60 flex items-center justify-around">
          <button
            onClick={() => {
              sound.playClick();
              setMuted(!muted);
            }}
            className={`p-2 rounded-full border transition-colors ${
              muted
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
      </div>

      {/* Right Column: Active Call Screen & Troubleshooting Dialogue Tree */}
      <div className="flex-1 flex flex-col bg-[#12151c] min-w-0">
        {activeCall ? (
          <>
            {/* Active Call Header & Profile Card */}
            <div className="p-4 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User size={24} />
                  </div>
                  {activeCall.status === 'Connected' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#161922]" />
                  )}
                  {activeCall.status === 'Ringing' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 ring-2 ring-[#161922] animate-ping" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white">{activeCall.callerName}</h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {activeCall.callerHostId}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {activeCall.urgency} Urgency
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activeCall.callerTitle} &bull; <strong className="text-emerald-400">{activeCall.department}</strong>
                    {activeCall.linkedTicketId && (
                      <span className="ml-2 font-mono text-sky-400">({activeCall.linkedTicketId})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Call Status & Controls */}
              <div className="flex items-center space-x-3">
                {activeCall.status === 'Connected' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                    <Clock size={13} />
                    <span>{formatDuration(callDurationSeconds)}</span>
                  </div>
                )}

                {activeCall.status === 'Ringing' ? (
                  <button
                    onClick={handleAnswer}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 animate-pulse"
                  >
                    <PhoneIncoming size={14} />
                    <span>Answer Call</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEndCall}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                  >
                    <PhoneOff size={14} />
                    <span>End Call</span>
                  </button>
                )}
              </div>
            </div>

            {/* Satisfaction Meter */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Caller Satisfaction:</span>
              <div className="flex items-center space-x-2">
                <div className="w-36 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      satisfactionScore > 70
                        ? 'bg-emerald-500'
                        : satisfactionScore > 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${satisfactionScore}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-slate-200">{satisfactionScore}%</span>
              </div>
            </div>

            {/* Dialogue Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeCall.status === 'Ringing' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 animate-bounce">
                    <PhoneIncoming size={32} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Incoming Call from {activeCall.callerName}</h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Click "Answer Call" to establish voice line and begin interactive troubleshooting.
                  </p>
                  <button
                    onClick={handleAnswer}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                  >
                    Answer Phone Line
                  </button>
                </div>
              ) : activeCall.status === 'Ended' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 rounded-full bg-slate-800 text-slate-500 border border-slate-700 mb-3">
                    <PhoneOff size={32} />
                  </div>
                  <h3 className="text-base font-bold text-slate-300 mb-1">Call Completed</h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    Call with {activeCall.callerName} was terminated. Clues unlocked are logged in incident tickets.
                  </p>
                  <button
                    onClick={() => handleCallFromHistory(activeCall.id)}
                    className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Call Back
                  </button>
                </div>
              ) : currentNode ? (
                <>
                  {/* Caller Speech Bubble */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                      <User size={16} />
                    </div>
                    <div className="bg-[#181d2a] border border-slate-700/80 rounded-2xl rounded-tl-sm p-4 max-w-xl shadow-md text-slate-200 text-sm leading-relaxed select-text">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        {activeCall.callerName}
                      </div>
                      {currentNode.speakerText}
                    </div>
                  </div>

                  {/* Technician Multi-Choice Answers */}
                  <div className="pt-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                      <MessageSquare size={13} className="text-sky-400" />
                      <span>Choose Your Troubleshooting Response:</span>
                    </div>

                    {currentNode.choices && currentNode.choices.length > 0 ? (
                      <div className="space-y-2.5 max-w-xl">
                        {currentNode.choices.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={() => handleSelectChoice(choice)}
                            className="w-full text-left p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 text-slate-200 text-xs leading-relaxed transition-all flex items-center justify-between group shadow-sm active:scale-[0.99]"
                          >
                            <div className="flex items-center space-x-2.5">
                              <span className="w-2 h-2 rounded-full bg-sky-400 group-hover:scale-125 transition-transform shrink-0" />
                              <span>{choice.text}</span>
                            </div>

                            {choice.satisfactionDelta !== 0 && (
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                                  choice.satisfactionDelta > 0
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {choice.satisfactionDelta > 0 ? `+${choice.satisfactionDelta}` : choice.satisfactionDelta}% Sat
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-400 text-xs italic flex items-center space-x-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span>Dialogue tree finished. Caller is satisfied. You can now wrap up and end the call.</span>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Revealed Clues Drawer at bottom */}
            {activeCall.revealedClues.length > 0 && (
              <div className="p-3 bg-slate-900/80 border-t border-slate-800">
                <div className="text-[10px] uppercase font-bold text-amber-400 mb-1 flex items-center space-x-1">
                  <Lightbulb size={12} />
                  <span>Discovered Diagnostic Clues ({activeCall.revealedClues.length})</span>
                </div>
                <div className="space-y-1">
                  {activeCall.revealedClues.map((clue, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-mono text-amber-200 bg-amber-950/30 p-1.5 rounded border border-amber-900/40"
                    >
                      &bull; {clue}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Phone size={36} className="text-slate-600 mb-2" />
            <span>No active phone line</span>
          </div>
        )}
      </div>
    </div>
  );
};