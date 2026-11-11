import React, { useState } from 'react';
import {
  Folder,
  Lock,
  Unlock,
  Shield,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  User,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { sound } from '../../utils/audio';

interface FileExplorerAppProps {
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({ networkEngine, onRefresh: _onRefresh }) => {
  const [currentUser, setCurrentUser] = useState<string>('nbishop');
  const [selectedShare, setSelectedShare] = useState<string>('share_payroll');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const users = networkEngine.getAllADUsers();
  const shares = networkEngine.getSharedFolders();

  const user = networkEngine.getADUser(currentUser);
  const share = shares.find((s) => s.id === selectedShare) || shares[0];

  const handleTestAccess = () => {
    sound.playClick();
    if (!share) return;
    const res = networkEngine.testShareAccess(currentUser, share.name);
    setTestResult(res);
    if (res.success) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
  };

  const hasAccess = share && user ? share.allowedGroups.some((g) => user.groups.includes(g)) : false;

  return (
    <div className="flex h-full bg-[#12151c] text-slate-100 select-none font-sans text-xs">
      {/* Left Navigation Tree */}
      <div className="w-60 border-r border-slate-700/60 bg-[#151821] flex flex-col p-3 space-y-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Simulated User Context
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1.5 rounded border border-slate-700">
            <User size={13} className="text-sky-400 shrink-0" />
            <select
              value={currentUser}
              onChange={(e) => {
                setCurrentUser(e.target.value);
                setTestResult(null);
              }}
              className="w-full bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.username} value={u.username} className="bg-slate-900 text-slate-100">
                  {u.displayName} ({u.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-1">
            Network Shares (\\FS-SRV-01)
          </div>
          {shares.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                setSelectedShare(s.id);
                setTestResult(null);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                selectedShare === s.id
                  ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Folder size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">{s.name}</span>
              </div>
              <span className="text-[10px] text-slate-400">{s.department}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Share View & Permission Inspector */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#13161c] flex flex-col">
        {share && (
          <div className="max-w-2xl space-y-5">
            {/* Share Header */}
            <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <FolderOpen size={24} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">\\\\FS-SRV-01\\{share.name}</h2>
                  <div className="text-xs text-slate-400">{share.path}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{share.description}</div>
                </div>
              </div>

              <div>
                {hasAccess ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center space-x-1 text-xs">
                    <Unlock size={12} />
                    <span>Access Granted</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold flex items-center space-x-1 text-xs">
                    <Lock size={12} />
                    <span>Access Denied</span>
                  </span>
                )}
              </div>
            </div>

            {/* Access Control List (ACL) */}
            <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Shield size={14} className="text-indigo-400" />
                <span>Security Group Permissions (NTFS &amp; SMB)</span>
              </div>

              <div className="space-y-1.5">
                {share.allowedGroups.map((grp) => {
                  const userHas = user?.groups.includes(grp);
                  return (
                    <div
                      key={grp}
                      className={`p-2 rounded border flex items-center justify-between text-xs ${
                        userHas
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-mono">
                        <Shield size={12} />
                        <span>{grp}</span>
                      </div>
                      <span className="text-[11px] font-semibold">
                        {userHas ? 'Matched (Permitted)' : 'Not in group'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* User Membership Summary */}
              {user && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  User <strong className="text-slate-200">{user.username}</strong> is currently a member of:{' '}
                  <span className="font-mono text-indigo-300">{user.groups.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Test Action */}
            <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                Verify if <strong className="text-slate-100">{user?.displayName}</strong> can open this share:
              </div>

              <button
                onClick={handleTestAccess}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center space-x-2 shadow-md"
              >
                <span>Test Network Drive Mount</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Test Result Output */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start space-x-2.5 animate-in fade-in duration-150 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    {testResult.success ? 'SMB Connection Successful' : 'SMB Connection Denied'}
                  </div>
                  <div className="text-xs mt-0.5 font-mono">{testResult.message}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
