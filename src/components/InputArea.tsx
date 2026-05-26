import React, { useState } from 'react';
import { Send, Sparkles, Loader2, Paperclip, X, FileText, Globe } from 'lucide-react';
import ToneSelector from './ToneSelector';
import { ToneType, FileAttachment } from '../types';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string, file?: FileAttachment) => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  currentTone: ToneType;
  onChangeTone: (tone: ToneType) => void;
  isLoading: boolean;
  webSearch: boolean;
  setWebSearch: (value: boolean) => void;
}

export default function InputArea({
  input,
  setInput,
  onSend,
  onOptimize,
  isOptimizing,
  currentTone,
  onChangeTone,
  isLoading,
  webSearch,
  setWebSearch,
}: InputAreaProps) {
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit check: 4MB Max
    if (file.size > 4 * 1024 * 1024) {
      setFileError('Ukuran file melebihi batas aman 4MB.');
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        content: content || '',
      });
    };
    reader.onerror = () => {
      setFileError('Gagal membaca isi dokumen.');
    };
    reader.readAsText(file);
    
    // reset target value so the same file selection can trigger changes again
    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setFileError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || isLoading) return;
    onSend(input, attachedFile || undefined);
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || attachedFile) && !isLoading) {
        onSend(input, attachedFile || undefined);
        setAttachedFile(null);
      }
    }
  };

  return (
    <div className="border-t border-neutral-900 bg-black/95 px-4 pb-6 pt-4 backdrop-blur-md">
      <div className="mx-auto max-w-3xl space-y-2.5">
        
        {/* File Attachment preview node description */}
        {attachedFile && (
          <div className="flex items-center justify-between p-2.5 bg-[#090909] border border-neutral-800 rounded font-mono text-xs text-neutral-300">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-neutral-200" />
              <div className="flex flex-col">
                <span className="truncate max-w-[240px] text-neutral-100 font-medium">
                  {attachedFile.name}
                </span>
                <span className="text-[9px] text-neutral-500">
                  Val: {(attachedFile.size / 1024).toFixed(1)} KB (Isi file berhasil dibaca & dilampirkan)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              className="text-neutral-500 hover:text-neutral-100 p-1 rounded hover:bg-neutral-900 cursor-pointer"
              title="Hapus Dokumen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {fileError && (
          <p className="text-[10px] font-mono text-red-400 select-none">{fileError}</p>
        )}

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2.5">
          
          {/* Tone Selector & Helper Actions Row */}
          <div className="flex items-center justify-between px-1 gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2">
              <ToneSelector currentTone={currentTone} onChangeTone={onChangeTone} />
              
              <button
                type="button"
                onClick={() => setWebSearch(!webSearch)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-[10px] select-none transition-all cursor-pointer h-7 ${
                  webSearch
                    ? 'bg-neutral-100 border-neutral-100 text-black shadow-inner font-semibold'
                    : 'bg-[#090909] border-[#1f1f1f] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
                title="Aktifkan atau nonaktifkan pencarian web Google Search"
              >
                <Globe className={`w-3 h-3 ${webSearch ? 'animate-pulse' : ''}`} />
                <span>CARI WEB: {webSearch ? 'ON' : 'OFF'}</span>
              </button>
            </div>
            
            {(input.trim() || attachedFile) && (
              <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                Hubungkan dengan tombol <kbd className="border border-neutral-800 px-1 rounded bg-neutral-900">Enter</kbd> untuk mengirim
              </span>
            )}
          </div>

          {/* Sleek Input entry dock */}
          <div className="relative flex items-end gap-2 bg-[#050505] border border-neutral-800 rounded-lg focus-within:border-neutral-700/80 p-2 shadow-2xl transition-all duration-200">
            
            {/* Custom file sender trigger */}
            <label
              className={`p-2.5 text-neutral-500 hover:text-neutral-200 cursor-pointer hover:bg-neutral-900 transition-colors rounded select-none ${
                isOptimizing ? 'pointer-events-none opacity-50' : ''
              }`}
              title="Kirim file teks (txt, md, js, py, ts, json, csv...)"
            >
              <Paperclip className="w-4 h-4" />
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.js,.ts,.tsx,.json,.csv,.py,.html,.css,.yaml,.yml,.sh"
                onChange={handleFileChange}
              />
            </label>

            {/* Multiline capable textarea input */}
            <textarea
              id="chat-input-textarea"
              rows={Math.min(6, input.split('\n').length || 1)}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan pikiran baru... Gunakan Shift+Enter untuk baris baru"
              className="flex-1 max-h-48 resize-none bg-transparent py-2.5 pl-1 pr-20 text-sm text-neutral-200 outline-none placeholder-neutral-600 font-sans"
              disabled={isOptimizing}
            />

            {/* Quick Actions overlay: Spark/Optimize wand, Send */}
            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
              
              {/* Prompt Optimizer Spark/Magic Wand trigger */}
              <button
                id="btn-optimize-prompt"
                type="button"
                onClick={onOptimize}
                disabled={isOptimizing || !input.trim()}
                className={`p-2 rounded border transition-all flex items-center justify-center select-none cursor-pointer ${
                  isOptimizing
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    : input.trim()
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 hover:shadow-[0_0_8px_rgba(255,255,255,0.04)]'
                    : 'bg-transparent border-transparent text-neutral-700 cursor-not-allowed'
                }`}
                title="Optimalkan Prompt Mentah"
              >
                {isOptimizing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>

              {/* Transmit send submit trigger */}
              <button
                id="btn-send-message"
                type="submit"
                disabled={(!input.trim() && !attachedFile) || isLoading || isOptimizing}
                className={`p-2 rounded flex items-center justify-center transition-all select-none cursor-pointer ${
                  (input.trim() || attachedFile) && !isLoading && !isOptimizing
                    ? 'bg-neutral-100 hover:bg-neutral-200 text-black shadow-sm'
                    : 'bg-neutral-950 text-neutral-700 cursor-not-allowed border border-neutral-900/60'
                }`}
                title="Kirim Obrolan"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Dynamic Warning Alert in case Key is Missing */}
        <div className="mt-3.5 text-center">
          <p className="text-[10px] font-mono text-neutral-600 leading-normal">
            Terminal MonoMind // Dilengkapi penganalisis file taktis & perisai pertahanan pelindung.
          </p>
        </div>
      </div>
    </div>
  );
}
