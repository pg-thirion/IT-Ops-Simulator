import React, { useState } from 'react';
import {
  Database,
  HardDrive,
  Camera,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Server,
  Archive,
  RefreshCw,
  ShieldAlert,
  FolderSync,
  AlertTriangle,
} from 'lucide-react';
import { BackupEngine } from '../../simulation/backupEngine';
import { NetworkEngine } from '../../simulation/networkEngine';
import { OutbreakEngine } from '../../simulation/outbreakEngine';
import { sound } from '../../utils/audio';

interface BackupManagerAppProps {
  backupEngine: BackupEngine;
  networkEngine: NetworkEngine;
  outbreakEngine?: OutbreakEngine;
  onRefresh?: () => void;
}

export const BackupManagerApp: React.FC<BackupManagerAppProps> = ({
  backupEngine,
  networkEngine: _networkEngine,
  outbreakEngine,
  onRefresh,
}) => {
  const [selectedServer, setSelectedServer] = useState<string>('FS-SRV-01');
  const [snapshotType, setSnapshotType] = useState<'Full' | 'Incremental'>('Full');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('SNAP-101');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Restore Modal State
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [restoreMode, setRestoreMode] = useState<'share' | 'database'>('share');
  const [targetItemName, setTargetItemName] = useState<string>('');

  const servers = [
    { id: 'FS-SRV-01', name: 'fs-srv-01.corp.local', role: 'Enterprise File Server' },
    { id: 'SQL-PROD-01', name: 'sql-prod-01.corp.local', role: 'Production Database Server' },
    { id: 'DC-SRV-01', name: 'dc-srv-01.corp.local', role: 'Primary Domain Controller' },
    { id: 'WEB-INTRA-01', name: 'web-intra-01.corp.local', role: 'Intranet Portal Host' },
  ];

  const allSnapshots = backupEngine.getSnapshots();
  const filteredSnapshots = backupEngine.getSnapshots(selectedServer === 'All' ? undefined : selectedServer);
  const totalStorageGb = backupEngine.getTotalBackupSizeGb();

  const selectedSnapshot =
    allSnapshots.find((s) => s.id === selectedSnapshotId) || filteredSnapshots[0] || allSnapshots[0];

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleTakeSnapshot = () => {
    if (isProcessing) return;
    sound.playClick();
    setIsProcessing(true);
    setProcessingMessage(`Creating ${snapshotType} snapshot for ${selectedServer}...`);
    setProcessingProgress(20);

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          const newSnap = backupEngine.takeSnapshot(selectedServer, snapshotType);
          setIsProcessing(false);
          sound.playSuccess();
          showToast('success', `Snapshot '${newSnap.id}' created successfully for ${selectedServer} (${newSnap.sizeGb} GB).`);
          setSelectedSnapshotId(newSnap.id);
          onRefresh?.();
          return 100;
        }
        return prev + 35;
      });
    }, 250);
  };

  const handleInitiateRestore = (mode: 'share' | 'database') => {
    if (!selectedSnapshot) return;
    sound.playClick();
    setRestoreMode(mode);
    if (mode === 'share') {
      setTargetItemName(selectedSnapshot.sharesIncluded[0] || 'Finance');
    } else {
      setTargetItemName(selectedSnapshot.databasesIncluded?.[0] || 'ERP_Production_DB');
    }
    setShowRestoreModal(true);
  };

  const handleExecuteRestore = () => {
    if (!selectedSnapshot || !targetItemName) return;
    sound.playClick();
    setShowRestoreModal(false);
    setIsProcessing(true);
    setProcessingMessage(`Restoring ${restoreMode === 'share' ? 'Network Share' : 'Database'} '${targetItemName}'...`);
    setProcessingProgress(15);

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setIsProcessing(false);

          let result;
          if (restoreMode === 'share') {
            result = backupEngine.restoreShare(selectedSnapshot.id, targetItemName);
            // If outbreak engine is active, restore share there as well!
            if (outbreakEngine) {
              outbreakEngine.restoreShare(targetItemName);
            }
          } else {
            result = backupEngine.restoreDatabase(selectedSnapshot.id, targetItemName);
          }

          if (result.success) {
            sound.playSuccess();
            showToast('success', result.message);
          } else {
            sound.playError();
            showToast('error', result.message);
          }
          onRefresh?.();
          return 100;
        }
        return prev + 30;
      });
    }, 250);
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

      {/* Progress Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <div className="bg-[#161a24] border border-slate-700 p-6 rounded-lg max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <FolderSync size={36} className="text-sky-400 animate-spin mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">{processingMessage}</h3>
            <p className="text-xs text-slate-400 mb-4">Verifying VSS snapshot hashes and staging recovery targets.</p>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-sky-500 h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2">{processingProgress}% complete</div>
          </div>
        </div>
      )}

      {/* Top Header & Repository Info */}
      <div className="p-3 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <Archive size={20} className="text-sky-400" />
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <span>Enterprise Backup &amp; Disaster Recovery Console</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 font-mono">
                VSS Snapshot Engine
              </span>
            </h1>
            <div className="text-[11px] text-slate-400">
              Total Storage In Use: <span className="font-mono text-white font-bold">{totalStorageGb} GB</span> &bull; Retained Snapshots: {allSnapshots.length}
            </div>
          </div>
        </div>

        <button
          onClick={() => onRefresh?.()}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-medium transition-colors"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Server Selector Bar & Snapshot Controls */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-700/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Server:</span>
          {['All', ...servers.map((s) => s.id)].map((srvId) => (
            <button
              key={srvId}
              onClick={() => {
                sound.playClick();
                setSelectedServer(srvId);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors border ${
                selectedServer === srvId
                  ? 'bg-sky-600/25 text-sky-300 border-sky-500/50'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
            >
              {srvId}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Full / Incremental Toggle */}
          <div className="flex items-center bg-slate-800/80 rounded border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setSnapshotType('Full');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                snapshotType === 'Full' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setSnapshotType('Incremental');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                snapshotType === 'Incremental' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Incremental
            </button>
          </div>

          <button
            onClick={handleTakeSnapshot}
            disabled={selectedServer === 'All'}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow ${
              selectedServer === 'All'
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
            }`}
          >
            <Camera size={14} />
            <span>Take Instant Snapshot</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Snapshots Table + Details & Restore Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Snapshot Repository Table */}
        <div className="flex-1 flex flex-col bg-[#141720] border-r border-slate-700/60">
          <div className="p-2.5 border-b border-slate-700/60 bg-slate-900/40 text-xs font-semibold text-slate-300">
            Available Recovery Snapshots ({filteredSnapshots.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
            {filteredSnapshots.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No backup snapshots recorded for {selectedServer}.
              </div>
            ) : (
              filteredSnapshots.map((snap) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <div
                    key={snap.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSnapshotId(snap.id);
                    }}
                    className={`p-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-sky-950/30 border-l-2 border-sky-400'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white">{snap.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                          {snap.recoveryPointType}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          {snap.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(snap.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-200 mb-1">
                      <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                        <Server size={13} className="text-slate-400" />
                        <span>{snap.serverName}</span>
                      </div>
                      <span className="font-mono text-slate-400">{snap.sizeGb} GB</span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      {snap.sharesIncluded.length > 0 && (
                        <span>Shares: {snap.sharesIncluded.join(', ')}</span>
                      )}
                      {snap.databasesIncluded && snap.databasesIncluded.length > 0 && (
                        <span> | DBs: {snap.databasesIncluded.join(', ')}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Snapshot Detail & Restore Actions */}
        <div className="w-96 flex flex-col bg-[#12151c] shrink-0">
          {selectedSnapshot ? (
            <>
              {/* Snapshot Inspector Header */}
              <div className="p-3.5 border-b border-slate-700/60 bg-[#161922] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Recovery Point Details
                  </div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">
                    {selectedSnapshot.id}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase">
                  {selectedSnapshot.recoveryPointType} Snapshot
                </span>
              </div>

              {/* Inspector Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Source Server</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {selectedSnapshot.hostId}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{selectedSnapshot.serverName}</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Archive Size</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      {selectedSnapshot.sizeGb} GB
                    </div>
                    <div className="text-[10px] text-slate-400">Compressed VSS</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Timestamp Created
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800 font-mono text-slate-300">
                    {new Date(selectedSnapshot.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Included Network Shares */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center space-x-1">
                    <HardDrive size={12} className="text-sky-400" />
                    <span>Included Network Shares ({selectedSnapshot.sharesIncluded.length})</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                    {selectedSnapshot.sharesIncluded.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic">No network shares in this backup</div>
                    ) : (
                      selectedSnapshot.sharesIncluded.map((sh) => (
                        <div key={sh} className="text-[11px] font-mono text-sky-300 flex items-center justify-between">
                          <span>\\{selectedSnapshot.hostId}\{sh}</span>
                          <span className="text-[10px] text-slate-500">Available</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Included SQL Databases */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center space-x-1">
                    <Database size={12} className="text-amber-400" />
                    <span>Included Databases ({selectedSnapshot.databasesIncluded?.length || 0})</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                    {(!selectedSnapshot.databasesIncluded || selectedSnapshot.databasesIncluded.length === 0) ? (
                      <div className="text-[11px] text-slate-500 italic">No SQL databases in this backup</div>
                    ) : (
                      selectedSnapshot.databasesIncluded.map((db) => (
                        <div key={db} className="text-[11px] font-mono text-amber-300 flex items-center justify-between">
                          <span>{db}</span>
                          <span className="text-[10px] text-slate-500">Clean</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Restore Action Buttons */}
              <div className="p-3 border-t border-slate-700/60 bg-[#161922] space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Target Disaster Recovery Actions
                </div>

                <button
                  onClick={() => handleInitiateRestore('share')}
                  disabled={selectedSnapshot.sharesIncluded.length === 0}
                  className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition-colors border ${
                    selectedSnapshot.sharesIncluded.length === 0
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-sky-600/30 text-sky-200 border-sky-500/50 hover:bg-sky-600/40'
                  }`}
                >
                  <RotateCcw size={13} />
                  <span>Restore Network Share</span>
                </button>

                <button
                  onClick={() => handleInitiateRestore('database')}
                  disabled={!selectedSnapshot.databasesIncluded || selectedSnapshot.databasesIncluded.length === 0}
                  className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition-colors border ${
                    !selectedSnapshot.databasesIncluded || selectedSnapshot.databasesIncluded.length === 0
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-amber-600/30 text-amber-200 border-amber-500/50 hover:bg-amber-600/40'
                  }`}
                >
                  <Database size={13} />
                  <span>Restore SQL Database</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs p-6">
              <Archive size={36} className="text-slate-600 mb-2" />
              <span>Select a snapshot to inspect</span>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && selectedSnapshot && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a24] border border-slate-700 rounded-lg max-w-md w-full shadow-2xl flex flex-col">
            <div className="p-3.5 border-b border-slate-700 bg-slate-900/60 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                <RotateCcw size={15} className="text-sky-400" />
                <span>Confirm Point-in-Time Restore</span>
              </h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                &times;
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 flex items-start space-x-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  Restoring will overwrite current files on <strong>{selectedSnapshot.serverName}</strong> with state from <strong>{selectedSnapshot.id}</strong>.
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                  Select {restoreMode === 'share' ? 'Network Share' : 'SQL Database'} to Restore:
                </label>
                <select
                  value={targetItemName}
                  onChange={(e) => setTargetItemName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-sky-500"
                >
                  {restoreMode === 'share'
                    ? selectedSnapshot.sharesIncluded.map((s) => (
                        <option key={s} value={s}>
                          \\{selectedSnapshot.hostId}\{s}
                        </option>
                      ))
                    : (selectedSnapshot.databasesIncluded || []).map((db) => (
                        <option key={db} value={db}>
                          {db}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div className="p-3 border-t border-slate-700 bg-slate-900/60 flex justify-end space-x-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow"
              >
                Execute Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};