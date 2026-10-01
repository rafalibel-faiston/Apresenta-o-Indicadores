// Parsers for the team's raw control sheets (one row per shipment / invoice).
// Columns are matched by name with aliases, so existing control sheets can be
// read as-is — no need to rename columns or move the header to row 1.
import { MonthKey, parseMonth } from './months';
import { toNumber } from './numbers';

export type ModalId = 'correios' | 'transportadoras' | 'cia-aerea' | 'courier' | 'dedicados';

export const MODAL_IDS: ModalId[] = ['correios', 'transportadoras', 'cia-aerea', 'courier', 'dedicados'];

export interface ExpedicaoRecord {
  month: MonthKey;
  modal: ModalId;
  carrier: string;
  project: string;
  cost: number;
  equipments: number;
  // Explicit shipment count; when absent each distinct NF (or row) counts as one.
  shipments?: number;
  shipmentId: string;
  route?: string;
}

export interface SelfStorageRecord {
  month: MonthKey;
  uf: string;
  project: string;
  cost: number;
  obs?: string;
}

export function normalizeHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/R\$/g, ' ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Order matters: the first alias found in the header wins.
const ALIASES = {
  month: ['MES', 'MES REFERENCIA', 'MES DE REFERENCIA', 'COMPETENCIA', 'FECHAMENTO'],
  date: ['DATA EXPEDICAO', 'DATA DE EXPEDICAO', 'DATA ENVIO', 'DATA DE ENVIO', 'DATA COLETA', 'DATA DA COLETA', 'DATA EMISSAO', 'DATA'],
  modal: ['MODAL', 'MODALIDADE', 'TIPO DE FRETE', 'TIPO FRETE', 'MODAL TRANSPORTE'],
  carrier: ['TRANSPORTADORA', 'TRANSPORTADOR', 'PARCEIRO', 'FORNECEDOR', 'EMPRESA'],
  project: ['PROJETO', 'CLIENTE PROJETO', 'CLIENTE', 'CENTRO DE CUSTO'],
  cost: ['VALOR FINAL', 'CUSTO TOTAL', 'CUSTO', 'VALOR FRETE', 'VALOR DO FRETE', 'FRETE', 'VALOR CTE', 'VALOR TOTAL', 'VALOR'],
  shipments: ['EMBARQUES', 'N DE EMBARQUES', 'NO DE EMBARQUES', 'QTD EMBARQUES', 'QTDE EMBARQUES', 'QNT EMBARQUES'],
  equipments: ['EQUIPAMENTOS', 'QTD EQUIPAMENTOS', 'QTD EQUIPAMENTO', 'QTDE EQUIPAMENTOS', 'QNT EQUIPAMENTO', 'QNT EQUIPAMENTOS', 'QUANTIDADE', 'QTDE', 'QTD'],
  nf: ['NF', 'NF GRM', 'NOTA FISCAL', 'N NF', 'NFE', 'CTE'],
  route: ['ROTA'],
  status: ['STATUS'],
  uf: ['UF', 'ESTADO'],
  obs: ['OBS', 'OBSERVACAO', 'OBSERVACOES', 'DESCRICAO'],
} as const;

type AliasTable = Record<string, readonly string[]>;
type Field = keyof typeof ALIASES;
type ColumnMap<F extends string = Field> = Partial<Record<F, number>>;

function matchHeader(headers: string[], aliases: readonly string[]): number | undefined {
  for (const alias of aliases) {
    const exact = headers.indexOf(alias);
    if (exact >= 0) return exact;
  }
  // Header cells merged with a title row arrive as "CONTROLE EXPEDICAO DATA".
  for (const alias of aliases) {
    const idx = headers.findIndex((h) => h.endsWith(` ${alias}`));
    if (idx >= 0) return idx;
  }
  return undefined;
}

function mapColumns<T extends AliasTable>(row: string[], table: T): ColumnMap<Extract<keyof T, string>> {
  const headers = row.map(normalizeHeader);
  const map: ColumnMap<Extract<keyof T, string>> = {};
  (Object.keys(table) as Extract<keyof T, string>[]).forEach((field) => {
    const idx = matchHeader(headers, table[field]);
    if (idx !== undefined) map[field] = idx;
  });
  return map;
}

// Finds the header row among the first rows (control sheets often have a title
// above the table) and returns it with the column map.
function locateHeader<T extends AliasTable = typeof ALIASES>(
  rows: string[][],
  required: Extract<keyof T, string>[][],
  table: T = ALIASES as unknown as T
): { headerIdx: number; cols: ColumnMap<Extract<keyof T, string>> } | undefined {
  const limit = Math.min(rows.length, 15);
  for (let i = 0; i < limit; i++) {
    const cols = mapColumns(rows[i], table);
    if (required.every((options) => options.some((f) => cols[f] !== undefined))) {
      return { headerIdx: i, cols };
    }
  }
  return undefined;
}

function cell(row: string[], idx: number | undefined): string {
  return idx === undefined ? '' : (row[idx] ?? '').trim();
}

export function classifyModal(...texts: string[]): ModalId | undefined {
  const s = normalizeHeader(texts.join(' '));
  if (!s) return undefined;
  if (/CORREIO|SEDEX|\bPAC\b/.test(s)) return 'correios';
  if (/AERE|AVIAO|\bGOL\b|LATAM|AZUL CARGO/.test(s)) return 'cia-aerea';
  if (/COURIER|LOGGI|MOTOBOY/.test(s)) return 'courier';
  if (/DEDICAD|EXCLUSIV/.test(s)) return 'dedicados';
  if (/TRANSPORTADORA|RODOVIARI|FRACIONAD|CARGA/.test(s)) return 'transportadoras';
  return undefined;
}

export interface SourceDefaults {
  modal?: string;
  carrier?: string;
  label: string;
  // Month for rows without date/month (from `Fontes.mes` or the tab name).
  month?: MonthKey;
}

export function parseExpedicoes(rows: string[][], defaults: SourceDefaults): ExpedicaoRecord[] {
  const located = locateHeader(rows, defaults.month ? [['cost']] : [['cost'], ['month', 'date']]);
  if (!located) {
    console.warn(`[planilha] "${defaults.label}": não encontrei as colunas de custo (ex.: VALOR FINAL/CUSTO) e data/mês (ex.: DATA EXPEDIÇÃO/MES).`);
    return [];
  }
  const { headerIdx, cols } = located;
  const records: ExpedicaoRecord[] = [];
  let skipped = 0;

  rows.slice(headerIdx + 1).forEach((row, i) => {
    if (row.every((c) => !c.trim())) return;
    if (/CANCELAD/.test(normalizeHeader(cell(row, cols.status)))) return;

    const month = parseMonth(cell(row, cols.month)) ?? parseMonth(cell(row, cols.date)) ?? defaults.month;
    const cost = toNumber(cell(row, cols.cost));
    const carrier = (cell(row, cols.carrier) || defaults.carrier || '').toUpperCase();
    const modalText = cell(row, cols.modal);
    // An explicit modal on the row wins over the source default.
    const modal = classifyModal(modalText) ?? classifyModal(defaults.modal ?? '') ?? classifyModal(carrier);
    const project = cell(row, cols.project).toUpperCase() || 'SEM PROJETO';

    // Total/subtotal rows of pivot-like sheets are not shipments.
    if (/^(TOTAL|SUBTOTAL|TOTAL GERAL)$/.test(normalizeHeader(project))) return;

    if (!month || cost === undefined || !modal) {
      skipped++;
      return;
    }

    const shipmentsRaw = cell(row, cols.shipments);
    const equipmentsRaw = cell(row, cols.equipments);
    const nf = cell(row, cols.nf);

    records.push({
      month,
      modal,
      carrier: carrier || 'NÃO INFORMADA',
      project,
      cost,
      equipments: equipmentsRaw ? toNumber(equipmentsRaw, 0)! : 1,
      shipments: shipmentsRaw ? toNumber(shipmentsRaw, 0) : undefined,
      shipmentId: nf ? `${modal}|${nf}` : `${defaults.label}|${headerIdx + 1 + i}`,
      route: cell(row, cols.route).toUpperCase() || undefined,
    });
  });

  if (skipped) {
    console.warn(`[planilha] "${defaults.label}": ${skipped} linha(s) ignorada(s) por falta de data/mês, custo ou modal.`);
  }
  return records;
}

export function parseSelfStorage(rows: string[][], label: string, defaultMonth?: MonthKey): SelfStorageRecord[] {
  const located = locateHeader(rows, defaultMonth ? [['cost'], ['uf']] : [['cost'], ['month', 'date'], ['uf']]);
  if (!located) {
    console.warn(`[planilha] "${label}": não encontrei as colunas MES/DATA, UF e CUSTO.`);
    return [];
  }
  const { headerIdx, cols } = located;
  const records: SelfStorageRecord[] = [];

  rows.slice(headerIdx + 1).forEach((row) => {
    const month = parseMonth(cell(row, cols.month)) ?? parseMonth(cell(row, cols.date)) ?? defaultMonth;
    const cost = toNumber(cell(row, cols.cost));
    const uf = cell(row, cols.uf).toUpperCase();
    if (!month || cost === undefined || !uf) return;
    records.push({
      month,
      uf,
      project: cell(row, cols.project).toUpperCase() || 'NTT',
      cost,
      obs: cell(row, cols.obs) || undefined,
    });
  });
  return records;
}

// --- Notas fiscais (Entrada e Saída) ---------------------------------------
// The month's NF report (e.g. exported from SAP) is pasted at once, item lines
// included; the app consolidates NFs, equipments, value and qty per client.

export type Lado = 'entrada' | 'saida';

export interface NotaRecord {
  month: MonthKey;
  lado: Lado;
  nf: string;
  client: string;
  qty: number;
  // Value of this line; for reports that only carry the NF total, the total is
  // repeated on each line and `perNf` tells the aggregation to count it once.
  value: number;
  perNf: boolean;
}

const NF_ALIASES = {
  month: ALIASES.month,
  date: ['DATA EMISSAO', 'DATA DE EMISSAO', 'DATA LANCAMENTO', 'DATA DE LANCAMENTO', 'DATA DOCUMENTO', 'DATA ENTRADA', 'DATA SAIDA', 'DATA'],
  lado: ['TIPO', 'OPERACAO', 'TIPO OPERACAO', 'TIPO DE OPERACAO', 'MOVIMENTO', 'MOVIMENTACAO', 'ENTRADA SAIDA', 'E S'],
  cfop: ['CFOP'],
  nf: ['NF', 'NF E', 'NFE', 'NOTA FISCAL', 'NOTA', 'N NF', 'NO NF', 'NUMERO NF', 'NUMERO DA NF', 'N NOTA', 'NUMERO NOTA', 'NUMERO'],
  client: ['PROJETO', 'CLIENTE', 'NOME DO CLIENTE', 'PARCEIRO', 'PARCEIRO DE NEGOCIO', 'NOME PN', 'NOME DO PN', 'RAZAO SOCIAL', 'DESTINATARIO', 'EMITENTE', 'FORNECEDOR'],
  qty: ['QTD EQUIPAMENTOS', 'EQUIPAMENTOS', 'QUANTIDADE', 'QTDE', 'QTD'],
  valueItem: ['VALOR TOTAL ITEM', 'VALOR TOTAL DO ITEM', 'VALOR ITEM', 'VALOR DO ITEM', 'TOTAL ITEM', 'TOTAL DA LINHA', 'TOTAL LINHA', 'VALOR LINHA'],
  valueNf: ['VALOR NF', 'VALOR DA NF', 'VALOR NOTA', 'VALOR DA NOTA', 'VALOR TOTAL NF', 'VALOR TOTAL DA NOTA', 'TOTAL NF', 'TOTAL DOCUMENTO', 'VALOR TOTAL', 'VALOR'],
  status: ['STATUS', 'SITUACAO'],
} as const;

export function classifyLado(text: string): Lado | undefined {
  const s = normalizeHeader(text);
  if (!s) return undefined;
  if (/^(E|ENT)$|ENTRADA|RECEBIMENTO|COMPRA/.test(s)) return 'entrada';
  if (/^(S|SAI)$|SAIDA|EXPEDICAO|REMESSA|VENDA/.test(s)) return 'saida';
  return undefined;
}

// CFOP starting with 1/2/3 is an inbound operation, 5/6/7 outbound.
function ladoFromCfop(cfop: string): Lado | undefined {
  const d = cfop.replace(/\D/g, '')[0];
  if (d && '123'.includes(d)) return 'entrada';
  if (d && '567'.includes(d)) return 'saida';
  return undefined;
}

export interface NotaDefaults {
  label: string;
  lado?: string;
  // Month of the whole paste, when the rows have no date (from `Fontes.mes` or
  // the tab name, e.g. "NF OUT.26").
  month?: MonthKey;
}

export function parseNotas(rows: string[][], defaults: NotaDefaults): NotaRecord[] {
  const located = locateHeader(rows, [['nf'], ['valueItem', 'valueNf', 'qty']], NF_ALIASES);
  if (!located) {
    console.warn(`[planilha] "${defaults.label}": não encontrei as colunas de NF e valor/quantidade no relatório de notas.`);
    return [];
  }
  const { headerIdx, cols } = located;
  const records: NotaRecord[] = [];
  let skipped = 0;

  rows.slice(headerIdx + 1).forEach((row) => {
    if (row.every((c) => !c.trim())) return;
    if (/CANCELAD/.test(normalizeHeader(cell(row, cols.status)))) return;

    const nf = cell(row, cols.nf);
    if (!nf || /^TOTAL/.test(normalizeHeader(nf))) return;

    const month = parseMonth(cell(row, cols.month)) ?? parseMonth(cell(row, cols.date)) ?? defaults.month;
    const lado =
      classifyLado(cell(row, cols.lado)) ?? ladoFromCfop(cell(row, cols.cfop)) ?? classifyLado(defaults.lado ?? '');
    if (!month || !lado) {
      skipped++;
      return;
    }

    const itemValue = toNumber(cell(row, cols.valueItem));
    const nfValue = toNumber(cell(row, cols.valueNf));
    const qtyRaw = cell(row, cols.qty);

    records.push({
      month,
      lado,
      nf,
      client: cell(row, cols.client).toUpperCase() || 'NÃO INFORMADO',
      qty: qtyRaw ? toNumber(qtyRaw, 0)! : 1,
      value: itemValue ?? nfValue ?? 0,
      perNf: itemValue === undefined && nfValue !== undefined,
    });
  });

  if (skipped) {
    console.warn(`[planilha] "${defaults.label}": ${skipped} linha(s) sem mês ou sem tipo (entrada/saída) foram ignoradas.`);
  }
  return records;
}

// Month written at the end of a tab name: "NF OUT.26", "Entradas 10-2026".
export function monthFromTabName(name: string): MonthKey | undefined {
  const m = name.trim().match(/([A-Za-zÀ-ú]{3,}[\s./\-_]*\d{2,4}|\d{1,2}[./\-]\d{4})$/);
  return m ? parseMonth(m[1]) : undefined;
}

// Extracts the spreadsheet ID from a full Google Sheets URL (or returns the ID as-is).
export function sheetIdFrom(value: string): string {
  const m = value.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : value.trim();
}
