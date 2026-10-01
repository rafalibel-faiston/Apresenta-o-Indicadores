// Month selection for the consolidated tabs (KPIs, Projects, EstoqueGroups...).
// Every tab may have an optional `mes` column, so the same workbook keeps the
// whole history: append the new month's rows instead of overwriting the old ones.
import { SheetData } from './types';
import { SheetRow } from './csv';
import { TABS } from './schema';
import { MonthKey, STATIC_MONTH, parseMonth } from './months';

// Month assumed for rows without `mes`: the workbook's global mesAbrev, or the
// month of the data hard-coded in slidesData.ts.
export function undatedMonth(data: SheetData): MonthKey {
  const row = (data[TABS.META] || []).find(
    (r) => (r.slide || '').trim() === 'global' && (r.key || '').trim() === 'mesAbrev' && !(r.mes || '').trim()
  );
  return parseMonth(row?.value) ?? STATIC_MONTH;
}

function rowMonth(row: SheetRow, fallback: MonthKey): MonthKey {
  return parseMonth(row.mes) ?? fallback;
}

export function consolidatedMonths(data: SheetData): MonthKey[] {
  const fallback = undatedMonth(data);
  const months = new Set<MonthKey>();
  Object.values(data).forEach((rows) => rows.forEach((r) => months.add(rowMonth(r, fallback))));
  return [...months];
}

export interface MonthSelection {
  data: SheetData;
  // Month each slide's consolidated data actually comes from (may be older
  // than the requested month when that slide was not updated since).
  sourceMonth: Record<string, MonthKey>;
}

// For each tab and slide, keeps only the rows of the latest month <= `month`.
export function selectMonth(data: SheetData, month: MonthKey): MonthSelection {
  const fallback = undatedMonth(data);
  const selected: SheetData = {};
  const sourceMonth: Record<string, MonthKey> = {};

  Object.entries(data).forEach(([tab, rows]) => {
    const bySlide = new Map<string, SheetRow[]>();
    rows.forEach((r) => {
      const slide = (r.slide || '').trim();
      if (!bySlide.has(slide)) bySlide.set(slide, []);
      bySlide.get(slide)!.push(r);
    });

    const kept: SheetRow[] = [];
    bySlide.forEach((slideRows, slide) => {
      const best = slideRows
        .map((r) => rowMonth(r, fallback))
        .filter((m) => m <= month)
        .sort()
        .pop();
      if (!best) return;
      kept.push(...slideRows.filter((r) => rowMonth(r, fallback) === best));
      if (slide && (!sourceMonth[slide] || sourceMonth[slide] < best)) sourceMonth[slide] = best;
    });
    selected[tab] = kept;
  });

  return { data: selected, sourceMonth };
}
