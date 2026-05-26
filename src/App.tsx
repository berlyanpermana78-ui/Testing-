import React, { useState, useEffect } from 'react';
import { Menu, Sparkles, AlertCircle, RefreshCw, X, Maximize, Minimize, Check, Copy } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import { ChatSession, ChatMessage, ToneType, FileAttachment } from './types';

// Helper to construct elegant timestamp
const getFormattedTime = (): string => {
  const date = new Date();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Helper for unique ID generation
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [webSearch, setWebSearch] = useState<boolean>(false);
  
  // Custom toast notifications for action confirmation feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('monomind_sessions_v1');
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // migration for older tone types to avoid crash on load
          const sanitized = parsed.map(s => ({
            ...s,
            tone: (s.tone as string === 'Deep Thinker' || s.tone as string === 'Sarcastic & Witty' || s.tone as string === 'Gen-Z Slang' || s.tone as string === 'Ultra-Minimalist') 
              ? 'mono-thinking' 
              : s.tone
          }));
          setSessions(sanitized);
          setActiveSessionId(sanitized[0].id);
          return;
        }
      }
      
      // Auto build an initial starting session if blank
      const defaultId = generateId();
      const initial: ChatSession = {
        id: defaultId,
        title: 'Pena Pikiran Utama',
        createdAt: new Date().toISOString(),
        messages: [],
        tone: 'mono-thinking',
      };
      setSessions([initial]);
      setActiveSessionId(defaultId);
    } catch (e) {
      console.error('Failed reading offline state storage:', e);
    }
  }, []);

  // Save to local storage on sessions state updates
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('monomind_sessions_v1', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('monomind_sessions_v1');
    }
  }, [sessions]);

  // Utility toast dispatcher
  const triggerToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const currentTone = activeSession ? activeSession.tone : ('mono-thinking' as ToneType);

  // 1. Create a "New Chat" session
  const handleNewSession = () => {
    const newId = generateId();
    const newSession: ChatSession = {
      id: newId,
      title: `Sesi Dialog ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [],
      tone: 'mono-thinking',
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    triggerToast('Sesi obrolan baru berhasil dibuat');
  };

  // 2. Delete archived session data
  const handleDeleteSession = (id: string) => {
    const remains = sessions.filter((s) => s.id !== id);
    setSessions(remains);
    
    // Manage state selection fallback
    if (activeSessionId === id) {
      if (remains.length > 0) {
        setActiveSessionId(remains[0].id);
      } else {
        const fallbackId = generateId();
        const fallbackSession: ChatSession = {
          id: fallbackId,
          title: 'Pena Pikiran Utama',
          createdAt: new Date().toISOString(),
          messages: [],
          tone: 'mono-thinking',
        };
        setSessions([fallbackSession]);
        setActiveSessionId(fallbackId);
      }
    }
    triggerToast('Riwayat obrolan berhasil dihapus', 'warn');
  };

  // 3. Mutate tone profile instantly
  const handleToneChange = (newTone: ToneType) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, tone: newTone } : s))
    );
    triggerToast(`Model rekayasa beralih ke: ${newTone}`);
  };

  // 4. Send query to standard dialog generator
  const handleSendMessage = async (textToSend: string, file?: FileAttachment, isFromOptimizer = false) => {
    if (!activeSessionId || (!textToSend.trim() && !file) || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: textToSend,
      timestamp: getFormattedTime(),
      isOptimized: isFromOptimizer,
      file: file,
    };

    // Optimistically push message user details
    let currentMessages = activeSession ? [...activeSession.messages, userMessage] : [userMessage];
    
    // Auto-update title based on the first prompt if it was generic
    let updatedTitle = activeSession?.title || 'Sinkronisasi dialog';
    if (activeSession && activeSession.messages.length === 0) {
      const displayTitle = textToSend.trim() || (file ? `File: ${file.name}` : 'Sinkronisasi dialog');
      updatedTitle = displayTitle.length > 25 ? displayTitle.substring(0, 25) + '...' : displayTitle;
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: currentMessages,
            }
          : s
      )
    );

    setInput('');
    setIsLoading(true);

    try {
      // Clean map layout with attached file content parsed straight to the API prompt
      const enrichedMessagesForAPI = currentMessages.map((msg) => {
        if (msg.role === 'user' && msg.file) {
          return {
            role: 'user',
            text: `[INFO DISKUSI BERKAS] Nama File: ${msg.file.name}\nIsi File:\n"""\n${msg.file.content}\n"""\n\nInstruksi Pengguna: ${msg.text.trim() || 'Tolong baca, pelajari, dan analisis isi berkas di atas.'}`,
          };
        }
        return {
          role: msg.role,
          text: msg.text,
        };
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: enrichedMessagesForAPI,
          tone: currentTone,
          webSearch: webSearch,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal tersambung dengan server');
      }

      const botReply: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: data.text,
        timestamp: getFormattedTime(),
        sources: data.sources,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...currentMessages, botReply] }
            : s
        )
      );

    } catch (err: any) {
      console.error('Chat transmit error:', err);
      // Construct a premium system warning bubble directly in dialogue flow
      const botErrorReply: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: `### ⚠️ Kesalahan Konektansi Utama\n\nGagal memuat muatan respon AI.\n\n* **Detail**: ${err.message || 'Quantum interface drop'}\n* **Tindakan**: Pastikan \`GEMINI_API_KEY\` Anda sudah diisi dengan benar di panel **Secrets** atau periksa koneksi internet Anda.`,
        timestamp: getFormattedTime(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...currentMessages, botErrorReply] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Advanced Prompt Optimizer wand action
  const handleOptimizePrompt = async () => {
    if (!input.trim() || isOptimizing) return;

    setIsOptimizing(true);
    triggerToast('Menghubungkan ke mesin optimasi...', 'success');

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server optimasi mengalami gangguan');
      }

      setInput(data.optimizedPrompt);
      triggerToast('Prompt berhasil direstrukturisasi!', 'success');
    } catch (err: any) {
      console.error('Optimization error:', err);
      triggerToast(err.message || 'Gagal mengoptimalkan prompt', 'warn');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Helper trigger to load sample preset seeds directly and optimize immediately
  const handleSeededLoadAndOptimize = async (seededText: string) => {
    setInput(seededText);
    triggerToast('Mengisi draf teks awal...');
  };

  // 6. Exports formatted streams dynamically
  const handleExportSession = (format: 'md' | 'txt') => {
    if (!activeSession || activeSession.messages.length === 0) {
      triggerToast('Tidak ada obrolan yang dapat diekspor', 'warn');
      return;
    }

    let exportContent = '';
    const dateStr = new Date(activeSession.createdAt).toLocaleDateString();

    if (format === 'md') {
      exportContent += `# Sesi MonoMind AI: ${activeSession.title}\n`;
      exportContent += `* **Tanggal Pembuatan**: ${dateStr}\n`;
      exportContent += `* **Model Persona**: ${activeSession.tone}\n`;
      exportContent += `* **Hash Sesi**: ${activeSession.id}\n\n`;
      exportContent += `---\n\n`;

      activeSession.messages.forEach((msg) => {
        const tag = msg.role === 'user' ? '### 👤 Pengguna' : `### 👽 MonoMind AI [${activeSession.tone}]`;
        const fileTag = msg.file ? `\n*(Lampiran Dokumen: ${msg.file.name})*\n` : '';
        exportContent += `${tag} - *(${msg.timestamp})*${fileTag}\n\n${msg.text}\n\n`;
      });
    } else {
      exportContent += `=========================================\n`;
      exportContent += `EKSPOR ALIRAN SESI MONOMIND AI \n`;
      exportContent += `=========================================\n`;
      exportContent += `Judul: ${activeSession.title}\n`;
      exportContent += `Model Persona: ${activeSession.tone}\n`;
      exportContent += `Tanggal: ${dateStr}\n\n`;

      activeSession.messages.forEach((msg) => {
        const tag = msg.role === 'user' ? 'PENGGUNA' : 'MONOMIND AI';
        const fileTag = msg.file ? ` (File: ${msg.file.name})` : '';
        exportContent += `[${tag}] (${msg.timestamp})${fileTag}:\n${msg.text}\n\n`;
      });
    }

    try {
      const element = document.createElement('a');
      const file = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${activeSession.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_ekspor.${format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      triggerToast(`Sesi berhasil dieor sebagai .${format}`);
    } catch (e) {
      console.error('Download setup failed:', e);
      triggerToast('Pembuatan file unduhan gagal', 'warn');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-neutral-100 font-sans">
      
      {/* 1. Left Sidebar panel */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewSession}
        onDeleteSession={handleDeleteSession}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode(!focusMode)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onExport={handleExportSession}
      />

      {/* Mobile Drawer Shade overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/8 w-full h-full backdrop-blur-sm transition-all"
        />
      )}

      {/* 2. Main Terminal Content Area Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Core Control Top Strip (Only displayed if NOT in focus mode or custom hover bar) */}
        <header
          id="main-top-strip"
          className={`px-4 sm:px-8 py-4 border-b border-neutral-900 bg-black flex items-center justify-between transition-all duration-300 ${
            focusMode ? 'h-0 opacity-0 overflow-hidden py-0 border-none' : 'h-16 opacity-100'
          }`}
        >
          {/* Menu triggers on mobile for drawer */}
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-neutral-400 hover:text-neutral-100 transition-colors p-1"
              aria-label="Buka Menu Samping"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Logo identity */}
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-wider uppercase text-neutral-100">
                {activeSession ? activeSession.title : 'Aliran Dialog'}
              </span>
              <span className="font-mono text-[9px] text-neutral-500 border border-neutral-900 px-1 py-0.2 rounded hidden sm:inline">
                {currentTone}
              </span>
            </div>
          </div>

          {/* Top Quick utilities */}
          <div className="flex items-center gap-3">
            
            {/* Focus mode quick exit */}
            <button
              id="btn-trigger-focus-mode"
              onClick={() => setFocusMode(!focusMode)}
              className="text-neutral-500 hover:text-neutral-100 hover:bg-neutral-900 p-2 border border-neutral-900 rounded font-sans text-xs flex items-center gap-2 transition-colors cursor-pointer"
              title="Isolasi Layar Kerja"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tampilan Fokus</span>
            </button>
          </div>
        </header>

        {/* Minimalist Floating Focus control strip to exit focus mode easily */}
        {focusMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-55 flex items-center gap-3 bg-neutral-950/80 border border-neutral-800 px-4 py-2 rounded-full backdrop-blur-md animate-fade-in shadow-2xl">
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              MODE FOKUS AKTIF
            </span>
            <span className="h-3 w-px bg-neutral-800"></span>
            <button
              id="exit-focus-mode"
              onClick={() => setFocusMode(false)}
              className="text-[10px] font-mono text-neutral-100 hover:text-neutral-300 hover:underline flex items-center gap-1.5 p-0.5 cursor-pointer"
            >
              <Minimize className="w-3 h-3 text-neutral-400" />
              KELUAR FOKUS
            </button>
          </div>
        )}

        {/* Dialogue Stream Message Area rendering */}
        <ChatArea
          messages={activeSession ? activeSession.messages : []}
          isLoading={isLoading}
          currentTone={currentTone}
          focusMode={focusMode}
          onOptimizeSample={handleSeededLoadAndOptimize}
        />

        {/* Floating Input Dock container */}
        <InputArea
          input={input}
          setInput={setInput}
          onSend={(txt, file) => handleSendMessage(txt, file, false)}
          onOptimize={handleOptimizePrompt}
          isOptimizing={isOptimizing}
          currentTone={currentTone}
          onChangeTone={handleToneChange}
          isLoading={isLoading}
          webSearch={webSearch}
          setWebSearch={setWebSearch}
        />
      </main>

      {/* Floating Tactical Toast notifications */}
      {toast && (
        <div
          id="tactical-toast-alert"
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-55 px-4 py-3 rounded border shadow-2xl flex items-center gap-2.5 max-w-sm text-xs font-mono backdrop-blur-md transform transition-all duration-300 translate-y-0 ${
            toast.type === 'warn'
              ? 'bg-[#120606] border-red-950 text-red-100'
              : 'bg-[#060c06] border-neutral-800 text-neutral-200'
          }`}
        >
          {toast.type === 'warn' ? (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-neutral-200 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
