import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatCompact, formatCurrency } from './MiniCharts';

// Categorical series colors, snapped to the Faiston palette and validated with
// the dataviz palette checker (lightness band, chroma floor, CVD separation,
// normal-vision separation, contrast). Every mark that uses them is also
// directly labelled, which is what licenses the two WARN-band results:
// #00b8f0 sits under 3:1 on white, and the dark pair #d600df/#6673ff sits in
// the 6–8 CVD floor band.
export const SERIES_LIGHT = ['#0054ec', '#fd11a4', '#00b8f0', '#960a9c', '#fd5665', '#4b50d8'];
export const SERIES_DARK = ['#3c7dff', '#eb0598', '#0193c0', '#f80345', '#d600df', '#6673ff'];

export function seriesColor(index: number, isDarkMode = false): string {
  const scale = isDarkMode ? SERIES_DARK : SERIES_LIGHT;
  return scale[index % scale.length];
}

/**
 * Color bound to the entity's name rather than to its position in the list.
 *
 * Rankings move between months — Correios can overtake Courier — and a color
 * that followed the rank would repaint both, making the comparison unreadable.
 * Hashing the label keeps each modality on the same hue across every month.
 */
export function stableSeriesColor(key: string, isDarkMode = false): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const scale = isDarkMode ? SERIES_DARK : SERIES_LIGHT;
  return scale[hash % scale.length];
}

export function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>, fallback = 720) {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(next);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export interface TrendPoint {
  competencia: string;
  label: string;
  value: number | null;
  variation: number | null;
}

/** Signed percentage pill. Reduction is good news in a cost chart, so it reads green. */
export function VariationBadge({
  value,
  invert = false,
  size = 'md',
  isDarkMode = false,
}: {
  value: number | null;
  /** Set when a rise is the good outcome (revenue, protected assets). */
  invert?: boolean;
  size?: 'sm' | 'md';
  isDarkMode?: boolean;
}) {
  if (value === null || !Number.isFinite(value)) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-mono font-bold ${
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
      } ${isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
        —
      </span>
    );
  }

  const isFlat = Math.abs(value) < 0.05;
  const isGood = invert ? value > 0 : value < 0;
  const Icon = isFlat ? ArrowRight : value > 0 ? ArrowUpRight : ArrowDownRight;

  const tone = isFlat
    ? isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
    : isGood
      ? isDarkMode ? 'bg-[#04a078]/15 text-[#3ddCaa]' : 'bg-[#04a078]/10 text-[#04795c]'
      : isDarkMode ? 'bg-[#fd5665]/15 text-[#ff9aa2]' : 'bg-[#fd5665]/11 text-[#c02234]';

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full font-mono font-bold ${
      size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
    } ${tone}`}>
      <Icon size={size === 'sm' ? 9 : 11} />
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

interface MonthlyTrendChartProps {
  data: TrendPoint[];
  isDarkMode?: boolean;
  height?: number;
  /** Rendered in the tooltip and on the axis. Defaults to Brazilian currency. */
  formatValue?: (value: number) => string;
}

/**
 * Single-series line + area over the competências. One series means no legend
 * is needed — the slide title names the measure. Only the first, last and peak
 * months are labelled directly; the rest are reachable by hovering.
 */
export function MonthlyTrendChart({
  data,
  isDarkMode = false,
  height = 260,
  formatValue = formatCurrency,
}: MonthlyTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => data.filter((point) => point.value !== null), [data]);

  const padding = { top: 24, right: 22, bottom: 34, left: 58 };
  const plotWidth = Math.max(width - padding.left - padding.right, 10);
  const plotHeight = Math.max(height - padding.top - padding.bottom, 10);

  const geometry = useMemo(() => {
    if (!points.length) return null;

    const values = points.map((p) => p.value as number);
    const rawMax = Math.max(...values);
    const rawMin = Math.min(...values);
    // Anchor the band to zero when the series is close to it, so the slope is
    // honest instead of exaggerated by a floating baseline.
    const min = rawMin > 0 && rawMin / rawMax > 0.55 ? rawMin * 0.88 : 0;
    const max = rawMax * 1.08 || 1;
    const span = max - min || 1;

    const x = (idx: number) =>
      padding.left + (points.length === 1 ? plotWidth / 2 : (idx / (points.length - 1)) * plotWidth);
    const y = (value: number) => padding.top + plotHeight - ((value - min) / span) * plotHeight;

    const coords = points.map((point, idx) => ({ ...point, x: x(idx), y: y(point.value as number) }));
    const line = coords.map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
    const area = `${line} L${coords[coords.length - 1].x.toFixed(2)},${(padding.top + plotHeight).toFixed(2)} L${coords[0].x.toFixed(2)},${(padding.top + plotHeight).toFixed(2)} Z`;

    // Round tick values (1/2/2.5/5 × 10^n) — an axis reading 44k/51k/58k/65k
    // makes people do arithmetic to place a bar.
    const rawStep = span / 3;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const niceStep = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((step) => step >= rawStep) ?? magnitude * 10;
    const firstTick = Math.ceil(min / niceStep) * niceStep;
    const ticks: number[] = [];
    for (let tick = firstTick; tick <= max; tick += niceStep) ticks.push(tick);
    const peakIdx = values.indexOf(rawMax);

    return { coords, line, area, ticks, y, min, max, peakIdx };
  }, [points, plotWidth, plotHeight, padding.left, padding.top]);

  if (!geometry || !points.length) {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-dashed text-[12px] font-light ${
        isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
      }`} style={{ height }}>
        Sem série histórica suficiente para o gráfico.
      </div>
    );
  }

  const accent = isDarkMode ? SERIES_DARK[0] : SERIES_LIGHT[0];
  const gridColor = isDarkMode ? '#1e293b' : '#e6e9f4';
  const axisText = isDarkMode ? '#7a839c' : '#7a839c';
  const gradientId = 'trend-area-gradient';

  const handlePointer = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    let nearest = 0;
    let bestDistance = Infinity;
    geometry.coords.forEach((coord, idx) => {
      const distance = Math.abs(coord.x - offsetX);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = idx;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex === null ? null : geometry.coords[hoverIndex];
  // Labelled directly: first, last and the peak — never a number on every point.
  const labelledIndexes = new Set([0, geometry.coords.length - 1, geometry.peakIdx]);
  const labelBelow = (idx: number) => {
    const neighbour = geometry.coords[idx === 0 ? 1 : idx - 1];
    // A smaller y is higher on screen: the neighbour rising means the stroke
    // passes above this point.
    return !!neighbour && neighbour.y < geometry.coords[idx].y;
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <svg
        width="100%"
        height={height}
        role="img"
        aria-label="Evolução mensal do custo logístico"
        onMouseMove={handlePointer}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={isDarkMode ? 0.32 : 0.18} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Recessive grid + value axis */}
        {geometry.ticks.map((tick, idx) => {
          const ty = geometry.y(tick);
          return (
            <g key={idx}>
              <line x1={padding.left} y1={ty} x2={padding.left + plotWidth} y2={ty} stroke={gridColor} strokeWidth={1} />
              <text x={padding.left - 10} y={ty + 3.5} textAnchor="end" fontSize={10} fill={axisText} fontFamily="ui-monospace, monospace">
                {formatCompact(tick)}
              </text>
            </g>
          );
        })}

        <path d={geometry.area} fill={`url(#${gradientId})`} />
        <path d={geometry.line} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {hovered && (
          <line
            x1={hovered.x}
            y1={padding.top}
            x2={hovered.x}
            y2={padding.top + plotHeight}
            stroke={accent}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}

        {geometry.coords.map((coord, idx) => {
          const isHovered = hoverIndex === idx;
          return (
            <g key={coord.competencia}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={isHovered ? 6 : 4.5}
                fill={accent}
                stroke={isDarkMode ? '#151720' : '#ffffff'}
                strokeWidth={2}
              />
              {labelledIndexes.has(idx) && !isHovered && (
                <text
                  x={coord.x + (idx === 0 ? 8 : idx === geometry.coords.length - 1 ? -2 : 0)}
                  /* Flip the label below the point when the line climbs away from
                     it, so the number never sits on top of the stroke. */
                  y={coord.y + (labelBelow(idx) ? 20 : -13)}
                  textAnchor={idx === 0 ? 'start' : idx === geometry.coords.length - 1 ? 'end' : 'middle'}
                  fontSize={10}
                  fontWeight={700}
                  fill={isDarkMode ? '#cbd5e1' : '#3f4661'}
                  fontFamily="ui-monospace, monospace"
                >
                  {formatCompact(coord.value as number)}
                </text>
              )}
              <text
                x={coord.x}
                y={padding.top + plotHeight + 18}
                textAnchor="middle"
                fontSize={10}
                fontWeight={isHovered ? 700 : 500}
                fill={isHovered ? accent : axisText}
                fontFamily="ui-monospace, monospace"
              >
                {coord.label}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          className={`pointer-events-none absolute z-10 rounded-xl border px-3 py-2 shadow-lg ${
            isDarkMode ? 'bg-[#12131a] border-slate-800 shadow-black/60' : 'bg-white border-slate-200 shadow-slate-200/70'
          }`}
          style={{
            left: Math.min(Math.max(hovered.x - 60, 0), Math.max(width - 130, 0)),
            top: Math.max(hovered.y - 62, 0),
          }}
        >
          <div className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {hovered.label}
          </div>
          <div className={`text-[13px] font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatValue(hovered.value as number)}
          </div>
          {hovered.variation !== null && (
            <div className="mt-1">
              <VariationBadge value={hovered.variation} size="sm" isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
