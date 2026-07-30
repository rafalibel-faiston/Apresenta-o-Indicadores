export type SheetRow = Record<string, string>;

// Minimal RFC4180 parser: handles quoted fields, escaped quotes ("") and quoted newlines/commas.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const n = text.length;

  for (let i = 0; i < n; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignore, \n handles the line break
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }

  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

export function csvToObjects(text: string): SheetRow[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .map((r) => {
      const obj: SheetRow = {};
      headers.forEach((h, idx) => {
        if (h) obj[h] = (r[idx] ?? '').trim();
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => v !== ''));
}
