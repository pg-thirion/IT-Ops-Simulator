import React, { useState } from 'react';
import {
  Inbox,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Ban,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  X,
  Code,
  Archive,
  RefreshCw,
  Mail,
  Flag,
} from 'lucide-react';
import { MailEngine } from '../../simulation/mailEngine';
import { EmailMessage } from '../../types/mail';
import { sound } from '../../utils/audio';

interface EmailClientAppProps {
  mailEngine: MailEngine;
  onRefresh?: () => void;
}

export const EmailClientApp: React.FC<EmailClientAppProps> = ({
  mailEngine,
  onRefresh,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'junk' | 'quarantine'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>('MSG-101');
  const [showRawHeaders, setShowRawHeaders] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const emailsInFolder = mailEngine.getEmails(selectedFolder);
  const inboxEmails = mailEngine.getEmails('inbox');
  const unreadInboxCount = inboxEmails.filter((e) => !e.isRead).length;
  const junkCount = mailEngine.getEmails('junk').length;
  const quarantineCount = mailEngine.getEmails('quarantine').length;

  const selectedEmail =
    emailsInFolder.find((e) => e.id === selectedEmailId) ||
    emailsInFolder[0] ||
    mailEngine.getEmail(selectedEmailId);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectEmail = (email: EmailMessage) => {
    sound.playClick();
    setSelectedEmailId(email.id);
    if (!email.isRead) {
      mailEngine.markAsRead(email.id);
      onRefresh?.();
    }
  };

  const handleQuarantine = () => {
    if (!selectedEmail) return;
    sound.playClick();
    const ok = mailEngine.quarantineEmail(selectedEmail.id);
    if (ok) {
      sound.playSuccess();
      showToast('success', `Email '${selectedEmail.subject}' moved to quarantine.`);
      onRefresh?.();
    }
  };

  const handleRelease = () => {
    if (!selectedEmail) return;
    sound.playClick();
    const ok = mailEngine.releaseEmail(selectedEmail.id);
    if (ok) {
      sound.playSuccess();
      showToast('success', `Email '${selectedEmail.subject}' released to Inbox.`);
      onRefresh?.();
    }
  };

  const handleBlockDomain = () => {
    if (!selectedEmail) return;
    sound.playClick();
    const ok = mailEngine.blockSenderDomain(selectedEmail.from);
    if (ok) {
      sound.playSuccess();
      const domain = selectedEmail.from.includes('@')
        ? selectedEmail.from.split('@')[1]
        : selectedEmail.from;
      showToast('success', `Domain '@${domain}' has been added to perimeter blocklist.`);
      onRefresh?.();
    } else {
      sound.playError();
      showToast('info', 'Domain is already blocked or invalid.');
    }
  };

  const handleReportPhishing = () => {
    if (!selectedEmail) return;
    sound.playClick();
    const result = mailEngine.reportPhishing(selectedEmail.id);
    if (result.success) {
      sound.playSuccess();
      showToast('success', `${result.message} (+${result.rewardXp} XP)`);
      onRefresh?.();
    } else {
      sound.playError();
      showToast('error', result.message);
    }
  };

  const headerVerification = selectedEmail
    ? mailEngine.verifyHeaders(selectedEmail.id)
    : null;

  return (
    <div className="flex h-full select-none text-slate-100 bg-[#12151c] relative overflow-hidden font-sans">
      {/* Toast Notification Banner */}
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

      {/* Left Column: Folders */}
      <div className="w-56 border-r border-slate-700/60 bg-[#161922] flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail size={16} className="text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Corporate Webmail
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
            corp.local
          </span>
        </div>

        <div className="p-2 space-y-1 flex-1 overflow-y-auto text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
            Mail Folders
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedFolder('inbox');
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
              selectedFolder === 'inbox'
                ? 'bg-sky-600/20 text-sky-300 font-semibold border border-sky-500/40'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <Inbox size={14} className={selectedFolder === 'inbox' ? 'text-sky-400' : 'text-slate-400'} />
              <span>Inbox</span>
            </div>
            {unreadInboxCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950">
                {unreadInboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedFolder('junk');
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
              selectedFolder === 'junk'
                ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <AlertTriangle size={14} className={selectedFolder === 'junk' ? 'text-amber-400' : 'text-slate-400'} />
              <span>Junk Email</span>
            </div>
            {junkCount > 0 && (
              <span className="text-[10px] font-mono text-slate-400">{junkCount}</span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedFolder('quarantine');
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
              selectedFolder === 'quarantine'
                ? 'bg-rose-600/20 text-rose-300 font-semibold border border-rose-500/40'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2.5 truncate">
              <Archive size={14} className={selectedFolder === 'quarantine' ? 'text-rose-400' : 'text-slate-400'} />
              <span>Quarantine</span>
            </div>
            {quarantineCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/80 text-white">
                {quarantineCount}
              </span>
            )}
          </button>

          <div className="pt-4 text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
            Blocked Senders
          </div>
          <div className="px-2 py-1 space-y-1">
            {mailEngine.getBlockedDomains().length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">No domains blocked yet</span>
            ) : (
              mailEngine.getBlockedDomains().map((d) => (
                <div
                  key={d}
                  className="flex items-center space-x-1.5 text-[11px] text-rose-400 font-mono bg-rose-950/30 px-2 py-1 rounded border border-rose-900/40 truncate"
                  title={d}
                >
                  <Ban size={10} className="shrink-0" />
                  <span className="truncate">@{d}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Account Snippet */}
        <div className="p-3 border-t border-slate-700/60 bg-slate-900/60 text-xs text-slate-400">
          <div className="font-semibold text-slate-300">Mailbox User:</div>
          <div className="text-[11px] truncate text-sky-400 font-mono">secops-admin@corp.local</div>
        </div>
      </div>

      {/* Middle Column: Email Message List */}
      <div className="w-80 border-r border-slate-700/60 bg-[#141720] flex flex-col shrink-0">
        <div className="p-2.5 border-b border-slate-700/60 bg-slate-900/40 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300 capitalize">
            {selectedFolder} Messages ({emailsInFolder.length})
          </div>
          <button
            onClick={() => onRefresh?.()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh mailbox"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {emailsInFolder.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No emails in {selectedFolder} folder.
            </div>
          ) : (
            emailsInFolder.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-3 cursor-pointer transition-colors relative ${
                    isSelected
                      ? 'bg-sky-950/40 border-l-2 border-sky-400'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {!email.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                      )}
                      <span className={`text-xs truncate ${!email.isRead ? 'font-bold text-white' : 'text-slate-300'}`}>
                        {email.fromName || email.from}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                      {email.date.split(' ')[1] || email.date}
                    </span>
                  </div>

                  <div className={`text-xs truncate mb-1 ${!email.isRead ? 'font-semibold text-slate-200' : 'text-slate-300'}`}>
                    {email.subject}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {email.body}
                  </div>

                  <div className="mt-2 flex items-center space-x-1.5 flex-wrap gap-y-1">
                    {email.isPhishing && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <ShieldAlert size={10} />
                        <span>Suspicious</span>
                      </span>
                    )}
                    {email.attachments.length > 0 && (
                      <span className="inline-flex items-center space-x-0.5 text-[10px] text-slate-400 font-mono">
                        <Paperclip size={11} />
                        <span>{email.attachments.length}</span>
                      </span>
                    )}
                    {email.quarantined && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Quarantined
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Reading Pane */}
      <div className="flex-1 flex flex-col bg-[#12151c] min-w-0">
        {selectedEmail ? (
          <>
            {/* Action Bar */}
            <div className="p-2.5 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                {selectedEmail.folder === 'quarantine' ? (
                  <button
                    onClick={handleRelease}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40 text-xs font-medium transition-colors"
                  >
                    <CheckCircle2 size={13} />
                    <span>Release from Quarantine</span>
                  </button>
                ) : (
                  <button
                    onClick={handleQuarantine}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-amber-600/30 text-amber-300 border border-amber-500/50 hover:bg-amber-600/40 text-xs font-medium transition-colors"
                  >
                    <Archive size={13} />
                    <span>Quarantine Email</span>
                  </button>
                )}

                <button
                  onClick={handleBlockDomain}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-rose-600/25 text-rose-300 border border-rose-500/40 hover:bg-rose-600/35 text-xs font-medium transition-colors"
                >
                  <Ban size={13} />
                  <span>Block Sender Domain</span>
                </button>

                <button
                  onClick={handleReportPhishing}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-red-600/30 text-red-200 border border-red-500/60 hover:bg-red-600/40 text-xs font-medium transition-colors"
                >
                  <Flag size={13} />
                  <span>Report Phishing</span>
                </button>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowRawHeaders(true);
                }}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/70 text-xs font-medium transition-colors"
              >
                <Code size={13} />
                <span>Inspect Raw Headers</span>
              </button>
            </div>

            {/* Email Header Details */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/30">
              <h2 className="text-base font-bold text-white mb-2 leading-tight">
                {selectedEmail.subject}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">From: </span>
                  <span className="font-semibold text-slate-200">
                    {selectedEmail.fromName ? `"${selectedEmail.fromName}" ` : ''}
                  </span>
                  <span className="text-sky-300 font-mono">&lt;{selectedEmail.from}&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400">Date: </span>
                  <span className="text-slate-200 font-mono">{selectedEmail.date}</span>
                </div>
                <div>
                  <span className="text-slate-400">To: </span>
                  <span className="text-slate-300 font-mono">{selectedEmail.to}</span>
                </div>
                <div>
                  <span className="text-slate-400">Originating IP: </span>
                  <span className="font-mono text-amber-300">{selectedEmail.originatingIp}</span>
                </div>
              </div>

              {/* Security Pill Indicators */}
              <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium">Authentication:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedEmail.spfStatus === 'pass'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  SPF: {selectedEmail.spfStatus}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedEmail.dkimStatus === 'pass'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  DKIM: {selectedEmail.dkimStatus}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedEmail.dmarcStatus === 'pass'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  DMARC: {selectedEmail.dmarcStatus}
                </span>

                {headerVerification?.isSpoofed && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/30 text-rose-200 border border-rose-500 flex items-center space-x-1">
                    <ShieldX size={11} />
                    <span>Spoofing Detected</span>
                  </span>
                )}
              </div>
            </div>

            {/* Email Body & Attachments */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-slate-200 text-sm whitespace-pre-line leading-relaxed font-sans select-text">
                {selectedEmail.body}
              </div>

              {/* Attachments Section */}
              {selectedEmail.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Paperclip size={13} />
                    <span>Attachments ({selectedEmail.attachments.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedEmail.attachments.map((att) => (
                      <div
                        key={att.id}
                        className={`p-2.5 rounded-md border flex items-center justify-between ${
                          att.isMalicious
                            ? 'bg-rose-950/40 border-rose-600/50 text-rose-200'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText size={16} className={att.isMalicious ? 'text-rose-400' : 'text-sky-400'} />
                          <div className="truncate">
                            <div className="text-xs font-mono font-medium truncate">{att.filename}</div>
                            <div className="text-[10px] text-slate-400">
                              {(att.sizeBytes / 1024).toFixed(1)} KB &bull; {att.fileExtension}
                            </div>
                          </div>
                        </div>

                        {att.isMalicious && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shrink-0 ml-2">
                            Weaponized
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Mail size={36} className="mb-2 text-slate-600" />
            <span>Select a message to view content</span>
          </div>
        )}
      </div>

      {/* Raw Headers Modal */}
      {showRawHeaders && selectedEmail && headerVerification && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a24] border border-slate-700 rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-3.5 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center space-x-2">
                <Code size={16} className="text-sky-400" />
                <h3 className="text-sm font-bold text-white">
                  Raw Headers &amp; Authentication Analysis
                </h3>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowRawHeaders(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {/* Verdict Banner */}
              <div
                className={`p-3 rounded border ${
                  headerVerification.isSpoofed
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                }`}
              >
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  {headerVerification.isSpoofed ? (
                    <>
                      <ShieldX size={15} className="text-rose-400" />
                      <span>FAILED AUTHENTICATION / SPOOFED IDENTITY</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} className="text-emerald-400" />
                      <span>AUTHENTICATION VERIFIED</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-300">
                  {headerVerification.summary}
                </div>
              </div>

              {/* SPF / DKIM / DMARC breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">SPF Status</div>
                  <div className="text-xs font-mono font-bold mt-1 text-white">
                    {headerVerification.spf}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">DKIM Status</div>
                  <div className="text-xs font-mono font-bold mt-1 text-white">
                    {headerVerification.dkim}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">DMARC Status</div>
                  <div className="text-xs font-mono font-bold mt-1 text-white">
                    {headerVerification.dmarc}
                  </div>
                </div>
              </div>

              {/* Full Headers List */}
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Header Trace Log:
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto space-y-1.5 select-text">
                  {selectedEmail.headers.map((h, i) => (
                    <div key={i} className="leading-snug">
                      <span className="text-sky-400 font-semibold">{h.name}: </span>
                      <span className="text-slate-300 break-all">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowRawHeaders(false);
                }}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};