import { CellValue, Sheet, Workbook } from './readXlsx';

// Helpers to locate tables inside a hand-maintained spreadsheet. Everything is found
// by the text of headers/titles (never by fixed cell addresses), so moving a table a
// few rows/columns around in Excel does not break the import.

export interface Pos {
  r: number;
  c: number;
}

/** Uppercase, no accents, single spaces (also folds non-breaking spaces). */
export function norm(value: CellValue | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s ]+/g, ' ')
    .trim()
    .toUpperCase();
}

export function cell(sheet: Sheet, r: number, c: number): CellValue {
  return sheet.grid[r]?.[c] ?? null;
}

export function text(sheet: Sheet, r: number, c: number): string {
  const v = cell(sheet, r, c);
  return v === null ? '' : String(v).replace(/[\s ]+/g, ' ').trim();
}

/** Numeric cell value; blanks, "-" and error strings count as 0. */
export function num(sheet: Sheet, r: number, c: number): number {
  const v = cell(sheet, r, c);
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[R$\s ]/g, '');
    if (!cleaned || !/\d/.test(cleaned)) return 0;
    const n = Number(cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function findSheet(wb: Workbook, ...names: string[]): Sheet | undefined {
  const wanted = names.map(norm);
  return wb.sheets.find((s) => wanted.includes(norm(s.name)));
}

export function findCells(sheet: Sheet, match: (normalized: string) => boolean): Pos[] {
  const found: Pos[] = [];
  sheet.grid.forEach((row, r) => {
    row?.forEach((v, c) => {
      if (v !== null && v !== undefined && match(norm(v))) found.push({ r, c });
    });
  });
  return found;
}

export function isTotalLabel(label: string): boolean {
  const n = norm(label);
  return n === 'TOTAL' || n.startsWith('TOTAL ') || n === 'SUBTOTAL';
}

export interface HeaderColumns {
  [key: string]: number;
}

/**
 * Maps the columns of a header row (to the right of `start`) using keyword rules.
 * Each rule returns true when a normalized header text belongs to that key.
 */
export function mapHeader(
  sheet: Sheet,
  start: Pos,
  rules: Record<string, (h: string) => boolean>,
  maxWidth = 12
): HeaderColumns {
  const cols: HeaderColumns = {};
  for (let c = start.c + 1; c <= start.c + maxWidth; c++) {
    const h = norm(cell(sheet, start.r, c));
    if (!h) {
      // A blank header ends the table, unless the next one is still filled.
      if (!norm(cell(sheet, start.r, c + 1))) break;
      continue;
    }
    for (const [key, rule] of Object.entries(rules)) {
      if (cols[key] === undefined && rule(h)) {
        cols[key] = c;
        break;
      }
    }
  }
  return cols;
}

/**
 * Reads the label column below a header until an empty label or a TOTAL row.
 * Returns the row indexes of the data rows.
 */
export function dataRows(sheet: Sheet, header: Pos, opts: { stopAt?: (label: string) => boolean } = {}): number[] {
  const rows: number[] = [];
  for (let r = header.r + 1; r < sheet.grid.length + 1; r++) {
    const label = text(sheet, r, header.c);
    if (!label) break;
    if (isTotalLabel(label) || opts.stopAt?.(label)) break;
    rows.push(r);
  }
  return rows;
}

/** First non-empty cell above `pos` in the same column, looking up to `maxUp` rows. */
export function titleAbove(sheet: Sheet, pos: Pos, maxUp = 3): string {
  for (let r = pos.r - 1; r >= Math.max(0, pos.r - maxUp); r--) {
    const t = text(sheet, r, pos.c);
    if (t) return t;
  }
  return '';
}
