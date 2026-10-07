import { Slide } from '../../types';
import { ALL_TABS, TABS } from './schema';
import { fetchSheetTab } from './googleSheets';
import { buildSlides } from './transform';
import { SheetData } from './types';
import { SheetRow } from './csv';
import { competenciaAbbr, competenciaLabel, normalizeCompetencia } from './competencia';
import { collectCompetencias, filterDataByCompetencia, makeBackedPredicate, rowCompetencia, sourceKeysForCompetencia } from './history';
import { BackedPredicate, MonthSnapshot, buildSnapshots } from './series';
import { withComparativeSlides } from './comparativeSlides';

export interface CompetenciaOption {
  /** Canonical `AAAA-MM` key. */
  competencia: string;
  /** Compact badge, e.g. `SET.26`. */
  abbr: string;
  /** Long label for menus, e.g. `Setembro/2026`. */
  label: string;
  /** Where the month comes from: the Google Sheets history or an uploaded .xlsx. */
  source?: 'sheets' | 'importada';
}

export interface Workbook {
  /** Every competência found in the sheet, oldest first. Empty for a legacy, single-snapshot sheet. */
  competencias: CompetenciaOption[];
  /** Ready-to-present deck per competência, already including the comparative slides. */
  slidesFor(competencia: string): Slide[];
  /** Flat, comparable numbers per competência — the backing store of the comparative slides. */
  snapshots: MonthSnapshot[];
  /** Raw deck per competência (without comparative slides) — merged with uploaded months in data/hub.ts. */
  decks: Map<string, Slide[]>;
  /** Which tabs were really filled in per competência (see sourceKeysForCompetencia). */
  backed: Map<string, BackedPredicate>;
  /** Deck used when the sheet carries no competência at all. */
  fallbackSlides: Slide[];
  /** Badge for the header when no competência is selected. */
  fallbackMesAbrev?: string;
}

function globalMetaValue(rows: SheetRow[], key: string, competencia?: string): string | undefined {
  const match = rows.find((row) => {
    if ((row.slide || '').trim() !== 'global') return false;
    if ((row.key || '').trim() !== key) return false;
    if (!competencia) return true;
    const rowMonth = rowCompetencia(row);
    return rowMonth === null || rowMonth === competencia;
  });
  const value = match?.value?.trim();
  return value || undefined;
}

export async function fetchWorkbook(sheetId: string): Promise<SheetData> {
  const entries = await Promise.all(
    ALL_TABS.map(async (tab): Promise<[string, SheetRow[]]> => {
      try {
        return [tab, await fetchSheetTab(sheetId, tab)];
      } catch (err) {
        console.warn(`[planilha] Não foi possível carregar a aba "${tab}":`, err);
        return [tab, []];
      }
    })
  );
  return Object.fromEntries(entries);
}

export function buildWorkbook(data: SheetData, staticSlides: Slide[]): Workbook {
  const metaRows = data[TABS.META] || [];
  const competenciaKeys = collectCompetencias(data);

  // Build every month's deck once. The transform is pure, so this is just a
  // handful of clones — and it lets the comparative slides read finished slides
  // instead of re-parsing the raw tabs.
  const decks = new Map<string, Slide[]>();
  const backed = new Map<string, BackedPredicate>();
  competenciaKeys.forEach((competencia) => {
    decks.set(competencia, buildSlides(staticSlides, filterDataByCompetencia(data, competencia)));
    backed.set(competencia, makeBackedPredicate(sourceKeysForCompetencia(data, competencia)));
  });

  const snapshots = buildSnapshots(decks, backed);

  const competencias: CompetenciaOption[] = competenciaKeys.map((competencia) => ({
    competencia,
    abbr: globalMetaValue(metaRows, 'mesAbrev', competencia) || competenciaAbbr(competencia),
    label: competenciaLabel(competencia),
    source: 'sheets',
  }));

  return {
    competencias,
    snapshots,
    decks,
    backed,
    slidesFor(competencia: string): Slide[] {
      const deck = decks.get(competencia);
      if (!deck) return buildSlides(staticSlides, data);
      return withComparativeSlides(deck, snapshots, competencia);
    },
    fallbackSlides: buildSlides(staticSlides, data),
    fallbackMesAbrev: globalMetaValue(metaRows, 'mesAbrev'),
  };
}

export async function loadWorkbook(sheetId: string, staticSlides: Slide[]): Promise<Workbook> {
  return buildWorkbook(await fetchWorkbook(sheetId), staticSlides);
}

/** Resolves a competência from the URL (`?mes=2026-09`), when it exists in the workbook. */
export function resolveCompetenciaFromUrl(workbook: Workbook, search: string): string | null {
  const requested = normalizeCompetencia(new URLSearchParams(search).get('mes'));
  if (!requested) return null;
  return workbook.competencias.some((c) => c.competencia === requested) ? requested : null;
}
