import { compareCompetencia } from './sheet/competencia';

// Picking which competências the comparative slides compare ("Comparar" menu).
// A recorte is a list of `AAAA-MM` keys; empty means "the whole history". The
// month being presented always takes part, whether or not it is in the list.

/** Keeps known months only, sorted; collapses "every month" back to [] (= all). */
export function normalizeRecorte(recorte: string[], available: string[]): string[] {
  const picked = Array.from(new Set(recorte.filter((c) => available.includes(c)))).sort(compareCompetencia);
  return picked.length >= available.length ? [] : picked;
}

/** Months actually compared, given the presented one. */
export function effectiveRecorte(recorte: string[], available: string[], current: string | null): string[] {
  if (!recorte.length) return available;
  return available.filter((c) => c === current || recorte.includes(c));
}

/** `?comparar=2026-07,2026-10` → ['2026-07', '2026-10']. */
export function recorteFromSearch(search: string): string[] {
  const raw = new URLSearchParams(search).get('comparar');
  return raw ? raw.split(',').map((c) => c.trim()).filter((c) => /^\d{4}-\d{2}$/.test(c)) : [];
}

export interface Atalho {
  label: string;
  hint: string;
  recorte: string[] | null;
}

function minusMonths(competencia: string, months: number): string {
  const [y, m] = competencia.split('-').map(Number);
  const total = y * 12 + (m - 1) - months;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** Ready-made cuts, relative to the presented month. `recorte: null` = not available. */
export function atalhosRecorte(available: string[], current: string | null): Atalho[] {
  const sorted = [...available].sort(compareCompetencia);
  const upToCurrent = current ? sorted.filter((c) => compareCompetencia(c, current) <= 0) : sorted;
  const atalhos: Atalho[] = [{ label: 'Todos', hint: 'Histórico completo', recorte: [] }];

  const ultimos3 = upToCurrent.slice(-3);
  atalhos.push({ label: 'Últimos 3 meses', hint: ultimos3.length >= 2 ? '' : 'Precisa de 2 meses até o aberto', recorte: ultimos3.length >= 2 ? ultimos3 : null });

  if (current) {
    const [y, m] = current.split('-').map(Number);
    const q = Math.floor((m - 1) / 3);
    const trimestre = sorted.filter((c) => {
      const [cy, cm] = c.split('-').map(Number);
      return cy === y && Math.floor((cm - 1) / 3) === q;
    });
    atalhos.push({
      label: `${q + 1}º trimestre/${y}`,
      hint: trimestre.length >= 2 ? '' : 'Só tem o mês aberto neste trimestre',
      recorte: trimestre.length >= 2 ? trimestre : null,
    });

    const anoAnterior = minusMonths(current, 12);
    const temAnoAnterior = sorted.includes(anoAnterior);
    atalhos.push({
      label: 'Mesmo mês do ano anterior',
      hint: temAnoAnterior ? '' : 'Ainda não tem o mês do ano passado na base',
      recorte: temAnoAnterior ? [anoAnterior, current] : null,
    });
  }

  return atalhos;
}
