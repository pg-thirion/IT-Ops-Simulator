import React, { useState } from 'react';
import {
  FolderTree,
  Shield,
  HardDrive,
  Usb,
  FileCode,
  KeyRound,
  CheckCircle2,
  XCircle,
  Link2,
  Unlink2,
  ToggleLeft,
  ToggleRight,
  Computer,
} from 'lucide-react';
import { GpoEngine } from '../../simulation/gpoEngine';
import { NetworkEngine } from '../../simulation/networkEngine';
import { GpoObject, GpoSettingId } from '../../types/gpo';
import { sound } from '../../utils/audio';

interface GroupPolicyAppProps {
  gpoEngine: GpoEngine;
  networkEngine: NetworkEngine;
  onRefresh?: () => void;
}

export const GroupPolicyApp: React.FC<GroupPolicyAppProps> = ({
  gpoEngine,
  networkEngine,
  onRefresh,
}) => {
  const [selectedOu, setSelectedOu] = useState<string>('Finance');
  const [selectedGpoId, setSelectedGpoId] = useState<string>('GPO-02');
  const [testedHostId, setTestedHostId] = useState<string>('PC-FIN-04');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const ous = ['All', 'Finance', 'Engineering', 'Sales', 'Executive', 'Marketing'];
  const allGpos = gpoEngine.getGpos();
  const allHosts = networkEngine.getAllHosts();

  const selectedGpo = allGpos.find((g) => g.id === selectedGpoId) || allGpos[0];

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleToggleSetting = (settingId: GpoSettingId, currentEnabled: boolean) => {
    if (!selectedGpo) return;
    sound.playClick();
    const newEnabled = !currentEnabled;
    const ok = gpoEngine.toggleGpoSetting(selectedGpo.id, settingId, newEnabled);
    if (ok) {
      sound.playSuccess();
      showToast('success', `Policy '${settingId}' ${newEnabled ? 'Enabled' : 'Disabled'} on ${selectedGpo.name}.`);
      onRefresh?.();
    }
  };

  const handleLinkGpo = (gpoId: string, ouName: string) => {
    sound.playClick();
    const ok = gpoEngine.linkGpoToOu(gpoId, ouName);
    if (ok) {
      sound.playSuccess();
      showToast('success', `GPO '${gpoId}' linked to OU '${ouName}'.`);
      onRefresh?.();
    }
  };

  const handleUnlinkGpo = (gpoId: string, ouName: string) => {
    sound.playClick();
    const ok = gpoEngine.unlinkGpoFromOu(gpoId, ouName);
    if (ok) {
      sound.playSuccess();
      showToast('info', `GPO '${gpoId}' unlinked from OU '${ouName}'.`);
      onRefresh?.();
    }
  };

  const handleToggleGpoEnabled = (gpoId: string, current: boolean) => {
    sound.playClick();
    gpoEngine.setGpoEnabled(gpoId, !current);
    sound.playSuccess();
    onRefresh?.();
  };

  // Evaluate effective policy for tester
  const effectivePolicy = gpoEngine.getEffectivePolicyForHost(testedHostId);
  const testedHost = networkEngine.getHost(testedHostId);
  const hostOu = gpoEngine.getHostOu(testedHostId) || testedHost?.department || 'Unknown';

  const isGpoLinkedToSelectedOu = (gpo: GpoObject, ou: string) => {
    if (ou === 'All') return gpo.scope === 'Domain' || gpo.targetOu === 'All';
    if (!gpo.targetOu) return false;
    const targets = gpo.targetOu.split(',').map((s) => s.trim().toLowerCase());
    return targets.includes(ou.toLowerCase()) || targets.includes('all');
  };

  return (
    <div className="flex h-full select-none text-slate-100 bg-[#12151c] relative overflow-hidden font-sans">
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
            <Shield size={15} className="text-indigo-400 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Left Column: OU Tree & Domain Hierarchy */}
      <div className="w-64 border-r border-slate-700/60 bg-[#161922] flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-700/60 bg-slate-900/40 flex items-center space-x-2">
          <FolderTree size={16} className="text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Group Policy Management
          </span>
        </div>

        <div className="p-2 space-y-1 flex-1 overflow-y-auto text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
            Forest: corp.local &bull; Domains
          </div>

          {ous.map((ou) => {
            const isSelected = selectedOu === ou;
            const linkedCount = allGpos.filter((g) => isGpoLinkedToSelectedOu(g, ou)).length;

            return (
              <button
                key={ou}
                onClick={() => {
                  sound.playClick();
                  setSelectedOu(ou);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-amber-600/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FolderTree size={13} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                  <span>{ou === 'All' ? 'corp.local (Root)' : `OU=${ou}`}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 px-1 rounded bg-slate-800">
                  {linkedCount} GPO{linkedCount !== 1 ? 's' : ''}
                </span>
              </button>
            );
          })}

          <div className="pt-4 text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
            All Group Policy Objects
          </div>

          <div className="space-y-1">
            {allGpos.map((gpo) => {
              const isSelected = selectedGpo?.id === gpo.id;
              return (
                <div
                  key={gpo.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedGpoId(gpo.id);
                  }}
                  className={`p-2 rounded cursor-pointer transition-colors text-xs border ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/50 text-white'
                      : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{gpo.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{gpo.id}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Scope: {gpo.scope} &bull; Target: {gpo.targetOu || 'Unlinked'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-700/60 bg-slate-900/60 text-xs text-slate-400">
          <div className="font-semibold text-slate-300">Active Domain Controller:</div>
          <div className="text-[11px] font-mono text-amber-400">DC-SRV-01.corp.local</div>
        </div>
      </div>

      {/* Middle Column: Selected GPO Configuration & Settings */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-700/60 bg-[#12151c]">
        {selectedGpo ? (
          <>
            {/* GPO Header */}
            <div className="p-3.5 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Shield size={16} className="text-amber-400" />
                  <h2 className="text-sm font-bold text-white">{selectedGpo.name}</h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedGpo.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Scope: <strong className="text-slate-300">{selectedGpo.scope}</strong> &bull;
                  Linked OUs: <strong className="text-amber-300">{selectedGpo.targetOu || 'None'}</strong>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isGpoLinkedToSelectedOu(selectedGpo, selectedOu) ? (
                  <button
                    onClick={() => handleUnlinkGpo(selectedGpo.id, selectedOu)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-rose-600/25 text-rose-300 border border-rose-500/40 hover:bg-rose-600/35 text-xs font-medium transition-colors"
                  >
                    <Unlink2 size={13} />
                    <span>Unlink from OU={selectedOu}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleLinkGpo(selectedGpo.id, selectedOu)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-amber-600/25 text-amber-300 border border-amber-500/40 hover:bg-amber-600/35 text-xs font-medium transition-colors"
                  >
                    <Link2 size={13} />
                    <span>Link to OU={selectedOu}</span>
                  </button>
                )}

                <button
                  onClick={() => handleToggleGpoEnabled(selectedGpo.id, selectedGpo.enabled)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                    selectedGpo.enabled
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {selectedGpo.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  <span>{selectedGpo.enabled ? 'GPO Enabled' : 'GPO Disabled'}</span>
                </button>
              </div>
            </div>

            {/* Policy Settings Editor */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Security &amp; Policy Settings Catalog
              </div>

              <div className="space-y-3">
                {/* 1. USB Storage Restriction */}
                {(() => {
                  const setting = selectedGpo.settings.find((s) => s.id === 'block_usb_storage');
                  const isEnabled = setting ? setting.enabled : false;
                  return (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded mt-0.5 ${isEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                          <Usb size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-2">
                            <span>Block Removable Storage Devices</span>
                            <span className="text-[10px] font-normal text-slate-400">(USB Storage)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Denies read/write access to removable USB drives to prevent data exfiltration.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSetting('block_usb_storage', isEnabled)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                          isEnabled
                            ? 'bg-amber-600/30 text-amber-200 border-amber-500/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {isEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* 2. Map Network Drives (Finance & Public) */}
                {(() => {
                  const finSetting = selectedGpo.settings.find((s) => s.id === 'map_drive_finance');
                  const finEnabled = finSetting ? finSetting.enabled : false;
                  const pubSetting = selectedGpo.settings.find((s) => s.id === 'map_drive_public');
                  const pubEnabled = pubSetting ? pubSetting.enabled : false;

                  return (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <HardDrive size={16} className="text-sky-400" />
                        <span>Map Network Department Shares</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <div className="text-[11px] font-semibold text-slate-200">Drive F: (Finance Share)</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">\\fs-srv-01\Finance</div>
                          </div>
                          <button
                            onClick={() => handleToggleSetting('map_drive_finance', finEnabled)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 border ${
                              finEnabled
                                ? 'bg-sky-600/30 text-sky-200 border-sky-500/60'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            <span>{finEnabled ? 'Mapped' : 'Off'}</span>
                          </button>
                        </div>

                        <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <div className="text-[11px] font-semibold text-slate-200">Drive P: (Public Share)</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">\\fs-srv-01\Public</div>
                          </div>
                          <button
                            onClick={() => handleToggleSetting('map_drive_public', pubEnabled)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 border ${
                              pubEnabled
                                ? 'bg-sky-600/30 text-sky-200 border-sky-500/60'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            <span>{pubEnabled ? 'Mapped' : 'Off'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Restrict Script Execution Policy */}
                {(() => {
                  const setting = selectedGpo.settings.find((s) => s.id === 'restrict_script_execution');
                  const isEnabled = setting ? setting.enabled : false;
                  return (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded mt-0.5 ${isEnabled ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                          <FileCode size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-2">
                            <span>Restrict Script Execution Policy</span>
                            <span className="text-[10px] font-mono text-slate-400">(PowerShell &amp; Batch)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Blocks unsigned scripts and macros from running on client workstations.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSetting('restrict_script_execution', isEnabled)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                          isEnabled
                            ? 'bg-rose-600/30 text-rose-200 border-rose-500/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {isEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        <span>{isEnabled ? 'Restricted' : 'Allow All'}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* 4. Password Policy */}
                {(() => {
                  const setting = selectedGpo.settings.find((s) => s.id === 'password_complexity');
                  const isEnabled = setting ? setting.enabled : false;
                  return (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded mt-0.5 ${isEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                          <KeyRound size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-2">
                            <span>Password Must Meet Complexity Requirements</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Requires 12+ chars, uppercase, lowercase, numbers, and symbols.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSetting('password_complexity', isEnabled)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                          isEnabled
                            ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {isEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        <span>{isEnabled ? 'Enforced' : 'Relaxed'}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Shield size={36} className="text-slate-600 mb-2" />
            <span>Select a GPO to view and edit settings</span>
          </div>
        )}
      </div>

      {/* Right Column: Effective Policy Tester (RSOP) */}
      <div className="w-80 flex flex-col bg-[#141720] shrink-0">
        <div className="p-3.5 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Computer size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Effective Policy Tester (RSOP)
            </h3>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
              Select Client Host to Evaluate:
            </label>
            <select
              value={testedHostId}
              onChange={(e) => {
                sound.playClick();
                setTestedHostId(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500"
            >
              {allHosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.id} ({h.department})
                </option>
              ))}
            </select>
          </div>

          {/* Host Overview */}
          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned OU:</span>
              <span className="font-semibold text-amber-300 font-mono">OU={hostOu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Logged On User:</span>
              <span className="text-slate-200 font-mono">
                {testedHost?.activeDirectoryUsername || 'None'}
              </span>
            </div>
          </div>

          {/* Effective Evaluated Policy Items */}
          <div className="space-y-2 pt-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Evaluated Policy Results
            </div>

            {/* USB Status */}
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Usb size={14} className={effectivePolicy.usbBlocked ? 'text-rose-400' : 'text-emerald-400'} />
                <span className="text-slate-300">USB Storage:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  effectivePolicy.usbBlocked
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {effectivePolicy.usbBlocked ? 'BLOCKED' : 'ALLOWED'}
              </span>
            </div>

            {/* Script Execution */}
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode size={14} className={effectivePolicy.scriptsRestricted ? 'text-amber-400' : 'text-slate-400'} />
                <span className="text-slate-300">Script Policy:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  effectivePolicy.scriptsRestricted
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {effectivePolicy.scriptsRestricted ? 'RESTRICTED' : 'UNRESTRICTED'}
              </span>
            </div>

            {/* Password Complexity */}
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound size={14} className={effectivePolicy.passwordComplexity ? 'text-indigo-400' : 'text-slate-400'} />
                <span className="text-slate-300">Password Rules:</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  effectivePolicy.passwordComplexity
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {effectivePolicy.passwordComplexity ? 'COMPLEX (12+)' : 'STANDARD'}
              </span>
            </div>

            {/* Mapped Drives */}
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
              <div className="flex items-center space-x-2 mb-1.5">
                <HardDrive size={14} className="text-sky-400" />
                <span className="text-slate-300">Effective Mapped Drives:</span>
              </div>
              {effectivePolicy.mappedDrives.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic">No network drives mapped</div>
              ) : (
                <div className="space-y-1">
                  {effectivePolicy.mappedDrives.map((d, i) => (
                    <div
                      key={i}
                      className="text-[11px] font-mono text-sky-300 bg-slate-950 p-1.5 rounded border border-slate-800 truncate"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};