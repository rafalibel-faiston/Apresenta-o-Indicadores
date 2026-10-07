import { useMemo, useRef, useState } from 'react';
import { formatCompact, formatCurrency } from './MiniCharts';
import { SERIES_DARK, SERIES_LIGHT, VariationBadge, useContainerWidth } from './TrendChart';

// Charts of the "Comparativo Consolidado" slide. Same validated palette as
// TrendChart.tsx; sized to fit the 1280×720 export capture.

// Modalities get a fixed slot in the validated categorical order — never a
// hash (two names could land on the same hue) and never their rank (a
// modality must keep its color when the ranking changes between months).
const MODALIDADE_ORDER = ['transport', 'correio', 'courier', 'dedicad', 'aere', 'storage'];

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function modalidadeSlot(category: string): number {
  const name = normalize(category);
  const idx = MODALIDADE_ORDER.findIndex((key) => name.includes(key));
  return idx >= 0 ? idx : MODALIDADE_ORDER.length;
}

export function modalidadeColor(category: string, isDarkMode = false): string {
  const scale = isDarkMode ? SERIES_DARK : SERIES_LIGHT;
  return scale[modalidadeSlot(category) % scale.length];
}

function niceTicks(max: number, count = 3): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? magnitude * 10;
  // The last tick sits at or above the max, so no column ever overflows the axis.
  const last = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = 0; tick <= last + step / 2; tick += step) ticks.push(tick);
  return ticks;
}

export interface ComposicaoMes {
  competencia: string;
  label: string;
  total: number | null;
  partes: { category: string; value: number }[];
}

/**
 * Part-to-whole over time: one stacked column per competência, one segment per
 * modality. Totals are labelled on top of each column; segment values live in
 * the hover tooltip. The presented month's label is emphasised.
 */
export function StackedMonthlyColumns({
  data,
  currentCompetencia,
  isDarkMode = false,
  height = 300,
}: {
  data: ComposicaoMes[];
  currentCompetencia?: string | null;
  isDarkMode?: boolean;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef, 480);
  const [hover, setHover] = useState<{ month: number; category: string } | null>(null);

  const categories = useMemo(() => {
    const names = new Set<string>();
    data.forEach((m) => m.partes.forEach((p) => p.value > 0 && names.add(p.category)));
    return Array.from(names).sort((a, b) => modalidadeSlot(a) - modalidadeSlot(b) || a.localeCompare(b));
  }, [data]);

  const months = data.map((m) => {
    const sum = m.partes.reduce((acc, p) => acc + Math.max(p.value, 0), 0);
    return { ...m, sum, total: m.total ?? sum };
  });
  const maxValue = Math.max(...months.map((m) => Math.max(m.sum, m.total ?? 0)), 0);

  const padding = { top: 22, right: 8, bottom: 26, left: 50 };
  const plotWidth = Math.max(width - padding.left - padding.right, 10);
  const plotHeight = Math.max(height - padding.top - padding.bottom, 10);
  const ticks = niceTicks(maxValue);
  const scaleMax = ticks[ticks.length - 1] || 1;
  const y = (value: number) => padding.top + plotHeight - (value / scaleMax) * plotHeight;
  const band = plotWidth / Math.max(months.length, 1);
  const colWidth = Math.min(56, band * 0.58);

  const gridColor = isDarkMode ? '#1e293b' : '#e6e9f4';
  const axisText = '#7a839c';
  const accent = isDarkMode ? SERIES_DARK[0] : SERIES_LIGHT[0];
  const surface = isDarkMode ? '#12131a' : '#ffffff';

  if (!categories.length) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed text-[12px] font-light ${
        isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
      }`} style={{ height }}>
        Nenhum mês com custo por modalidade preenchido.
      </div>
    );
  }

  const hoveredMonth = hover ? months[hover.month] : null;
  const hoveredValue = hoveredMonth?.partes.find((p) => p.category === hover?.category)?.value ?? 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Legend — always present for ≥ 2 series; text stays in ink, the swatch carries identity. */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {categories.map((category) => (
          <span key={category} className={`flex items-center gap-1.5 text-[10px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: modalidadeColor(category, isDarkMode) }} />
            {category}
          </span>
        ))}
      </div>

      <div ref={containerRef} className="relative w-full" style={{ height }}>
        <svg width="100%" height={height} role="img" aria-label="Composição do custo logístico por modalidade em cada competência" onMouseLeave={() => setHover(null)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={padding.left} y1={y(tick)} x2={padding.left + plotWidth} y2={y(tick)} stroke={gridColor} strokeWidth={1} />
              <text x={padding.left - 8} y={y(tick) + 3.5} textAnchor="end" fontSize={10} fill={axisText} fontFamily="ui-monospace, monospace">
                {formatCompact(tick)}
              </text>
            </g>
          ))}

          {months.map((month, mIdx) => {
            const cx = padding.left + band * mIdx + band / 2;
            const x = cx - colWidth / 2;
            const isCurrent = month.competencia === currentCompetencia;
            let acc = 0;
            const segments = categories
              .map((category) => ({ category, value: Math.max(month.partes.find((p) => p.category === category)?.value ?? 0, 0) }))
              .filter((s) => s.value > 0)
              .map((s) => {
                const y0 = y(acc);
                acc += s.value;
                return { ...s, top: y(acc), bottom: y0 };
              });
            const topY = segments.length ? segments[segments.length - 1].top : y(0);
            const clipId = `col-clip-${mIdx}`;
            const r = Math.min(4, colWidth / 2);

            return (
              <g key={month.competencia}>
                <defs>
                  {/* Rounded at the data end, square at the baseline. */}
                  <clipPath id={clipId}>
                    <path d={`M${x},${y(0)} L${x},${topY + r} Q${x},${topY} ${x + r},${topY} L${x + colWidth - r},${topY} Q${x + colWidth},${topY} ${x + colWidth},${topY + r} L${x + colWidth},${y(0)} Z`} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${clipId})`}>
                  {segments.map((seg, sIdx) => {
                    const isHovered = hover?.month === mIdx && hover.category === seg.category;
                    // 2px surface gap between stacked segments.
                    const gap = sIdx > 0 ? 2 : 0;
                    return (
                      <rect
                        key={seg.category}
                        x={x}
                        y={seg.top}
                        width={colWidth}
                        height={Math.max(seg.bottom - seg.top - gap, 0.5)}
                        fill={modalidadeColor(seg.category, isDarkMode)}
                        opacity={hover && !isHovered ? 0.45 : 1}
                        onMouseEnter={() => setHover({ month: mIdx, category: seg.category })}
                      />
                    );
                  })}
                </g>
                <text x={cx} y={topY - 7} textAnchor="middle" fontSize={10} fontWeight={700} fill={isDarkMode ? '#cbd5e1' : '#3f4661'} fontFamily="ui-monospace, monospace">
                  {formatCompact(month.total ?? month.sum)}
                </text>
                <text
                  x={cx}
                  y={padding.top + plotHeight + 17}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={isCurrent ? 800 : 500}
                  fill={isCurrent ? accent : axisText}
                  fontFamily="ui-monospace, monospace"
                >
                  {month.label}
                </text>
                <rect x={cx - colWidth / 2} y={padding.top + plotHeight + 23} width={colWidth} height={2} rx={1} fill={isCurrent ? accent : 'transparent'} />
              </g>
            );
          })}
          <line x1={padding.left} y1={y(0)} x2={padding.left + plotWidth} y2={y(0)} stroke={isDarkMode ? '#334155' : '#cfd5e6'} strokeWidth={1} />
        </svg>

        {hover && hoveredMonth && (
          <div
            className={`pointer-events-none absolute z-10 rounded-xl border px-3 py-2 shadow-lg ${
              isDarkMode ? 'bg-[#12131a] border-slate-800 shadow-black/60' : 'bg-white border-slate-200 shadow-slate-200/70'
            }`}
            style={{
              left: Math.min(Math.max(padding.left + band * hover.month + band / 2 + colWidth / 2 + 6, 0), Math.max(width - 170, 0)),
              top: padding.top,
            }}
          >
            <div className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {hoveredMonth.label}
            </div>
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: modalidadeColor(hover.category, isDarkMode), boxShadow: `0 0 0 2px ${surface}` }} />
              {hover.category}
            </div>
            <div className={`text-[13px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(hoveredValue)}</div>
            <div className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {hoveredMonth.sum > 0 ? `${((hoveredValue / hoveredMonth.sum) * 100).toFixed(1)}% do mês` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export interface IndicadorLinha {
  label: string;
  format: 'currency' | 'number';
  mode: 'sum' | 'last' | 'avg';
  /** Which direction is good news: 'down' for costs, 'up' for revenue, 'neutral' when neither. */
  polarity?: 'down' | 'up' | 'neutral';
  values: (number | null)[];
}

function formatIndicador(value: number, format: IndicadorLinha['format']): string {
  return format === 'currency' ? formatCompact(value) : new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

/**
 * One indicator across the compared months, as a small multiple: the presented
 * month in the accent hue, the others in a recessive gray (emphasis form).
 * Hovering a bar shows that month's value in the card header.
 */
export function IndicadorCard({
  linha,
  meses,
  currentCompetencia,
  isDarkMode = false,
}: {
  linha: IndicadorLinha;
  meses: { competencia: string; label: string }[];
  currentCompetencia?: string | null;
  isDarkMode?: boolean;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const currentIdx = Math.max(meses.findIndex((m) => m.competencia === currentCompetencia), 0);
  // Fall back to the latest filled month when the presented one has no value.
  const lastFilled = linha.values.reduce<number>((best, v, i) => (v !== null ? i : best), -1);
  const focusIdx = hoverIdx ?? (linha.values[currentIdx] !== null ? currentIdx : lastFilled);
  const focusValue = focusIdx >= 0 ? linha.values[focusIdx] : null;

  let previous: number | null = null;
  for (let i = focusIdx - 1; i >= 0; i--) {
    if (linha.values[i] !== null) {
      previous = linha.values[i];
      break;
    }
  }
  const variation = focusValue !== null && previous !== null && previous !== 0 ? ((focusValue - previous) / Math.abs(previous)) * 100 : null;

  const present = linha.values.filter((v): v is number => v !== null);
  const max = Math.max(...present, 0) || 1;
  const accent = isDarkMode ? SERIES_DARK[0] : SERIES_LIGHT[0];
  const rest = isDarkMode ? '#334155' : '#cfd5e6';
  const barArea = 26;

  return (
    <div className={`rounded-2xl border px-3 py-2 flex flex-col gap-1 ${
      isDarkMode ? 'bg-[#12131a] border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {linha.label}
        </span>
        <span className={`text-[9px] font-mono font-bold shrink-0 ${hoverIdx !== null ? '' : 'opacity-0'} ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {focusIdx >= 0 ? meses[focusIdx]?.label : ''}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className={`text-[15px] font-black leading-none tabular-nums whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {focusValue === null ? '—' : formatIndicador(focusValue, linha.format)}
        </span>
        {linha.polarity === 'neutral' ? (
          variation !== null && (
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
            </span>
          )
        ) : (
          <VariationBadge value={variation} invert={linha.polarity === 'up'} size="sm" isDarkMode={isDarkMode} />
        )}
      </div>
      <div className="flex items-end gap-[2px]" style={{ height: barArea }} onMouseLeave={() => setHoverIdx(null)}>
        {linha.values.map((value, idx) => {
          const isFocus = idx === focusIdx;
          return (
            <div
              key={meses[idx]?.competencia ?? idx}
              className="flex-1 h-full flex items-end cursor-default"
              onMouseEnter={() => setHoverIdx(idx)}
              title={`${meses[idx]?.label}: ${value === null ? 'sem dado' : formatIndicador(value, linha.format)}`}
            >
              {value === null ? (
                <div className={`w-full h-[3px] rounded-full border-t border-dashed ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`} />
              ) : (
                <div
                  className="w-full rounded-t-[4px] transition-colors"
                  style={{
                    height: `${Math.max((Math.max(value, 0) / max) * 100, 4)}%`,
                    backgroundColor: idx === currentIdx || isFocus ? accent : rest,
                    opacity: hoverIdx !== null && !isFocus && idx !== currentIdx ? 0.7 : 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className={`flex justify-between text-[8px] leading-none font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
        <span>{meses[0]?.label}</span>
        {meses.length > 1 && <span>{meses[meses.length - 1]?.label}</span>}
      </div>
    </div>
  );
}

