import React, { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, MinusCircle, Upload, X } from 'lucide-react';
import { Slide } from '../types';
import { readXlsx, Workbook } from '../data/workbook/readXlsx';
import { normalizeCompetencia } from '../data/sheet/competencia';
import { detectMonthLabel, importWorkbook, parseMonthLabel, SlideReport, unusedSheets } from '../data/workbook/importWorkbook';

export interface AppliedImport {
  wb: Workbook;
  monthLabel: string;
  fileName: string;
  bytes: Uint8Array;
}

interface Props {
  /** Deck the workbook is applied on top of, for a given competência (`AAAA-MM`). */
  baseSlidesFor: (competencia: string | null) => Slide[];
  /** Months already in the database — uploading one of them again replaces it. */
  storedMonths: { competencia: string; monthLabel: string; fileName: string; importedAt?: string }[];
  onApply: (result: AppliedImport) => void;
  onClose: () => void;
}

const STATUS = {
  updated: { icon: CheckCircle2, cls: 'text-emerald-600', label: 'Atualizado' },
  warning: { icon: AlertTriangle, cls: 'text-amber-500', label: 'Conferir' },
  kept: { icon: MinusCircle, cls: 'text-slate-400', label: 'Mantido' },
} as const;

export default function ImportWorkbookModal({ baseSlidesFor, storedMonths, onApply, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<{ wb: Workbook; bytes: Uint8Array } | null>(null);
  const [monthLabel, setMonthLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const monthValid = !!parseMonthLabel(monthLabel) && /^[A-Z]{3}\.\d{2}$/.test(monthLabel);
  const competencia = monthValid ? normalizeCompetencia(monthLabel) : null;
  const result = useMemo(() => {
    if (!loaded || !monthValid) return null;
    return importWorkbook(loaded.wb, baseSlidesFor(competencia), monthLabel);
  }, [loaded, monthLabel, monthValid, competencia, baseSlidesFor]);
  const replacing = storedMonths.find((m) => m.competencia === competencia);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!/\.xlsx$/i.test(file.name)) {
      setError('Envie o arquivo do Excel no formato .xlsx (Arquivo → Salvar como → Pasta de Trabalho do Excel).');
      return;
    }
    setIsReading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const wb = await readXlsx(bytes, file.name);
      setLoaded({ wb, bytes });
      setMonthLabel(detectMonthLabel(wb));
    } catch (err) {
      console.error(err);
      setError(`Não consegui ler a planilha: ${(err as Error).message}`);
      setLoaded(null);
    } finally {
      setIsReading(false);
    }
  };

  const counts = (result?.report ?? []).reduce(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { updated: 0, warning: 0, kept: 0 } as Record<SlideReport['status'], number>
  );
  const ignored = loaded ? unusedSheets(loaded.wb) : [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0054ec]/10 text-[#0054ec]">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Importar planilha do fechamento</h3>
              <p className="text-[11px] text-slate-500 font-medium">Cada planilha vira um mês na base: fica salva no servidor para todo mundo e entra no comparativo entre meses.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100" title="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-4">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            className={`cursor-pointer rounded-2xl border-2 border-dashed px-5 py-6 flex flex-col items-center gap-2 text-center transition-colors ${
              isDragging ? 'border-[#0054ec] bg-[#0054ec]/5' : 'border-slate-200 hover:border-[#0054ec]/50 hover:bg-slate-50'
            }`}
          >
            <Upload size={22} className="text-[#0054ec]" />
            <span className="text-[13px] font-bold text-slate-800">
              {isReading ? 'Lendo planilha…' : loaded ? loaded.wb.fileName : 'Arraste o .xlsx aqui ou clique para escolher'}
            </span>
            <span className="text-[11px] text-slate-500">
              {loaded ? `${loaded.wb.sheets.length} abas lidas · clique para trocar o arquivo` : 'Ex.: "Atualização Gráficos Fechamento Out.26.xlsx"'}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          {error && <div className="text-[12px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}

          {loaded && (
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <span className="text-[12px] font-bold text-slate-700">
                Mês desta planilha
                <span className="block text-[11px] font-medium text-slate-500">Mês em que ela é salva na base. Aparece na capa, no cabeçalho e nos subtítulos (formato MMM.AA).</span>
              </span>
              <input
                value={monthLabel}
                onChange={(e) => setMonthLabel(e.target.value.toUpperCase().trim())}
                maxLength={6}
                className={`w-24 text-center font-mono font-black text-[13px] rounded-lg border px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#0054ec]/30 ${
                  monthValid ? 'border-slate-200 text-[#0054ec]' : 'border-red-300 text-red-600'
                }`}
              />
            </label>
          )}

          {replacing && (
            <div className="text-[12px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              {replacing.monthLabel} já está na base ({replacing.fileName}
              {replacing.importedAt ? `, importada em ${new Date(replacing.importedAt).toLocaleString('pt-BR')}` : ''}). Aplicar
              substitui o mês por esta planilha — a versão anterior continua guardada no histórico do banco.
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 text-[11px] font-bold uppercase tracking-wide">
                <span className="text-emerald-600">{counts.updated} atualizados</span>
                <span className="text-amber-500">{counts.warning} para conferir</span>
                <span className="text-slate-400">{counts.kept} mantidos</span>
              </div>
              <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100">
                {result.report.map((r) => {
                  const s = STATUS[r.status];
                  const Icon = s.icon;
                  return (
                    <li key={r.id} className="flex gap-3 px-4 py-2.5">
                      <Icon size={16} className={`${s.cls} mt-0.5 flex-shrink-0`} />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[12px] font-bold text-slate-800">
                          {r.title} <span className={`ml-1 text-[10px] uppercase ${s.cls}`}>{s.label}</span>
                        </span>
                        {r.notes.map((n, i) => (
                          <span key={i} className="text-[11px] text-slate-500 leading-snug">{n}</span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {ignored.length > 0 && (
                <p className="text-[11px] text-slate-500">Abas visíveis não usadas por nenhum slide: {ignored.join(', ')}.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button
            disabled={!result || !loaded}
            onClick={() => result && loaded && onApply({ wb: loaded.wb, monthLabel: result.monthLabel, fileName: loaded.wb.fileName, bytes: loaded.bytes })}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: '#0054ec' }}
          >
            {replacing ? `Substituir ${replacing.monthLabel}` : 'Salvar mês na base'}
          </button>
        </div>
      </div>
    </div>
  );
}
