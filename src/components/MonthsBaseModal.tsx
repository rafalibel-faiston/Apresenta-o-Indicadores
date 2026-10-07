import { useState } from 'react';
import { Database, Eye, Sheet, Trash2, Upload, X } from 'lucide-react';
import { CompetenciaOption } from '../data/sheet/loadSlides';
import { ImportedMonth } from '../data/hub';

interface Props {
  options: CompetenciaOption[];
  imports: ImportedMonth[];
  current: string | null;
  onOpen: (competencia: string) => void;
  /** Resolves when the month is gone (or the person cancelled). */
  onDelete: (month: ImportedMonth) => Promise<void>;
  onImport: () => void;
  onClose: () => void;
}

/**
 * Every month the presentation knows about, newest first: open one, delete an
 * uploaded one from the database, or upload a new one.
 */
export default function MonthsBaseModal({ options, imports, current, onOpen, onDelete, onImport, onClose }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const ordered = [...options].reverse();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0054ec]/10 text-[#0054ec]">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Base de meses</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {options.length === 0 ? 'Nenhum mês salvo ainda.' : `${options.length} ${options.length === 1 ? 'mês' : 'meses'} — valem para todo mundo que abre a apresentação.`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" title="Fechar">
            <X size={16} />
          </button>
        </div>

        <ul className="overflow-y-auto divide-y divide-slate-100">
          {ordered.map((option) => {
            const month = imports.find((m) => m.competencia === option.competencia);
            const isCurrent = option.competencia === current;
            const saveError = month && typeof month.saveState === 'object' ? month.saveState.error : null;
            return (
              <li key={option.competencia} className={`flex items-center gap-3 px-6 py-3 ${isCurrent ? 'bg-[#0054ec]/[0.04]' : ''}`}>
                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-slate-800">
                    {option.label}
                    <span className="font-mono text-[10px] text-slate-400">{option.abbr}</span>
                    {isCurrent && <span className="text-[9px] font-black uppercase tracking-widest text-[#0054ec]">aberto</span>}
                  </span>
                  {month ? (
                    <span className="text-[11px] text-slate-500 truncate" title={month.fileName}>
                      📊 {month.fileName}
                      {month.importedAt && ` · ${new Date(month.importedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`}
                      {month.saveState === 'saving' && ' · salvando…'}
                      {saveError && <span className="text-amber-600"> · não salvou ({saveError})</span>}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Sheet size={11} /> Google Sheets — para tirar, edite a planilha online.
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onOpen(option.competencia)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200 hover:border-[#0054ec]/40 hover:text-[#0054ec]"
                >
                  <Eye size={12} /> Abrir
                </button>
                {month && (
                  <button
                    disabled={month.saveState === 'saving' || deleting !== null}
                    onClick={async () => {
                      setDeleting(month.competencia);
                      try {
                        await onDelete(month);
                      } finally {
                        setDeleting(null);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={`Apagar ${option.abbr} da base`}
                  >
                    <Trash2 size={12} /> {deleting === month.competencia ? 'Apagando…' : 'Apagar'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-[10px] text-slate-400 leading-snug">Apagar remove a planilha do mês de vez (todas as versões).</p>
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-[12px] font-bold text-white hover:opacity-90"
            style={{ backgroundColor: '#0054ec' }}
          >
            <Upload size={13} /> Importar planilha
          </button>
        </div>
      </div>
    </div>
  );
}
