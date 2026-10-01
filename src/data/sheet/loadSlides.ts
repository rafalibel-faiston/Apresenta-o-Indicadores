import { Slide } from '../../types';
import { ALL_TABS, RAW_TABS, TABS } from './schema';
import { fetchSheetGrid, fetchSheetTab } from './googleSheets';
import { buildSlides } from './transform';
import { SheetData } from './types';
import { SheetRow } from './csv';
import { consolidatedMonths, selectMonth } from './byMonth';
import { ExpedicaoRecord, SelfStorageRecord, normalizeHeader, parseExpedicoes, parseSelfStorage, sheetIdFrom } from './raw';
import { applyConsolidado, applyRawExpedicoes, applyRawSelfStorage } from './aggregate';
import { MonthKey, STATIC_MONTH, monthAbbrev, monthFullName, monthYear, previousMonth } from './months';

// Slides without monthly data — never flagged as "data from another month".
const NON_MONTHLY_SLIDES = new Set(['capa', 'agradecimento']);

export interface MonthBuild {
  slides: Slide[];
  // Month the data of each slide comes from (only when it differs from the
  // requested month, i.e. the slide was not updated for it).
  staleSlides: Record<string, MonthKey>;
  // Slides computed from only part of their inputs (e.g. Custo Consolidado
  // without a modal that has no rows for the month): slide id → missing parts.
  partialSlides: Record<string, string[]>;
}

export interface MonthlyBase {
  // Available months, most recent first.
  months: MonthKey[];
  build(month: MonthKey): MonthBuild;
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[planilha] Não foi possível carregar ${label}:`, err);
    return fallback;
  }
}

interface RawData {
  expedicoes: ExpedicaoRecord[];
  selfStorage: SelfStorageRecord[];
}

// Reads the raw control sheets: the `Expedicoes`/`SelfStorage` tabs of the main
// workbook plus every source listed in its `Fontes` tab.
async function loadRaw(mainSheetId: string): Promise<RawData> {
  const fontes = await safe<SheetRow[]>(`a aba "${RAW_TABS.FONTES}"`, () => fetchSheetTab(mainSheetId, RAW_TABS.FONTES), []);

  const sources = [
    { tipo: 'expedicoes', sheetId: mainSheetId, aba: RAW_TABS.EXPEDICOES, modal: '', transportadora: '' },
    { tipo: 'self-storage', sheetId: mainSheetId, aba: RAW_TABS.SELF_STORAGE, modal: '', transportadora: '' },
    ...fontes
      .filter((f) => (f.aba || '').trim())
      .map((f) => ({
        tipo: normalizeHeader(f.tipo || '').includes('STORAGE') ? 'self-storage' : 'expedicoes',
        sheetId: (f.planilha || '').trim() ? sheetIdFrom(f.planilha) : mainSheetId,
        aba: f.aba.trim(),
        modal: (f.modal || '').trim(),
        transportadora: (f.transportadora || '').trim(),
      })),
  ];

  const grids = await Promise.all(
    sources.map((src) => safe(`a aba "${src.aba}"`, () => fetchSheetGrid(src.sheetId, src.aba), [] as string[][]))
  );

  const raw: RawData = { expedicoes: [], selfStorage: [] };
  sources.forEach((src, i) => {
    if (!grids[i].length) return;
    const label = src.sheetId === mainSheetId ? src.aba : `${src.aba} (${src.sheetId.slice(0, 8)}…)`;
    if (src.tipo === 'self-storage') raw.selfStorage.push(...parseSelfStorage(grids[i], label));
    else raw.expedicoes.push(...parseExpedicoes(grids[i], { label, modal: src.modal, carrier: src.transportadora }));
  });
  return raw;
}

function relabelMonth(text: string | undefined, month: MonthKey): string | undefined {
  if (!text) return text;
  const full = monthFullName(month);
  const capitalized = full.charAt(0) + full.slice(1).toLowerCase();
  const yy = monthYear(month).slice(2);
  return text
    .replace(/\((?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\.\d{2}\)/g, `(${monthAbbrev(month)})`)
    .replace(/\b(?:Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\/\d{2}\b/g, `${capitalized}/${yy}`);
}

function hasCommentaryFor(data: SheetData, slideId: string): boolean {
  return (data[TABS.COMMENTARY] || []).some((r) => (r.slide || '').trim() === slideId);
}

export async function loadMonthlyBase(sheetId: string, staticSlides: Slide[]): Promise<MonthlyBase> {
  const [entries, raw] = await Promise.all([
    Promise.all(
      ALL_TABS.map(async (tab): Promise<[string, SheetRow[]]> => [
        tab,
        await safe(`a aba "${tab}"`, () => fetchSheetTab(sheetId, tab), []),
      ])
    ),
    loadRaw(sheetId),
  ]);
  const data: SheetData = Object.fromEntries(entries);

  const months = new Set<MonthKey>([...consolidatedMonths(data), STATIC_MONTH]);
  raw.expedicoes.forEach((r) => months.add(r.month));
  raw.selfStorage.forEach((r) => months.add(r.month));

  const build = (month: MonthKey): MonthBuild => {
    const { data: monthData, sourceMonth } = selectMonth(data, month);
    const slides = buildSlides(staticSlides, monthData);
    const prev = previousMonth(month);
    const monthRecs = raw.expedicoes.filter((r) => r.month === month);
    const prevRecs = raw.expedicoes.filter((r) => r.month === prev);
    const fromRaw = new Set<string>();

    slides.forEach((slide) => {
      const manualCommentary = sourceMonth[slide.id] === month && hasCommentaryFor(monthData, slide.id);
      const rebuilt =
        slide.id === 'self-storage'
          ? applyRawSelfStorage(slide, raw.selfStorage.filter((r) => r.month === month))
          : applyRawExpedicoes(slide, monthRecs, prevRecs, {
              prevLabel: monthAbbrev(prev),
              hasManualCommentary: manualCommentary,
            });
      if (rebuilt) fromRaw.add(slide.id);
    });

    const partialSlides: Record<string, string[]> = {};
    const consolidado = slides.find((s) => s.id === 'custo-consolidado');
    if (consolidado && fromRaw.size) {
      const current = new Set([...fromRaw, ...Object.keys(sourceMonth).filter((id) => sourceMonth[id] === month)]);
      const missing = applyConsolidado(consolidado, slides, current);
      if (missing.length) partialSlides[consolidado.id] = missing;
      fromRaw.add(consolidado.id);
    }

    const staleSlides: Record<string, MonthKey> = {};
    slides.forEach((slide) => {
      if (slide.id === 'capa') {
        slide.content.mes = monthFullName(month);
        slide.content.year = monthYear(month);
      }
      const monthly = !NON_MONTHLY_SLIDES.has(slide.id) && !fromRaw.has(slide.id);
      const source = monthly ? sourceMonth[slide.id] ?? STATIC_MONTH : month;
      // The subtitle names the month the numbers really belong to.
      slide.subtitle = relabelMonth(slide.subtitle, source);
      if (source !== month) staleSlides[slide.id] = source;
    });

    return { slides, staleSlides, partialSlides };
  };

  return { months: [...months].sort().reverse(), build };
}
