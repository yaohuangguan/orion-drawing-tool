import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, y, visible, onClose, onUndo, onRedo, canUndo, canRedo, onClear 
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (visible) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-[100] w-56 text-sm font-medium text-gray-700 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
        Actions
      </div>
      <button 
        onClick={() => { onUndo(); onClose(); }}
        disabled={!canUndo}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
      >
        <span className="group-hover:text-gray-900">Undo</span>
        <div className="flex items-center gap-2">
           <kbd className="hidden font-mono text-[10px] bg-gray-100 px-1 rounded text-gray-500 group-hover:inline-block">Ctrl+Z</kbd>
           <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </div>
      </button>
      <button 
        onClick={() => { onRedo(); onClose(); }}
        disabled={!canRedo}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between group"
      >
        <span className="group-hover:text-gray-900">Redo</span>
        <div className="flex items-center gap-2">
            <kbd className="hidden font-mono text-[10px] bg-gray-100 px-1 rounded text-gray-500 group-hover:inline-block">Ctrl+Y</kbd>
           <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
        </div>
      </button>
      <div className="h-px bg-gray-100 my-1"></div>
      <button 
        onClick={() => { onClear(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 flex items-center justify-between"
      >
        <span>Clear Canvas</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  );
};