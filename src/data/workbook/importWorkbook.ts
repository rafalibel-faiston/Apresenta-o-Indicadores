import { Slide } from '../../types';
import { Sheet, Workbook } from './readXlsx';
import { cell, dataRows, findCells, findSheet, HeaderColumns, mapHeader, norm, num, Pos, text } from './grid';

// Turns the monthly "Atualização Gráficos Fechamento" workbook (the one the logistics
// team already maintains, with tabs CORREIOS, TRANSPORTADORAS, GOL, LOGGI, ...) into
// the slides of the presentation. Every slide has its own reader: when a tab is
// missing or a table can't be found, that slide keeps its previous data and the
// report says why — the import never leaves a slide broken or half-filled.

export type SlideStatus = 'updated' | 'kept' | 'warning';

export interface SlideReport {
  id: string;
  title: string;
  status: SlideStatus;
  notes: string[];
}

export interface ImportResult {
  slides: Slide[];
  report: SlideReport[];
  monthLabel: string;
}

// ─── Month helpers ────────────────────────────────────────────────────────────

export const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const MONTH_NAMES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const MONTH_RE = new RegExp(`(?:^|[^A-Z])(${MONTHS.join('|')})[A-Z]*?[\\s._/-]*(\\d{4}|\\d{2})(?!\\d)`);
const MONTH_TAG_RE = new RegExp(`\\((?:${MONTHS.join('|')})\\.\\d{2}\\)`, 'gi');

export function parseMonthLabel(value: string): { month: number; year: number } | null {
  const m = norm(value).match(MONTH_RE);
  if (!m) return null;
  return { month: MONTHS.indexOf(m[1]), year: parseInt(m[2].slice(-2), 10) };
}

export function formatMonthLabel(month: number, year: number): string {
  return `${MONTHS[month]}.${String(year).padStart(2, '0')}`;
}

/**
 * Month shown on the presentation. The file name wins ("Fechamento Out.26" → OUT.26);
 * otherwise it is the month after the last month column of the CORREIOS history
 * (the presentation of a month shows the previous month's closing).
 */
export function detectMonthLabel(wb: Workbook): string {
  const fromName = parseMonthLabel(wb.fileName.replace(/\.xlsx?$/i, ''));
  if (fromName) return formatMonthLabel(fromName.month, fromName.year);

  const correios = findSheet(wb, 'CORREIOS');
  let last: { month: number; year: number } | null = null;
  correios?.grid.forEach((row) =>
    row?.forEach((v) => {
      const p = typeof v === 'string' ? parseMonthLabel(v) : null;
      if (p && (!last || p.year * 12 + p.month > last.year * 12 + last.month)) last = p;
    })
  );
  if (last) {
    const { month, year } = last as { month: number; year: number };
    return month === 11 ? formatMonthLabel(0, year + 1) : formatMonthLabel(month + 1, year);
  }
  const now = new Date();
  return formatMonthLabel(now.getMonth(), now.getFullYear() % 100);
}

function applyMonthLabel(slides: Slide[], label: string) {
  const parsed = parseMonthLabel(label);
  slides.forEach((s) => {
    if (s.subtitle) s.subtitle = s.subtitle.replace(MONTH_TAG_RE, `(${label})`);
    if (s.id === 'capa' && parsed) {
      s.content.mes = MONTH_NAMES[parsed.month];
      s.content.year = String(2000 + parsed.year);
    }
  });
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

const round2 = (n: number) => Math.round(n * 100) / 100;
const pct = (part: number, total: number) => (total ? round2((part / total) * 100) : 0);

export function brl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(n)
    .replace(/ /g, ' ');
}

const pctText = (n: number) => `${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const KEEP_UPPER = new Set(['NTT', 'RMA', 'TRAG', 'NF', 'SW', 'AP', 'APS', 'CPE', 'HP', 'TI', 'BK']);

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const upper = w.toUpperCase();
      if (upper.includes('_') || KEEP_UPPER.has(upper) || /\d/.test(w)) return upper;
      const lower = w.toLowerCase();
      if (i > 0 && ['e', 'de', 'da', 'do', 'das', 'dos'].includes(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

// Same client written in different ways across tabs.
const PROJECT_ALIASES: Record<string, string> = {
  ITAU: 'ITAÚ',
  'ALL CARE': 'ALLCARE',
  'T SYSTEMS': 'T-SYSTEMS',
  TSYSTEMS: 'T-SYSTEMS',
  ARCOS: 'ARCOS DOURADOS',
  WHASHINGTON: 'WASHINGTON',
};

function displayName(raw: string): string {
  const clean = raw.replace(/[\s ]+/g, ' ').trim();
  return PROJECT_ALIASES[norm(clean)] ?? clean;
}

interface Totals {
  name: string;
  cost: number;
  shipments: number;
  equipments: number;
}

function mergeByName<T extends { name: string }>(items: T[], merge: (into: T, from: T) => void): T[] {
  const map = new Map<string, T>();
  items.forEach((item) => {
    const key = norm(item.name);
    const existing = map.get(key);
    if (existing) merge(existing, item);
    else map.set(key, { ...item });
  });
  return [...map.values()];
}

const mergeTotals = (items: Totals[]) =>
  mergeByName(items, (a, b) => {
    a.cost += b.cost;
    a.shipments += b.shipments;
    a.equipments += b.equipments;
  });

const sum = <T>(items: T[], pick: (t: T) => number) => items.reduce((acc, t) => acc + pick(t), 0);

// ─── Table readers ────────────────────────────────────────────────────────────

const PROJECT_RULES = {
  cost: (h: string) => h.includes('CUSTO') && !h.includes('MEDIO'),
  shipments: (h: string) => h.includes('EMBARQUE') || h.includes('ENVIO') || h.startsWith('QNT. NF') || h === 'NF',
  equipments: (h: string) => h.includes('EQUIP') && !h.includes('MEDIO'),
};

interface ProjectTable {
  header: Pos;
  cols: HeaderColumns;
  rows: Totals[];
}

/** All "PROJETO | Custo | Embarques | Equipamentos" tables of a sheet. */
function projectTables(sheet: Sheet): ProjectTable[] {
  return findCells(sheet, (v) => v === 'PROJETO')
    .map((header) => {
      const cols = mapHeader(sheet, header, PROJECT_RULES);
      if (cols.cost === undefined) return null;
      const rows = dataRows(sheet, header).map((r) => ({
        name: displayName(text(sheet, r, header.c)),
        cost: num(sheet, r, cols.cost),
        shipments: cols.shipments !== undefined ? num(sheet, r, cols.shipments) : 0,
        equipments: cols.equipments !== undefined ? num(sheet, r, cols.equipments) : 0,
      }));
      return { header, cols, rows };
    })
    .filter((t): t is ProjectTable => !!t && t.rows.length > 0);
}

/** Tables in the "Seguro" tab: a title cell (EXTRA, TRAG, FLUKE...) with a "Cliente" header just below. */
function insuranceSection(sheet: Sheet, ...titles: string[]) {
  const wanted = titles.map(norm);
  for (const title of findCells(sheet, (v) => wanted.includes(v))) {
    for (let r = title.r + 1; r <= title.r + 4; r++) {
      if (!norm(cell(sheet, r, title.c)).startsWith('CLIENTE')) continue;
      const header = { r, c: title.c };
      const cols = mapHeader(sheet, header, {
        cost: (h) => h.includes('CUSTO'),
        qty: (h) => h.startsWith('QNT') || h.startsWith('QTD'),
        value: (h) => !!h,
      });
      const costHeader = cols.cost !== undefined ? text(sheet, header.r, cols.cost) : '';
      const rateMatch = costHeader.match(/(\d+(?:[.,]\d+)?)\s*%/);
      const rate = rateMatch
        ? `${Number(rateMatch[1].replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.m`
        : undefined;
      const rows = dataRows(sheet, header).map((row) => ({
        name: text(sheet, row, header.c),
        qty: cols.qty !== undefined ? num(sheet, row, cols.qty) : 0,
        value: cols.value !== undefined ? num(sheet, row, cols.value) : 0,
        cost: cols.cost !== undefined ? num(sheet, row, cols.cost) : 0,
      }));
      if (rows.length) return { rows, rate };
    }
  }
  return null;
}

// ─── Import context ───────────────────────────────────────────────────────────

class ImportContext {
  readonly report = new Map<string, SlideReport>();

  constructor(readonly wb: Workbook, readonly slides: Slide[]) {
    slides.forEach((s) => this.report.set(s.id, { id: s.id, title: s.title, status: 'kept', notes: [] }));
  }

  slide(id: string): Slide | undefined {
    return this.slides.find((s) => s.id === id);
  }

  updated(id: string, note?: string) {
    const r = this.report.get(id);
    if (!r) return;
    if (r.status === 'kept') r.status = 'updated';
    if (note) r.notes.push(note);
  }

  warn(id: string, note: string) {
    const r = this.report.get(id);
    if (!r) return;
    r.status = 'warning';
    r.notes.push(note);
  }

  kept(id: string, note: string) {
    const r = this.report.get(id);
    if (r) r.notes.push(note);
  }

  isUpdated(id: string) {
    return this.report.get(id)?.status !== 'kept';
  }

  sheet(id: string, ...names: string[]): Sheet | undefined {
    const sheet = findSheet(this.wb, ...names);
    if (!sheet) this.kept(id, `Aba "${names[0]}" não encontrada na planilha — dados anteriores mantidos.`);
    return sheet;
  }
}

function minMaxCommentary(rows: Totals[], extra?: (t: Totals) => string) {
  const sorted = [...rows].filter((r) => r.cost > 0).sort((a, b) => b.cost - a.cost);
  if (!sorted.length) return [];
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  const suffix = (t: Totals) => (extra ? extra(t) : '');
  return [
    { type: 'info', text: `Maior custo: ${max.name} – ${brl(max.cost)}${suffix(max)}` },
    { type: 'success', text: `Menor custo: ${min.name} – ${brl(min.cost)}${suffix(min)}` },
  ];
}

const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

// ─── Expedições ───────────────────────────────────────────────────────────────

function importCorreios(ctx: ImportContext) {
  const slide = ctx.slide('correios');
  const sheet = ctx.sheet('correios', 'CORREIOS');
  if (!slide || !sheet) return;
  const table = projectTables(sheet)[0];
  if (!table) return ctx.kept('correios', 'Tabela "PROJETO / Custo" não encontrada na aba CORREIOS.');

  const rows = table.rows.sort((a, b) => b.cost - a.cost);
  const cost = sum(rows, (r) => r.cost);
  const shipments = sum(rows, (r) => r.shipments);
  slide.content.kpis = [
    { label: 'Custo Total', value: round2(cost), type: 'currency', isHighlight: true },
    { label: 'Total Embarques', value: shipments, type: 'number' },
    { label: 'Equipamentos', value: sum(rows, (r) => r.equipments), type: 'number' },
    { label: 'Custo Médio', value: round2(shipments ? cost / shipments : 0), type: 'currency' },
  ];
  slide.content.projects = rows.map((r) => ({
    project: r.name,
    cost: round2(r.cost),
    shipments: r.shipments,
    equipments: r.equipments,
    averageCost: round2(r.shipments ? r.cost / r.shipments : 0),
  }));
  slide.content.commentary = minMaxCommentary(rows);
  ctx.updated('correios', `${plural(rows.length, 'projeto')}, total ${brl(cost)}.`);
}

function importTransportadoras(ctx: ImportContext) {
  const slide = ctx.slide('transportadoras');
  const sheet = ctx.sheet('transportadoras', 'TRANSPORTADORAS');
  if (!slide || !sheet) return;

  const carriers: { name: string; rows: Totals[] }[] = [];
  projectTables(sheet).forEach((table, i) => {
    // Carrier name comes from the block title ("BESTLOG - SET.26") above the header.
    let name = '';
    for (let r = table.header.r - 1; r >= Math.max(0, table.header.r - 4) && !name; r--) {
      const m = norm(cell(sheet, r, table.header.c)).match(new RegExp(`^(.*?)\\s*-\\s*(?:${MONTHS.join('|')})`));
      if (m && m[1]) name = displayName(m[1]);
    }
    if (!name) {
      name = `Transportadora ${i + 1}`;
      ctx.warn('transportadoras', `Bloco sem título "NOME - MÊS" acima da tabela (coluna ${table.header.c + 1}); usei "${name}".`);
    }
    if (sum(table.rows, (r) => r.cost) > 0) carriers.push({ name, rows: table.rows });
  });
  if (!carriers.length) return ctx.kept('transportadoras', 'Nenhuma tabela de transportadora com custo encontrada.');

  const all = carriers.flatMap((c) => c.rows);
  const cost = sum(all, (r) => r.cost);
  const shipments = sum(all, (r) => r.shipments);
  const equipments = sum(all, (r) => r.equipments);
  const projects = mergeTotals(all).sort((a, b) => b.cost - a.cost);

  const palette = ['from-emerald-500 to-teal-500', 'from-indigo-500 to-violet-500', 'from-purple-500 to-pink-500', 'from-blue-500 to-cyan-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-red-500'];
  const oldColors = new Map<string, string>((slide.content.distribution || []).map((d: any) => [norm(d.name), d.color]));
  const used = new Set<string>();
  slide.content.distribution = mergeByName(
    carriers.map((c) => ({ name: c.name, value: sum(c.rows, (r) => r.cost) })),
    (a, b) => (a.value += b.value)
  )
    .sort((a, b) => b.value - a.value)
    .map((c) => {
      let color = oldColors.get(norm(c.name));
      if (!color || used.has(color)) color = palette.find((p) => !used.has(p)) ?? palette[0];
      used.add(color);
      return { name: c.name, value: round2(c.value), percentage: pct(c.value, cost), color };
    });

  slide.content.kpis = [
    { label: 'Custo Total', value: round2(cost), type: 'currency', isHighlight: true },
    { label: 'Notas Fiscais / Embarques', value: shipments, type: 'number' },
    { label: 'Equipamentos', value: equipments, type: 'number' },
  ];
  slide.content.projects = projects.map((p) => ({
    project: p.name,
    cost: round2(p.cost),
    shipments: p.shipments,
    equipments: p.equipments,
    averageCost: round2(p.shipments ? p.cost / p.shipments : 0),
  }));

  const commentary: { type: string; text: string }[] = [];
  if (projects.length >= 2) {
    const top2 = projects[0].cost + projects[1].cost;
    commentary.push({ type: 'info', text: `${projects[0].name} e ${projects[1].name} somam ${brl(top2)} (${pctText(pct(top2, cost))} do custo consolidado).` });
  }
  const topEq = [...projects].sort((a, b) => b.equipments - a.equipments)[0];
  if (topEq?.equipments) commentary.push({ type: 'link', text: `${topEq.name} concentra ${topEq.equipments.toLocaleString('pt-BR')} dos ${equipments.toLocaleString('pt-BR')} equipamentos transportados.` });
  slide.content.commentary = commentary;

  ctx.updated('transportadoras', `${carriers.map((c) => c.name).join(', ')} — total ${brl(cost)}.`);

  // Cross-check with the RESUMO tab when it exists.
  const resumo = findSheet(ctx.wb, 'RESUMO');
  const fornecedor = resumo && findCells(resumo, (v) => v === 'FORNECEDOR')[0];
  if (resumo && fornecedor) {
    const cols = mapHeader(resumo, fornecedor, PROJECT_RULES);
    if (cols.cost !== undefined) {
      const resumoCost = sum(dataRows(resumo, fornecedor), (r) => num(resumo, r, cols.cost));
      if (Math.abs(resumoCost - cost) > 1) {
        ctx.warn('transportadoras', `A aba RESUMO soma ${brl(resumoCost)}, diferente dos blocos da aba TRANSPORTADORAS (${brl(cost)}). Confira.`);
      }
    }
  }
}

function importCiaAerea(ctx: ImportContext) {
  const slide = ctx.slide('cia-aerea');
  if (!slide) return;
  const airlines: { name: string; rows: Totals[] }[] = [];
  ['GOL', 'LATAM', 'AZUL'].forEach((name) => {
    const sheet = findSheet(ctx.wb, name);
    if (!sheet || sheet.hidden) return;
    const table = projectTables(sheet)[0];
    if (table && sum(table.rows, (r) => r.cost) > 0) airlines.push({ name, rows: table.rows });
  });
  if (!airlines.length) return ctx.kept('cia-aerea', 'Nenhuma aba de cia aérea visível com dados (GOL / LATAM / AZUL).');

  const rows = mergeTotals(airlines.flatMap((a) => a.rows)).sort((a, b) => b.cost - a.cost);
  const cost = sum(rows, (r) => r.cost);
  const equipments = sum(rows, (r) => r.equipments);
  slide.subtitle = `Consolidado ${airlines.map((a) => a.name).join(' + ')} - Custo total e equipamentos (SET.26)`;
  slide.content.kpis = [
    { label: 'Custo Total', value: round2(cost), type: 'currency', isHighlight: true },
    { label: 'Qtd. Equipamentos', value: equipments, type: 'number' },
    { label: 'Custo Médio / Equip.', value: round2(equipments ? cost / equipments : 0), type: 'currency' },
  ];
  slide.content.projects = rows.map((r) => ({
    project: r.name,
    cost: round2(r.cost),
    equipments: r.equipments,
    averageCost: round2(r.equipments ? r.cost / r.equipments : 0),
  }));
  slide.content.commentary = minMaxCommentary(rows);
  ctx.updated('cia-aerea', `${airlines.map((a) => a.name).join(' + ')} — total ${brl(cost)}.`);
}

function importCourier(ctx: ImportContext) {
  const slide = ctx.slide('courier');
  const sheet = ctx.sheet('courier', 'LOGGI');
  if (!slide || !sheet) return;
  const table = projectTables(sheet)[0];
  if (!table) return ctx.kept('courier', 'Tabela "PROJETO / Custo" não encontrada na aba LOGGI.');

  const rows = table.rows.sort((a, b) => b.cost - a.cost);
  const cost = sum(rows, (r) => r.cost);
  const shipments = sum(rows, (r) => r.shipments);
  slide.content.kpis = [
    { label: 'Custo Total', value: round2(cost), type: 'currency', isHighlight: true },
    { label: 'Nº de Embarques', value: shipments, type: 'number' },
    { label: 'Qtd. Equipamentos', value: sum(rows, (r) => r.equipments), type: 'number' },
    { label: 'Custo Médio / Emb.', value: round2(shipments ? cost / shipments : 0), type: 'currency' },
  ];
  slide.content.projects = rows.map((r) => ({
    project: r.name,
    cost: round2(r.cost),
    shipments: r.shipments,
    equipments: r.equipments,
    averageCost: round2(r.shipments ? r.cost / r.shipments : 0),
  }));
  slide.content.commentary = minMaxCommentary(rows, (t) => ` (${plural(t.equipments, 'equipamento')})`);
  ctx.updated('courier', `${plural(rows.length, 'projeto')}, total ${brl(cost)}.`);
}

function importDedicados(ctx: ImportContext) {
  const slide = ctx.slide('dedicados');
  const sheet = ctx.sheet('dedicados', 'Consolidado Dedicados', 'DEDICADOS');
  if (!slide || !sheet) return;
  const header = findCells(sheet, (v) => v === 'PROJETO')[0];
  if (!header) return ctx.kept('dedicados', 'Cabeçalho "PROJETO" não encontrado na aba de dedicados.');

  // Header: PROJETO | <one column per driver> | Qtd. Equipamentos | Custo Total
  let eqCol: number | undefined;
  let totalCol: number | undefined;
  const drivers: { name: string; col: number }[] = [];
  for (let c = header.c + 1; c <= header.c + 20; c++) {
    const h = norm(cell(sheet, header.r, c));
    if (!h) break;
    if (h.includes('EQUIP')) eqCol = c;
    else if (h.includes('CUSTO') || h.includes('TOTAL')) totalCol = c;
    else drivers.push({ name: displayName(text(sheet, header.r, c)), col: c });
  }
  const rowIdx = dataRows(sheet, header);
  if (!rowIdx.length || !drivers.length) return ctx.kept('dedicados', 'Tabela de dedicados vazia.');

  const projects = rowIdx
    .map((r) => {
      const byDriver = sum(drivers, (d) => num(sheet, r, d.col));
      return {
        name: displayName(text(sheet, r, header.c)),
        cost: totalCol !== undefined ? num(sheet, r, totalCol) || byDriver : byDriver,
        equipments: eqCol !== undefined ? num(sheet, r, eqCol) : 0,
      };
    })
    .filter((p) => p.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  const rotas = drivers
    .map((d) => {
      const breakdown = rowIdx
        .map((r) => ({ project: displayName(text(sheet, r, header.c)), val: round2(num(sheet, r, d.col)) }))
        .filter((b) => b.val > 0)
        .sort((a, b) => b.val - a.val);
      return { transportadora: d.name, total: round2(sum(breakdown, (b) => b.val)), breakdown };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);

  const cost = sum(projects, (p) => p.cost);
  slide.content.kpis = [
    { label: 'Custo Total', value: round2(cost), type: 'currency', isHighlight: true },
    { label: 'Qtd. Equipamentos', value: sum(projects, (p) => p.equipments), type: 'number' },
  ];
  slide.content.rotas = rotas;
  slide.content.projects = projects.map((p) => ({
    project: p.name,
    cost: round2(p.cost),
    ...(p.equipments ? { equipments: p.equipments } : {}),
  }));
  slide.content.commentary = [
    rotas[0] && { type: 'info', text: `Maior custo de rota: ${rotas[0].transportadora} – ${brl(rotas[0].total)}` },
    projects[0] && { type: 'success', text: `Custo por projetos: ${projects[0].name} lidera com ${brl(projects[0].cost)}` },
  ].filter(Boolean);

  const rotasTotal = sum(rotas, (r) => r.total);
  if (Math.abs(rotasTotal - cost) > 1) {
    ctx.warn('dedicados', `Soma por motorista (${brl(rotasTotal)}) difere da coluna de custo total (${brl(cost)}).`);
  }
  ctx.updated('dedicados', `${plural(rotas.length, 'rota')}, total ${brl(cost)}.`);
}

function importSelfStorage(ctx: ImportContext) {
  const slide = ctx.slide('self-storage');
  const sheet = ctx.sheet('self-storage', 'SELF STORAGE');
  if (!slide || !sheet) return;

  const candidates = findCells(sheet, (v) => v === 'UF')
    .map((header) => {
      const cols = mapHeader(sheet, header, { project: (h) => h.startsWith('PROJETO'), cost: (h) => h.includes('CUSTO') });
      if (cols.cost === undefined) return null;
      const rows = dataRows(sheet, header)
        .map((r) => ({
          uf: text(sheet, r, header.c),
          project: cols.project !== undefined ? displayName(text(sheet, r, cols.project)) : '',
          cost: num(sheet, r, cols.cost),
        }))
        .filter((r) => r.cost > 0);
      return rows.length ? { header, rows, total: sum(rows, (r) => r.cost) } : null;
    })
    .filter((c): c is NonNullable<typeof c> => !!c)
    .sort((a, b) => a.header.r - b.header.r);
  if (!candidates.length) return ctx.kept('self-storage', 'Tabela "UF / PROJETO / Custo" não encontrada.');

  // Prefer the table that matches the latest value of the monthly history ("CUSTO" column).
  let latest: number | undefined;
  const histHeader = findCells(sheet, (v) => v === 'CUSTO')[0];
  if (histHeader) {
    for (let r = histHeader.r + 1; r < sheet.grid.length; r++) {
      if (typeof cell(sheet, r, histHeader.c) === 'number') latest = num(sheet, r, histHeader.c);
    }
  }
  const chosen = candidates.find((c) => latest !== undefined && Math.abs(c.total - latest) < 0.05) ?? candidates[0];
  if (latest !== undefined && Math.abs(chosen.total - latest) >= 0.05) {
    ctx.warn('self-storage', `Total por UF (${brl(chosen.total)}) diferente do último mês do histórico (${brl(latest)}).`);
  }

  const oldTexts = new Map<string, string>((slide.content.regions || []).map((r: any) => [norm(r.uf), r.text]));
  const rows = [...chosen.rows].sort((a, b) => b.cost - a.cost);
  const projectNames = [...new Set(rows.map((r) => r.project).filter(Boolean))];
  slide.content.regions = rows.map((r) => ({ uf: r.uf, project: r.project, cost: round2(r.cost), text: oldTexts.get(norm(r.uf)) ?? '' }));
  slide.content.kpis = [
    { label: 'Custo Total', value: round2(chosen.total), type: 'currency', isHighlight: true },
    { label: projectNames.length > 1 ? 'Projetos Atendidos' : 'Projeto Atendido', value: projectNames.join(' / '), type: 'text' },
    { label: 'Regiões', value: rows.length, type: 'number' },
  ];
  slide.subtitle = `Valores consolidados por UF para ${projectNames.length > 1 ? 'projetos' : 'projeto'} ${projectNames.join(' / ')} (SET.26)`;
  rows.filter((r) => !oldTexts.has(norm(r.uf))).forEach((r) => ctx.warn('self-storage', `UF nova (${r.uf}) sem texto descritivo — card aparece sem descrição.`));
  ctx.updated('self-storage', `${plural(rows.length, 'UF')}, total ${brl(chosen.total)}.`);
}

const CONSOLIDADO_PARTS = [
  { id: 'transportadoras', category: 'Transportadora', color: '#6366f1' },
  { id: 'correios', category: 'Correios', color: '#8b5cf6' },
  { id: 'courier', category: 'Courier (Loggi)', color: '#06b6d4' },
  { id: 'dedicados', category: 'Dedicados', color: '#ec4899' },
  { id: 'cia-aerea', category: 'Cia Aérea', color: '#3b82f6' },
  { id: 'self-storage', category: 'Self Storage', color: '#10b981' },
];

function importCustoConsolidado(ctx: ImportContext) {
  const slide = ctx.slide('custo-consolidado');
  if (!slide) return;
  const parts = CONSOLIDADO_PARTS.map((p) => ({ ...p, slide: ctx.slide(p.id) })).filter((p) => p.slide);
  if (!parts.some((p) => ctx.isUpdated(p.id))) return ctx.kept('custo-consolidado', 'Nenhuma modalidade de expedição foi atualizada.');

  const totalOf = (s: Slide) =>
    s.id === 'self-storage'
      ? sum(s.content.regions || [], (r: any) => r.cost)
      : sum(s.content.projects || [], (p: any) => p.cost);
  const breakdown = parts.map((p) => ({ category: p.category, val: round2(totalOf(p.slide!)), color: p.color }));
  const total = sum(breakdown, (b) => b.val);

  const projectRows: Totals[] = parts.flatMap((p) =>
    p.id === 'self-storage'
      ? (p.slide!.content.regions || []).map((r: any) => ({ name: r.project, cost: r.cost, shipments: 0, equipments: 0 }))
      : (p.slide!.content.projects || []).map((r: any) => ({ name: r.project, cost: r.cost, shipments: 0, equipments: 0 }))
  );

  slide.content.kpis = [{ label: 'Custo Logístico Total', value: round2(total), type: 'currency', isHighlight: true }];
  slide.content.breakdown = breakdown.sort((a, b) => b.val - a.val).map((b) => ({ ...b, share: pct(b.val, total) }));
  slide.content.projects = mergeTotals(projectRows)
    .filter((p) => p.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .map((p) => ({ name: p.name, value: round2(p.cost) }));

  const stale = parts.filter((p) => !ctx.isUpdated(p.id)).map((p) => p.category);
  if (stale.length) ctx.warn('custo-consolidado', `Usa dados do mês anterior para: ${stale.join(', ')}.`);
  ctx.updated('custo-consolidado', `Total ${brl(total)} somando as modalidades.`);

  // Cross-check with the pivot "Total Geral" of the Base Consolidado tab.
  const base = findSheet(ctx.wb, 'Base Consolidado');
  if (base) {
    const totals = findCells(base, (v) => v === 'TOTAL GERAL');
    for (const rowLabel of totals) {
      const colHeader = totals.find((t) => t.r < rowLabel.r && t.c > rowLabel.c);
      if (!colHeader) continue;
      const pivotTotal = num(base, rowLabel.r, colHeader.c);
      if (pivotTotal && Math.abs(pivotTotal - total) > 1) {
        ctx.warn('custo-consolidado', `A aba Base Consolidado mostra ${brl(pivotTotal)}, diferente da soma das modalidades (${brl(total)}).`);
      }
      break;
    }
  }
}

// ─── Operações ────────────────────────────────────────────────────────────────

function importEntradaSaida(ctx: ImportContext) {
  const slide = ctx.slide('entrada-saida');
  const sheet = ctx.sheet('entrada-saida', 'Notas Saída', 'NOTAS SAIDA');
  if (!slide || !sheet) return;

  // The first (topmost) ENTRADA/SAÍDA block is the current month; older months sit below it.
  const entrada = findCells(sheet, (v) => v === 'ENTRADA').sort((a, b) => a.r - b.r || a.c - b.c)[0];
  if (!entrada || norm(cell(sheet, entrada.r + 1, entrada.c)) !== 'SAIDA') {
    return ctx.kept('entrada-saida', 'Bloco "NF | ENTRADA | SAÍDA" não encontrado.');
  }
  const cols = mapHeader(sheet, { r: entrada.r - 1, c: entrada.c }, {
    nfs: (h) => h.includes('NF'),
    equipments: (h) => h.includes('EQUIP'),
    value: (h) => h.includes('CUSTO') || h.includes('VALOR'),
  });
  const read = (r: number) => ({
    nfs: cols.nfs !== undefined ? num(sheet, r, cols.nfs) : 0,
    equipments: cols.equipments !== undefined ? num(sheet, r, cols.equipments) : 0,
    value: cols.value !== undefined ? round2(num(sheet, r, cols.value)) : 0,
  });
  slide.content.entrada = { ...slide.content.entrada, ...read(entrada.r), details: [] };
  slide.content.saida = { ...slide.content.saida, ...read(entrada.r + 1) };

  const clientHeader = findCells(sheet, (v) => v === 'CLIENTE')
    .filter((p) => /^(QUANT|QTD|QNT)/.test(norm(cell(sheet, p.r, p.c + 1))))
    .sort((a, b) => a.r - b.r)[0];
  if (clientHeader) {
    const details = mergeByName(
      dataRows(sheet, clientHeader).map((r) => ({ name: displayName(text(sheet, r, clientHeader.c)), qty: num(sheet, r, clientHeader.c + 1) })),
      (a, b) => (a.qty += b.qty)
    ).sort((a, b) => b.qty - a.qty);
    slide.content.saida.details = details.map((d) => ({ client: d.name, qty: d.qty }));
    const detailTotal = sum(details, (d) => d.qty);
    if (detailTotal !== slide.content.saida.nfs) {
      ctx.warn('entrada-saida', `Soma por cliente (${detailTotal}) diferente da quantidade de NFs de saída (${slide.content.saida.nfs}).`);
    }
  } else {
    ctx.warn('entrada-saida', 'Tabela "CLIENTE / QUANTIDADE" não encontrada — lista de clientes da NF Saída mantida.');
  }
  ctx.updated('entrada-saida', `Entrada: ${slide.content.entrada.nfs} NFs · Saída: ${slide.content.saida.nfs} NFs.`);
}

const ESTOQUE_GROUPS = [
  { key: 'com', match: (h: string) => h.includes('C/ NF') || h.includes('COM NF'), name: 'Projetos com NF', color: 'bg-[#0054ec]' },
  { key: 'sem', match: (h: string) => h.includes('SEM NF'), name: 'Estoque sem NF', color: 'bg-[#fd11a4]' },
  { key: 'ativos', match: (h: string) => h.includes('ATIVOS'), name: 'Ativos e Outros', color: 'bg-[#fd5665]' },
  { key: 'guarda', match: (h: string) => h.includes('GUARDA'), name: 'Guarda de Técnico', color: 'bg-[#9b1dbf]' },
  { key: 'total', match: (h: string) => h.includes('TOTAL'), name: '', color: '' },
];

function importEstoque(ctx: ImportContext) {
  const slide = ctx.slide('estoque-atual');
  const sheet = ctx.sheet('estoque-atual', 'Seguro');
  if (!slide || !sheet) return;

  const anchor = findCells(sheet, (v) => ESTOQUE_GROUPS[0].match(v) && v.startsWith('ESTOQUE'))[0];
  if (!anchor) return ctx.kept('estoque-atual', 'Linha "ESTOQUE C/ NF | ESTOQUE SEM NF | GUARDA | ATIVOS | Total" não encontrada na aba Seguro.');
  const values: Record<string, number> = {};
  for (let c = anchor.c; c <= anchor.c + 8; c++) {
    const h = norm(cell(sheet, anchor.r, c));
    const g = h && ESTOQUE_GROUPS.find((x) => values[x.key] === undefined && x.match(h));
    if (g) values[g.key] = num(sheet, anchor.r + 1, c);
  }
  const groupsSum = (values.com ?? 0) + (values.sem ?? 0) + (values.ativos ?? 0) + (values.guarda ?? 0);
  const total = values.total || groupsSum;
  if (Math.abs(groupsSum - total) > 1) ctx.warn('estoque-atual', `Soma das categorias (${brl(groupsSum)}) ≠ Total Geral (${brl(total)}).`);

  slide.content.total = round2(total);
  slide.content.groups = ESTOQUE_GROUPS.filter((g) => g.name && values[g.key] !== undefined)
    .map((g) => ({ name: g.name, value: round2(values[g.key]), percentage: pct(values[g.key], total), color: g.color }))
    .sort((a, b) => b.value - a.value);

  // Guarda de técnico: PROJETO | ITEM | VALOR GUARDA
  const guardaHeader = findCells(sheet, (v) => v === 'PROJETO').find((p) => norm(cell(sheet, p.r, p.c + 1)).startsWith('ITEM'));
  if (guardaHeader) {
    const cols = mapHeader(sheet, guardaHeader, { qty: (h) => h.startsWith('ITEM'), value: (h) => h.includes('VALOR') });
    slide.content.guardaTecnica = dataRows(sheet, guardaHeader)
      .map((r) => ({ client: displayName(text(sheet, r, guardaHeader.c)), qty: num(sheet, r, cols.qty), value: round2(num(sheet, r, cols.value)) }))
      .sort((a, b) => b.value - a.value);
  } else {
    ctx.warn('estoque-atual', 'Tabela de Guarda de Técnico (PROJETO / ITEM / VALOR GUARDA) não encontrada — mantida.');
  }

  // Ativos / Outros: labels in the "Cliente | PATRIMONIAL" table.
  const ativos = findCells(sheet, (v) => v === 'ATIVOS')[0];
  const outros = findCells(sheet, (v) => v === 'OUTROS')[0];
  if (ativos && outros && Array.isArray(slide.content.ativosOutros) && slide.content.ativosOutros.length >= 2) {
    slide.content.ativosOutros[0].value = round2(num(sheet, ativos.r, ativos.c + 1));
    slide.content.ativosOutros[1].value = round2(num(sheet, outros.r, outros.c + 1));
  }

  // Estoque sem NF: "Cliente sem NF | QNT. EQUIPAMENTO | VALOR"
  const semNfHeader = findCells(sheet, (v) => v.startsWith('CLIENTE SEM NF'))[0];
  if (semNfHeader) {
    const cols = mapHeader(sheet, semNfHeader, { qty: (h) => /^(QNT|QTD)/.test(h), value: (h) => h.includes('VALOR') });
    slide.content.semNf = dataRows(sheet, semNfHeader)
      .map((r) => ({ client: text(sheet, r, semNfHeader.c), qty: num(sheet, r, cols.qty), value: round2(num(sheet, r, cols.value)) }))
      .sort((a, b) => b.value - a.value);
  } else {
    ctx.warn('estoque-atual', 'Tabela "Cliente sem NF" não encontrada — mantida.');
  }

  // Projetos com NF: pivot "Rótulos de Linha | Contagem de PROJETO | Soma de Valor"
  const pivot = findCells(sheet, (v) => v === 'ROTULOS DE LINHA').find((p) =>
    [1, 2].some((d) => norm(cell(sheet, p.r, p.c + d)).startsWith('SOMA DE VALOR'))
  );
  if (pivot) {
    const cols = mapHeader(sheet, pivot, { qty: (h) => h.startsWith('CONTAGEM'), value: (h) => h.startsWith('SOMA') });
    const projects = dataRows(sheet, pivot)
      .map((r) => {
        let project = text(sheet, r, pivot.c);
        // Evotech Fase 2 é projeto da NTT: entra no guarda-chuva NTT_.
        if (norm(project).includes('EVOTECH') && !norm(project).startsWith('NTT')) project = `NTT_${project}`;
        return { project, value: round2(num(sheet, r, cols.value)), itemQty: num(sheet, r, cols.qty) };
      })
      .sort((a, b) => b.value - a.value);
    slide.content.topProjectsWithNF = projects;
    const pivotSum = sum(projects, (p) => p.value);
    if (values.com !== undefined && Math.abs(pivotSum - values.com) > 1) {
      ctx.warn('estoque-atual', `Tabela dinâmica de projetos soma ${brl(pivotSum)}, diferente de "Estoque c/ NF" (${brl(values.com)}). Atualize a tabela dinâmica no Excel.`);
    }
  } else {
    ctx.warn('estoque-atual', 'Tabela dinâmica de projetos com NF não encontrada — lista mantida.');
  }
  ctx.updated('estoque-atual', `Total custodiado ${brl(total)}.`);
}

interface Lote {
  number: number;
  qty: number;
  value: number;
  items: { name: string; qty: number }[];
}

function importDescarte(ctx: ImportContext) {
  const slide = ctx.slide('descarte-sustentavel');
  const sheet = ctx.sheet('descarte-sustentavel', 'SANLIEN', 'SALIEN');
  if (!slide || !sheet) return;
  const header = findCells(sheet, (v) => v.startsWith('ITENS'))[0];
  if (!header) return ctx.kept('descarte-sustentavel', 'Cabeçalho "ITENS | QUANTIDADE | LOTE | VALOR DO LOTE" não encontrado.');
  const cols = mapHeader(sheet, header, {
    qty: (h) => h.startsWith('QUANT') || h.startsWith('QTD'),
    lote: (h) => h === 'LOTE',
    value: (h) => h.includes('VALOR'),
  });
  if (cols.lote === undefined) return ctx.kept('descarte-sustentavel', 'Coluna "LOTE" não encontrada.');

  const lotes = new Map<number, Lote>();
  dataRows(sheet, header).forEach((r) => {
    const n = parseInt(text(sheet, r, cols.lote).replace(/\D/g, ''), 10);
    if (!Number.isFinite(n)) return;
    const lote = lotes.get(n) ?? { number: n, qty: 0, value: 0, items: [] };
    const qty = num(sheet, r, cols.qty);
    lote.qty += qty;
    lote.value = lote.value || (cols.value !== undefined ? num(sheet, r, cols.value) : 0);
    lote.items.push({ name: text(sheet, r, header.c), qty });
    lotes.set(n, lote);
  });

  // Lots are historical: cards already on the slide stay as they are (some group several
  // lots, like "Lotes 1, 2 e 3"); only lots that don't appear on any card are added.
  const cards: any[] = slide.content.lotes || [];
  const covered = new Set<number>(cards.flatMap((c) => (String(c.name).match(/\d+/g) || []).map(Number)));
  const novos = [...lotes.values()].filter((l) => !covered.has(l.number)).sort((a, b) => a.number - b.number);
  if (!novos.length) {
    return ctx.kept('descarte-sustentavel', `Nenhum lote novo na aba ${sheet.name} (lotes ${[...lotes.keys()].join(', ')} já estão no slide).`);
  }
  novos.forEach((l) => {
    const desc = [...l.items]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4)
      .map((i) => titleCase(i.name))
      .join(', ');
    cards.push({ name: `Lote ${l.number}`, qty: l.qty, value: round2(l.value), desc });
  });
  slide.content.lotes = cards;
  const kpiQty = slide.content.kpis?.find((k: any) => norm(k.label).includes('QTD'));
  const kpiValue = slide.content.kpis?.find((k: any) => k.type === 'currency');
  if (kpiQty) kpiQty.value = sum(cards, (c) => c.qty);
  if (kpiValue) kpiValue.value = round2(sum(cards, (c) => c.value));
  ctx.updated('descarte-sustentavel', `Adicionado(s): ${novos.map((l) => `Lote ${l.number}`).join(', ')}.`);
}

// ─── Seguros ──────────────────────────────────────────────────────────────────

function importSeguros(ctx: ImportContext) {
  const sheet = findSheet(ctx.wb, 'Seguro');
  const extraSlide = ctx.slide('seguros-extra');
  const tragSlide = ctx.slide('seguros-trags');
  const satSlide = ctx.slide('seguros-satelite');
  if (!sheet) {
    ['seguros-extra', 'seguros-trags', 'seguros-satelite'].forEach((id) => ctx.kept(id, 'Aba "Seguro" não encontrada.'));
    return;
  }

  // Seguro Extra (trânsito + guarda técnica)
  const extra = insuranceSection(sheet, 'EXTRA');
  const extraSection = extraSlide?.content.sections?.[0];
  if (extra && extraSection) {
    const old: any[] = extraSection.subItems || [];
    extraSection.subItems = extra.rows.map((r) => {
      const n = norm(r.name);
      const previous = n.includes('GUARDA') ? old.find((o) => norm(o.name).includes('GUARDA')) : old.find((o) => norm(o.name).includes(n));
      return { name: previous?.name ?? titleCase(r.name), value: round2(r.value), cost: round2(r.cost), rate: extra.rate ?? previous?.rate };
    });
    extraSection.totalValue = round2(sum(extra.rows, (r) => r.value));
    extraSection.monthlyCost = round2(sum(extra.rows, (r) => r.cost));
    ctx.updated('seguros-extra', `Total ${brl(extraSection.totalValue)} · custo ${brl(extraSection.monthlyCost)}.`);
  } else if (extraSlide) {
    ctx.kept('seguros-extra', 'Bloco "EXTRA" (Cliente / EXTRA / CUSTO MÊS) não encontrado na aba Seguro.');
  }

  // TRAG + Arcos Dourados
  const trag = insuranceSection(sheet, 'TRAG');
  const arcos = insuranceSection(sheet, 'ARCOS DOURADOS');
  const tragSections: any[] = tragSlide?.content.sections || [];
  const tragSection = tragSections.find((s) => norm(s.title).includes('TRAG'));
  const arcosSection = tragSections.find((s) => norm(s.title).includes('ARCOS'));
  if (trag && tragSection) {
    tragSection.phases = trag.rows.map((r) => ({ client: titleCase(r.name), val: round2(r.value), minCost: round2(r.cost) }));
    tragSection.totalValue = round2(sum(trag.rows, (r) => r.value));
    tragSection.monthlyCost = round2(sum(trag.rows, (r) => r.cost));
    if (trag.rate) tragSection.rate = trag.rate;
    ctx.updated('seguros-trags', `TRAG: ${trag.rows.map((r) => titleCase(r.name)).join(', ')} — ${brl(tragSection.totalValue)}.`);
  }
  if (arcos && arcosSection) {
    const phaseName = arcosSection.phases?.[0]?.client ?? 'Unidades em Instalação';
    arcosSection.totalValue = round2(sum(arcos.rows, (r) => r.value));
    arcosSection.monthlyCost = round2(sum(arcos.rows, (r) => r.cost));
    arcosSection.phases = [{ client: phaseName, qty: sum(arcos.rows, (r) => r.qty), val: arcosSection.totalValue }];
    if (arcos.rate) arcosSection.rate = arcos.rate;
    ctx.updated('seguros-trags', `Arcos Dourados: ${brl(arcosSection.totalValue)}.`);
  }
  if (tragSlide && !trag) ctx.warn('seguros-trags', 'Bloco "TRAG" não encontrado na aba Seguro — mantido.');
  if (tragSlide && !arcos) ctx.warn('seguros-trags', 'Bloco "ARCOS DOURADOS" não encontrado na aba Seguro — mantido.');

  // Starlink (bloco CONECT) + Fluke
  const starlink = insuranceSection(sheet, 'CONECT', 'STARLINK');
  const fluke = insuranceSection(sheet, 'FLUKE');
  const satSections: any[] = satSlide?.content.sections || [];
  const starSection = satSections.find((s) => norm(s.title).includes('STARLINK'));
  const flukeSection = satSections.find((s) => norm(s.title).includes('FLUKE'));
  if (starlink && starSection) {
    starSection.apolices = starlink.rows.map((r) => {
      const n = r.name.match(/\d+/)?.[0];
      return { name: n ? `${n}ª Apólice` : titleCase(r.name), value: round2(r.value), cost: round2(r.cost) };
    });
    starSection.totalValue = round2(sum(starlink.rows, (r) => r.value));
    starSection.monthlyCost = round2(sum(starlink.rows, (r) => r.cost));
    if (starlink.rate) starSection.rate = starlink.rate;
    ctx.updated('seguros-satelite', `Starlink: ${plural(starlink.rows.length, 'apólice')}, ${brl(starSection.totalValue)}.`);
  }
  if (fluke && flukeSection) {
    flukeSection.totalValue = round2(sum(fluke.rows, (r) => r.value));
    flukeSection.monthlyCost = round2(sum(fluke.rows, (r) => r.cost));
    if (fluke.rate) flukeSection.rate = fluke.rate;
    ctx.updated('seguros-satelite', `Fluke: ${brl(flukeSection.totalValue)}.`);
  }
  if (satSlide && !starlink) ctx.warn('seguros-satelite', 'Bloco "CONECT" (Starlink) não encontrado na aba Seguro — mantido.');
  if (satSlide && !fluke) ctx.warn('seguros-satelite', 'Bloco "FLUKE" não encontrado na aba Seguro — mantido.');
}

const INVOICE_ITEMS: { match: (n: string) => boolean; label: string; name: string; sub: string; credit?: boolean }[] = [
  { match: (n) => n.startsWith('PATRIMONIAL'), label: 'Patrimonial', name: 'Seguro Patrimonial', sub: 'Estoque fixo' },
  { match: (n) => n.startsWith('EXTRA') || n.includes('GUARDA'), label: 'Extra', name: 'Seguro Extra / Guarda Técnica', sub: 'Trânsito e bases satélites' },
  { match: (n) => n.startsWith('BD'), label: 'BD Costs', name: 'BD Costs', sub: 'Serviços de gestão e corretagem' },
  { match: (n) => n.startsWith('ARCOS'), label: 'Arcos', name: 'Arcos Dourados', sub: 'Instalações' },
  { match: (n) => n.startsWith('TRAG'), label: 'TRAG', name: 'TRAG', sub: 'Reversa e desativação' },
  { match: (n) => n.startsWith('STARLINK') || n.startsWith('CONECT'), label: 'Starlink', name: 'Starlink', sub: 'Antenas em campo' },
  { match: (n) => n.startsWith('SIMPAR'), label: 'Simpar', name: 'Simpar', sub: 'Apólice dedicada Simpar' },
  { match: (n) => n.startsWith('ZAMP'), label: 'Zamp', name: 'Zamp', sub: 'Apólice dedicada Zamp' },
  { match: (n) => n.startsWith('FLUKE'), label: 'Fluke', name: 'Fluke', sub: 'Instrumentos de medição' },
  { match: (n) => n.startsWith('OPEX'), label: 'Opex', name: 'Opex', sub: 'Ajuste administrativo do mês' },
  { match: (n) => n.startsWith('DESMOBILIZ'), label: 'Desmob. BK', name: 'Desmobilização BK', sub: 'Desmobilização de equipamentos BK' },
  { match: (n) => n.startsWith('MENSALIDADE') || n.startsWith('MESALIDADE'), label: 'Mensalidade', name: 'Mensalidade', sub: 'Taxa fixa mensal' },
  { match: (n) => n.startsWith('ESTORNO') || n.startsWith('CREDITO'), label: 'Estorno', name: 'Estorno', sub: 'Crédito de conciliação', credit: true },
];

type InvoiceItem = { label: string; name: string; value: number; sub: string; isCredit?: true };

/** Reads a "SEGURO | CUSTO" table into invoice items, keeping the slide's descriptions for known items. */
function readInvoiceTable(sheet: Sheet, header: Pos, previousItems: any[]): { items: InvoiceItem[]; sheetTotal: number | null } {
  const items = dataRows(sheet, header)
    .map((r) => {
      const raw = text(sheet, r, header.c);
      const value = round2(num(sheet, r, header.c + 1));
      const known = INVOICE_ITEMS.find((i) => i.match(norm(raw)));
      const label = known?.label ?? titleCase(raw);
      const previous = previousItems.find((i: any) => norm(i.label) === norm(label));
      const isCredit = !!known?.credit || value < 0;
      return {
        label,
        name: previous?.name ?? known?.name ?? titleCase(raw),
        value,
        sub: previous?.sub ?? known?.sub ?? '',
        ...(isCredit ? { isCredit: true as const } : {}),
      };
    })
    .filter((i) => i.value !== 0)
    .sort((a, b) => Number(!!a.isCredit) - Number(!!b.isCredit) || b.value - a.value);

  // The TOTAL row may sit a few blank rows below the items (the management table does).
  let sheetTotal: number | null = null;
  for (let r = header.r + 1; r <= header.r + 30 && r < sheet.grid.length; r++) {
    if (norm(cell(sheet, r, header.c)) === 'TOTAL') {
      sheetTotal = round2(num(sheet, r, header.c + 1));
      break;
    }
  }
  return { items, sheetTotal };
}

/** Every "SEGURO | CUSTO" header of a sheet, top to bottom. */
function invoiceHeaders(sheet: Sheet): Pos[] {
  return findCells(sheet, (v) => v === 'SEGURO')
    .filter((p) => norm(cell(sheet, p.r, p.c + 1)).startsWith('CUSTO'))
    .sort((a, b) => a.r - b.r || a.c - b.c);
}

/** The first invoice header below a title cell such as "CUSTO FATURA CNPJ PRINCIPAL - SEGURO". */
function invoiceHeaderUnder(sheet: Sheet, titleMatch: (n: string) => boolean): Pos | undefined {
  const title = findCells(sheet, titleMatch)[0];
  if (!title) return undefined;
  return invoiceHeaders(sheet).find((h) => h.r > title.r);
}

function importFaturas(ctx: ImportContext, monthLabel: string) {
  const slide = ctx.slide('custo-fatura');
  if (!slide) return;

  // Since OUT.26 both invoices live in the FATURA tab, each under its own title.
  // Older workbooks only have the principal one, in "Consolidado seguro".
  const faturaSheet = findSheet(ctx.wb, 'FATURA');
  const legacySheet = findSheet(ctx.wb, 'Consolidado seguro');
  let sheet: Sheet | undefined;
  let principalHeader: Pos | undefined;
  let gerHeader: Pos | undefined;
  if (faturaSheet) {
    sheet = faturaSheet;
    principalHeader = invoiceHeaderUnder(faturaSheet, (v) => v.includes('CNPJ PRINCIPAL')) ?? invoiceHeaders(faturaSheet)[0];
    gerHeader = invoiceHeaderUnder(faturaSheet, (v) => v.includes('CNPJ GERENCIAMENTO'));
  }
  if (!principalHeader && legacySheet) {
    sheet = legacySheet;
    principalHeader = invoiceHeaders(legacySheet)[0];
  }
  if (!sheet) return ctx.kept('custo-fatura', 'Abas "FATURA" e "Consolidado seguro" não encontradas — dados anteriores mantidos.');
  if (!principalHeader) return ctx.kept('custo-fatura', `Tabela "SEGURO | CUSTO" não encontrada na aba ${sheet.name.trim()}.`);

  const { items, sheetTotal } = readInvoiceTable(sheet, principalHeader, slide.content.invoiceItems || []);
  if (!items.length) return ctx.kept('custo-fatura', 'Tabela de fatura sem valores.');

  const total = round2(sum(items, (i) => i.value));
  slide.content.total = total;
  slide.content.invoiceItems = items;
  if (slide.content.kpis?.[0]) slide.content.kpis[0].value = total;

  const find = (label: string) => items.find((i) => i.label === label);
  const patrimonial = find('Patrimonial');
  const extra = find('Extra');
  const estorno = items.filter((i) => i.isCredit);
  const mensalidade = find('Mensalidade');
  const comments = [`Fatura do CNPJ principal fecha em ${brl(total)}, concentrando todas as apólices operacionais da Faiston.`];
  if (patrimonial && extra) {
    comments.push(
      `Patrimonial (${brl(patrimonial.value)}) e Extra / Guarda Técnica (${brl(extra.value)}) respondem por ${pctText(pct(patrimonial.value + extra.value, total))} da fatura do mês.`
    );
  }
  comments.push(
    estorno.length
      ? `Estorno de crédito de ${brl(Math.abs(sum(estorno, (e) => e.value)))} abatido na fatura do mês.`
      : `Mês sem estorno de crédito${mensalidade ? `; mensalidade fixa (${brl(mensalidade.value)}) segue como despesa recorrente` : ''}.`
  );
  slide.content.comments = comments;
  ctx.updated('custo-fatura', `Aba ${sheet.name.trim()}: ${plural(items.length, 'item', 'itens')}, total ${brl(total)}.`);
  if (sheetTotal !== null && Math.abs(sheetTotal - total) > 0.05) {
    ctx.warn('custo-fatura', `A soma dos itens (${brl(total)}) não bate com o TOTAL da planilha (${brl(sheetTotal)}).`);
  }

  // "Consolidado seguro" carries the invoice reference ("FATURA 2026.03"). If it is far
  // from the month being presented, the tab was probably not updated this month.
  if (sheet === legacySheet) {
    const faturaHeader = findCells(sheet, (v) => v === 'FATURA')[0];
    const ref = faturaHeader && text(sheet, faturaHeader.r + 1, faturaHeader.c).match(/^(\d{4})[.\/-](\d{1,2})$/);
    const label = parseMonthLabel(monthLabel);
    if (ref && label) {
      const refIndex = parseInt(ref[1], 10) * 12 + parseInt(ref[2], 10) - 1;
      const labelIndex = (2000 + label.year) * 12 + label.month;
      if (labelIndex - refIndex > 2) {
        ctx.warn('custo-fatura', `A aba "${sheet.name.trim()}" está marcada com a fatura ${ref[1]}.${ref[2].padStart(2, '0')} — confira se ela foi atualizada com a fatura deste mês.`);
      }
    }
  }

  const ger = ctx.slide('custo-fatura-gerenciamento');
  if (!ger) return;
  const gerTable = gerHeader && sheet === faturaSheet ? readInvoiceTable(sheet, gerHeader, ger.content.invoiceItems || []) : null;
  if (gerTable && gerTable.items.length) {
    const gerTotal = round2(sum(gerTable.items, (i) => i.value));
    ger.content.total = gerTotal;
    ger.content.invoiceItems = gerTable.items;
    if (ger.content.kpis?.[0]) ger.content.kpis[0].value = gerTotal;
    const indevido = gerTable.items.filter((i) => i.isCredit || /INDEVID|CONTEST/.test(norm(i.name)));
    ger.content.comments = [
      `Fatura do CNPJ de gerenciamento fecha em ${brl(gerTotal)}, valor residual frente aos ${brl(total)} do CNPJ principal.`,
      ...(indevido.length
        ? [`${indevido.map((i) => `${i.name} (${brl(Math.abs(i.value))})`).join(', ')} identificado na conciliação do mês.`]
        : [`${plural(gerTable.items.length, 'item', 'itens')} na fatura do mês: ${gerTable.items.map((i) => i.name).join(', ')}.`]),
      `Somadas, as duas faturas totalizam ${brl(round2(gerTotal + total))} de despesa mensal com seguros.`,
    ];
    ctx.updated('custo-fatura-gerenciamento', `Aba ${sheet.name.trim()}: ${plural(gerTable.items.length, 'item', 'itens')}, total ${brl(gerTotal)}.`);
    if (gerTable.sheetTotal !== null && Math.abs(gerTable.sheetTotal - gerTotal) > 0.05) {
      ctx.warn('custo-fatura-gerenciamento', `A soma dos itens (${brl(gerTotal)}) não bate com o TOTAL da planilha (${brl(gerTable.sheetTotal)}).`);
    }
    return;
  }

  // No management table in the workbook: keep its items, but its comments quote the main total.
  const g = Number(ger.content.total) || 0;
  ger.content.comments = (ger.content.comments || []).map((c: string) => {
    if (/CNPJ principal/i.test(c)) return `Fatura do CNPJ de gerenciamento fecha em ${brl(g)}, valor residual frente aos ${brl(total)} do CNPJ principal.`;
    if (/^Somadas/i.test(c)) return `Somadas, as duas faturas totalizam ${brl(round2(g + total))} de despesa mensal com seguros.`;
    return c;
  });
  ctx.warn('custo-fatura-gerenciamento', 'Tabela "CUSTO FATURA CNPJ GERENCIAMENTO" não encontrada na aba FATURA — itens mantidos; só os comentários que citam o CNPJ principal foram recalculados.');
}

// ─── Laboratório Técnico ─────────────────────────────────────────────────────

const MONTH_TITLE = MONTH_NAMES.map((m) => m.charAt(0) + m.slice(1).toLowerCase());

const KIND_SINGULAR: Record<string, string> = {
  APs: 'AP',
  switches: 'switch',
  fontes: 'fonte',
  CPEs: 'CPE',
  impressoras: 'impressora',
  notebooks: 'notebook',
  'outros equipamentos': 'outro equipamento',
};

/** What kind of equipment a model is, for the per-client summary. */
function equipmentKind(model: string): string {
  const n = norm(model);
  if (/^AP\b|CW91|AIR-|ACCESS POINT/.test(n)) return 'APs';
  if (/SWITCH|^C9\d{3}|CATALYST/.test(n)) return 'switches';
  if (n.startsWith('FONTE') || n.includes('CARREGADOR')) return 'fontes';
  if (n.includes('CPE') || n.includes('ROTEADOR') || n.includes('ROUTER')) return 'CPEs';
  if (n.includes('ZEBRA') || n.includes('IMPRESSORA') || /^ZT\d/.test(n)) return 'impressoras';
  if (/LENOVO|HP |DELL|MACBOOK|ACER|ASUS|SAMSUNG|NOTEBOOK|IDEAPAD|INSPIRON|INSPIRION|THINKPAD|LATITUDE/.test(n)) return 'notebooks';
  return 'outros equipamentos';
}

/** First sentence-ish chunk of a free-text note, for the "sem reparo" summary. */
function shortReason(note: string): string {
  const clean = note.replace(/["“”]/g, '').replace(/\s+/g, ' ').trim();
  const cut = clean.split(/ - | – |;|\.(?=\s)/)[0].trim();
  return cut.length > 60 ? `${cut.slice(0, 57).trimEnd()}…` : cut;
}

const LAB_CLIENT_NAMES: Record<string, string> = {
  NTT: 'NTT — Redes',
  CORPORATIVO: 'Corporativo Faiston',
};

function importLaboratorio(ctx: ImportContext) {
  const slide = ctx.slide('laboratorio-tecnico');
  if (!slide) return;
  const sheet = findSheet(ctx.wb, 'Laboratorio Tecnico', 'Laboratório Técnico', 'LABORATORIO');
  if (!sheet) {
    return ctx.kept('laboratorio-tecnico', 'Aba "Laboratorio Técnico" não encontrada — slide mantido com os dados anteriores.');
  }
  const header = findCells(sheet, (v) => v === 'CHAMADO')[0];
  if (!header) return ctx.kept('laboratorio-tecnico', 'Cabeçalho "Chamado" não encontrado na aba Laboratorio Técnico.');
  const cols = mapHeader(sheet, header, {
    modelo: (h) => h.startsWith('MODELO'),
    descricao: (h) => h === 'SITUACAO 2' || h.startsWith('DESCRI') || h.startsWith('SERVICO'),
    status: (h) => h === 'DATA' || h.startsWith('STATUS'),
    obs: (h) => h.startsWith('PECAS') || h.startsWith('OBS'),
  });
  if (cols.status === undefined) return ctx.kept('laboratorio-tecnico', 'Coluna "DATA" (OK/BAD) não encontrada na aba Laboratorio Técnico.');

  type Chamado = { cliente: string; modelo: string; ok: boolean; bad: boolean; descricao: string; obs: string };
  const chamados: Chamado[] = [];
  const months = new Map<string, number>();
  dataRows(sheet, header).forEach((r) => {
    const cliente = text(sheet, r, header.c);
    const status = norm(cell(sheet, r, cols.status));
    const date = text(sheet, r, cols.status).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (date) {
      const key = `${date[3]}-${date[2].padStart(2, '0')}`;
      months.set(key, (months.get(key) ?? 0) + 1);
    }
    chamados.push({
      cliente,
      modelo: cols.modelo !== undefined ? text(sheet, r, cols.modelo) : '',
      ok: status.startsWith('OK'),
      bad: status.startsWith('BAD'),
      descricao: cols.descricao !== undefined ? text(sheet, r, cols.descricao) : '',
      obs: cols.obs !== undefined ? text(sheet, r, cols.obs) : '',
    });
  });
  if (!chamados.length) return ctx.kept('laboratorio-tecnico', 'Aba Laboratorio Técnico sem chamados.');

  const reparados = chamados.filter((c) => c.ok).length;
  const pendentes = chamados.length - reparados;

  // One card per client, biggest first.
  const byClient = new Map<string, Chamado[]>();
  chamados.forEach((c) => {
    const key = norm(c.cliente) || 'OUTROS';
    byClient.set(key, [...(byClient.get(key) ?? []), c]);
  });
  const categorias = Array.from(byClient.entries())
    .map(([key, list]) => {
      const kinds = new Map<string, number>();
      list.forEach((c) => kinds.set(equipmentKind(c.modelo), (kinds.get(equipmentKind(c.modelo)) ?? 0) + 1));
      const composicao = Array.from(kinds.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([kind, n]) => `${n} ${n === 1 ? KIND_SINGULAR[kind] ?? kind : kind}`)
        .join(', ');
      const ok = list.filter((c) => c.ok).length;
      const semReparo = list.filter((c) => !c.ok);
      const desc =
        `${composicao}. ${
          ok === list.length ? 'Todos reparados e liberados para uso' : ok === 0 ? 'Nenhum reparado no período' : `${ok} ${ok === 1 ? 'reparado e liberado' : 'reparados e liberados'} para uso`
        }` +
        (semReparo.length
          ? `; sem reparo: ${semReparo
              .map((c) => `${c.modelo || 'equipamento'} (${shortReason(c.descricao) || 'em análise'}${/EXTERN/i.test(c.obs) ? ' — enviado para análise externa' : ''})`)
              .join(', ')}.`
          : '.');
      const first = list[0].cliente.trim();
      return {
        name: LAB_CLIENT_NAMES[key] ?? (first === first.toUpperCase() && first.length > 4 ? titleCase(first.toLowerCase()) : first),
        total: list.length,
        reparados: ok,
        pendentes: semReparo.length,
        desc,
      };
    })
    .sort((a, b) => b.total - a.total);

  slide.content.kpis = [
    { label: 'Chamados Atendidos', value: chamados.length, type: 'number' },
    { label: 'Equipamentos Reparados', value: reparados, type: 'number', isHighlight: true },
    { label: 'Sem Reparo / Pendente', value: pendentes, type: 'number' },
  ];
  slide.content.categorias = categorias;

  // The lab reports the month its repairs were closed in — usually the one before the
  // presentation. Take the month most of the status dates fall in.
  const topMonth = Array.from(months.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (topMonth) {
    const [y, m] = topMonth.split('-').map(Number);
    slide.subtitle = `Reparos e manutenções de equipamentos — ${MONTH_TITLE[m - 1]}/${String(y).slice(-2)}`;
  }

  ctx.updated(
    'laboratorio-tecnico',
    `${plural(chamados.length, 'chamado', 'chamados')} em ${plural(categorias.length, 'cliente', 'clientes')}: ${reparados} reparados, ${pendentes} sem reparo/pendentes.`
  );
}

/** Slides that only combine numbers already imported (patrimonial, divisor). */
function importSegurosDerivados(ctx: ImportContext) {
  const estoque = ctx.slide('estoque-atual');
  const patrimonial = ctx.slide('seguros-patrimonial');
  const fatura = ctx.slide('custo-fatura');

  if (patrimonial && estoque && ctx.isUpdated('estoque-atual')) {
    const groupValue = (name: string) => estoque.content.groups.find((g: any) => g.name === name)?.value ?? 0;
    const guarda = groupValue('Guarda de Técnico');
    const segurado = round2(estoque.content.total - guarda);
    const com = groupValue('Projetos com NF');
    const sem = groupValue('Estoque sem NF');
    const [ativos, outros] = (estoque.content.ativosOutros || []).map((a: any) => a.value);

    const kpis: any[] = patrimonial.content.kpis;
    kpis[0].value = segurado;
    const patrimonialCost = fatura?.content.invoiceItems?.find((i: any) => i.label === 'Patrimonial')?.value;
    if (patrimonialCost && ctx.isUpdated('custo-fatura') && kpis[1]) kpis[1].value = patrimonialCost;

    const coberturaValues = [com, ativos ?? 0, outros ?? 0, sem];
    patrimonial.content.coberturas = (patrimonial.content.coberturas || []).map((c: any, i: number) => ({
      ...c,
      value: round2(coberturaValues[i] ?? c.value),
      share: pct(coberturaValues[i] ?? c.value, segurado),
    }));
    patrimonial.content.semNfBreakdown = (estoque.content.semNf || []).map((s: any) => ({ name: titleCase(s.client), qty: s.qty, value: s.value }));
    patrimonial.content.comentarios = (patrimonial.content.comentarios || []).map((c: string) =>
      /^Valor segurado concilia/i.test(c)
        ? `Valor segurado concilia com o Estoque Atual: ${brl(estoque.content.total)} custodiados menos ${brl(guarda)} de Guarda de Técnico, que é coberta pela apólice de Seguro Extra.`
        : c
    );
    const limite = kpis.find((k) => norm(k.label).includes('LIMITE'))?.value;
    if (limite && segurado > limite) {
      ctx.warn('seguros-patrimonial', `Valor segurado (${brl(segurado)}) passou do limite de cobertura (${brl(limite)}).`);
    }
    ctx.updated('seguros-patrimonial', `Valor segurado ${brl(segurado)} (estoque − guarda de técnico).`);
  }

  const divisor = ctx.slide('divisor-seguros');
  const sources = ['seguros-patrimonial', 'seguros-extra', 'seguros-trags', 'seguros-satelite'];
  if (divisor && sources.some((id) => ctx.isUpdated(id))) {
    const sections = sources
      .filter((id) => id !== 'seguros-patrimonial')
      .flatMap((id) => ctx.slide(id)?.content.sections || []);
    const patrimonialKpis: any[] = patrimonial?.content.kpis || [];
    const totalProtected = (patrimonialKpis[0]?.value ?? 0) + sum(sections, (s: any) => s.totalValue || 0);
    const monthly = (patrimonialKpis[1]?.value ?? 0) + sum(sections, (s: any) => s.monthlyCost || 0);
    divisor.content.totalProtected = round2(totalProtected);
    divisor.content.monthlyBillingCost = round2(monthly);
    ctx.updated('divisor-seguros', `Total protegido ${brl(totalProtected)} · custo mensal ${brl(monthly)}.`);
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const IMPORTERS: ((ctx: ImportContext, monthLabel: string) => void)[] = [
  importCorreios,
  importTransportadoras,
  importCiaAerea,
  importCourier,
  importDedicados,
  importSelfStorage,
  importCustoConsolidado,
  importEntradaSaida,
  importEstoque,
  importDescarte,
  importSeguros,
  importFaturas,
  importLaboratorio,
  importSegurosDerivados,
];

export function importWorkbook(wb: Workbook, baseSlides: Slide[], monthLabel = detectMonthLabel(wb)): ImportResult {
  const slides: Slide[] = JSON.parse(JSON.stringify(baseSlides));
  const ctx = new ImportContext(wb, slides);

  for (const run of IMPORTERS) {
    const name = run.name.replace(/^import/, '');
    try {
      run(ctx, monthLabel);
    } catch (err) {
      console.error(`[importar planilha] ${name}:`, err);
      ctx.warn(slides[0]?.id ?? 'capa', `Erro inesperado ao ler "${name}": ${(err as Error).message}`);
    }
  }

  applyMonthLabel(slides, monthLabel);
  ctx.updated('capa', `Mês da apresentação: ${monthLabel}.`);

  return { slides, report: slides.map((s) => ctx.report.get(s.id)!).filter((r) => r.id !== 'agradecimento'), monthLabel };
}

/** Exposed for the import modal: lists which sheets of the workbook were not used. */
export const KNOWN_SHEETS = [
  'CORREIOS', 'TRANSPORTADORAS', 'RESUMO', 'GOL', 'LATAM', 'AZUL', 'LOGGI', 'Consolidado Dedicados', 'DEDICADOS',
  'SELF STORAGE', 'Base Consolidado', 'Seguro', 'Notas Saída', 'Consolidado seguro', 'SANLIEN', 'SALIEN',
  'FATURA', 'Laboratorio Tecnico',
].map(norm);

export function unusedSheets(wb: Workbook): string[] {
  return wb.sheets.filter((s) => !s.hidden && !KNOWN_SHEETS.includes(norm(s.name))).map((s) => s.name);
}

