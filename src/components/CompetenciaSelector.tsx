import { useEffect, useRef, useState } from 'react';
import { CalendarRange, Check, ChevronDown } from 'lucide-react';
import { CompetenciaOption } from '../data/sheet/loadSlides';

interface CompetenciaSelectorProps {
  options: CompetenciaOption[];
  value: string | null;
  onChange: (competencia: string) => void;
  isDarkMode?: boolean;
}

/**
 * Month picker for the presentation hub. Every competência stored in the
 * workbook is selectable, so any past month can be reopened exactly as it was
 * presented.
 */
export default function CompetenciaSelector({ options, value, onChange, isDarkMode = false }: CompetenciaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (options.length === 0) return null;

  const selected = options.find((option) => option.competencia === value) ?? options[options.length - 1];
  // Newest first: the month people open by default is the one at the top.
  const ordered = [...options].reverse();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Trocar a competência apresentada"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${
          isDarkMode
            ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
            : 'bg-white border-slate-200 text-slate-700 hover:border-[#0054ec]/40 hover:text-[#0054ec] shadow-sm'
        }`}
      >
        <CalendarRange size={14} className={isDarkMode ? 'text-[#00fafb]' : 'text-[#0054ec]'} />
        <span className="font-mono tracking-wider">{selected.abbr}</span>
        <ChevronDown size={13} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 top-full mt-2 z-50 min-w-[200px] max-h-[340px] overflow-y-auto rounded-2xl border p-1.5 shadow-xl ${
            isDarkMode ? 'bg-[#12131a] border-slate-800 shadow-black/60' : 'bg-white border-slate-200 shadow-slate-200/70'
          }`}
        >
          <div className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] font-mono ${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Competência
          </div>
          {ordered.map((option) => {
            const isSelected = option.competencia === selected.competencia;
            return (
              <button
                key={option.competencia}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.competencia);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-left transition-colors ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-[#0054ec]/20 text-white'
                      : 'bg-[#0054ec]/8 text-[#0054ec]'
                    : isDarkMode
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-semibold font-serif leading-none">{option.label}</span>
                  <span className={`text-[9px] font-mono tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {option.abbr}
                    {option.source === 'importada' && <span className="ml-1.5 text-emerald-600">· planilha</span>}
                  </span>
                </span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
