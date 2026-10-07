// Competência (month) handling.
//
// The whole point of the historical hub is that every row in the spreadsheet
// carries the month it belongs to, so nobody ever overwrites last month's
// numbers. This module is the single place that decides what a "month" looks
// like, so the sheet can be filled in whatever notation feels natural to the
// person typing it.

export const MONTH_COLUMN = 'mes';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MONTH_ABBR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

// Accepts both the 3-letter abbreviation and the full name, with or without accents.
const MONTH_LOOKUP: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  MONTH_NAMES.forEach((name, idx) => {
    map[stripAccents(name).toLowerCase()] = idx + 1;
  });
  MONTH_ABBR.forEach((abbr, idx) => {
    map[abbr.toLowerCase()] = idx + 1;
  });
  return map;
})();

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Two-digit years are read as 20xx — this presentation started in 2026 and
// nobody is typing 1926 into a logistics sheet.
function expandYear(year: number): number {
  return year < 100 ? 2000 + year : year;
}

function isValidMonth(month: number): boolean {
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

/**
 * Normalizes any competência notation to the canonical `AAAA-MM` key.
 *
 * Understands `2026-09`, `2026/09`, `09/2026`, `9-2026`, `SET.26`, `set/26`,
 * `setembro 2026` and `SETEMBRO/2026`. Returns null when the value is empty or
 * cannot be read as a month, so callers can treat it as "no competência".
 */
export function normalizeCompetencia(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const value = stripAccents(String(raw)).trim();
  if (!value) return null;

  // AAAA-MM / AAAA/MM / AAAA.MM
  const isoMatch = value.match(/^(\d{4})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const month = Number(isoMatch[2]);
    return isValidMonth(month) ? `${isoMatch[1]}-${pad2(month)}` : null;
  }

  // MM/AAAA / MM-AA / M.AAAA
  const numericMatch = value.match(/^(\d{1,2})[-/.](\d{2}|\d{4})$/);
  if (numericMatch) {
    const month = Number(numericMatch[1]);
    if (!isValidMonth(month)) return null;
    return `${expandYear(Number(numericMatch[2]))}-${pad2(month)}`;
  }

  // SET.26 / set/26 / SETEMBRO 2026 / setembro-2026
  const nameMatch = value.match(/^([a-zA-Z]{3,})[-/.\s]*(\d{2}|\d{4})$/);
  if (nameMatch) {
    const month = MONTH_LOOKUP[nameMatch[1].toLowerCase()];
    if (!month) return null;
    return `${expandYear(Number(nameMatch[2]))}-${pad2(month)}`;
  }

  return null;
}

function parts(competencia: string): { year: number; month: number } | null {
  const match = competencia.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const month = Number(match[2]);
  return isValidMonth(month) ? { year: Number(match[1]), month } : null;
}

/** `2026-09` → `SET.26` — the compact badge used on the cover and headers. */
export function competenciaAbbr(competencia: string): string {
  const p = parts(competencia);
  if (!p) return competencia;
  return `${MONTH_ABBR[p.month - 1]}.${pad2(p.year % 100)}`;
}

/** `2026-09` → `Setembro/2026` — the long label for menus and titles. */
export function competenciaLabel(competencia: string): string {
  const p = parts(competencia);
  if (!p) return competencia;
  return `${MONTH_NAMES[p.month - 1]}/${p.year}`;
}

/** `2026-09` → `Setembro` — used when the year is already on screen. */
export function competenciaMonthName(competencia: string): string {
  const p = parts(competencia);
  return p ? MONTH_NAMES[p.month - 1] : competencia;
}

/** `2026-09` → `2026`. */
export function competenciaYear(competencia: string): string {
  const p = parts(competencia);
  return p ? String(p.year) : '';
}

/** Chronological comparator — canonical keys sort correctly as plain strings. */
export function compareCompetencia(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The competência immediately before the given one (`2026-01` → `2025-12`). */
export function previousCompetencia(competencia: string): string | null {
  const p = parts(competencia);
  if (!p) return null;
  const month = p.month === 1 ? 12 : p.month - 1;
  const year = p.month === 1 ? p.year - 1 : p.year;
  return `${year}-${pad2(month)}`;
}
