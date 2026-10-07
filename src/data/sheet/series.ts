import { Slide } from '../../types';
import { compareCompetencia } from './competencia';
import { TABS } from './schema';

/** Tells whether a given tab was actually filled in for the month being read. */
export type BackedPredicate = (tab: string, slide: string) => boolean;

// Turns the per-month slide decks into flat, comparable numbers.
//
// Everything here reads the *built* slides rather than the raw tabs on purpose:
// the transform layer already knows how to read each tab, so the historical
// series stays correct automatically when a slide's parsing changes.

export interface ExpedicaoSnapshot {
  slideId: string;
  label: string;
  custo: number | null;
  embarques: number | null;
  equipamentos: number | null;
}

export interface MovimentoSnapshot {
  nfs: number | null;
  equipments: number | null;
  value: number | null;
}

export interface MonthSnapshot {
  competencia: string;
  custoLogistico: number | null;
  custoPorModalidade: { category: string; value: number; color?: string }[];
  estoqueTotal: number | null;
  entrada: MovimentoSnapshot | null;
  saida: MovimentoSnapshot | null;
  segurosProtegido: number | null;
  segurosCustoMensal: number | null;
  descarteQtd: number | null;
  descarteReceita: number | null;
  expedicoes: ExpedicaoSnapshot[];
}

export const EXPEDICAO_SLIDES: { id: string; label: string }[] = [
  { id: 'correios', label: 'Correios' },
  { id: 'transportadoras', label: 'Transportadoras' },
  { id: 'cia-aerea', label: 'Cia Aérea' },
  { id: 'courier', label: 'Courier' },
  { id: 'dedicados', label: 'Dedicados' },
  { id: 'self-storage', label: 'Self Storage' },
];

function findSlide(slides: Slide[], id: string): Slide | undefined {
  return slides.find((s) => s.id === id);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Finds a KPI whose label contains every one of the given terms (accent/case-insensitive). */
function kpiValue(slide: Slide | undefined, ...terms: string[]): number | null {
  const kpis = slide?.content?.kpis;
  if (!Array.isArray(kpis)) return null;
  const normalized = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const match = kpis.find((kpi: any) => {
    const label = normalized(String(kpi?.label ?? ''));
    return terms.every((term) => label.includes(normalized(term)));
  });
  return numberOrNull(match?.value);
}

function movimento(side: any): MovimentoSnapshot | null {
  if (!side) return null;
  return {
    nfs: numberOrNull(side.nfs),
    equipments: numberOrNull(side.equipments),
    value: numberOrNull(side.value),
  };
}

function custoLogisticoFrom(slide: Slide | undefined): number | null {
  const fromKpi = kpiValue(slide, 'custo', 'total');
  if (fromKpi !== null) return fromKpi;

  // Fall back to summing the modality breakdown, so a sheet that fills only the
  // breakdown still produces a usable total for the trend line.
  const breakdown = slide?.content?.breakdown;
  if (!Array.isArray(breakdown) || !breakdown.length) return null;
  const sum = breakdown.reduce((acc: number, item: any) => acc + (numberOrNull(item?.val) ?? 0), 0);
  return sum > 0 ? sum : null;
}

/**
 * @param backed Tells which tabs the sheet actually filled in for this
 *   competência. Omit it to trust everything (a sheet with no history at all).
 *   A metric whose tab was not filled in fell back to the hardcoded deck, so it
 *   belongs to no month in particular and is dropped instead of being charted
 *   as this month's number.
 */
export function buildSnapshot(competencia: string, slides: Slide[], backed?: BackedPredicate): MonthSnapshot {
  const from = (tab: string, slideId: string) =>
    !backed || backed(tab, slideId) ? findSlide(slides, slideId) : undefined;

  const consolidadoKpis = from(TABS.KPIS, 'custo-consolidado');
  const consolidadoBreakdown = from(TABS.CONSOLIDADO_BREAKDOWN, 'custo-consolidado');
  const entradaSaida = from(TABS.ENTRADA_SAIDA, 'entrada-saida');
  const estoque = from(TABS.META, 'estoque-atual');
  const seguros = from(TABS.META, 'divisor-seguros');
  const descarte = from(TABS.KPIS, 'descarte-sustentavel');

  const breakdown = Array.isArray(consolidadoBreakdown?.content?.breakdown)
    ? consolidadoBreakdown!.content.breakdown
    : [];

  return {
    competencia,
    // The headline cost can come from either source, so accept whichever of the
    // two tabs this month actually has.
    custoLogistico: kpiValue(consolidadoKpis, 'custo', 'total') ?? custoLogisticoFrom(consolidadoBreakdown),
    custoPorModalidade: breakdown
      .map((item: any) => ({
        category: String(item?.category ?? ''),
        value: numberOrNull(item?.val) ?? 0,
        color: item?.color,
      }))
      .filter((item: { category: string }) => item.category !== ''),
    estoqueTotal: numberOrNull(estoque?.content?.total),
    entrada: movimento(entradaSaida?.content?.entrada),
    saida: movimento(entradaSaida?.content?.saida),
    segurosProtegido: numberOrNull(seguros?.content?.totalProtected),
    segurosCustoMensal: numberOrNull(seguros?.content?.monthlyBillingCost),
    descarteQtd: kpiValue(descarte, 'qtd'),
    descarteReceita: kpiValue(descarte, 'receita'),
    expedicoes: EXPEDICAO_SLIDES.map(({ id, label }) => {
      const slide = from(TABS.KPIS, id);
      return {
        slideId: id,
        label,
        custo: kpiValue(slide, 'custo', 'total') ?? kpiValue(slide, 'custo'),
        embarques: kpiValue(slide, 'embarques'),
        equipamentos: kpiValue(slide, 'equipamentos'),
      };
    }),
  };
}

export function buildSnapshots(
  slidesByCompetencia: Map<string, Slide[]>,
  backedByCompetencia?: Map<string, BackedPredicate>
): MonthSnapshot[] {
  return Array.from(slidesByCompetencia.entries())
    .map(([competencia, slides]) => buildSnapshot(competencia, slides, backedByCompetencia?.get(competencia)))
    .sort((a, b) => compareCompetencia(a.competencia, b.competencia));
}

/** Percentage change between two values; null when the base is missing or zero. */
export function variation(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function sumSeries(values: (number | null)[]): number {
  return values.reduce((acc: number, value) => acc + (value ?? 0), 0);
}

export function averageSeries(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  if (!present.length) return null;
  return present.reduce((acc, v) => acc + v, 0) / present.length;
}
