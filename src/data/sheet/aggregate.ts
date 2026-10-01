// Builds the expedition slides straight from the raw control-sheet rows of a
// month: totals, per-project tables, carrier split and auto commentary.
import { Slide } from '../../types';
import { ExpedicaoRecord, ModalId, SelfStorageRecord } from './raw';

const DISTRIBUTION_PALETTE = [
  'from-indigo-500 to-violet-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
];

const CONSOLIDADO_PALETTE = ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface ProjectAgg {
  project: string;
  cost: number;
  shipments: number;
  equipments: number;
}

function countShipments(records: ExpedicaoRecord[]): number {
  const implicit = new Set<string>();
  let explicit = 0;
  records.forEach((r) => {
    if (r.shipments !== undefined) explicit += r.shipments;
    else implicit.add(r.shipmentId);
  });
  return explicit + implicit.size;
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  });
  return map;
}

function sum<T>(items: T[], value: (item: T) => number): number {
  return items.reduce((acc, item) => acc + value(item), 0);
}

function aggregateProjects(records: ExpedicaoRecord[]): ProjectAgg[] {
  return [...groupBy(records, (r) => r.project)]
    .map(([project, recs]) => ({
      project,
      cost: round2(sum(recs, (r) => r.cost)),
      shipments: countShipments(recs),
      equipments: Math.round(sum(recs, (r) => r.equipments)),
    }))
    .sort((a, b) => b.cost - a.cost);
}

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

function momComment(total: number, prevTotal: number | undefined, prevLabel: string) {
  if (!prevTotal) return undefined;
  const delta = ((total - prevTotal) / prevTotal) * 100;
  const sign = delta > 0 ? '+' : '';
  return {
    type: 'stats',
    text: `Variação vs ${prevLabel}: ${sign}${pct.format(delta)}% (${brl.format(prevTotal)} → ${brl.format(total)})`,
  };
}

function extremesCommentary(projects: ProjectAgg[], withEquipments: boolean) {
  const suffix = (p: ProjectAgg) => (withEquipments ? ` (${plural(p.equipments, 'equipamento', 'equipamentos')})` : '');
  const out = [{ type: 'info', text: `Maior custo: ${projects[0].project} – ${brl.format(projects[0].cost)}${suffix(projects[0])}` }];
  if (projects.length > 1) {
    const last = projects[projects.length - 1];
    out.push({ type: 'success', text: `Menor custo: ${last.project} – ${brl.format(last.cost)}${suffix(last)}` });
  }
  return out;
}

export interface RawContext {
  prevLabel: string;
  // Manual commentary rows for this exact month win over the generated ones.
  hasManualCommentary: boolean;
}

// Returns true when the slide was rebuilt from raw rows.
export function applyRawExpedicoes(
  slide: Slide,
  records: ExpedicaoRecord[],
  prevRecords: ExpedicaoRecord[],
  ctx: RawContext
): boolean {
  const modal = slide.id as ModalId;
  const recs = records.filter((r) => r.modal === modal);
  if (!recs.length) return false;

  const prevRecs = prevRecords.filter((r) => r.modal === modal);
  const projects = aggregateProjects(recs);
  const total = round2(sum(projects, (p) => p.cost));
  const shipments = countShipments(recs);
  const equipments = sum(projects, (p) => p.equipments);
  const prevTotal = prevRecs.length ? round2(sum(prevRecs, (r) => r.cost)) : undefined;
  const c = slide.content;

  let commentary: { type: string; text: string }[] = [];

  switch (modal) {
    case 'correios':
    case 'courier': {
      c.kpis = [
        { label: 'Custo Total', value: total, type: 'currency', isHighlight: true },
        { label: modal === 'correios' ? 'Total Embarques' : 'Nº de Embarques', value: shipments, type: 'number' },
        { label: modal === 'correios' ? 'Equipamentos' : 'Qtd. Equipamentos', value: equipments, type: 'number' },
        { label: modal === 'correios' ? 'Custo Médio' : 'Custo Médio / Emb.', value: round2(total / (shipments || 1)), type: 'currency' },
      ];
      c.projects = projects.map((p) => ({ ...p, averageCost: round2(p.cost / (p.shipments || 1)) }));
      commentary = extremesCommentary(projects, modal === 'courier');
      break;
    }
    case 'cia-aerea': {
      c.kpis = [
        { label: 'Custo Total', value: total, type: 'currency', isHighlight: true },
        { label: 'Qtd. Equipamentos', value: equipments, type: 'number' },
        { label: 'Custo Médio / Equip.', value: round2(total / (equipments || 1)), type: 'currency' },
      ];
      c.projects = projects.map((p) => ({
        project: p.project,
        cost: p.cost,
        equipments: p.equipments,
        averageCost: round2(p.cost / (p.equipments || 1)),
      }));
      commentary = extremesCommentary(projects, false);
      break;
    }
    case 'transportadoras': {
      c.kpis = [
        { label: 'Custo Total', value: total, type: 'currency', isHighlight: true },
        { label: 'Notas Fiscais / Embarques', value: shipments, type: 'number' },
        { label: 'Equipamentos', value: equipments, type: 'number' },
      ];
      c.distribution = [...groupBy(recs, (r) => r.carrier)]
        .map(([name, rs]) => ({ name, value: round2(sum(rs, (r) => r.cost)) }))
        .sort((a, b) => b.value - a.value)
        .map((d, i) => ({
          ...d,
          percentage: round2(total ? (d.value / total) * 100 : 0),
          color: DISTRIBUTION_PALETTE[i % DISTRIBUTION_PALETTE.length],
        }));
      c.projects = projects.map((p) => ({ ...p, averageCost: round2(p.cost / (p.shipments || 1)) }));

      const top = projects.slice(0, 2);
      const topCost = sum(top, (p) => p.cost);
      commentary.push({
        type: 'info',
        text:
          top.length > 1
            ? `${top[0].project} e ${top[1].project} somam ${brl.format(topCost)} (${pct.format((topCost / total) * 100)}% do custo consolidado).`
            : `${top[0].project} concentra 100% do custo consolidado (${brl.format(topCost)}).`,
      });
      const topEquip = [...projects].sort((a, b) => b.equipments - a.equipments)[0];
      commentary.push({
        type: 'link',
        text: `${topEquip.project} concentra ${topEquip.equipments} dos ${equipments} equipamentos transportados.`,
      });
      break;
    }
    case 'dedicados': {
      c.kpis = [
        { label: 'Custo Total', value: total, type: 'currency', isHighlight: true },
        { label: 'Qtd. Equipamentos', value: equipments, type: 'number' },
      ];
      c.rotas = [...groupBy(recs, (r) => r.route || r.carrier)]
        .map(([transportadora, rs]) => ({
          transportadora,
          total: round2(sum(rs, (r) => r.cost)),
          breakdown: aggregateProjects(rs).map((p) => ({ project: p.project, val: p.cost })),
        }))
        .sort((a, b) => b.total - a.total);
      c.projects = projects.map((p) => ({
        project: p.project,
        cost: p.cost,
        ...(p.equipments ? { equipments: p.equipments } : {}),
      }));
      commentary = [
        { type: 'info', text: `Maior custo de rota: ${c.rotas[0].transportadora} – ${brl.format(c.rotas[0].total)}` },
        { type: 'success', text: `Custo por projetos: ${projects[0].project} lidera com ${brl.format(projects[0].cost)}` },
      ];
      break;
    }
  }

  if (!ctx.hasManualCommentary) {
    const mom = momComment(total, prevTotal, ctx.prevLabel);
    c.commentary = mom ? [...commentary, mom] : commentary;
  }
  return true;
}

export function applyRawSelfStorage(slide: Slide, records: SelfStorageRecord[]): boolean {
  if (!records.length) return false;
  const regions = [...groupBy(records, (r) => r.uf)]
    .map(([uf, rs]) => ({
      uf,
      project: [...new Set(rs.map((r) => r.project))].join(' / '),
      cost: round2(sum(rs, (r) => r.cost)),
      text: rs.find((r) => r.obs)?.obs ?? '',
    }))
    .sort((a, b) => b.cost - a.cost);
  const projects = [...new Set(records.map((r) => r.project))];

  slide.content.regions = regions;
  slide.content.kpis = [
    { label: 'Custo Total', value: round2(sum(regions, (r) => r.cost)), type: 'currency', isHighlight: true },
    { label: projects.length > 1 ? 'Projetos Atendidos' : 'Projeto Atendido', value: projects.join(' / '), type: 'text' },
    { label: 'Regiões', value: regions.length, type: 'number' },
  ];
  return true;
}

const CONSOLIDADO_SOURCES: { slideId: string; category: string }[] = [
  { slideId: 'transportadoras', category: 'Transportadora' },
  { slideId: 'correios', category: 'Correios' },
  { slideId: 'courier', category: 'Courier' },
  { slideId: 'dedicados', category: 'Dedicados' },
  { slideId: 'cia-aerea', category: 'Cia Aérea' },
  { slideId: 'self-storage', category: 'Self Storage' },
];

function slideTotal(slide: Slide | undefined): number {
  const kpi = slide?.content?.kpis?.find((k: any) => k.label === 'Custo Total');
  return typeof kpi?.value === 'number' ? kpi.value : 0;
}

// Recomputes "Custo Consolidado" from the already-built modal slides, so it
// always matches what the expedition slides of the same month show. Only slides
// with data for the month (`current`) are summed; returns the categories left out.
export function applyConsolidado(slide: Slide, slides: Slide[], current: Set<string>): string[] {
  const byId = new Map(slides.filter((s) => current.has(s.id)).map((s) => [s.id, s]));
  const missing = CONSOLIDADO_SOURCES.filter(({ slideId }) => !byId.has(slideId)).map(({ category }) => category);
  const parts = CONSOLIDADO_SOURCES.map(({ slideId, category }) => ({ category, val: round2(slideTotal(byId.get(slideId))) }))
    .filter((p) => p.val > 0)
    .sort((a, b) => b.val - a.val);
  const total = round2(sum(parts, (p) => p.val));
  if (!total) return missing;

  const perProject = new Map<string, number>();
  const add = (name: string, value: number) => perProject.set(name, (perProject.get(name) ?? 0) + value);
  CONSOLIDADO_SOURCES.forEach(({ slideId }) => {
    const s = byId.get(slideId);
    if (!s) return;
    if (slideId === 'self-storage') (s.content.regions || []).forEach((r: any) => add(r.project, r.cost));
    else (s.content.projects || []).forEach((p: any) => add(p.project, p.cost));
  });

  slide.content.kpis = [{ label: 'Custo Logístico Total', value: total, type: 'currency', isHighlight: true }];
  slide.content.breakdown = parts.map((p, i) => ({
    ...p,
    share: round2((p.val / total) * 100),
    color: CONSOLIDADO_PALETTE[i % CONSOLIDADO_PALETTE.length],
  }));
  slide.content.projects = [...perProject]
    .map(([name, value]) => ({ name, value: round2(value) }))
    .sort((a, b) => b.value - a.value);
  return missing;
}
