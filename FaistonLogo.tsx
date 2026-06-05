import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Hook to track element dimensions for responsive SVG design
function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 400, height: 260 });

  useEffect(() => {
    if (!ref.current) return;
    const target = ref.current;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setSize({
        width: width || 400,
        height: height || 260,
      });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

// Format numbers nicely, like currency or compact units
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return 'R$ ' + (value / 1000000).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return 'R$ ' + (value / 1000).toFixed(0) + 'k';
  }
  return 'R$ ' + value.toFixed(0);
}

interface ChartItem {
  label: string;
  value: number;
  subValue?: number;
  color?: string;
  meta?: string;
}

interface BarChartProps {
  data: ChartItem[];
  colorTheme?: 'purple' | 'cyan' | 'pink' | 'indigo' | 'blue' | 'mixed';
  yAxisFormatter?: (val: number) => string;
  showGridLines?: boolean;
  chartType?: 'bar' | 'combined';
}

export function ResponsiveBarChart({ 
  data, 
  colorTheme = 'purple', 
  yAxisFormatter = formatCompact, 
  showGridLines = true,
  chartType = 'bar'
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const paddingLeft = 60;
  const paddingRight = chartType === 'combined' ? 50 : 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = Math.max(width - paddingLeft - paddingRight, 100);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 80);

  const maxVal = Math.max(...data.map(d => Math.abs(d.value) || 1), 1) * 1.1;
  const maxLineVal = Math.max(...data.map(d => d.subValue || 0), 1) * 1.15;

  const getGradientId = (index: number) => {
    if (colorTheme === 'mixed') {
      const themes = ['indigo-grad', 'purple-grad', 'pink-grad', 'cyan-grad', 'blue-grad'];
      return themes[index % themes.length];
    }
    return `${colorTheme}-grad`;
  };

  const getLineColors = () => {
    switch (colorTheme) {
      case 'purple':
        return { glow: '#fd5665', main: '#fd11a4', point: '#960a9c' };
      case 'cyan':
        return { glow: '#00fafb', main: '#0054ec', point: '#2226c0' };
      case 'pink':
        return { glow: '#fd5665', main: '#fd11a4', point: '#960a9c' };
      case 'indigo':
        return { glow: '#0054ec', main: '#2226c0', point: '#151720' };
      case 'blue':
        return { glow: '#00fafb', main: '#0054ec', point: '#2226c0' };
      case 'mixed':
      default:
        return { glow: '#fd5665', main: '#fd11a4', point: '#960a9c' };
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative" id="responsive-bar-chart-container">
      <svg width={width} height={height} className="overflow-visible select-none">
        <defs>
          <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fd5665" />
            <stop offset="100%" stopColor="#fd11a4" />
          </linearGradient>
          <linearGradient id="cyan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00fafb" />
            <stop offset="100%" stopColor="#0054ec" />
          </linearGradient>
          <linearGradient id="pink-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fd5665" />
            <stop offset="100%" stopColor="#fd11a4" />
          </linearGradient>
          <linearGradient id="indigo-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0054ec" />
            <stop offset="100%" stopColor="#2226c0" />
          </linearGradient>
          <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00fafb" />
            <stop offset="100%" stopColor="#0054ec" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Grid lines */}
        {showGridLines && [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const gridVal = maxVal * ratio;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + chartWidth}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="font-mono text-[10px] fill-slate-400 font-medium"
              >
                {yAxisFormatter(gridVal)}
              </text>
              {chartType === 'combined' && (
                <text
                  x={paddingLeft + chartWidth + 10}
                  y={y + 4}
                  textAnchor="start"
                  className="font-mono text-[10px] fill-[#fd11a4] font-semibold"
                >
                  {Math.round(maxLineVal * ratio)}
                </text>
              )}
            </g>
          );
        })}

        {/* Right side Axis line for combined charts */}
        {chartType === 'combined' && (
          <line
            x1={paddingLeft + chartWidth}
            y1={paddingTop}
            x2={paddingLeft + chartWidth}
            y2={paddingTop + chartHeight}
            stroke="#fd11a4"
            strokeWidth="1.5"
          />
        )}

        {/* Bars */}
        {data.map((item, index) => {
          const barWidth = Math.max((chartWidth / data.length) * 0.52, 10);
          const spacing = chartWidth / data.length;
          const x = paddingLeft + (index * spacing) + (spacing - barWidth) / 2;

          const ratio = item.value / maxVal;
          const barValHeight = chartHeight * ratio;
          const y = paddingTop + chartHeight - barValHeight;

          return (
            <g
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barValHeight, 2)}
                rx={Math.min(barWidth / 2, 6)}
                fill={`url(#${getGradientId(index)})`}
                className="transition-all duration-300"
                style={{
                  filter: hoveredIndex === index ? 'url(#shadow)' : 'none',
                  opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.35 : 1,
                }}
              />

              {/* Sub-value marker dot if NOT in combined mode (in combined mode we draw a real connecting line) */}
              {chartType !== 'combined' && item.subValue !== undefined && item.subValue > 0 && (
                <circle
                  cx={x + barWidth / 2}
                  cy={y + 12}
                  r={Math.min(barWidth / 3, 5)}
                  fill="#ffffff"
                  fillOpacity="0.85"
                />
              )}

              {/* X Axis Labels */}
              <text
                x={x + barWidth / 2}
                y={paddingTop + chartHeight + 18}
                textAnchor="middle"
                className={`font-sans font-medium text-[10px] leading-tight fill-slate-500 max-w-[50px] transition-colors duration-200 ${hoveredIndex === index ? 'fill-[#0054ec] font-semibold' : ''}`}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {item.label.length > 12 ? `${item.label.substring(0, 10)}...` : item.label}
              </text>
            </g>
          );
        })}

        {/* Dual-axis Line Chart overlay (Combined Chart Type) */}
        {chartType === 'combined' && (() => {
          const spacing = chartWidth / data.length;
          const points = data.map((item, idx) => {
            const x = paddingLeft + (idx * spacing) + spacing / 2;
            const y = paddingTop + chartHeight - ((item.subValue || 0) / maxLineVal) * chartHeight;
            return { x, y, value: item.subValue || 0 };
          });

          const pathStr = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

           return (
            <g>
              {/* Outer visual line glow */}
              <path
                d={pathStr}
                fill="none"
                stroke={getLineColors().glow}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.12"
              />
              {/* Main Neon Line */}
              <motion.path
                d={pathStr}
                fill="none"
                stroke={getLineColors().main}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {/* Interactive Point markers */}
              {points.map((p, idx) => (
                <g 
                  key={idx} 
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === idx ? 8 : 4.5}
                    fill={getLineColors().point}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === idx ? 4.5 : 2}
                    fill="#ffffff"
                    className="transition-all duration-200"
                  />
                </g>
              ))}
            </g>
          );
        })()}
      </svg>

      {/* Dynamic Floating Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-10 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-xl p-3 text-xs text-slate-800"
            style={{
              left: `${Math.min(Math.max((paddingLeft + (hoveredIndex * (chartWidth / data.length)) + (chartWidth / data.length / 2) - 80), 10), width - 170)}px`,
              top: `${Math.max(paddingTop - 15, 5)}px`,
            }}
          >
            <div className="font-semibold text-slate-950 pr-2 border-b border-slate-100 pb-1 mb-1 truncate max-w-[150px]">
              {data[hoveredIndex].label}
            </div>
            <div className="flex flex-col gap-0.5 font-mono">
              <span className="text-[#0054ec] font-bold flex justify-between gap-3">
                Custo: <span>{formatCurrency(data[hoveredIndex].value)}</span>
              </span>
              {data[hoveredIndex].subValue !== undefined && (
                <span className="text-pink-600 font-bold flex justify-between gap-3">
                  Qtd. Equipamentos: <span>{data[hoveredIndex].subValue}</span>
                </span>
              )}
              {data[hoveredIndex].meta && (
                <span className="text-slate-400 text-[10px] sm:text-xs mt-1 border-t border-slate-50 pt-0.5 flex justify-between">
                  <span>Embarques:</span> <span>{data[hoveredIndex].meta}</span>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HorizontalBarChart({ data, colorTheme = 'indigo' }: { data: ChartItem[], colorTheme?: string }) {
  const maxVal = Math.max(...data.map(d => Math.abs(d.value) || 1), 1);
  const colorMap: Record<string, string> = {
    indigo: "from-[#0054ec] to-[#2226c0]",
    purple: "from-[#fd5665] to-[#fd11a4]",
    pink: "from-[#fd5665] to-[#fd11a4]",
    cyan: "from-[#00fafb] to-[#0054ec]",
    blue: "from-[#0054ec] to-[#2226c0]",
  };
  const gradient = colorMap[colorTheme] || "from-[#0054ec] to-[#2226c0]";

  return (
    <div className="flex flex-col gap-3.5 w-full justify-center py-2" id="horizontal-bar-chart">
      {data.map((item, index) => {
        const ratio = Math.max(item.value / maxVal, 0.02);
        return (
          <div key={index} className="flex flex-col gap-1 w-full text-slate-800">
            <div className="flex justify-between items-center text-xs px-1">
              <span className="font-semibold text-slate-900 truncate max-w-[70%]">{item.label}</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-950">{formatCurrency(item.value)}</span>
                {item.subValue !== undefined && (
                  <span className="text-slate-400 text-[10px] bg-slate-100 rounded px-1">{item.subValue} Itens</span>
                )}
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 1, delay: index * 0.05, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${item.color ? item.color : gradient}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({ 
  data, 
  layout = 'auto', 
  size = 'md', 
  showExactTotal = false,
  showExactLegendValues = false
}: { 
  data: { label: string, value: number, percentage: number, colorClass?: string }[],
  layout?: 'row' | 'col' | 'auto',
  size?: 'sm' | 'md' | 'lg',
  showExactTotal?: boolean,
  showExactLegendValues?: boolean
}) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  // Custom colors for slices
  const indexColors = [
    'stroke-[#0054ec]',
    'stroke-[#fd11a4]',
    'stroke-[#fd5665]',
    'stroke-[#2226c0]',
    'stroke-[#00fafb]',
    'stroke-emerald-400'
  ];

  let cumulativePercent = 0;

  // Layout classes
  const containerClass = layout === 'col' 
    ? "flex flex-col items-center justify-center gap-4 p-2 w-full"
    : layout === 'row'
      ? "flex flex-row items-center justify-center gap-6 p-2 w-full"
      : "flex flex-col sm:flex-row items-center justify-center gap-6 p-2 w-full"; // auto

  // Size classes
  const circleSizeClass = size === 'sm' ? 'w-28 h-28' : size === 'lg' ? 'w-48 h-48' : 'w-40 h-40';
  const totalTextClass = size === 'sm' ? 'text-[9.5px] font-black leading-none' : 'text-sm font-bold';
  const totalLabelClass = size === 'sm' ? 'text-[8px]' : 'text-[10px]';

  return (
    <div className={containerClass} id="donut-chart-container">
      {/* Circle rendering */}
      <div className={`relative ${circleSizeClass} flex-shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3.5" />
          
          {data.map((item, idx) => {
            const percent = item.percentage || (item.value / total) * 100;
            const strokeDashValues = `${percent} ${100 - percent}`;
            const strokeOffset = 100 - cumulativePercent;
            cumulativePercent += percent;

            return (
              <circle
                key={idx}
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                className={`${item.colorClass || indexColors[idx % indexColors.length]} stroke-rounded transition-all duration-500`}
                strokeWidth="4"
                strokeDasharray={strokeDashValues}
                strokeDashoffset={strokeOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white rounded-full m-3.5 border border-slate-50 shadow-inner">
          <span className={`${totalLabelClass} font-semibold text-slate-400 tracking-wider uppercase`}>Total</span>
          <span className={`${totalTextClass} text-slate-850 font-sans tracking-tight text-center px-1`}>
            {showExactTotal ? formatCurrency(total) : formatCompact(total)}
          </span>
        </div>
      </div>

      {/* Labels / Legends */}
      <div className={`flex flex-col gap-1.5 relative flex-1 ${layout === 'col' ? 'w-full px-2' : 'min-w-[120px]'}`}>
        {data.map((item, idx) => {
          const bgColors = [
            'bg-[#0054ec]',
            'bg-[#fd11a4]',
            'bg-[#fd5665]',
            'bg-[#2226c0]',
            'bg-[#00fafb]',
            'bg-emerald-400'
          ];
          const colorBg = item.colorClass ? item.colorClass.replace('stroke-', 'bg-') : bgColors[idx % bgColors.length];
          return (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs font-sans">
              <div className="flex items-center gap-2 truncate">
                <div className={`w-2 h-2 rounded-full ${colorBg} flex-shrink-0`} />
                <span className="font-semibold text-slate-700 truncate max-w-[80px] sm:max-w-none">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-900 font-bold">{(item.percentage || 0).toFixed(0)}%</span>
                <span className="text-slate-400 text-[10px]">
                  ({showExactLegendValues ? formatCurrency(item.value) : formatCompact(item.value)})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Interactive Area Chart for invoice items
export function ResponsiveAreaChart({ data }: { data: { label?: string, name?: string, value: number, isCredit?: boolean }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = Math.max(width - paddingLeft - paddingRight, 100);
  const chartHeight = Math.max(height - paddingTop - paddingBottom, 80);

  // Separate absolute values for path drawing logic, then original values for visuals
  const values = data.map(d => d.value);
  const minVal = Math.min(...values, 0) * 1.1;
  const maxVal = Math.max(...values, 1) * 1.15;
  const range = maxVal - minVal;

  const getX = (index: number) => paddingLeft + (chartWidth / (data.length - 1 || 1)) * index;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / (range || 1)) * chartHeight;

  // Build SVG Path string
  let linePath = "";
  let areaPath = "";

  if (data.length > 0) {
    linePath = data.map((item, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(item.value)}`).join(' ');
    // Closes area down to the zero baseline
    const zeroY = getY(0);
    areaPath = `${linePath} L ${getX(data.length - 1)} ${zeroY} L ${getX(0)} ${zeroY} Z`;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative" id="responsive-area-chart-container">
      <svg width={width} height={height} className="overflow-visible select-none">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fd11a4" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#2226c0" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#2226c0" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fd11a4" />
            <stop offset="50%" stopColor="#0054ec" />
            <stop offset="100%" stopColor="#2226c0" />
          </linearGradient>
        </defs>

        {/* Zero baseline */}
        <line
          x1={paddingLeft}
          y1={getY(0)}
          x2={paddingLeft + chartWidth}
          y2={getY(0)}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Vertical divisions */}
        {data.map((item, idx) => {
          const x = getX(idx);
          const nameText = item.label || item.name || "";
          return (
            <g key={idx}>
              <line
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + chartHeight}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={x}
                y={paddingTop + chartHeight + 16}
                textAnchor="middle"
                className="font-sans font-extrabold text-[8.5px] fill-slate-500"
              >
                {nameText}
              </text>
            </g>
          );
        })}

        {/* Fill Area */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#area-grad)"
            className="transition-all duration-300"
          />
        )}

        {/* Draw Line */}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#line-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
            animate={{ strokeDashoffset: "0" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* Scatter Points / Markers with Data Labels */}
        {data.map((item, idx) => {
          const cx = getX(idx);
          const cy = getY(item.value);
          const isNeutral = item.isCredit;
          const labelYOffset = item.value >= 0 ? -11 : 16;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle
                cx={cx}
                cy={cy}
                r={hoveredIndex === idx ? 7 : 4}
                className={`transition-all duration-200 ${isNeutral ? 'fill-emerald-500' : 'fill-[#0054ec]'} stroke-white stroke-2`}
              />
              {/* White contrast halo background for maximum legibility over colored vectors */}
              <text
                x={cx}
                y={cy + labelYOffset}
                textAnchor="middle"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
                className="font-sans font-black text-[9.5px] pointer-events-none opacity-90 select-none"
              >
                {formatCurrency(item.value)}
              </text>
              <text
                x={cx}
                y={cy + labelYOffset}
                textAnchor="middle"
                className={`font-sans font-black text-[9.5px] pointer-events-none ${
                  isNeutral ? 'fill-emerald-600' : 'fill-[#0054ec]'
                }`}
              >
                {formatCurrency(item.value)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Precise Tooltip overlay */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10 bg-white border border-slate-100 shadow-lg rounded-lg p-2.5 text-xs font-sans text-slate-800"
            style={{
              left: `${Math.min(Math.max((getX(hoveredIndex) - 75), 10), width - 160)}px`,
              top: `${Math.max(getY(data[hoveredIndex].value) - 60, 5)}px`,
            }}
          >
            <div className="font-semibold text-slate-900 truncate max-w-[130px]">{data[hoveredIndex].label || data[hoveredIndex].name || ""}</div>
            <div className={`font-mono font-bold mt-1 ${data[hoveredIndex].value < 0 ? 'text-emerald-600' : 'text-[#0054ec]'}`}>
              {formatCurrency(data[hoveredIndex].value)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
