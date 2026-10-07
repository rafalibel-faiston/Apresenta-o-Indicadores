import JSZip from 'jszip';

// Minimal .xlsx reader built on JSZip (already a dependency for the ZIP export).
// It only reads cached cell values — formulas are not recalculated, which is fine
// because Excel always saves the last computed value next to each formula.

export type CellValue = string | number | boolean | null;

export interface Sheet {
  name: string;
  hidden: boolean;
  /** grid[row][col], both 0-based. Missing cells are undefined/null. */
  grid: CellValue[][];
}

export interface Workbook {
  fileName: string;
  sheets: Sheet[];
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeXml(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decodeXml(m[1]) : undefined;
}

// Concatenates every <t> run inside a shared/inline string (rich text has several).
function textRuns(xml: string): string {
  const parts: string[] = [];
  const re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) parts.push(decodeXml(m[1]));
  return parts.join('');
}

function colIndex(ref: string): number {
  let n = 0;
  for (const ch of ref) {
    const code = ch.charCodeAt(0);
    if (code < 65 || code > 90) break;
    n = n * 26 + (code - 64);
  }
  return n - 1;
}

function resolvePath(target: string): string {
  const clean = target.replace(/^\/+/, '');
  return clean.startsWith('xl/') ? clean : `xl/${clean}`;
}

function parseSheetXml(xml: string, shared: string[]): CellValue[][] {
  const grid: CellValue[][] = [];
  const cellRe = /<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m: RegExpExecArray | null;
  while ((m = cellRe.exec(xml))) {
    const attrs = ` ${m[1]}`;
    const inner = m[2] ?? '';
    const ref = attr(attrs, 'r');
    if (!ref) continue;
    const type = attr(attrs, 't');
    const rawV = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];

    let value: CellValue = null;
    if (type === 's') {
      value = rawV !== undefined ? shared[parseInt(rawV, 10)] ?? null : null;
    } else if (type === 'inlineStr') {
      value = textRuns(inner);
    } else if (type === 'str') {
      value = rawV !== undefined ? decodeXml(rawV) : null;
    } else if (type === 'b') {
      value = rawV === '1';
    } else if (type === 'e') {
      value = rawV !== undefined ? decodeXml(rawV) : null;
    } else if (rawV !== undefined) {
      const n = Number(rawV);
      value = Number.isFinite(n) ? n : decodeXml(rawV);
    }
    if (value === null || value === '') continue;

    const row = parseInt(ref.replace(/^[A-Z]+/, ''), 10) - 1;
    const col = colIndex(ref);
    (grid[row] ||= [])[col] = value;
  }
  return grid;
}

export async function readXlsx(data: ArrayBuffer | Uint8Array, fileName = ''): Promise<Workbook> {
  const zip = await JSZip.loadAsync(data);
  const read = async (path: string) => {
    const file = zip.file(path);
    return file ? file.async('string') : '';
  };

  const workbookXml = await read('xl/workbook.xml');
  if (!workbookXml) throw new Error('Arquivo não parece ser uma planilha Excel (.xlsx) válida.');
  const relsXml = await read('xl/_rels/workbook.xml.rels');
  const sharedXml = await read('xl/sharedStrings.xml');

  const shared: string[] = [];
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(sharedXml))) shared.push(textRuns(m[1]));

  const rels: Record<string, string> = {};
  const relRe = /<Relationship\s[^>]*>/g;
  while ((m = relRe.exec(relsXml))) {
    const id = attr(m[0], 'Id');
    const target = attr(m[0], 'Target');
    if (id && target) rels[id] = resolvePath(target);
  }

  const sheets: Sheet[] = [];
  const sheetRe = /<sheet\s[^>]*>/g;
  while ((m = sheetRe.exec(workbookXml))) {
    const tag = m[0];
    const name = attr(tag, 'name') ?? '';
    const relId = attr(tag, 'r:id');
    const path = relId ? rels[relId] : undefined;
    if (!path) continue;
    const xml = await read(path);
    sheets.push({
      name,
      hidden: (attr(tag, 'state') ?? 'visible') !== 'visible',
      grid: parseSheetXml(xml, shared),
    });
  }

  return { fileName, sheets };
}
