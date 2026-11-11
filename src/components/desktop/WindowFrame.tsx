import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { DesktopWindow } from '../../types/game';

interface WindowFrameProps {
  window: DesktopWindow;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw' | null;

export const WindowFrame: React.FC<WindowFrameProps> = ({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children,
}) => {
  const [pos, setPos] = useState({ x: win.x, y: win.y });
  const [size, setSize] = useState({ width: win.width, height: win.height });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDirection>(null);

  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: win.x,
    posY: win.y,
  });

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startPosX: number;
    startPosY: number;
  }>({
    startX: 0,
    startY: 0,
    startWidth: win.width,
    startHeight: win.height,
    startPosX: win.x,
    startPosY: win.y,
  });

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (win.isMaximized) return;

      if (isDragging) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 120, dragRef.current.posX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.posY + dy)),
        });
      } else if (resizeDir) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const minW = 460;
        const minH = 320;

        let newW = resizeRef.current.startWidth;
        let newH = resizeRef.current.startHeight;
        let newX = resizeRef.current.startPosX;
        let newY = resizeRef.current.startPosY;

        if (resizeDir.includes('e')) {
          newW = Math.max(minW, resizeRef.current.startWidth + dx);
        }
        if (resizeDir.includes('s')) {
          newH = Math.max(minH, resizeRef.current.startHeight + dy);
        }
        if (resizeDir.includes('w')) {
          const calcW = resizeRef.current.startWidth - dx;
          if (calcW >= minW) {
            newW = calcW;
            newX = resizeRef.current.startPosX + dx;
          }
        }
        if (resizeDir.includes('n')) {
          const calcH = resizeRef.current.startHeight - dy;
          if (calcH >= minH) {
            newH = calcH;
            newY = resizeRef.current.startPosY + dy;
          }
        }

        setSize({ width: newW, height: newH });
        setPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeDir(null);
    };

    if (isDragging || resizeDir) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizeDir, win.isMaximized]);

  if (!win.isOpen) {
    return null;
  }

  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-window-control]')) {
      return;
    }
    onFocus();
    if (win.isMaximized) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  };

  const handleStartResize = (e: React.MouseEvent, dir: ResizeDirection) => {
    e.stopPropagation();
    onFocus();
    if (win.isMaximized) return;
    setResizeDir(dir);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startPosX: pos.x,
      startPosY: pos.y,
    };
  };

  const handleWindowMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-window-control]')) {
      return;
    }
    onFocus();
  };

  const frameStyle: React.CSSProperties = {
    position: 'fixed',
    left: win.isMaximized ? 0 : `${pos.x}px`,
    top: win.isMaximized ? 0 : `${pos.y}px`,
    width: win.isMaximized ? '100vw' : `${size.width}px`,
    height: win.isMaximized ? 'calc(100vh - 48px)' : `${size.height}px`,
    zIndex: win.zIndex,
    display: win.isMinimized ? 'none' : 'flex',
  };

  return (
    <div
      data-window-id={win.id}
      style={frameStyle}
      onMouseDown={handleWindowMouseDown}
      className="flex-col bg-[#1e222b] text-slate-100 rounded-lg shadow-2xl border border-slate-700/80 overflow-hidden select-text relative"
    >
      {/* Title bar */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={onMaximize}
        className="h-10 bg-gradient-to-r from-[#181a20] to-[#222631] border-b border-slate-700/60 px-3 flex items-center justify-between cursor-move select-none shrink-0"
      >
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="text-base select-none">{win.icon}</span>
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
            {win.title}
          </span>
        </div>

        {/* Window controls */}
        <div
          data-window-control="container"
          className="flex items-center space-x-1"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-window-control="minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            data-window-control="maximize"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700/50 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            {win.isMaximized ? <Copy size={12} /> : <Square size={12} />}
          </button>
          <button
            type="button"
            data-window-control="close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto bg-[#13161c] relative flex flex-col min-h-0">
        <React.Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              Loading module...
            </div>
          }
        >
          {children}
        </React.Suspense>
      </div>

      {/* 8-Direction Resize Handles (when not maximized) */}
      {!win.isMaximized && (
        <>
          <div
            onMouseDown={(e) => handleStartResize(e, 'e')}
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 'w')}
            className="absolute top-0 left-0 w-2 h-full cursor-ew-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 's')}
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 'n')}
            className="absolute top-0 left-0 w-full h-2 cursor-ns-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 'se')}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 'sw')}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 'ne')}
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-20"
          />
          <div
            onMouseDown={(e) => handleStartResize(e, 'nw')}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-20"
          />
        </>
      )}
    </div>
  );
};
