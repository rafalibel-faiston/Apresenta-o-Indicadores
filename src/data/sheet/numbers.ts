// Accepts plain numbers ("1234.56"), pt-BR formatted numbers ("1.234,56" or "1234,56")
// and values with stray currency symbols/spaces ("R$ 1.234,56").
export function toNumber(raw: string | undefined, fallback?: number): number | undefined {
  if (raw === undefined) return fallback;
  const trimmed = raw.trim();
  if (trimmed === '') return fallback;

  let s = trimmed.replace(/[R$\s]/gi, '');

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // pt-BR thousands+decimal: 1.234,56
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    // pt-BR decimal only: 1234,56
    s = s.replace(',', '.');
  } else {
    // plain or US thousands: 1234.56 / 1,234 (no decimals) — drop stray thousands commas
    s = s.replace(/,/g, '');
  }

  const n = parseFloat(s);
  return Number.isNaN(n) ? fallback : n;
}

export function toInt(raw: string | undefined, fallback?: number): number | undefined {
  const n = toNumber(raw, fallback);
  return n === undefined ? undefined : Math.round(n);
}

export function toBool(raw: string | undefined): boolean {
  if (!raw) return false;
  return ['true', '1', 'sim', 'verdadeiro', 'x', 'yes'].includes(raw.trim().toLowerCase());
}
