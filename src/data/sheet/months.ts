// Month handling for the monthly base. A month is always stored as a sortable
// key "YYYY-MM" and shown as "SET.26" (abbrev) or "SETEMBRO" (full name).

export type MonthKey = string; // "2026-09"

const ABBREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const FULL = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

// Prefixes accepted for month names (pt-BR and English).
const NAME_PREFIXES: [string, number][] = [
  ['JAN', 1], ['FEV', 2], ['FEB', 2], ['MAR', 3], ['ABR', 4], ['APR', 4], ['MAI', 5], ['MAY', 5],
  ['JUN', 6], ['JUL', 7], ['AGO', 8], ['AUG', 8], ['SET', 9], ['SEP', 9], ['OUT', 10], ['OCT', 10],
  ['NOV', 11], ['DEZ', 12], ['DEC', 12],
];

// Month of the data hard-coded in src/data/slidesData.ts.
export const STATIC_MONTH: MonthKey = '2026-09';

export function makeMonthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function fullYear(y: number): number {
  return y < 100 ? 2000 + y : y;
}

function validKey(year: number, month: number): MonthKey | undefined {
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return undefined;
  return makeMonthKey(year, month);
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Parses a month or a full date into a MonthKey. Accepts:
// "SET.26", "Set/2026", "setembro 2026", "Jan.26", "09/2026", "2026-09",
// "2026-09-13", "13/09/2026" (dd/mm/yyyy) and Excel serial dates (45913).
export function parseMonth(raw: string | undefined): MonthKey | undefined {
  if (!raw) return undefined;
  const s = stripAccents(raw.trim()).toUpperCase();
  if (!s) return undefined;

  let m = s.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?(?:[ T].*)?$/);
  if (m) return validKey(+m[1], +m[2]);

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:\s.*)?$/);
  if (m) return validKey(fullYear(+m[3]), +m[2]);

  m = s.match(/^(\d{1,2})[-/.](\d{4})$/);
  if (m) return validKey(+m[2], +m[1]);

  m = s.match(/^([A-Z]{3,})[\s./\-_]*(?:DE\s+)?(\d{2}|\d{4})$/);
  if (m) {
    const prefix = NAME_PREFIXES.find(([p]) => m![1].startsWith(p));
    if (prefix) return validKey(fullYear(+m[2]), prefix[1]);
  }

  // Excel serial date (days since 1899-12-30), as exported by some sheets.
  if (/^\d{5}(?:[.,]\d+)?$/.test(s)) {
    const serial = parseFloat(s.replace(',', '.'));
    if (serial > 36000 && serial < 73000) {
      const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
      return validKey(d.getUTCFullYear(), d.getUTCMonth() + 1);
    }
  }

  return undefined;
}

function split(key: MonthKey): [number, number] {
  const [y, m] = key.split('-').map(Number);
  return [y, m];
}

export function monthAbbrev(key: MonthKey): string {
  const [y, m] = split(key);
  return `${ABBREV[m - 1]}.${String(y % 100).padStart(2, '0')}`;
}

export function monthFullName(key: MonthKey): string {
  return FULL[split(key)[1] - 1];
}

export function monthYear(key: MonthKey): string {
  return String(split(key)[0]);
}

export function previousMonth(key: MonthKey): MonthKey {
  const [y, m] = split(key);
  return m === 1 ? makeMonthKey(y - 1, 12) : makeMonthKey(y, m - 1);
}
