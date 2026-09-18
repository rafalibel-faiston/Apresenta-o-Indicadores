import { SheetRow } from './csv';
import { SheetData } from './types';
import { MONTH_COLUMN, compareCompetencia, normalizeCompetencia } from './competencia';

/**
 * The competência a row belongs to, or null when the row has no `mes` column
 * (or it is blank). A blank competência means "valid for every month" — that's
 * what keeps sheets written before the historical model still working, and it
 * also lets constants like slide titles be typed once.
 */
export function rowCompetencia(row: SheetRow): string | null {
  return normalizeCompetencia(row[MONTH_COLUMN]);
}

/** Every competência present anywhere in the workbook, oldest first. */
export function collectCompetencias(data: SheetData): string[] {
  const found = new Set<string>();
  Object.values(data).forEach((rows) => {
    rows.forEach((row) => {
      const competencia = rowCompetencia(row);
      if (competencia) found.add(competencia);
    });
  });
  return Array.from(found).sort(compareCompetencia);
}

/**
 * Narrows the workbook to a single competência.
 *
 * A tab that never mentions a month is passed through untouched — that is the
 * legacy, single-snapshot layout. As soon as a tab has at least one dated row,
 * it is filtered: dated rows must match the requested month, undated rows stay
 * (they are the constants of that tab).
 */
export function filterDataByCompetencia(data: SheetData, competencia: string): SheetData {
  const filtered: SheetData = {};

  Object.entries(data).forEach(([tab, rows]) => {
    const hasDatedRows = rows.some((row) => rowCompetencia(row) !== null);
    if (!hasDatedRows) {
      filtered[tab] = rows;
      return;
    }
    filtered[tab] = rows.filter((row) => {
      const rowMonth = rowCompetencia(row);
      return rowMonth === null || rowMonth === competencia;
    });
  });

  return filtered;
}

/** All rows of a tab that belong to a given competência. */
export function rowsForCompetencia(data: SheetData, tab: string, competencia: string): SheetRow[] {
  return (data[tab] || []).filter((row) => {
    const rowMonth = rowCompetencia(row);
    return rowMonth === null || rowMonth === competencia;
  });
}

/**
 * The `aba::slide` pairs actually filled in for a given competência.
 *
 * The transform layer falls back to the hardcoded deck whenever a tab has no
 * rows, which is what keeps a presentation from ever breaking. In a historical
 * series that safety net becomes a trap: a month nobody filled in would show
 * the hardcoded numbers as if they were its own, and land in the comparative
 * charts as a real data point. The comparative layer uses these keys to tell
 * "filled in" apart from "fell back" — per tab, because a month can perfectly
 * well have its KPIs typed and its breakdown still missing.
 */
export function sourceKeysForCompetencia(data: SheetData, competencia: string): Set<string> {
  const keys = new Set<string>();

  Object.entries(data).forEach(([tab, rows]) => {
    rows.forEach((row) => {
      const slideId = (row.slide || '').trim();
      if (!slideId || slideId === 'global') return;
      const rowMonth = rowCompetencia(row);
      // An undated row belongs to a sheet with no history at all — there, every
      // source counts as filled in.
      if (rowMonth === null || rowMonth === competencia) keys.add(`${tab}::${slideId}`);
    });
  });

  return keys;
}

/** Turns the key set into the predicate the snapshot builder consumes. */
export function makeBackedPredicate(keys: Set<string>): (tab: string, slide: string) => boolean {
  return (tab, slide) => keys.has(`${tab}::${slide}`);
}
