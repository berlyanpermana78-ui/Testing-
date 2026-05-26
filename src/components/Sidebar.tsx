import React from 'react';
import { Plus, Trash2, Sliders, ToggleLeft, ToggleRight, Sparkles, LogOut, ArrowLeftRight, FileText, Download, Menu, X, MessageSquare } from 'lucide-react';
import { ChatSession, ToneType } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'md' | 'txt') => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  focusMode,
  onToggleFocusMode,
  isOpen,
  onClose,
  onExport,
}: SidebarProps) {
  return (
    <aside
      id="mono-sidebar"
      className={`fixed lg:static top-0 left-0 z-40 h-full w-72 bg-[#000000] border-r border-neutral-900 flex flex-col transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${focusMode ? 'lg:hidden' : 'lg:flex'}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-5 border-b border-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-1 w-1-accent bg-neutral-100 rounded-sm"></div>
          <span className="font-display font-bold text-lg tracking-wider text-neutral-100">
            MONOMIND
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[#737373] border border-neutral-800 px-1.5 py-0.5 rounded uppercase">
            v1.1
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden text-neutral-400 hover:text-neutral-100 transition-colors p-1"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Button: New Chat */}
      <div className="p-4">
        <button
          id="btn-new-chat"
          onClick={() => {
            onNewChat();
            onClose(); // Auto-close on mobile layout
          }}
          className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded border border-neutral-800 font-display font-medium text-sm flex items-center justify-center gap-2.5 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Mulai Sesi Baru
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono font-medium tracking-widest text-neutral-500 uppercase">
          Riwayat Obrolan ({sessions.length})
        </div>

        {sessions.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-neutral-600">
            Matriks memori kosong
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                id={`session-item-${session.id}`}
                className={`group relative flex items-center justify-between rounded px-3 py-2.5 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-neutral-100 border border-neutral-800'
                    : 'text-neutral-400 hover:bg-[#0c0c0c] hover:text-neutral-200 border border-transparent'
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose(); // Mobile layout behavior
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-6">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-neutral-100' : 'text-neutral-600 group-hover:text-neutral-400'}`} />
                  <div className="truncate text-xs font-mono tracking-tight text-left">
                    {session.title || 'Sesi Tanpa Judul'}
                  </div>
                </div>

                {/* Delete button (displays on active state or group hover) */}
                <button
                  id={`btn-delete-${session.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 focus:opacity-100 text-neutral-500 hover:text-neutral-100 transition-all p-1 rounded hover:bg-neutral-800`}
                  title="Hapus Data Sesi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Context Actions / Focus Mode / Export Box */}
      <div className="p-4 border-t border-neutral-950 bg-[#040404] space-y-3.5">
        
        {/* Focus Mode State Indicator */}
        <div className="flex items-center justify-between p-2.5 rounded border border-neutral-900 hover:border-neutral-800 transition-colors bg-[#080808]">
          <div className="flex flex-col">
            <span className="text-xs font-display font-medium text-neutral-200">
              Mode Fokus
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              Isolasi matriks layar
            </span>
          </div>
          <button
            id="toggle-focus-mode"
            onClick={onToggleFocusMode}
            className="text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            {focusMode ? (
              <ToggleRight className="w-8 h-8 text-neutral-100" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-neutral-600" />
            )}
          </button>
        </div>

        {/* Export Matrix actions */}
        {activeSessionId && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono tracking-widest text-[#737373] uppercase px-1">
              Ekspor Aliran Sesi
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-export-markdown"
                onClick={() => onExport('md')}
                className="py-1.5 px-2 bg-transparent hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 rounded font-mono text-[10px] text-neutral-300 hover:text-neutral-100 flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3 h-3 text-neutral-400" />
                Markdown
              </button>
              <button
                id="btn-export-plain"
                onClick={() => onExport('txt')}
                className="py-1.5 px-2 bg-transparent hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 rounded font-mono text-[10px] text-neutral-300 hover:text-neutral-100 flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-3 h-3 text-neutral-400" />
                Teks Biasa
              </button>
            </div>
          </div>
        )}

        {/* Footer info branding */}
        <div className="pt-2 text-center border-t border-neutral-900/50">
          <p className="text-[10px] font-mono text-neutral-600 tracking-wider">
            SYSTEM // OFFLINE CACHE OK
          </p>
        </div>
      </div>
    </aside>
  );
}
