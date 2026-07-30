export type SheetRow = Record<string, string>;

// Converts a matrix of raw cell values (first row = headers, following rows =
// data) into the same row-object shape used across schema.ts/transform.ts.
// Cell values coming from an .xlsx file are typed (number/boolean/Date/null),
// so everything is stringified here — numbers.ts (toNumber/toBool) already
// knows how to parse plain and pt-BR formatted strings back out.
export function rowsFromMatrix(matrix: unknown[][]): SheetRow[] {
  if (matrix.length === 0) return [];

  const headers = matrix[0].map((h) => String(h ?? '').trim());

  return matrix
    .slice(1)
    .map((row) => {
      const obj: SheetRow = {};
      headers.forEach((h, idx) => {
        if (h) obj[h] = stringifyCell(row[idx]);
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => v !== ''));
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}
