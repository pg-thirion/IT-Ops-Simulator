import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Trash2, HelpCircle } from 'lucide-react';
import { TerminalEngine, TerminalOutputLine } from '../../simulation/terminalEngine';
import { NetworkEngine } from '../../simulation/networkEngine';
import { sound } from '../../utils/audio';

interface TerminalAppProps {
  currentHostId: string;
  networkEngine: NetworkEngine;
  terminalEngine: TerminalEngine;
  onSelectHost?: (hostId: string) => void;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  currentHostId,
  networkEngine,
  terminalEngine,
  onSelectHost,
}) => {
  const [hostId, setHostId] = useState<string>(currentHostId);
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [output, setOutput] = useState<TerminalOutputLine[]>([
    { text: 'Windows PowerShell', type: 'system' },
    { text: 'Copyright (C) Microsoft Corporation. All rights reserved.', type: 'system' },
    { text: `Targeting: ${currentHostId} | Type 'help' for available network commands.`, type: 'output' },
    { text: '', type: 'output' },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHostId(currentHostId);
  }, [currentHostId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    sound.playKeypress();

    if (e.key === 'Enter') {
      e.preventDefault();
      sound.playEnter();
      const cmd = inputVal.trim();
      if (!cmd) return;

      const newHistory = [...history, cmd];
      setHistory(newHistory);
      setHistoryIndex(-1);

      if (cmd.toLowerCase() === 'cls' || cmd.toLowerCase() === 'clear') {
        setOutput([]);
        setInputVal('');
        return;
      }

      // Add user command line
      const promptText = `PS C:\\Users\\Administrator> ${cmd}`;
      const res = terminalEngine.execute(hostId, cmd);

      setOutput((prev) => [
        ...prev,
        { text: promptText, type: 'command' },
        ...res,
        { text: '', type: 'output' },
      ]);

      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    }
  };

  const runQuickCommand = (cmd: string) => {
    sound.playEnter();
    const promptText = `PS C:\\Users\\Administrator> ${cmd}`;
    const res = terminalEngine.execute(hostId, cmd);
    setOutput((prev) => [
      ...prev,
      { text: promptText, type: 'command' },
      ...res,
      { text: '', type: 'output' },
    ]);
  };

  const allHosts = networkEngine.getAllHosts();

  const getLineClass = (type: TerminalOutputLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-sky-300 font-semibold';
      case 'error':
        return 'text-rose-400 font-medium';
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'system':
        return 'text-slate-400 italic';
      default:
        return 'text-slate-200';
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#0c0e14] font-mono text-xs select-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Toolbar */}
      <div
        className="h-9 bg-[#161a23] border-b border-slate-800 px-3 flex items-center justify-between select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <TerminalIcon size={14} className="text-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300">Terminal Host:</span>
          <select
            value={hostId}
            onChange={(e) => {
              const val = e.target.value;
              setHostId(val);
              onSelectHost?.(val);
              setOutput((prev) => [
                ...prev,
                { text: `[Session switched to host ${val}]`, type: 'system' },
              ]);
            }}
            className="bg-[#0f1117] border border-slate-700 rounded px-2 py-0.5 text-xs text-sky-400 focus:outline-none focus:border-sky-500 font-mono"
          >
            {allHosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.id} ({h.hostname}) - {h.department}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setOutput([])}
            className="px-2 py-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 text-[10px] flex items-center space-x-1 transition-colors"
            title="Clear Terminal Screen"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Console Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {output.map((line, idx) => (
          <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${getLineClass(line.type)}`}>
            {line.text}
          </div>
        ))}

        {/* Active Input Line */}
        <div className="flex items-center space-x-1.5 pt-1 text-slate-100">
          <span className="text-sky-400 select-none">PS C:\Users\Administrator&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-slate-100 caret-sky-400 p-0"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Quick Command Shortcuts Bar */}
      <div
        className="bg-[#12151e] border-t border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-[11px] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500">Quick CLI:</span>
          <button
            onClick={() => runQuickCommand('ipconfig /all')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-sky-300 font-mono border border-slate-700 text-[10px]"
          >
            ipconfig /all
          </button>
          <button
            onClick={() => runQuickCommand('ping 8.8.8.8')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-emerald-300 font-mono border border-slate-700 text-[10px]"
          >
            ping 8.8.8.8
          </button>
          <button
            onClick={() => runQuickCommand('nslookup example.com')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-amber-300 font-mono border border-slate-700 text-[10px]"
          >
            nslookup example.com
          </button>
          <button
            onClick={() => runQuickCommand('ipconfig /renew')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-purple-300 font-mono border border-slate-700 text-[10px]"
          >
            ipconfig /renew
          </button>
          <button
            onClick={() => runQuickCommand('Get-Service')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 font-mono border border-slate-700 text-[10px]"
          >
            Get-Service
          </button>
          <button
            onClick={() => runQuickCommand('help')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-mono border border-slate-700 text-[10px] flex items-center space-x-0.5"
          >
            <HelpCircle size={10} />
            <span>help</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-mono hidden md:block">
          Host: {hostId}
        </div>
      </div>
    </div>
  );
};
