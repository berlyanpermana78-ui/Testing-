import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Terminal, Copy, Check, MessageSquare, ArrowDown, User, ShieldAlert, FileCode, Download, FileText, Globe } from 'lucide-react';
import { ChatMessage, ToneType } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentTone: ToneType;
  focusMode: boolean;
  onOptimizeSample: (prompt: string) => void;
}

// Interactive Real-Time Cognitive Thinking Trace (Alur Berpikir)
function ThinkingTrace({ currentTone }: { currentTone: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    { label: 'VECTOR INBOUND', text: 'Scanning memory stream for injection vectors and anti-jailbreak anomalies...', code: 'SEC_GUARD_0X49' },
    { label: 'GRAPH CACHE', text: 'Retrieving contextual historical session memory links from local cache...', code: 'MEM_CACHED_OK' },
    { label: 'TONE MUTATOR', text: `Adjusting LLM configuration arrays with active persona parameter [${currentTone}]`, code: 'CFG_TONE_VAL' },
    { label: 'INFERENCE INFRA', text: 'Requesting neural context tokens from safe gemini-3.5-flash backend engine...', code: 'NEURAL_RUNNING' },
    { label: 'PARSER MATRIX', text: 'Synthesizing response characters, building tables, rendering math & code formatting...', code: 'PARSE_SYNTAX_OK' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 850);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="border border-neutral-900 bg-[#040404] rounded p-4 font-mono text-[11px] text-neutral-400 space-y-2.5 max-w-full my-3 hover:border-neutral-800 transition-colors shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-200 animate-ping"></div>
          <span className="font-bold tracking-wider text-neutral-200">ALUR BERPIKIR // MONOMIND MIND LAYER</span>
        </div>
        <span className="text-[9px] text-neutral-600">LIVE_TRACE_SECURE</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone = idx < stepIndex;
          const isActive = idx === stepIndex;
          const isPending = idx > stepIndex;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 transition-opacity duration-200 ${
                isPending ? 'opacity-35' : 'opacity-100'
              }`}
            >
              <span className={`text-[10px] font-bold min-w-[14px] ${
                isDone ? 'text-neutral-500' : isActive ? 'text-neutral-100' : 'text-neutral-800'
              }`}>
                {isDone ? '✓' : isActive ? '●' : '○'}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] tracking-wider font-semibold ${
                    isActive ? 'text-neutral-100' : 'text-neutral-500'
                  }`}>
                    [{step.label}]
                  </span>
                  <span className="text-[8px] text-neutral-700">{step.code}</span>
                </div>
                <p className={`text-[10px] mt-0.5 leading-relaxed ${
                  isActive ? 'text-neutral-300' : 'text-neutral-500'
                }`}>
                  {step.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Sub-component for a copyable and fully downloadable Code Block within markdown
function CustomCodeBlock({ inline, className, children }: { inline?: boolean; className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Extract language if present
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : 'code';

  const extensionMap: Record<string, string> = {
    python: 'py', py: 'py',
    javascript: 'js', js: 'js',
    typescript: 'ts', ts: 'ts',
    react: 'tsx', jsx: 'jsx', tsx: 'tsx',
    css: 'css', html: 'html', json: 'json',
    shell: 'sh', bash: 'sh', sh: 'sh',
    sql: 'sql', rust: 'rs', rs: 'rs',
    go: 'go', cpp: 'cpp', c: 'c',
    yaml: 'yml', yml: 'yml', markdown: 'md', md: 'md'
  };

  const ext = extensionMap[lang.toLowerCase()] || 'txt';

  // Dynamic real file download logic
  const handleDownload = () => {
    try {
      const blob = new Blob([codeText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monomind_source_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed downloading file:', error);
    }
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-xs rounded">
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 border border-neutral-800 rounded bg-[#0b0b0b] overflow-hidden text-left shadow-lg">
      {/* Code Header bar */}
      <div className="bg-[#0e0e0e] border-b border-neutral-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
            {lang}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Real file download action */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-[#0f0f0f] hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 py-1 px-2.5 rounded text-[10px] font-mono text-neutral-400 hover:text-neutral-100 transition-all select-none cursor-pointer"
            title="Download block as real-time source file"
          >
            <Download className="w-3 h-3" />
            <span>Download .{ext}</span>
          </button>

          {/* Copy snippet clipboard function */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 py-1 px-2.5 rounded text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-all select-none cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-neutral-200" />
                <span className="text-neutral-200 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-neutral-200 font-mono text-xs leading-relaxed selection:bg-neutral-800">
        <pre>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ChatArea({ messages, isLoading, currentTone, focusMode, onOptimizeSample }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Native auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isLoading]);

  // Handle scroll listener to show "back to bottom" button if scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
    setShowScrollButton(!isAtBottom && target.scrollTop > 100);
  };

  // Sample prompt helpers for blank states
  const samplePrompts = [
    { text: "Bantu saya menulis micro-service Python yang efisien dan rapi", label: "Buat Micro-Service" },
    { text: "Lakukan telaah filosofis mengenai intuisi buatan vs sintesis logis", label: "Telaah Filosofis" },
    { text: "Analisis kode data ini dan berikan saran batas performa efisiensi", label: "Batas Performa" }
  ];

  return (
    <div 
      className="flex-1 overflow-y-auto bg-black flex flex-col relative px-4 sm:px-8 py-6"
      onScroll={handleScroll}
    >
      {/* Messages Stream Wrapper container */}
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-start">
        
        {messages.length === 0 ? (
          /* Landing/Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-12 text-center">
            
            {/* Elegant futuristic floating design logo */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-neutral-800/20 blur-2xl rounded-full"></div>
              <div className="relative h-16 w-16 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.05)]">
                <span className="font-display font-light text-3xl tracking-tighter text-neutral-300">M</span>
              </div>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-neutral-100 uppercase mb-2">
              MONOMIND AI
            </h1>
            <p className="max-w-md text-sm text-neutral-400 font-sans leading-relaxed mb-8">
              Selamat datang di terminal dialog premium. Berdiskusi secara mendalam menggunakan modul kecerdasan buatan modular tercepat.
            </p>

            {/* Persona Indicator Widget */}
            <div className="mb-10 px-4 py-2 bg-[#090909] border border-neutral-900 rounded-full inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-200 animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-widest text-[#737373] uppercase">
                MODEL JALUR AKTIF: {currentTone}
              </span>
            </div>

            {/* Context Sample Prompts Trigger Section */}
            <div className="w-full max-w-lg space-y-3">
              <div className="text-[10px] font-mono tracking-widest text-neutral-600 uppercase text-center">
                REKOMENDASI TOPIK DISKUSI
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samplePrompts.map((seeded, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOptimizeSample(seeded.text)}
                    className="p-3 text-left bg-[#070707] hover:bg-[#0c0c0c] border border-neutral-900 hover:border-neutral-800 rounded font-sans text-xs text-neutral-400 hover:text-neutral-200 transition-all duration-200 group flex flex-col justify-between h-20 text-left select-none cursor-pointer"
                  >
                    <span className="truncate text-neutral-200 font-medium group-hover:text-neutral-100">
                      {seeded.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 line-clamp-1 group-hover:text-neutral-400 font-mono mt-1">
                      {seeded.text} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Conversation Feed */
          <div className="space-y-8 pb-12 pt-4">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  id={`chat-msg-${message.id}`}
                  className={`flex gap-4 sm:gap-6 items-start ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Left avatar sign for models */}
                  {!isUser && (
                    <div className="h-8 w-8 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs font-mono font-medium text-neutral-300 shadow-sm flex-shrink-0 mt-0.5">
                      M1
                    </div>
                  )}

                  {/* Chat bubble body container */}
                  <div
                    className={`max-w-[85%] flex flex-col ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Header tags */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-neutral-500">
                        {isUser ? 'PENGGUNA' : `MONOMIND [${currentTone}]`}
                      </span>
                      {message.isOptimized && (
                        <span className="px-1.5 py-0.2 text-[8px] bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono rounded inline-flex items-center gap-1 uppercase tracking-wider">
                          <Sparkles className="w-2 h-2 text-neutral-200" />
                          Dioptimalkan
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-neutral-500/60 font-light">
                        {message.timestamp}
                      </span>
                    </div>

                    {/* Styled Text body bubble / Custom Markdown display */}
                    <div
                      className={`text-sm leading-relaxed ${
                        isUser
                          ? 'bg-neutral-900 text-neutral-100 border border-neutral-800 rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm'
                          : 'text-neutral-200 px-1 py-1 w-full'
                      }`}
                    >
                      {isUser ? (
                        <div className="space-y-2">
                          {message.file && (
                            <div className="mb-2 p-2 bg-[#050505] border border-neutral-800 rounded flex items-center gap-2 text-xs font-mono text-neutral-300">
                              <FileText className="w-3.5 h-3.5 text-neutral-400" />
                              <div className="flex flex-col text-left">
                                <span className="font-semibold text-neutral-100 truncate max-w-[180px]">
                                  {message.file.name}
                                </span>
                                <span className="text-[9px] text-neutral-500">
                                  {(message.file.size / 1024).toFixed(1)} KB (Isi terbaca)
                                </span>
                              </div>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap font-sans break-words text-left">{message.text || 'Mengirim berkas lampiran.'}</p>
                        </div>
                      ) : (
                        <div id={`markdown-container-${message.id}`} className="prose prose-invert max-w-none prose-xs selection:bg-neutral-800 prose-headings:font-display prose-headings:font-semibold prose-headings:text-neutral-100 prose-headings:tracking-tight prose-p:font-sans prose-p:text-neutral-300 prose-p:leading-relaxed prose-a:text-neutral-200 prose-a:underline hover:prose-a:text-neutral-100 prose-strong:text-neutral-100 prose-ul:font-sans prose-ul:text-neutral-300 prose-ol:font-sans prose-ol:text-neutral-300">
                          <ReactMarkdown
                            components={{
                              code({ node, className, children, ...props }: any) {
                                const isInline = !className;
                                return (
                                  <CustomCodeBlock
                                    inline={isInline}
                                    className={className}
                                    children={children}
                                  />
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="my-5 overflow-x-auto border border-neutral-800 rounded">
                                    <table className="min-w-full divide-y divide-neutral-800 font-sans text-xs">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              thead({ children }) {
                                return <thead className="bg-[#0b0b0b]">{children}</thead>;
                              },
                              tbody({ children }) {
                                return <tbody className="divide-y divide-neutral-900 bg-black">{children}</tbody>;
                              },
                              tr({ children }) {
                                return <tr className="hover:bg-neutral-950/40 transition-colors">{children}</tr>;
                              },
                              th({ children }) {
                                return <th className="px-4 py-2.5 text-left font-semibold text-neutral-200 uppercase tracking-wider font-display border-b border-neutral-800">{children}</th>;
                              },
                              td({ children }) {
                                return <td className="px-4 py-2 text-neutral-300">{children}</td>;
                              },
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>

                          {/* Grounding web search sources list */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-4 pt-3.5 border-t border-neutral-900 font-mono text-[11px] animate-fade-in">
                              <div className="flex items-center gap-1.5 text-neutral-400 mb-2 uppercase tracking-widest text-[9px] font-semibold select-none">
                                <Globe className="w-3.5 h-3.5 text-neutral-500 animate-spin" style={{ animationDuration: '6s' }} />
                                <span>Sumber Pencarian Web ({message.sources.length}):</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {message.sources.map((src, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={src.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2 py-1 bg-[#050505] hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-neutral-100 rounded text-[10px] transition-all max-w-full truncate"
                                    title={src.title}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 flex-shrink-0" />
                                    <span className="truncate max-w-[190px]">{src.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right avatar sign for user */}
                  {isUser && (
                    <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-mono font-medium text-neutral-400 flex-shrink-0 mt-0.5 shadow-inner">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Streaming/Loading State indicator */}
            {isLoading && (
              <div className="flex gap-4 sm:gap-6 items-start justify-start w-full">
                <div className="h-8 w-8 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs font-mono font-medium text-neutral-300 shadow-sm flex-shrink-0 mt-0.5">
                  M1
                </div>
                <div className="flex-1 max-w-[85%] flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-neutral-500">
                      MONOMIND [{currentTone}]
                    </span>
                    <span className="text-[9px] font-mono text-neutral-600 animate-pulse">
                      PROCESSING COGNITIVE TRACE...
                    </span>
                  </div>
                  
                  {/* Real-time thinking logger stream */}
                  <div className="w-full">
                    <ThinkingTrace currentTone={currentTone} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anchored bottom ref to guarantee page pins */}
        <div ref={scrollRef} />
      </div>

      {/* Floating back-to-bottom prompt helper */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-4 sm:right-8 p-2.5 bg-[#090909] hover:bg-[#141414] border border-neutral-800 hover:border-neutral-700 text-neutral-100 rounded-full shadow-2xl transition-all cursor-pointer z-20 flex items-center justify-center group-hover:scale-105"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 text-neutral-300 group-hover:text-neutral-100" />
        </button>
      )}
    </div>
  );
}
