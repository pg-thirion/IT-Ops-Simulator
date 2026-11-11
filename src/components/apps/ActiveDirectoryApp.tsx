import React, { useState } from 'react';
import {
  Users,
  FolderTree,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  Shield,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { NetworkEngine } from '../../simulation/networkEngine';
import { sound } from '../../utils/audio';

interface ActiveDirectoryAppProps {
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const ActiveDirectoryApp: React.FC<ActiveDirectoryAppProps> = ({
  networkEngine,
  onRefresh,
}) => {
  const [selectedOu, setSelectedOu] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUsername, setSelectedUsername] = useState<string>('lkumar');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState<string>('Payroll Access');
  const [showAddGroup, setShowAddGroup] = useState(false);

  const ous = ['All', 'Executive', 'Finance', 'Engineering', 'Sales', 'HR', 'Marketing', 'IT'];
  const allUsers = networkEngine.getAllADUsers();

  const filteredUsers = allUsers.filter((u) => {
    const matchesOu = selectedOu === 'All' || u.ou === selectedOu;
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.assignedHostId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOu && matchesSearch;
  });

  const selectedUser = allUsers.find((u) => u.username === selectedUsername) || filteredUsers[0];

  const handleUnlockUser = (username: string) => {
    sound.playClick();
    const ok = networkEngine.unlockADUser(username);
    if (ok) {
      sound.playSuccess();
      setActionNotice(`User account '${username}' unlocked successfully. Bad logon count reset.`);
      onRefresh?.();
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleResetPassword = (username: string) => {
    sound.playClick();
    const ok = networkEngine.resetADPassword(username);
    if (ok) {
      sound.playSuccess();
      setActionNotice(`Password for '${username}' has been reset to temporary policy password. Expiration flag cleared.`);
      onRefresh?.();
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleToggleEnable = (username: string, currentEnabled: boolean) => {
    sound.playClick();
    networkEngine.setADUserEnabled(username, !currentEnabled);
    setActionNotice(`User '${username}' has been ${!currentEnabled ? 'enabled' : 'disabled'}.`);
    onRefresh?.();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAddGroup = (username: string) => {
    if (!newGroupName.trim()) return;
    sound.playClick();
    networkEngine.addUserToGroup(username, newGroupName.trim());
    sound.playSuccess();
    setActionNotice(`Added user '${username}' to security group '${newGroupName.trim()}'.`);
    setShowAddGroup(false);
    onRefresh?.();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRemoveGroup = (username: string, grp: string) => {
    sound.playClick();
    networkEngine.removeUserFromGroup(username, grp);
    setActionNotice(`Removed user '${username}' from group '${grp}'.`);
    onRefresh?.();
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="flex h-full select-none text-slate-100 bg-[#12151c]">
      {/* Left Column: OU Tree & Filters */}
      <div className="w-64 border-r border-slate-700/60 bg-[#161922] flex flex-col">
        <div className="p-3 border-b border-slate-700/60 bg-slate-900/40 flex items-center space-x-2">
          <FolderTree size={16} className="text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Domain: CORP.LOCAL
          </span>
        </div>

        {/* OU List */}
        <div className="p-2 space-y-0.5 flex-1 overflow-y-auto text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
            Organizational Units
          </div>
          {ous.map((ou) => (
            <button
              key={ou}
              onClick={() => {
                sound.playClick();
                setSelectedOu(ou);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                selectedOu === ou
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Users size={13} className="text-slate-400" />
                <span>{ou === 'All' ? 'Entire Directory' : `OU=${ou}`}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {ou === 'All' ? allUsers.length : allUsers.filter((u) => u.ou === ou).length}
              </span>
            </button>
          ))}
        </div>

        {/* Domain Info Footer */}
        <div className="p-3 border-t border-slate-700/60 text-[11px] text-slate-400 space-y-1 bg-slate-900/30">
          <div>Forest Functional Level: 2016</div>
          <div className="text-indigo-300">PDC Emulator: DC-SRV-01</div>
        </div>
      </div>

      {/* Middle Column: User Table */}
      <div className="w-80 border-r border-slate-700/60 flex flex-col bg-[#141720]">
        {/* Search Input */}
        <div className="p-2.5 border-b border-slate-700/60 bg-slate-900/40">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, login, machine..."
              className="w-full bg-slate-800 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* User Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredUsers.map((user) => {
            const isSelected = selectedUser?.username === user.username;
            return (
              <div
                key={user.username}
                onClick={() => {
                  sound.playClick();
                  setSelectedUsername(user.username);
                  setActionNotice(null);
                }}
                className={`p-2.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500'
                    : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {user.displayName}
                  </span>
                  {user.isLocked && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center space-x-0.5">
                      <Lock size={10} />
                      <span>LOCKED</span>
                    </span>
                  )}
                  {user.passwordExpired && !user.isLocked && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      EXPIRED
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-slate-400">{user.username}</span>
                  <span className="text-slate-400">{user.ou}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: User Details & Administration Panel */}
      <div className="flex-1 p-5 overflow-y-auto bg-[#13161c] flex flex-col">
        {selectedUser ? (
          <div className="max-w-2xl space-y-5">
            {/* Action Notice Banner */}
            {actionNotice && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
                <CheckCircle size={16} className="shrink-0" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Profile Header */}
            <div className="bg-[#191d27] border border-slate-700/60 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white text-base shadow-lg">
                  {selectedUser.displayName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">{selectedUser.displayName}</h2>
                  <div className="text-xs text-slate-400">{selectedUser.title}</div>
                  <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end space-y-1">
                {selectedUser.isLocked ? (
                  <span className="px-2 py-1 rounded bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs font-bold flex items-center space-x-1">
                    <Lock size={12} />
                    <span>Account Locked Out</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-bold flex items-center space-x-1">
                    <UserCheck size={12} />
                    <span>Active &amp; Unlocked</span>
                  </span>
                )}
                {selectedUser.passwordExpired && (
                  <span className="text-[10px] text-amber-400 font-bold">
                    Password Expired (Must Change)
                  </span>
                )}
                {selectedUser.badPasswordCount > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono">
                    Failed logins: {selectedUser.badPasswordCount}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Account Management Actions
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {selectedUser.isLocked && (
                  <button
                    onClick={() => handleUnlockUser(selectedUser.username)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Unlock size={14} />
                    <span>Unlock User Account</span>
                  </button>
                )}

                <button
                  onClick={() => handleResetPassword(selectedUser.username)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
                >
                  <KeyRound size={14} className="text-amber-400" />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={() => setShowAddGroup(!showAddGroup)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add to Group...</span>
                </button>

                <button
                  onClick={() => handleToggleEnable(selectedUser.username, selectedUser.isEnabled)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
                >
                  {selectedUser.isEnabled ? (
                    <>
                      <UserX size={14} className="text-rose-400" />
                      <span>Disable Account</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} className="text-emerald-400" />
                      <span>Enable Account</span>
                    </>
                  )}
                </button>
              </div>

              {/* Add Group Popup / Inline */}
              {showAddGroup && (
                <div className="mt-2 p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center space-x-2">
                  <select
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none flex-1"
                  >
                    <option value="Payroll Access">Payroll Access (HR Share \\FS-SRV-01\Payroll)</option>
                    <option value="Finance Users">Finance Users (\\FS-SRV-01\Finance)</option>
                    <option value="Engineering Users">Engineering Users (\\FS-SRV-01\Engineering)</option>
                    <option value="Executive Users">Executive Users (\\FS-SRV-01\Executive)</option>
                    <option value="Domain Admins">Domain Admins</option>
                  </select>
                  <button
                    onClick={() => handleAddGroup(selectedUser.username)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddGroup(false)}
                    className="px-2 py-1 hover:bg-slate-800 text-slate-400 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Directory Attributes Card */}
            <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3 text-xs select-text">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Directory Attributes
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">User Logon Name (sAMAccountName)</span>
                  <span className="font-mono font-semibold text-slate-200">{selectedUser.username}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Assigned Workstation Host</span>
                  <span className="font-mono font-semibold text-sky-400">{selectedUser.assignedHostId}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Department / OU</span>
                  <span className="font-semibold text-slate-200">{selectedUser.department} (OU={selectedUser.ou})</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Password Status</span>
                  <span className={selectedUser.passwordExpired ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                    {selectedUser.passwordExpired ? 'Must Change at Next Logon' : 'Compliant'}
                  </span>
                </div>
              </div>

              {/* Group Memberships */}
              <div className="pt-3 border-t border-slate-700/60">
                <span className="text-slate-500 block text-[10px] uppercase mb-1.5">
                  Member Of (Security Groups)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.groups.map((grp) => (
                    <span
                      key={grp}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center space-x-1.5"
                    >
                      <Shield size={11} className="text-indigo-400" />
                      <span>{grp}</span>
                      {grp !== 'Domain Users' && (
                        <button
                          onClick={() => handleRemoveGroup(selectedUser.username, grp)}
                          className="hover:text-rose-400 transition-colors ml-1"
                          title="Remove group"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Users size={48} className="opacity-30 mb-2" />
            <p className="text-xs">Select a user account from the list</p>
          </div>
        )}
      </div>
    </div>
  );
};
