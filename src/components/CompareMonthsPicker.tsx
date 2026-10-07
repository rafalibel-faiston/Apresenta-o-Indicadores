import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, GitCompareArrows } from 'lucide-react';
import { CompetenciaOption } from '../data/sheet/loadSlides';
import { atalhosRecorte, effectiveRecorte, normalizeRecorte } from '../data/recorte';

interface CompareMonthsPickerProps {
  options: CompetenciaOption[];
  /** Month being presented — always part of the comparison. */
  current: string | null;
  /** Picked competências; empty = the whole history. */
  value: string[];
  onChange: (recorte: string[]) => void;
  isDarkMode?: boolean;
}

/**
 * "Comparar" menu: picks which competências the comparative slides (evolution
 * and consolidated table) compare, instead of the whole history.
 */
export default function CompareMonthsPicker({ options, current, value, onChange, isDarkMode = false }: CompareMonthsPickerProps) {
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

  const available = options.map((o) => o.competencia);
  const compared = effectiveRecorte(value, available, current);
  const isAll = value.length === 0;
  const atalhos = atalhosRecorte(available, current);

  const toggle = (competencia: string) => {
    const next = compared.includes(competencia) ? compared.filter((c) => c !== competencia) : [...compared, competencia];
    onChange(normalizeRecorte(next, available));
  };

  const muted = isDarkMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Escolher quais meses entram nos slides comparativos"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-colors ${
          !isAll
            ? 'bg-[#0054ec]/8 border-[#0054ec]/40 text-[#0054ec]'
            : isDarkMode
              ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20'
              : 'bg-white border-slate-200 text-slate-700 hover:border-[#0054ec]/40 hover:text-[#0054ec] shadow-sm'
        }`}
      >
        <GitCompareArrows size={14} className={isDarkMode ? 'text-[#00fafb]' : 'text-[#0054ec]'} />
        <span>Comparar</span>
        <span className="font-mono tracking-wider">{isAll ? 'todos' : `${compared.length} meses`}</span>
        <ChevronDown size={13} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Meses comparados"
          className={`absolute left-0 top-full mt-2 z-50 w-[270px] rounded-2xl border p-1.5 shadow-xl ${
            isDarkMode ? 'bg-[#12131a] border-slate-800 shadow-black/60' : 'bg-white border-slate-200 shadow-slate-200/70'
          }`}
        >
          <div className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] font-mono ${muted}`}>Atalhos</div>
          <div className="flex flex-wrap gap-1.5 px-2 pb-2">
            {atalhos.map((atalho) => {
              const active =
                atalho.recorte !== null &&
                normalizeRecorte(atalho.recorte, available).join() === normalizeRecorte(compared, available).join();
              return (
                <button
                  key={atalho.label}
                  type="button"
                  disabled={atalho.recorte === null}
                  title={atalho.hint || undefined}
                  onClick={() => atalho.recorte && onChange(normalizeRecorte(atalho.recorte, available))}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
                    active
                      ? 'bg-[#0054ec] border-[#0054ec] text-white'
                      : isDarkMode
                        ? 'border-white/10 text-slate-300 hover:bg-white/5'
                        : 'border-slate-200 text-slate-600 hover:border-[#0054ec]/40 hover:text-[#0054ec]'
                  }`}
                >
                  {atalho.label}
                </button>
              );
            })}
          </div>

          <div className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] font-mono border-t ${muted} ${
            isDarkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            Meses
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {[...options].reverse().map((option) => {
              const isCurrent = option.competencia === current;
              const checked = compared.includes(option.competencia);
              return (
                <button
                  key={option.competencia}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  disabled={isCurrent}
                  onClick={() => toggle(option.competencia)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                    isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'
                  } disabled:cursor-default disabled:hover:bg-transparent`}
                >
                  <span
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      checked ? 'bg-[#0054ec] border-[#0054ec] text-white' : isDarkMode ? 'border-slate-600' : 'border-slate-300'
                    } ${isCurrent ? 'opacity-60' : ''}`}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="text-[12px] font-semibold font-serif">{option.label}</span>
                  <span className={`ml-auto text-[9px] font-mono tracking-widest ${muted}`}>
                    {isCurrent ? 'ABERTO' : option.abbr}
                  </span>
                </button>
              );
            })}
          </div>

          {compared.length < 2 && (
            <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold text-amber-600">
              Marque pelo menos mais um mês — com um só, os slides comparativos não aparecem.
            </p>
          )}
          <p className={`px-2.5 pt-2 pb-1 text-[10px] leading-snug ${muted}`}>
            O mês aberto sempre entra. Vale para os slides comparativos e para o PPT/ZIP exportado.
          </p>
        </div>
      )}
    </div>
  );
}
