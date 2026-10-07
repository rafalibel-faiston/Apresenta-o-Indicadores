import { Slide } from '../../types';
import { competenciaAbbr, competenciaLabel, competenciaYear } from './competencia';
import { MonthSnapshot, averageSeries, sumSeries, variation } from './series';

// Builds the slides that only exist because the workbook keeps history:
// a month-over-month evolution slide and a consolidated table of every
// competência presented so far.

export const EVOLUCAO_SLIDE_ID = 'evolucao-mensal';
export const CONSOLIDADO_SLIDE_ID = 'comparativo-consolidado';

const MODALIDADE_PALETTE = ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function snapshotFor(snapshots: MonthSnapshot[], competencia: string): MonthSnapshot | undefined {
  return snapshots.find((s) => s.competencia === competencia);
}

function trendPoints(snapshots: MonthSnapshot[], pick: (s: MonthSnapshot) => number | null) {
  return snapshots.map((snapshot, idx) => {
    const value = pick(snapshot);
    const previous = idx > 0 ? pick(snapshots[idx - 1]) : null;
    return {
      competencia: snapshot.competencia,
      label: competenciaAbbr(snapshot.competencia),
      value,
      variation: variation(value, previous),
    };
  });
}

/**
 * Month-over-month evolution of the logistics cost, anchored on the competência
 * currently selected in the hub. Returns null when there is only one month of
 * history — there is nothing to compare yet.
 */
export function buildEvolucaoSlide(
  snapshots: MonthSnapshot[],
  competenciaAtual: string,
  slideNumber: number
): Slide | null {
  if (snapshots.length < 2) return null;

  const atual = snapshotFor(snapshots, competenciaAtual);
  const atualIdx = snapshots.findIndex((s) => s.competencia === competenciaAtual);
  if (!atual || atualIdx < 0) return null;

  const anterior = atualIdx > 0 ? snapshots[atualIdx - 1] : undefined;
  const custoSerie = trendPoints(snapshots, (s) => s.custoLogistico);
  const custos = snapshots.map((s) => s.custoLogistico);
  const variacaoMoM = variation(atual.custoLogistico, anterior?.custoLogistico ?? null);
  const media = averageSeries(custos);

  // Modality comparison against the previous month.
  const categorias = new Map<string, { atual: number | null; anterior: number | null; color?: string }>();
  atual.custoPorModalidade.forEach((item) => {
    categorias.set(item.category, { atual: item.value, anterior: null, color: item.color });
  });
  (anterior?.custoPorModalidade ?? []).forEach((item) => {
    const entry = categorias.get(item.category);
    if (entry) entry.anterior = item.value;
    else categorias.set(item.category, { atual: null, anterior: item.value, color: item.color });
  });

  const modalidades = Array.from(categorias.entries())
    .map(([category, entry], idx) => ({
      category,
      atual: entry.atual,
      anterior: entry.anterior,
      variacao: variation(entry.atual, entry.anterior),
      color: entry.color || MODALIDADE_PALETTE[idx % MODALIDADE_PALETTE.length],
    }))
    .sort((a, b) => (b.atual ?? 0) - (a.atual ?? 0));

  const destaques: { type: string; text: string }[] = [];
  const comVariacao = modalidades.filter((m) => m.variacao !== null);
  if (comVariacao.length) {
    const maiorAlta = comVariacao.reduce((a, b) => ((b.variacao ?? 0) > (a.variacao ?? 0) ? b : a));
    const maiorQueda = comVariacao.reduce((a, b) => ((b.variacao ?? 0) < (a.variacao ?? 0) ? b : a));
    if ((maiorAlta.variacao ?? 0) > 0) {
      destaques.push({ type: 'warning', text: `Maior alta: ${maiorAlta.category} (+${(maiorAlta.variacao ?? 0).toFixed(1)}%)` });
    }
    if ((maiorQueda.variacao ?? 0) < 0) {
      destaques.push({ type: 'success', text: `Maior redução: ${maiorQueda.category} (${(maiorQueda.variacao ?? 0).toFixed(1)}%)` });
    }
  }
  if (media !== null && atual.custoLogistico !== null) {
    const ante = atual.custoLogistico > media ? 'acima' : 'abaixo';
    destaques.push({ type: 'info', text: `Mês ${ante} da média histórica de ${snapshots.length} competências` });
  }

  return {
    id: EVOLUCAO_SLIDE_ID,
    number: slideNumber,
    title: 'Evolução Mensal do Custo Logístico',
    subtitle: `Série histórica e variação mês a mês (${competenciaAbbr(competenciaAtual)})`,
    category: 'comparative',
    content: {
      competenciaAtual,
      competenciaAnterior: anterior?.competencia ?? null,
      kpis: [
        { label: 'Custo do Mês', value: atual.custoLogistico ?? 0, type: 'currency', isHighlight: true },
        { label: 'Variação vs. Mês Anterior', value: variacaoMoM === null ? '—' : `${variacaoMoM > 0 ? '+' : ''}${variacaoMoM.toFixed(1)}%`, type: 'text' },
        { label: 'Média Histórica', value: media ?? 0, type: 'currency' },
        { label: 'Acumulado no Período', value: sumSeries(custos), type: 'currency' },
      ],
      serie: custoSerie,
      modalidades,
      destaques,
    },
  };
}

/**
 * One row per indicator, one column per competência — the consolidated view of
 * everything already presented. Shown whenever the workbook has at least two
 * competências.
 */
export function buildConsolidadoSlide(snapshots: MonthSnapshot[], slideNumber: number): Slide | null {
  if (snapshots.length < 2) return null;

  const meses = snapshots.map((s) => ({
    competencia: s.competencia,
    label: competenciaAbbr(s.competencia),
    full: competenciaLabel(s.competencia),
  }));

  // `sum` totals the period, `last` shows the closing position (a stock balance
  // makes no sense summed across months), `avg` averages it.
  const linhas = [
    { label: 'Custo Logístico Total', format: 'currency', mode: 'sum', values: snapshots.map((s) => s.custoLogistico) },
    { label: 'NF Entrada (valor)', format: 'currency', mode: 'sum', values: snapshots.map((s) => s.entrada?.value ?? null) },
    { label: 'NF Saída (valor)', format: 'currency', mode: 'sum', values: snapshots.map((s) => s.saida?.value ?? null) },
    { label: 'NF Entrada (qtd.)', format: 'number', mode: 'sum', values: snapshots.map((s) => s.entrada?.nfs ?? null) },
    { label: 'NF Saída (qtd.)', format: 'number', mode: 'sum', values: snapshots.map((s) => s.saida?.nfs ?? null) },
    { label: 'Equipamentos Expedidos', format: 'number', mode: 'sum', values: snapshots.map((s) => s.saida?.equipments ?? null) },
    { label: 'Estoque Custodiado', format: 'currency', mode: 'last', values: snapshots.map((s) => s.estoqueTotal) },
    { label: 'Patrimônio Segurado', format: 'currency', mode: 'last', values: snapshots.map((s) => s.segurosProtegido) },
    { label: 'Custo Mensal de Seguros', format: 'currency', mode: 'avg', values: snapshots.map((s) => s.segurosCustoMensal) },
    { label: 'Receita de Descarte', format: 'currency', mode: 'last', values: snapshots.map((s) => s.descarteReceita) },
  ].filter((linha) => linha.values.some((v) => v !== null));

  const anos = Array.from(new Set(snapshots.map((s) => competenciaYear(s.competencia)))).filter(Boolean);
  const periodo = `${meses[0].full} — ${meses[meses.length - 1].full}`;

  const custos = snapshots.map((s) => s.custoLogistico);
  const custoMedio = averageSeries(custos);
  const picoIdx = custos.reduce((best, value, idx) => ((value ?? -Infinity) > (custos[best] ?? -Infinity) ? idx : best), 0);

  return {
    id: CONSOLIDADO_SLIDE_ID,
    number: slideNumber,
    title: 'Comparativo Consolidado',
    subtitle: `Todos os indicadores já apresentados — ${periodo}`,
    category: 'comparative',
    content: {
      periodo,
      anos,
      meses,
      linhas,
      kpis: [
        { label: 'Competências', value: snapshots.length, type: 'number' },
        { label: 'Custo Acumulado', value: sumSeries(custos), type: 'currency', isHighlight: true },
        { label: 'Custo Médio Mensal', value: custoMedio ?? 0, type: 'currency' },
        { label: 'Pico de Custo', value: meses[picoIdx]?.label ?? '—', type: 'text' },
      ],
    },
  };
}

/**
 * Inserts the comparative slides right after the consolidated cost slide (or at
 * the end, when that slide is absent) and renumbers the whole deck.
 */
export function withComparativeSlides(
  slides: Slide[],
  snapshots: MonthSnapshot[],
  competenciaAtual: string
): Slide[] {
  const evolucao = buildEvolucaoSlide(snapshots, competenciaAtual, 0);
  const consolidado = buildConsolidadoSlide(snapshots, 0);
  const extras = [evolucao, consolidado].filter((s): s is Slide => s !== null);
  if (!extras.length) return slides;

  const anchor = slides.findIndex((s) => s.id === 'custo-consolidado');
  const insertAt = anchor >= 0 ? anchor + 1 : slides.length;
  const merged = [...slides.slice(0, insertAt), ...extras, ...slides.slice(insertAt)];

  return merged.map((slide, idx) => ({ ...slide, number: idx + 1 }));
}
