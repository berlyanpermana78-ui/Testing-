import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Sparkles, Smile, MessageSquareCode, ToggleLeft, ToggleRight, Settings2, ShieldCheck, HelpCircle } from 'lucide-react';
import { ToneType } from '../types';

interface ToneSelectorProps {
  currentTone: ToneType;
  onChangeTone: (tone: ToneType) => void;
}

export default function ToneSelector({ currentTone, onChangeTone }: ToneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toneOptions: Array<{ value: ToneType; label: string; description: string; tag: string }> = [
    {
      value: 'mono-thinking',
      label: 'mono-thinking',
      description: 'Gaya berpikir mendalam, analisis filosofis logis secara berurutan sistematis.',
      tag: 'BERPIKIR',
    },
    {
      value: 'mono-fast',
      label: 'mono-fast',
      description: 'Gaya ringkas, padat, sangat cepat, to-the-point tanpa basa-basi.',
      tag: 'CEPAT',
    },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeOption = toneOptions.find((opt) => opt.value === currentTone) || toneOptions[0];

  return (
    <div ref={containerRef} className="relative inline-block z-30">
      <button
        id="tone-picker-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-[#090909] hover:bg-[#141414] border border-neutral-800 rounded flex items-center gap-2 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-all select-none cursor-pointer"
      >
        <Sliders className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-500">MODEL REKAYASA:</span>
        <span className="text-neutral-200 font-medium">{activeOption.label}</span>
      </button>

      {isOpen && (
        <div
          id="tone-dropdown-panel"
          className="absolute bottom-full mb-2 left-0 w-72 bg-[#080808] border border-neutral-800 rounded-lg p-2 shadow-2xl space-y-1 hover:shadow-[0_0_24px_rgba(255,255,255,0.03)]"
        >
          <div className="px-2 py-1.5 border-b border-neutral-900 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
              PILIH MODEL JALUR AI
            </span>
            <span className="text-[9px] font-mono text-neutral-600">PROFIL</span>
          </div>

          {toneOptions.map((option) => {
            const isSelected = option.value === currentTone;
            return (
              <button
                key={option.value}
                id={`btn-tone-opt-${option.value.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => {
                  onChangeTone(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded transition-all cursor-pointer flex items-start gap-2.5 relative ${
                  isSelected
                    ? 'bg-neutral-900 border border-neutral-700 text-neutral-100'
                    : 'bg-transparent border border-transparent text-neutral-400 hover:bg-[#0e0e0e] hover:text-neutral-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-medium">{option.label}</span>
                    <span className="text-[8px] font-mono tracking-wider border border-neutral-800 px-1 py-0.2 rounded-sm text-neutral-500 uppercase">
                      {option.tag}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-sans">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
