import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Shield, CheckCircle2, TrendingUp, Sparkles, Building, ChevronRight } from 'lucide-react';
import { formatCurrency } from './MiniCharts';

interface RegionData {
  uf: string;
  project: string;
  cost: number;
  text: string;
}

interface SelfStorageMapProps {
  activeRegion: string | null;
  onHoverRegion: (uf: string | null) => void;
  regions: RegionData[];
}

export default function SelfStorageMap({ activeRegion, onHoverRegion, regions }: SelfStorageMapProps) {
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);

  // Stylized profile path representing the outline of Brazil (optimized for 380x380 viewport)
  const brazilOutlinePath = "M 55,175 C 50,150 90,80 155,48 C 185,35 220,40 240,55 C 270,55 300,70 330,90 C 355,105 385,120 380,140 C 375,160 315,220 305,260 C 295,300 245,370 235,375 C 225,370 215,315 200,300 C 185,285 150,270 140,250 C 130,230 100,215 55,175 Z";

  // Coordinates matching the stylized outline for the three hubs
  const hubs = [
    {
      uf: 'DF',
      name: 'Brasília (DF)',
      x: 235,
      y: 195,
      color: '#0054ec',
      bgClass: 'bg-[#0054ec]',
      gradient: 'from-[#0054ec] to-[#2226c0]',
      shadowColor: 'rgba(0, 84, 236, 0.4)',
    },
    {
      uf: 'PR',
      name: 'Curitiba (PR)',
      x: 220,
      y: 295,
      color: '#fd11a4',
      bgClass: 'bg-[#fd11a4]',
      gradient: 'from-[#fd11a4] to-[#960a9c]',
      shadowColor: 'rgba(253, 17, 164, 0.4)',
    },
    {
      uf: 'PE',
      name: 'Recife (PE)',
      x: 350,
      y: 135,
      color: '#fd5665',
      bgClass: 'bg-[#fd5665]',
      gradient: 'from-[#fd5665] to-[#fd11a4]',
      shadowColor: 'rgba(253, 86, 101, 0.4)',
    }
  ];

  const currentActive = hoveredHub || activeRegion;

  // Find info about current hovered/active hub
  const activeHubInfo = hubs.find(h => h.uf === currentActive);
  const activeRegionData = regions.find(r => r.uf === currentActive);

  // Curved connection vectors
  const connections = [
    {
      from: 'DF',
      to: 'PR',
      path: 'M 235 195 Q 210 245 220 295',
      hubColor: '#fd11a4',
      activeColor: 'rgba(253, 17, 164, 0.85)',
    },
    {
      from: 'DF',
      to: 'PE',
      path: 'M 235 195 Q 295 155 350 135',
      hubColor: '#fd5665',
      activeColor: 'rgba(253, 86, 101, 0.85)',
    }
  ];

  return (
    <div className="relative border border-slate-200 bg-white/95 backdrop-blur-subtle rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 flex flex-col gap-5 items-center justify-between min-h-[385px] w-full max-w-[420px] mx-auto overflow-hidden group/card">
      
      {/* Grid operational header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h5 className="font-sans font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0054ec] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0054ec]"></span>
            </span>
            Painel Nacional
          </h5>
          <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-tight">Ativos Securitários & logísticos (NTT)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/80 font-mono text-[9px] font-black text-[#0054ec] shadow-inner">
          <Building size={10} className="text-[#0054ec] animate-pulse" />
          3 HUBS OPERACIONAIS
        </div>
      </div>

      {/* Map visual and connection indicators */}
      <div className="relative w-full aspect-square max-w-[280px] max-h-[280px] select-none flex items-center justify-center">
        
        {/* Decorative ambient radial grid behind map */}
        <div className="absolute inset-0 bg-radial-gradient from-[#0054ec]/10 via-transparent to-transparent opacity-60 pointer-events-none" />

        <svg viewBox="0 0 400 400" className="w-[100%] h-[100%] overflow-visible">
          <defs>
            {/* Smooth outline clipping path for Brazil map */}
            <clipPath id="brazil-clip">
              <path d={brazilOutlinePath} />
            </clipPath>
            
            {/* Futuristic digital operational dot pattern */}
            <pattern id="grid-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" className="fill-slate-300/85" />
            </pattern>

            <pattern id="grid-dots-active" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" fill="#0054ec" fillOpacity="0.3" />
            </pattern>
          </defs>

          {/* Elegant ambient border grid references */}
          <g className="stroke-slate-100/70" strokeWidth="1" strokeDasharray="4 4">
            <line x1="50" y1="100" x2="350" y2="100" />
            <line x1="50" y1="200" x2="350" y2="200" />
            <line x1="50" y1="300" x2="350" y2="300" />
            <line x1="100" y1="50" x2="100" y2="350" />
            <line x1="200" y1="50" x2="200" y2="350" />
            <line x1="300" y1="50" x2="300" y2="350" />
          </g>

          {/* Deep blur map shadow below */}
          <path
            d={brazilOutlinePath}
            className="fill-slate-100 stroke-slate-200/50 transition-all duration-700 pointer-events-none"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'blur(8px)',
              opacity: 0.85
            }}
          />

          {/* Glow backdrop boundary on active hub */}
          <path
            d={brazilOutlinePath}
            className="transition-all duration-500 fill-none pointer-events-none"
            stroke={activeHubInfo ? activeHubInfo.color : 'rgba(226, 232, 240, 0.5)'}
            strokeWidth={activeHubInfo ? "8" : "3.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: activeHubInfo ? 0.45 : 0.15,
              filter: activeHubInfo ? `drop-shadow(0 0 6px ${activeHubInfo.color})` : 'none',
            }}
          />

          {/* Elegant outline base of Brazil map */}
          <path
            d={brazilOutlinePath}
            className={`transition-all duration-500 fill-slate-50/50 stroke-slate-250/90`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* High-tech clipped dot grid on top of landmass */}
          <rect
            x="0"
            y="0"
            width="400"
            height="400"
            fill={currentActive ? "url(#grid-dots-active)" : "url(#grid-dots)"}
            clipPath="url(#brazil-clip)"
            className="transition-all duration-500 pointer-events-none"
          />

          {/* Translucent colored highlight sweep inside clipped landmass on state selection */}
          <path
            d={brazilOutlinePath}
            fill={
              currentActive === 'DF'
                ? 'rgba(0, 84, 236, 0.07)'
                : currentActive === 'PR'
                  ? 'rgba(253, 17, 164, 0.07)'
                  : currentActive === 'PE'
                    ? 'rgba(253, 86, 101, 0.07)'
                    : 'transparent'
            }
            className="transition-all duration-500 pointer-events-none"
            clipPath="url(#brazil-clip)"
          />

          {/* Logistical connection lines branching out from Central hub (DF) with Bezier Curves */}
          <g>
            {connections.map((conn, i) => {
              const isRouteActive = currentActive === 'DF' || currentActive === conn.to;
              return (
                <g key={i}>
                  {/* Outer glow stroke of the curved wire */}
                  <path
                    d={conn.path}
                    fill="none"
                    stroke={isRouteActive ? conn.hubColor : '#cbd5e1'}
                    strokeWidth={isRouteActive ? "4" : "1.5"}
                    strokeLinecap="round"
                    className="transition-all duration-500 pointer-events-none"
                    style={{
                      opacity: isRouteActive ? 0.45 : 0.2,
                      filter: isRouteActive ? `drop-shadow(0 0 4px ${conn.hubColor})` : 'none'
                    }}
                  />
                  {/* High contrast sharp core outline */}
                  <path
                    d={conn.path}
                    fill="none"
                    stroke={isRouteActive ? conn.hubColor : '#cbd5e1'}
                    strokeWidth={isRouteActive ? "2" : "1"}
                    strokeDasharray={isRouteActive ? "none" : "5 5"}
                    strokeLinecap="round"
                    className="transition-all duration-500 pointer-events-none"
                    style={{
                      opacity: isRouteActive ? 1 : 0.5
                    }}
                  />
                  {/* Dynamic logistical packet running through the network stream */}
                  {isRouteActive && (
                    <circle r="4.5" fill={conn.hubColor} stroke="#ffffff" strokeWidth="1.5" className="shadow-sm">
                      <animateMotion 
                        path={conn.path} 
                        dur="1.8s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* Interactive hubs markers */}
          {hubs.map((hub) => {
            const isSelected = currentActive === hub.uf;
            return (
              <g
                key={hub.uf}
                className="cursor-pointer group/node"
                onMouseEnter={() => {
                  setHoveredHub(hub.uf);
                  onHoverRegion(hub.uf);
                }}
                onMouseLeave={() => {
                  setHoveredHub(null);
                  onHoverRegion(null);
                }}
              >
                {/* Triple radar sonar rings for premium pulsing effects */}
                <AnimatePresence>
                  {isSelected && (
                    <g className="pointer-events-none">
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r="28"
                        fill="none"
                        stroke={hub.color}
                        strokeWidth="1.5"
                        className="opacity-30"
                      >
                        <animate attributeName="r" values="8;28" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r="18"
                        fill="none"
                        stroke={hub.color}
                        strokeWidth="1.2"
                        className="opacity-50"
                      >
                        <animate attributeName="r" values="4;18" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  )}
                </AnimatePresence>

                {/* Sub-node hover handle background */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={isSelected ? 14 : 9}
                  fill={hub.color}
                  className="opacity-15 transition-all duration-300 pointer-events-none"
                />

                {/* Core White Border/Ring */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={isSelected ? 8.5 : 5.8}
                  fill="#ffffff"
                  stroke={hub.color}
                  strokeWidth={isSelected ? "4" : "2.8"}
                  className="transition-all duration-300 drop-shadow-md"
                />

                {/* Micro Neon Core Point */}
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r="2.5"
                  fill={hub.color}
                  className="transition-all duration-300 pointer-events-none"
                />

                {/* Styled Badge Stem Map flag for PE, PR and DF */}
                <text
                  x={hub.x + (hub.uf === 'PE' ? 14 : -14)}
                  y={hub.y + 4}
                  textAnchor={hub.uf === 'PE' ? 'start' : 'end'}
                  className={`font-sans select-none pointer-events-none transition-all duration-300 ${
                    isSelected 
                      ? 'fill-slate-900 font-black text-[13px] tracking-wide' 
                      : 'fill-slate-450 font-extrabold text-[11px] tracking-wider'
                  }`}
                >
                  {hub.uf}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Hover / Active floating metadata details card */}
        <AnimatePresence>
          {currentActive && activeHubInfo && activeRegionData && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-1.5 w-68 bg-slate-950/95 backdrop-blur-md rounded-2xl p-4 border border-slate-800 text-white shadow-2xl flex flex-col gap-3.5 z-20 pointer-events-none"
              style={{
                boxShadow: `0 10px 30px -10px ${activeHubInfo.shadowColor}`
              }}
            >
              {/* Colored status strip */}
              <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: activeHubInfo.color }} />

              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="font-extrabold text-[12px] text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: activeHubInfo.color }} />
                  {activeHubInfo.name}
                </span>
                <span className="font-mono text-[12px] font-black text-amber-400">
                  {formatCurrency(activeRegionData.cost)}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-bold italic">
                  "{activeRegionData.text}"
                </p>
                <div className="flex items-center justify-between text-[8px] font-black tracking-widest uppercase text-slate-450 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1 text-slate-300"><Shield size={10} className="text-[#0054ec]" /> Operação NTT</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    HOMOLOGADA
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Aesthetic operational status badge footnote */}
      <span className="text-[9px] font-extrabold text-slate-450 tracking-widest flex items-center gap-2 text-center bg-slate-50/80 hover:bg-slate-50 hover:text-[#151720] transition-all px-4 py-2.5 rounded-xl border border-slate-150 w-full justify-center shadow-xs uppercase font-mono cursor-default">
        <Sparkles size={11} className="text-[#0054ec] flex-shrink-0" />
        Sistemas Securitários & Portais Logísticos Integrados
      </span>
    </div>
  );
}
