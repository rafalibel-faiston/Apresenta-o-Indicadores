import { Slide } from '../../types';
import { SheetRow } from './csv';
import { SheetData } from './types';
import { TABS } from './schema';
import { toBool, toInt, toNumber } from './numbers';

const DISTRIBUTION_PALETTE = [
  'from-indigo-500 to-violet-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
];

const CONSOLIDADO_PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const ESTOQUE_GROUP_PALETTE = ['bg-[#0054ec]', 'bg-[#fd11a4]', 'bg-[#9b1dbf]', 'bg-[#fd5665]', 'bg-[#10b981]', 'bg-[#f59e0b]'];

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function rowsForSlide(rows: SheetRow[], slideId: string): SheetRow[] {
  return rows
    .filter((r) => (r.slide || '').trim() === slideId)
    .sort((a, b) => (toInt(a.order, 0) ?? 0) - (toInt(b.order, 0) ?? 0));
}

function metaMapForSlide(data: SheetData, slideId: string): Record<string, string> {
  const rows = rowsForSlide(data[TABS.META] || [], slideId);
  const map: Record<string, string> = {};
  rows.forEach((r) => {
    const key = (r.key || '').trim();
    if (key) map[key] = r.value ?? '';
  });
  return map;
}

function buildKpis(data: SheetData, slideId: string) {
  const rows = rowsForSlide(data[TABS.KPIS] || [], slideId);
  if (!rows.length) return undefined;
  return rows.map((r) => {
    const type = (r.type || 'number').trim() as 'currency' | 'number' | 'text';
    const kpi: any = {
      label: r.label,
      value: type === 'text' ? r.value : toNumber(r.value, 0),
      type,
    };
    if (toBool(r.isHighlight)) kpi.isHighlight = true;
    return kpi;
  });
}

function buildCommentaryObjs(data: SheetData, slideId: string) {
  const rows = rowsForSlide(data[TABS.COMMENTARY] || [], slideId);
  if (!rows.length) return undefined;
  return rows.map((r) => ({ type: (r.type || 'info').trim() || 'info', text: r.text }));
}

function buildCommentaryStrings(data: SheetData, slideId: string) {
  const rows = rowsForSlide(data[TABS.COMMENTARY] || [], slideId);
  if (!rows.length) return undefined;
  return rows.map((r) => r.text);
}

function buildProjects(data: SheetData, slideId: string) {
  const rows = rowsForSlide(data[TABS.PROJECTS] || [], slideId);
  if (!rows.length) return undefined;
  return rows.map((r) => {
    const p: any = { project: r.project, cost: toNumber(r.cost, 0) };
    if (r.shipments) p.shipments = toInt(r.shipments);
    if (r.equipments) p.equipments = toInt(r.equipments);
    if (r.averageCost) p.averageCost = toNumber(r.averageCost);
    return p;
  });
}

function applyKpisCommentaryProjects(slide: Slide, data: SheetData) {
  const kpis = buildKpis(data, slide.id);
  if (kpis) slide.content.kpis = kpis;
  const commentary = buildCommentaryObjs(data, slide.id);
  if (commentary) slide.content.commentary = commentary;
  const projects = buildProjects(data, slide.id);
  if (projects) slide.content.projects = projects;
}

function applyCapa(slide: Slide, data: SheetData) {
  const meta = metaMapForSlide(data, 'capa');
  if (meta.slogan) slide.content.slogan = meta.slogan;
  if (meta.departamento) slide.content.department = meta.departamento;
  if (meta.year) slide.content.year = meta.year;
  if (meta.mes) slide.content.mes = meta.mes;
}

function applyTransportadoras(slide: Slide, data: SheetData) {
  applyKpisCommentaryProjects(slide, data);
  const rows = rowsForSlide(data[TABS.DISTRIBUTION] || [], slide.id);
  if (rows.length) {
    slide.content.distribution = rows.map((r, i) => ({
      name: r.name,
      value: toNumber(r.value, 0),
      percentage: toNumber(r.percentage, 0),
      color: DISTRIBUTION_PALETTE[i % DISTRIBUTION_PALETTE.length],
    }));
  }
}

function applyDedicados(slide: Slide, data: SheetData) {
  applyKpisCommentaryProjects(slide, data);
  const rotaRows = rowsForSlide(data[TABS.ROTAS] || [], slide.id);
  if (rotaRows.length) {
    const breakdownRows = rowsForSlide(data[TABS.ROTAS_BREAKDOWN] || [], slide.id);
    slide.content.rotas = rotaRows.map((r) => {
      const order = (r.order || '').trim();
      const breakdown = breakdownRows
        .filter((b) => (b.rotaOrder || '').trim() === order)
        .map((b) => ({ project: b.project, val: toNumber(b.val, 0) }));
      return { transportadora: r.transportadora, total: toNumber(r.total, 0), breakdown };
    });
  }
}

function applySelfStorage(slide: Slide, data: SheetData) {
  applyKpisCommentaryProjects(slide, data);
  const rows = rowsForSlide(data[TABS.REGIONS] || [], slide.id);
  if (rows.length) {
    slide.content.regions = rows.map((r) => ({
      uf: r.uf,
      project: r.project,
      cost: toNumber(r.cost, 0),
      text: r.text,
    }));
  }
}

function applyCustoConsolidado(slide: Slide, data: SheetData) {
  const kpis = buildKpis(data, slide.id);
  if (kpis) slide.content.kpis = kpis;

  const breakdownRows = rowsForSlide(data[TABS.CONSOLIDADO_BREAKDOWN] || [], slide.id);
  if (breakdownRows.length) {
    slide.content.breakdown = breakdownRows.map((r, i) => ({
      category: r.category,
      val: toNumber(r.val, 0),
      share: toNumber(r.share, 0),
      color: CONSOLIDADO_PALETTE[i % CONSOLIDADO_PALETTE.length],
    }));
  }

  const projectRows = rowsForSlide(data[TABS.CONSOLIDADO_PROJECTS] || [], slide.id);
  if (projectRows.length) {
    slide.content.projects = projectRows.map((r) => ({ name: r.name, value: toNumber(r.value, 0) }));
  }
}

function applyEntradaSaida(slide: Slide, data: SheetData) {
  const summaryRows = rowsForSlide(data[TABS.ENTRADA_SAIDA] || [], slide.id);
  const detailRows = rowsForSlide(data[TABS.ENTRADA_SAIDA_DETAILS] || [], slide.id);

  (['entrada', 'saida'] as const).forEach((lado) => {
    const summary = summaryRows.find((r) => (r.lado || '').trim().toLowerCase() === lado);
    if (summary) {
      const target = slide.content[lado];
      if (summary.title) target.title = summary.title;
      target.nfs = toNumber(summary.nfs, target.nfs);
      target.equipments = toNumber(summary.equipments, target.equipments);
      target.value = toNumber(summary.value, target.value);
    }

    const details = detailRows.filter((r) => (r.lado || '').trim().toLowerCase() === lado);
    if (details.length) {
      slide.content[lado].details = details.map((r) => ({ client: r.client, qty: toInt(r.qty, 0) }));
    }
  });
}

function applyEstoque(slide: Slide, data: SheetData) {
  const meta = metaMapForSlide(data, slide.id);
  if (meta.total) slide.content.total = toNumber(meta.total, slide.content.total);

  const groups = rowsForSlide(data[TABS.ESTOQUE_GROUPS] || [], slide.id);
  if (groups.length) {
    slide.content.groups = groups.map((r, i) => ({
      name: r.name,
      value: toNumber(r.value, 0),
      percentage: toNumber(r.percentage, 0),
      color: ESTOQUE_GROUP_PALETTE[i % ESTOQUE_GROUP_PALETTE.length],
    }));
  }

  const guarda = rowsForSlide(data[TABS.ESTOQUE_GUARDA_TECNICA] || [], slide.id);
  if (guarda.length) {
    slide.content.guardaTecnica = guarda.map((r) => ({ client: r.client, qty: toInt(r.qty, 0), value: toNumber(r.value, 0) }));
  }

  const ativos = rowsForSlide(data[TABS.ESTOQUE_ATIVOS_OUTROS] || [], slide.id);
  if (ativos.length) {
    slide.content.ativosOutros = ativos.map((r) => ({ name: r.name, value: toNumber(r.value, 0), desc: r.desc }));
  }

  const semNf = rowsForSlide(data[TABS.ESTOQUE_SEM_NF] || [], slide.id);
  if (semNf.length) {
    slide.content.semNf = semNf.map((r) => ({ client: r.client, qty: toInt(r.qty, 0), value: toNumber(r.value, 0) }));
  }

  const topProjetos = rowsForSlide(data[TABS.ESTOQUE_TOP_PROJETOS] || [], slide.id);
  if (topProjetos.length) {
    slide.content.topProjectsWithNF = topProjetos.map((r) => ({
      project: r.project,
      value: toNumber(r.value, 0),
      itemQty: toInt(r.itemQty, 0),
    }));
  }
}

function applyDescarte(slide: Slide, data: SheetData) {
  const kpis = buildKpis(data, slide.id);
  if (kpis) slide.content.kpis = kpis;
  const rows = rowsForSlide(data[TABS.DESCARTE_LOTES] || [], slide.id);
  if (rows.length) {
    slide.content.lotes = rows.map((r) => ({ name: r.name, qty: toInt(r.qty, 0), value: toNumber(r.value, 0), desc: r.desc }));
  }
}

function applyTodoGerencial(slide: Slide, data: SheetData) {
  const meta = metaMapForSlide(data, slide.id);
  if (meta.totalSaving) slide.content.totalSaving = toNumber(meta.totalSaving, slide.content.totalSaving);
  if (meta.totalUtilizado) slide.content.totalUtilizado = toNumber(meta.totalUtilizado, slide.content.totalUtilizado);
  if (meta.saldoSaving) slide.content.saldoSaving = toNumber(meta.saldoSaving, slide.content.saldoSaving);

  const savingItems = rowsForSlide(data[TABS.TODO_SAVING_ITEMS] || [], slide.id);
  if (savingItems.length) {
    slide.content.savingItems = savingItems.map((r) => ({
      item: toInt(r.item, 0),
      desc: r.desc,
      qty: r.qty ? toInt(r.qty) : null,
      value: toNumber(r.value, 0),
      ...(toBool(r.utilizado) ? { utilizado: true } : {}),
      ...(r.obs ? { obs: r.obs } : {}),
    }));
  }

  const utilizadoItems = rowsForSlide(data[TABS.TODO_UTILIZADO_ITEMS] || [], slide.id);
  if (utilizadoItems.length) {
    slide.content.utilizadoItems = utilizadoItems.map((r) => ({
      desc: r.desc,
      value: toNumber(r.value, 0),
      ...(r.obs ? { obs: r.obs } : {}),
    }));
  }

  const savingAnual = rowsForSlide(data[TABS.TODO_SAVING_ANUAL] || [], slide.id);
  if (savingAnual.length) {
    slide.content.savingAnual = savingAnual.map((r) => ({
      item: toInt(r.item, 0),
      desc: r.desc,
      mensal: toNumber(r.mensal, 0),
      anual: toNumber(r.anual, 0),
    }));
  }
}

function applyDivisorSeguros(slide: Slide, data: SheetData) {
  const meta = metaMapForSlide(data, slide.id);
  if (meta.totalProtected) slide.content.totalProtected = toNumber(meta.totalProtected, slide.content.totalProtected);
  if (meta.monthlyBillingCost) slide.content.monthlyBillingCost = toNumber(meta.monthlyBillingCost, slide.content.monthlyBillingCost);
  if (meta.activePolicies) slide.content.activePolicies = toInt(meta.activePolicies, slide.content.activePolicies);
}

function applySegurosPatrimonial(slide: Slide, data: SheetData) {
  const kpis = buildKpis(data, slide.id);
  if (kpis) slide.content.kpis = kpis;

  const coberturas = rowsForSlide(data[TABS.SEGUROS_COBERTURAS] || [], slide.id);
  if (coberturas.length) {
    slide.content.coberturas = coberturas.map((r) => ({ name: r.name, value: toNumber(r.value, 0), share: toNumber(r.share, 0) }));
  }

  const semNf = rowsForSlide(data[TABS.SEGUROS_SEM_NF_BREAKDOWN] || [], slide.id);
  if (semNf.length) {
    slide.content.semNfBreakdown = semNf.map((r) => ({ name: r.name, qty: toInt(r.qty, 0), value: toNumber(r.value, 0) }));
  }

  const comentarios = buildCommentaryStrings(data, slide.id);
  if (comentarios) slide.content.comentarios = comentarios;
}

function applySegurosSections(slide: Slide, data: SheetData) {
  const sectionRows = rowsForSlide(data[TABS.SEGUROS_SECTIONS] || [], slide.id);
  if (!sectionRows.length) return;

  const subItemRows = rowsForSlide(data[TABS.SEGUROS_SUB_ITEMS] || [], slide.id);
  const phaseRows = rowsForSlide(data[TABS.SEGUROS_PHASES] || [], slide.id);
  const apoliceRows = rowsForSlide(data[TABS.SEGUROS_APOLICES] || [], slide.id);

  slide.content.sections = sectionRows.map((sec) => {
    const order = (sec.order || '').trim();
    const section: any = { title: sec.title, totalValue: toNumber(sec.totalValue, 0) };
    if (sec.monthlyCost) section.monthlyCost = toNumber(sec.monthlyCost, 0);
    if (sec.rate) section.rate = sec.rate;
    if (sec.desc) section.desc = sec.desc;

    const subItems = subItemRows
      .filter((r) => (r.sectionOrder || '').trim() === order)
      .map((r) => ({ name: r.name, value: toNumber(r.value, 0), cost: toNumber(r.cost, 0), rate: r.rate }));
    if (subItems.length) section.subItems = subItems;

    const phases = phaseRows
      .filter((r) => (r.sectionOrder || '').trim() === order)
      .map((r) => {
        const phase: any = { client: r.client, val: toNumber(r.val, 0) };
        if (r.minCost) phase.minCost = toNumber(r.minCost, 0);
        if (r.qty) phase.qty = toInt(r.qty, 0);
        return phase;
      });
    if (phases.length) section.phases = phases;

    const apolices = apoliceRows
      .filter((r) => (r.sectionOrder || '').trim() === order)
      .map((r) => {
        const ap: any = { name: r.name, value: toNumber(r.value, 0) };
        if (r.cost) ap.cost = toNumber(r.cost, 0);
        return ap;
      });
    if (apolices.length) section.apolices = apolices;

    return section;
  });
}

function applyCustoFatura(slide: Slide, data: SheetData) {
  const kpis = buildKpis(data, slide.id);
  if (kpis) slide.content.kpis = kpis;

  const meta = metaMapForSlide(data, slide.id);
  if (meta.total) slide.content.total = toNumber(meta.total, slide.content.total);

  const invoiceRows = rowsForSlide(data[TABS.FATURA_INVOICE_ITEMS] || [], slide.id);
  if (invoiceRows.length) {
    slide.content.invoiceItems = invoiceRows.map((r) => ({
      label: r.label,
      name: r.name,
      value: toNumber(r.value, 0),
      sub: r.sub,
      ...(toBool(r.isCredit) ? { isCredit: true } : {}),
    }));
  }

  const comments = buildCommentaryStrings(data, slide.id);
  if (comments) slide.content.comments = comments;
}

function applySlideOverride(slide: Slide, data: SheetData) {
  const override = (data[TABS.SLIDES] || []).find((r) => (r.slide || '').trim() === slide.id);
  if (!override) return;
  if (override.title) slide.title = override.title;
  if (override.subtitle) slide.subtitle = override.subtitle;
}

function buildSlide(staticSlide: Slide, data: SheetData): Slide {
  const slide = deepClone(staticSlide);
  applySlideOverride(slide, data);

  switch (slide.id) {
    case 'capa':
      applyCapa(slide, data);
      break;
    case 'correios':
    case 'cia-aerea':
    case 'courier':
      applyKpisCommentaryProjects(slide, data);
      break;
    case 'transportadoras':
      applyTransportadoras(slide, data);
      break;
    case 'dedicados':
      applyDedicados(slide, data);
      break;
    case 'self-storage':
      applySelfStorage(slide, data);
      break;
    case 'custo-consolidado':
      applyCustoConsolidado(slide, data);
      break;
    case 'entrada-saida':
      applyEntradaSaida(slide, data);
      break;
    case 'estoque-atual':
      applyEstoque(slide, data);
      break;
    case 'descarte-sustentavel':
      applyDescarte(slide, data);
      break;
    case 'todo-gerencial':
      applyTodoGerencial(slide, data);
      break;
    case 'divisor-seguros':
      applyDivisorSeguros(slide, data);
      break;
    case 'seguros-patrimonial':
      applySegurosPatrimonial(slide, data);
      break;
    case 'seguros-extra':
    case 'seguros-trags':
    case 'seguros-satelite':
      applySegurosSections(slide, data);
      break;
    case 'custo-fatura':
      applyCustoFatura(slide, data);
      break;
    default:
      // 'agradecimento' has no monthly data — stays static.
      break;
  }

  return slide;
}

export function buildSlides(staticSlides: Slide[], data: SheetData): Slide[] {
  return staticSlides.map((slide) => buildSlide(slide, data));
}
