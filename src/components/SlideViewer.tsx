import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, Package, Truck, Shield, ShieldCheck, Info, CheckCircle2,
  ExternalLink, Search, BarChart3, List, Layers, HelpCircle,
  Database, RefreshCw, Smartphone, Mail, Globe, Sparkles, TrendingUp,
  Network, Cable, Server, BatteryCharging, Cpu, Wifi,
  ChevronDown, ChevronUp
} from 'lucide-react';
import KPICard from './KPICard';
import FaistonLogo from './FaistonLogo';
import EntradaSaidaChart from './EntradaSaidaChart';
import { 
  ResponsiveBarChart, 
  HorizontalBarChart, 
  DonutChart, 
  ResponsiveAreaChart,
  formatCurrency, 
  formatCompact 
} from './MiniCharts';

interface SlideViewerProps {
  slide: any;
  isFullscreen?: boolean;
  isDarkMode?: boolean;
}

export default function SlideViewer({ slide, isFullscreen = false, isDarkMode = false }: SlideViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [activeStockTab, setActiveStockTab] = useState('topNf');
  const [expandedStockGroups, setExpandedStockGroups] = useState<string[]>(['NTT']);
  const [chartDisplayType, setChartDisplayType] = useState<'bar' | 'combined'>('combined');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [consolidatedTab, setConsolidatedTab] = useState<'chart' | 'bars'>('chart');

  useEffect(() => {
    setChartDisplayType('combined');
    setActiveRegion(null);
    setConsolidatedTab('chart');
  }, [slide]);

  const dk = isDarkMode;
  const cardCls = `border rounded-3xl p-6 shadow-sm flex flex-col ${dk ? 'bg-[#12131a] border-[#1c1f2e] shadow-black/20' : 'bg-white border-slate-200/90'}`;
  const innerCls = `rounded-xl border ${dk ? 'bg-[#0d0f17] border-slate-800/50' : 'bg-slate-50/70 border-slate-100'}`;
  const divCls = dk ? 'border-slate-800' : 'border-slate-150';
  const txtPri = dk ? 'text-white' : 'text-slate-900';
  const txtMuted = dk ? 'text-slate-400' : 'text-slate-500';
  const tabBg = dk ? 'bg-[#0d0f17] border border-slate-800' : 'bg-slate-50';
  const tabActiveCls = (active: boolean) => active
    ? (dk ? 'bg-[#1a1c27] text-[#00fafb] shadow-sm' : 'bg-white text-[#0054ec] shadow-sm')
    : (dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600');
  const commentWrapCls = `border p-5 rounded-2xl flex flex-col gap-3 ${dk ? 'bg-[#0d0f17]/70 border-slate-800/60' : 'bg-slate-50/50 border-slate-150'}`;
  const commentItemCls = `flex items-start gap-3.5 p-4 rounded-xl border border-l-4 shadow-sm hover:shadow-md hover:translate-x-0.5 transition-all duration-200 ${dk ? 'bg-[#151720] border-[#1e2230] text-slate-300' : 'bg-white border-slate-200/70 text-slate-700'}`;
  const subItemCls = `flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl border shadow-xs ${dk ? 'bg-[#0d0f17]/50 border-slate-800/40 hover:bg-[#0d0f17]/80' : 'bg-slate-50/50 border-slate-100/50 hover:bg-slate-50'}`;

  const { category, title, subtitle, content } = slide;

  // Render a lovely geometric Faiston logo icon using styling
  const renderFaistonLogoIcon = (sizeClass = "w-12 h-12") => {
    return (
      <div className={`${sizeClass} relative flex-shrink-0 animate-pulse`}>
        {/* Layered triangle path resembling 'F' and play icon of Faiston */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00fafb] via-[#0054ec] to-[#fd11a4] rounded-xl rotate-12 opacity-80" />
        <div className="absolute inset-1.5 bg-white rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current text-[#0054ec]" strokeWidth="2.5">
            <path d="M5 3h14c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2Z" />
            <path d="M3 14h12c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2v-3c0-1.1.9-2 2-2Z" />
            <path d="M12 9v5h3" />
          </svg>
        </div>
      </div>
    );
  };

  // Safe search utility for tables
  const filterList = (list: any[], key: string) => {
    if (!searchTerm) return list;
    return list.filter(item => 
      String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Helper to choose color themes based on section category
  const getThemeColor = () => {
    switch (category) {
      case 'insurance': return '#0054ec'; // Blue
      case 'operations': return '#fd11a4'; // Pink
      case 'financials': return '#2226c0'; // Purple
      default: return '#0054ec'; // Indigo
    }
  };

  const getBarChartTheme = (): 'indigo' | 'purple' | 'pink' | 'cyan' | 'blue' => {
    switch (slide?.id) {
      case 'correios': return 'indigo';
      case 'cia-aerea': return 'cyan';
      case 'dedicados': return 'purple';
      case 'self-storage': return 'pink';
      case 'custo-fatura': return 'blue';
      case 'seguros-sinistros': return 'purple';
      default: {
        const themes: ('indigo' | 'purple' | 'pink' | 'cyan' | 'blue')[] = ['indigo', 'purple', 'pink', 'cyan', 'blue'];
        const index = slide?.number ? slide.number : 0;
        return themes[index % themes.length];
      }
    }
  };

  // 1. CAPA / COVER
  if (category === 'cover') {
    return (
      <div className={`flex flex-col justify-between items-center h-full min-h-[520px] text-center px-6 py-12 relative overflow-hidden rounded-2xl border transition-colors duration-300 ${
        isDarkMode ? "bg-[#151720] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-850"
      }`} id="slide-cover">
        {/* Soft elegant backdrop glow points */}
        <div className={`absolute top-10 left-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-[#0054ec]/10' : 'bg-[#0054ec]/5'}`} />
        <div className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`} />
        <div className={`absolute inset-0 bg-[radial-gradient(${isDarkMode ? '#1e293b' : '#e2e8f0'}_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40`} />

        {/* Centered Main Brand Content */}
        <div className="my-auto flex flex-col items-center gap-6 z-10 w-full max-w-lg">
          <div className="relative flex items-center justify-center p-2">
            <FaistonLogo 
              className={`w-full max-w-[320px] md:max-w-[400px] h-auto transition-all ${
                isDarkMode 
                  ? "text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
                  : "text-slate-800"
              }`}
            />
          </div>
          
          {/* Subtle colored key line accent */}
          <div className="w-24 h-0.5 bg-gradient-to-r from-[#00fafb] via-[#0054ec] to-[#fd11a4] rounded-full opacity-70" />
          
          <h2 className={`text-xs font-black tracking-[0.2em] font-serif uppercase ${isDarkMode ? "text-[#0054ec]" : "text-[#0054ec]"}`}>
            {subtitle}
          </h2>
          
          <p className={`text-xs font-bold leading-relaxed max-w-sm font-sans italic ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            "{content.slogan}"
          </p>
        </div>

        {/* Centralized Higher-Contrast Department & Month Indicator Footer */}
        <div className={`w-full max-w-lg border-t pt-6 mt-4 z-10 flex flex-col items-center gap-2 font-sans select-none ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div className="text-center">
            <span className={`text-[8px] font-extrabold tracking-widest uppercase font-mono block mb-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>DEPARTAMENTO</span>
            <span className={`text-lg md:text-2xl font-serif font-black tracking-tight leading-tight block ${isDarkMode ? "text-white" : "text-slate-800"}`}>
              {content.department}
            </span>
          </div>
          <div className={`mt-2 px-3.5 py-1.5 font-mono text-[9px] font-black tracking-widest rounded-full shadow-inner uppercase border ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-cyan-400" : "bg-slate-50 border-slate-200 text-[#0054ec]"
          }`}>
            MAIO
          </div>
        </div>
      </div>
    );
  }

  // 2. SEPARATOR / SECTION DIVIDER
  if (category === 'divider') {
    return (
      <div className={`flex flex-col justify-between items-center h-full min-h-[500px] text-center px-12 py-16 relative overflow-hidden rounded-2xl border transition-colors duration-300 ${
        isDarkMode ? "bg-[#151720] border-slate-800 text-white" : "bg-gradient-to-r from-[#0054ec]/5 via-slate-50 to-[#fd11a4]/5 border-slate-200"
      }`} id="slide-divider">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-[#0054ec]/10' : 'bg-[#0054ec]/15'}`} />
        
        <div className="my-auto flex flex-col items-center gap-6 z-10 w-full max-w-lg">
          <div className={`p-4.5 rounded-2xl shadow-md border ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-cyan-400" : "bg-white border-slate-100 text-[#0054ec]"
          }`}>
            <Shield size={40} />
          </div>
          <h1 className={`text-4xl font-extrabold tracking-tight font-serif mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-[#0054ec] to-[#fd11a4] rounded-full" />
          <p className={`font-medium text-md max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        </div>

        <div className={`grid grid-cols-3 gap-4 w-full max-w-xl border p-5 rounded-2xl shadow-sm z-10 transition-colors ${
          isDarkMode ? "bg-[#12131a] border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"
        }`}>
          <div className="flex flex-col text-center">
            <span className={`text-[10px] font-bold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>Valores Cobertos</span>
            <span className={`text-md font-bold mt-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{formatCompact(content.totalProtected)}</span>
          </div>
          <div className={`flex flex-col text-center border-x ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
            <span className={`text-[10px] font-bold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>Custos de Fatura</span>
            <span className={`text-md font-bold mt-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{formatCurrency(content.monthlyBillingCost)}</span>
          </div>
          <div className="flex flex-col text-center">
            <span className={`text-[10px] font-bold uppercase ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>Apólices Clientes</span>
            <span className={`text-md font-bold mt-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>{content.activePolicies} Ativas</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. CONTACT / AGRADECIMENTO
  if (category === 'contact') {
    return (
      <div className={`flex flex-col justify-between items-center h-full min-h-[500px] px-8 py-12 relative overflow-hidden rounded-2xl border transition-colors duration-300 ${
        isDarkMode ? "bg-[#151720] border-slate-800 text-white" : "bg-gradient-to-b from-white to-slate-50 border-slate-200"
      }`} id="slide-contact">
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-[#0054ec]/10' : 'bg-[#0054ec]/10'}`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${isDarkMode ? 'bg-[#fd11a4]/10' : 'bg-[#fd11a4]/10'}`} />

        <div className="my-auto text-center flex flex-col items-center gap-6 z-10 w-full max-w-lg">
          <div className={`p-4.5 rounded-full mb-2 border ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-cyan-400" : "bg-[#0054ec]/8 text-[#0054ec] border-[#0054ec]/30"
          }`}>
            <Sparkles size={32} />
          </div>
          <h1 className={`text-4xl md:text-5xl font-black font-serif tracking-tight leading-none uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h1>
          <p className={`text-md font-medium max-w-sm mt-1 mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
          <div className="w-16 h-1.5 bg-[#0054ec] rounded-full" />
        </div>

        {/* Contact details Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`border p-8 rounded-3xl max-w-md w-full flex flex-col items-center text-center z-10 transition-colors ${
            isDarkMode ? "bg-[#12131a] border-slate-800 shadow-xl shadow-black/60" : "bg-white border-slate-100 shadow-lg shadow-slate-100/60"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0054ec] to-[#2226c0] text-white flex items-center justify-center font-bold text-xl mb-4 font-sans border-2 border-white shadow-md">
            BH
          </div>
          <h2 className={`text-xl font-extrabold font-serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{content.presenter}</h2>
          <p className={`text-xs font-semibold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{content.role}</p>

          <div className={`w-full h-px my-6 ${isDarkMode ? 'bg-slate-850' : 'bg-slate-50'}`} />

          {/* Sorteable detailed contact fields */}
          <div className={`flex flex-col gap-4.5 w-full font-medium text-xs text-left px-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-705'}`}>
            <a href={`tel:${content.contact.phone}`} className={`flex items-center gap-3.5 transition-colors py-group group ${
              isDarkMode ? 'hover:text-cyan-400' : 'hover:text-[#0054ec]'
            }`}>
              <span className={`p-2 rounded-xl transition-all border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/40 group-hover:border-cyan-800' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-[#0054ec] group-hover:bg-[#0054ec]/8'
              }`}>
                <Smartphone size={16} />
              </span>
              <span>{content.contact.phone}</span>
            </a>
            <a href={`mailto:${content.contact.email}`} className={`flex items-center gap-3.5 transition-colors py-group group ${
              isDarkMode ? 'hover:text-cyan-400' : 'hover:text-[#0054ec]'
            }`}>
              <span className={`p-2 rounded-xl transition-all border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/40 group-hover:border-cyan-800' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-[#0054ec] group-hover:bg-[#0054ec]/8'
              }`}>
                <Mail size={16} />
              </span>
              <span className="truncate">{content.contact.email}</span>
            </a>
            <a href={`https://${content.contact.web}`} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className={`flex items-center gap-3.5 transition-colors py-group group ${
              isDarkMode ? 'hover:text-cyan-400' : 'hover:text-[#0054ec]'
            }`}>
              <span className={`p-2 rounded-xl transition-all border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-950/40 group-hover:border-cyan-800' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:text-[#0054ec] group-hover:bg-[#0054ec]/8'
              }`}>
                <Globe size={16} />
              </span>
              <span>{content.contact.web}</span>
            </a>
          </div>
        </motion.div>

        {/* Bottom credits */}
        <div className="text-[10px] font-mono font-bold text-slate-400 z-10 tracking-wider uppercase mt-8 flex items-center gap-2">
          <span>Faiston S.A.</span>
          <span className="text-slate-200">•</span>
          <span>Evoluindo junto com nossos clientes</span>
        </div>
      </div>
    );
  }

  // 4. MAIN DEFAULT SLIDE LAYOUT
  return (
    <div className="flex flex-col h-full bg-transparent select-text" id="slide-viewer-content">
      {/* Slide Title with visual category indicators */}
      <div className={`border-b pb-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-3.5">
          <div>
            <h2 className={`text-2xl font-black tracking-tight font-serif ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-none mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getThemeColor() }} />
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Slide Components */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* --- EXPEDIDORES (Correios, Transportadoras, Cia Aérea, Courier, Dedicados, Self-Storage) --- */}
        {category === 'expeditions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left columnar metrics */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                 {content.kpis.map((kpi: any, idx: number) => (
                  <KPICard 
                    key={idx} 
                    label={kpi.label} 
                    value={kpi.value} 
                    type={kpi.type} 
                    isHighlight={kpi.isHighlight}
                    borderAccent={getThemeColor()}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>

              {/* Comentários/Observações section */}
              {content.commentary && (
                <div className={commentWrapCls}>
                  <div className="flex flex-col gap-3.5">
                    {content.commentary.map((comm: any, idx: number) => {
                      const isSuccess = comm.type === 'success';
                      const isStats = comm.type === 'stats' || comm.type === 'link';
                      const accentColor = isSuccess ? '#10b981' : isStats ? '#2226c0' : '#0054ec';
                      return (
                        <div
                          key={idx}
                          className={commentItemCls}
                          style={{ borderLeftColor: accentColor }}
                        >
                          <span
                            className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center border transition-colors ${dk ? 'bg-[#0d0f17] border-slate-800' : 'bg-slate-50 border-slate-150'}`}
                            style={{ color: accentColor }}
                          >
                            {isSuccess ? <CheckCircle2 size={13} strokeWidth={2.5} /> :
                             isStats ? <TrendingUp size={13} strokeWidth={2.5} /> :
                             <Info size={13} strokeWidth={2.5} />}
                          </span>
                          <p className={`font-bold text-[12px] leading-relaxed mt-0.5 ${dk ? 'text-slate-300' : 'text-slate-700'}`}>{comm.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right columnar detailed tables/charts */}
            <div className={`lg:col-span-8 ${cardCls}`}>
              <div className={`flex items-center justify-between border-b pb-3 mb-4 ${divCls}`}>
                {/* Control tabs */}
                <div className={`flex p-1 rounded-xl gap-1 ${tabBg}`}>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tabActiveCls(activeTab === 'summary')}`}
                  >
                    <BarChart3 size={12} />
                    Gráfico Comparativo
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tabActiveCls(activeTab === 'table')}`}
                  >
                    <List size={12} />
                    Tabela de Dados
                  </button>
                </div>

                {/* Direct carrier distribution for Transportadora slide */}
                {slide.id === 'transportadoras' && activeTab === 'summary' && (
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase">
                    {content.distribution.map((dist: any, dIdx: number) => (
                      <span key={dIdx} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr" style={{ backgroundColor: dIdx === 0 ? '#0054ec' : dIdx === 1 ? '#2226c0' : '#06b6d4' }} />
                        {dist.name}: {dist.percentage}%
                      </span>
                    ))}
                  </div>
                )}

                {/* Combined vs pure bar selector */}
                {activeTab === 'summary' && !['transportadoras', 'dedicados', 'self-storage'].includes(slide.id) && content.projects && (
                  <div className="flex bg-slate-100 p-0.5 rounded-xl gap-1 border border-slate-200/50">
                    <button 
                      onClick={() => setChartDisplayType('bar')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${chartDisplayType === 'bar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Apenas Barras
                    </button>
                    <button 
                      onClick={() => setChartDisplayType('combined')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${chartDisplayType === 'combined' ? 'bg-[#fd11a4] text-white shadow-sm font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Misto (Barras + Linha)
                    </button>
                  </div>
                )}
              </div>

              {/* TAB CONTENT 1: Summary Chart */}
              {activeTab === 'summary' && (
                <div className="flex-1 flex flex-col justify-center min-h-[280px]">
                  {/* Handle customized transportadoras slide showing distribution donut + top records */}
                  {slide.id === 'transportadoras' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">Divisão por Transportadora</h4>
                        <DonutChart 
                          data={content.distribution.map((d: any) => ({
                            label: d.name,
                            value: d.value,
                            percentage: d.percentage
                          }))} 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Ranking Custo por Projeto</h4>
                        <HorizontalBarChart data={content.projects.slice(0, 4).map((p: any) => ({ label: p.project, value: p.cost, subValue: p.equipments }))} />
                      </div>
                    </div>
                  ) : slide.id === 'dedicados' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Principais Rotas Registradas</h4>
                        <div className="flex flex-col gap-3">
                          {content.rotas.map((r: any, rIdx: number) => (
                            <div key={rIdx} className="bg-slate-50 border border-slate-100/50 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                              <div className="flex flex-col gap-1.5">
                                <span className="font-extrabold text-slate-900 tracking-tight">{r.transportadora}</span>
                                <div className="flex flex-wrap gap-1">
                                  {r.breakdown.map((b: any, bIdx: number) => (
                                    <span key={bIdx} className="text-[9px] bg-[#0054ec]/8 text-[#0054ec] px-1.5 py-0.5 rounded font-semibold">{b.project}</span>
                                  ))}
                                </div>
                              </div>
                              <span className="font-mono font-bold text-slate-950 text-right">{formatCurrency(r.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ranking Volume de Custos</h4>
                        <HorizontalBarChart data={content.projects.map((p: any) => ({ label: p.project, value: p.cost, subValue: p.equipments }))} />
                      </div>
                    </div>
                  ) : slide.id === 'self-storage' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
                      <div className="lg:col-span-7 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribuição por Região</h4>
                        <div className="flex flex-col gap-3">
                          {content.regions.map((region: any, regIdx: number) => {
                            const isSelected = activeRegion === region.uf;
                            const borderHighlight = isSelected
                              ? region.uf === 'DF'
                                ? 'border-[#0054ec]/80 bg-[#0054ec]/5 ring-2 ring-[#0054ec]/20 shadow-sm'
                                : region.uf === 'PR'
                                  ? 'border-[#fd11a4]/80 bg-pink-50/10 ring-2 ring-[#fd11a4]/20 shadow-sm'
                                  : 'border-cyan-400/80 bg-cyan-50/10 ring-2 ring-cyan-100 shadow-sm'
                              : (dk ? 'border-slate-800/60 hover:border-slate-700 hover:bg-[#12131a]' : 'border-slate-100/75 hover:border-slate-200 hover:bg-slate-50/65 hover:shadow-xs');

                            const avatarGrad = region.uf === 'DF'
                              ? 'from-[#0054ec] to-[#2226c0] shadow-[#0054ec]/20'
                              : region.uf === 'PR'
                                ? 'from-[#fd11a4] to-[#960a9c] shadow-pink-100/60'
                                : 'from-[#00fafb] to-[#0054ec] shadow-cyan-100/60';

                            return (
                              <div
                                key={regIdx}
                                className={`border p-4.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 ${borderHighlight}`}
                                onMouseEnter={() => setActiveRegion(region.uf)}
                                onMouseLeave={() => setActiveRegion(null)}
                              >
                                <div className="flex items-center gap-3.5">
                                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatarGrad} text-white flex items-center justify-center font-black text-sm select-none shadow-md`}>
                                    {region.uf}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`font-extrabold text-xs ${dk ? 'text-white' : 'text-slate-800'}`}>Self Storage {region.uf}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{region.text}</span>
                                  </div>
                                </div>
                                <span className={`font-mono font-black text-xs transition-colors duration-300 ${
                                  isSelected
                                    ? region.uf === 'DF'
                                      ? 'text-[#0054ec]'
                                      : region.uf === 'PR'
                                        ? 'text-[#fd11a4]'
                                        : 'text-cyan-500'
                                    : (dk ? 'text-white' : 'text-slate-950')
                                }`}>
                                  {formatCurrency(region.cost)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="lg:col-span-5 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left">Participação por Região</h4>
                        <div className="flex-1 flex items-center justify-center min-h-[190px] w-full">
                          <DonutChart
                            data={content.regions.map((r: any) => ({ label: `Self Storage ${r.uf}`, value: r.cost, percentage: (r.cost / 1116.9) * 100 }))}
                            layout="col"
                            size="md"
                            showExactTotal={true}
                            showExactLegendValues={true}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 flex-1">
                      <div className={isFullscreen ? "h-96 lg:h-[45vh]" : "h-64"}>
                        <ResponsiveBarChart 
                          data={content.projects.slice(0, 8).map((p: any) => ({
                            label: p.project,
                            value: p.cost,
                            subValue: p.equipments,
                            meta: p.shipments !== undefined ? `${p.shipments} Embarques` : undefined
                          }))}
                          colorTheme={getBarChartTheme()}
                          chartType={chartDisplayType}
                        />
                      </div>
                      <span className="text-center text-[10px] text-slate-400 font-bold block uppercase tracking-wider mt-3">Visualizando os 8 principais projetos por ordem de relevância</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 2: Detailed Table */}
              {activeTab === 'table' && (
                <div className="flex-1 flex flex-col">
                  {/* Table search filter */}
                  <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 text-xs mb-3 max-w-sm ${dk ? 'bg-[#0d0f17] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Search size={14} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar projeto..."
                      className={`bg-transparent border-none outline-none w-full font-medium ${dk ? 'text-slate-300 placeholder:text-slate-600' : 'text-slate-700'}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className={`overflow-x-auto border rounded-2xl flex-1 overflow-y-auto ${isFullscreen ? "max-h-[50vh]" : "max-h-[290px]"} ${dk ? 'border-slate-800' : 'border-slate-50'}`}>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`uppercase font-bold text-[10px] border-b ${dk ? 'bg-[#0d0f17] text-slate-500 border-slate-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          <th className="py-2.5 px-4 font-black">Projeto</th>
                          <th className="py-2.5 px-4 text-right font-black">Custo Total</th>
                          {content.projects[0]?.shipments !== undefined && <th className="py-2.5 px-4 text-right font-black">Embarques</th>}
                          {content.projects[0]?.equipments !== undefined && <th className="py-2.5 px-4 text-right font-black">Equipamentos</th>}
                          {content.projects[0]?.averageCost !== undefined && <th className="py-2.5 px-4 text-right font-black">Custo Médio</th>}
                        </tr>
                      </thead>
                      <tbody className={`divide-y font-semibold ${dk ? 'divide-slate-800 text-slate-300' : 'divide-slate-50 text-slate-700'}`}>
                        {filterList(content.projects, 'project').map((p: any, idx: number) => (
                          <tr key={idx} className={`transition-colors ${dk ? 'hover:bg-[#0054ec]/10' : 'hover:bg-slate-50'}`}>
                            <td className={`py-2.5 px-4 font-bold ${dk ? 'text-slate-200' : 'text-slate-900'}`}>{p.project}</td>
                            <td className={`py-2.5 px-4 font-mono font-black text-right ${dk ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(p.cost)}</td>
                            {p.shipments !== undefined && <td className="py-2.5 px-4 font-mono text-right">{p.shipments}</td>}
                            {p.equipments !== undefined && <td className="py-2.5 px-4 font-mono text-right">{p.equipments}</td>}
                            {p.averageCost !== undefined && <td className={`py-2.5 px-4 font-mono text-right ${dk ? 'text-slate-400' : 'text-slate-500'}`}>{formatCurrency(p.averageCost)}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- CUSTO CONSOLIDADO (Slide 8) --- */}
        {slide.id === 'custo-consolidado' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left columnar breakdown bar list */}
            <div className={`lg:col-span-5 flex flex-col justify-between ${cardCls}`}>
              <div className={`flex flex-col gap-4 ${dk ? 'text-slate-200' : 'text-slate-850'}`}>
                <div className={`flex justify-between items-center border-b pb-2 mb-1 ${divCls}`}>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0054ec]/80 animate-ping" />
                    Divisão por Modalidade Geral
                  </h3>
                  
                  {/* Selector tabs buttons */}
                  <div className={`flex items-center gap-1 p-0.5 rounded-xl border ${dk ? 'bg-[#0d0f17] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <button
                      onClick={() => setConsolidatedTab('chart')}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${consolidatedTab === 'chart' ? 'bg-[#0054ec] text-white shadow-xs' : (dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-450 hover:text-slate-600')}`}
                    >
                      Gráfico
                    </button>
                    <button
                      onClick={() => setConsolidatedTab('bars')}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer ${consolidatedTab === 'bars' ? (dk ? 'bg-[#1a1c27] text-white shadow-xs' : 'bg-white text-slate-800 shadow-xs') : (dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-450 hover:text-slate-600')}`}
                    >
                      Barras
                    </button>
                  </div>
                </div>
                
                {consolidatedTab === 'chart' ? (
                  <div className="py-2 flex items-center justify-center min-h-[200px]">
                    <DonutChart 
                      data={content.breakdown.map((item: any, index: number) => {
                        const colorPrefixes = [
                          'stroke-[#0054ec]',
                          'stroke-[#fd11a4]',
                          'stroke-[#3b82f6]',
                          'stroke-[#ec4899]',
                          'stroke-[#06b6d4]',
                          'stroke-emerald-400'
                        ];
                        return {
                          label: item.category,
                          value: item.val,
                          percentage: item.share,
                          colorClass: colorPrefixes[index % colorPrefixes.length]
                        };
                      })} 
                      layout="col"
                      size="md"
                      showExactTotal={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 py-2">
                    {content.breakdown.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-800 font-bold">{item.category}</span>
                          <div className="font-mono">
                            <span className="font-bold text-slate-950 mr-2">{formatCurrency(item.val)}</span>
                            <span className="text-[10px] text-slate-400">({item.share.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.share}%` }}
                            transition={{ duration: 1.2, delay: idx * 0.05 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick High level summary card */}
              <div className="bg-[#0054ec]/8 border border-[#0054ec]/20 rounded-2xl p-4.5 mt-4 text-xs font-medium text-[#151720] leading-relaxed">
                As <span className="font-bold text-[#2226c0]">Transportadoras</span> concentram a esmagadora maioria das despesas logísticas com <span className="font-black text-[#2226c0]">92,1%</span> do custo total, seguidas pelas remessas de <span className="font-bold text-[#2226c0]">Correios</span>.
              </div>
            </div>

            {/* Right ranking projects list */}
            <div className={`lg:col-span-7 flex flex-col justify-between ${cardCls}`}>
              <div>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-4 ${divCls}`}>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={14} className="text-[#fd11a4]" />
                    Principais Projetos Contratantes (Ranking Custo)
                  </h3>

                  <div className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1 text-[10px] max-w-[200px] ${dk ? 'bg-[#0d0f17] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                    <Search size={12} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      className={`bg-transparent border-none outline-none w-full font-semibold ${dk ? 'text-slate-300 placeholder:text-slate-600' : 'text-slate-700'}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto pr-1 ${isFullscreen ? "max-h-[55vh]" : "max-h-[310px]"}`}>
                  {filterList(content.projects, 'name').map((proj: any, idx: number) => {
                    const progress = Math.max((proj.value / 110641.69) * 100, 1);
                    return (
                      <div key={idx} className={`border p-3 rounded-xl flex flex-col gap-1 transition-colors ${dk ? 'bg-[#0d0f17]/60 border-slate-800/50 hover:bg-[#0d0f17]' : 'bg-slate-50/70 border-slate-100/50 hover:bg-slate-100'}`}>
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className={`font-bold truncate max-w-[70%] ${dk ? 'text-slate-200' : 'text-slate-900'}`}>{proj.name}</span>
                          <span className={`font-mono font-black ${dk ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(proj.value)}</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden border ${dk ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100/50'}`}>
                          <div
                            className="bg-gradient-to-r from-[#fd11a4] to-[#2226c0] h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- CONSOLIDADO ENTRADA E SAÍDA (Slide 9) --- */}
        {slide.id === 'entrada-saida' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* ENTRADA CARD */}
            <div className={`lg:col-span-4 flex flex-col justify-between ${cardCls}`}>
              <div>
                <div className={`flex items-center gap-3 border-b pb-3 mb-5 ${divCls}`}>
                  <div className={`px-3 py-1.5 rounded-xl text-[#0054ec] font-black text-[11px] uppercase tracking-wider border ${dk ? 'bg-[#0054ec]/10 border-[#0054ec]/20' : 'bg-[#0054ec]/8 border-[#0054ec]/20'}`}>
                    Entrada
                  </div>
                  <div>
                    <h3 className={`text-md font-extrabold font-sans ${dk ? 'text-white' : 'text-slate-900'}`}>{content.entrada.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lançamentos Fiscais de Entrada</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className={`p-2.5 rounded-2xl flex flex-col ${dk ? 'bg-[#0d0f17]/80' : 'bg-slate-50/80'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">NF-e</span>
                    <span className={`text-lg font-black font-mono mt-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{content.entrada.nfs}</span>
                  </div>
                  <div className={`p-2.5 rounded-2xl flex flex-col ${dk ? 'bg-[#0d0f17]/80' : 'bg-slate-50/80'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Equip.</span>
                    <span className={`text-lg font-black font-mono mt-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{content.entrada.equipments}</span>
                  </div>
                  <div className="bg-[#0054ec]/8 text-[#2226c0] p-2.5 rounded-2xl flex flex-col">
                    <span className="text-[9px] font-bold text-[#0054ec] uppercase">Valor</span>
                    <span className="text-[11px] font-black font-mono mt-1.5">{formatCompact(content.entrada.value)}</span>
                  </div>
                </div>

                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Detalhamento por Cliente</h4>
                <div className={`flex flex-col gap-2 overflow-y-auto ${isFullscreen ? "max-h-[38vh]" : "max-h-[180px]"}`}>
                  {content.entrada.details.map((item: any, idx: number) => {
                    const ratio = (item.qty / 122) * 100;
                    return (
                      <div key={idx} className="bg-slate-50 flex items-center justify-between p-3 rounded-xl border border-slate-100/50">
                        <span className="text-xs font-bold text-slate-800">{item.client}</span>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <div className="w-16 bg-white border border-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-[#0054ec]/80 h-full rounded-full" style={{ width: `${ratio}%` }} />
                          </div>
                          <span className={`font-extrabold ${dk ? 'text-white' : 'text-slate-950'}`}>{item.qty} equip</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`text-[10px] text-slate-400 font-semibold tracking-wider text-center mt-4 border-t pt-3 ${divCls}`}>
                Total de equipamentos de entrada física
              </div>
            </div>

            {/* HIGH FIDELITY COMPARATIVE VISUAL CHART CARD */}
            <div className="lg:col-span-4">
              <EntradaSaidaChart entrada={content.entrada} saida={content.saida} />
            </div>

            {/* SAÍDA CARD */}
            <div className={`lg:col-span-4 flex flex-col justify-between ${cardCls}`}>
              <div>
                <div className={`flex items-center gap-3 border-b pb-3 mb-5 ${divCls}`}>
                  <div className={`px-3 py-1.5 rounded-xl text-pink-600 font-black text-[11px] uppercase tracking-wider border ${dk ? 'bg-pink-500/10 border-pink-500/20' : 'bg-pink-50 border-pink-100'}`}>
                    Saída
                  </div>
                  <div>
                    <h3 className={`text-md font-extrabold font-sans ${dk ? 'text-white' : 'text-slate-900'}`}>{content.saida.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lançamentos Fiscais de Saída</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className={`p-2.5 rounded-2xl flex flex-col ${dk ? 'bg-[#0d0f17]/80' : 'bg-slate-50/80'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">NF-e</span>
                    <span className={`text-lg font-black font-mono mt-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{content.saida.nfs}</span>
                  </div>
                  <div className={`p-2.5 rounded-2xl flex flex-col ${dk ? 'bg-[#0d0f17]/80' : 'bg-slate-50/80'}`}>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Equip.</span>
                    <span className={`text-lg font-black font-mono mt-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{content.saida.equipments}</span>
                  </div>
                  <div className="bg-pink-50 text-[#151720] p-2.5 rounded-2xl flex flex-col">
                    <span className="text-[9px] font-bold text-pink-400 uppercase">Valor</span>
                    <span className="text-[11px] font-black font-mono mt-1.5">{formatCompact(content.saida.value)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhamento por Cliente</h4>
                  <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-black">14 Clientes</span>
                </div>
                
                <div className={`flex flex-col gap-2 overflow-y-auto pr-1 ${isFullscreen ? "max-h-[38vh]" : "max-h-[180px]"}`}>
                  {content.saida.details.map((item: any, idx: number) => {
                    const ratio = (item.qty / 2636) * 100;
                    return (
                      <div key={idx} className="bg-slate-50 flex items-center justify-between p-2.5 rounded-xl border border-slate-100/50 hover:bg-slate-100 transition-colors">
                        <span className="text-xs font-bold text-slate-800">{item.client}</span>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <div className="w-16 bg-white border border-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className="bg-pink-500 h-full rounded-full" style={{ width: `${ratio}%` }} />
                          </div>
                          <span className={`font-extrabold ${dk ? 'text-white' : 'text-slate-950'}`}>{item.qty} equip</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`text-[10px] text-slate-400 font-semibold tracking-wider text-center mt-4 border-t pt-3 ${divCls}`}>
                Alto volume de saída física com destino ao projeto ZAMP
              </div>
            </div>
          </div>
        )}

        {/* --- ESTOQUE ATUAL (Slide 10) --- */}
        {slide.id === 'estoque-atual' && (
          <div className="flex flex-col gap-6">
            {/* Top overview KPIs with a beautiful Segment Comparison bar */}
            <div className={`flex flex-col gap-4 ${cardCls}`}>
              <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 ${divCls}`}>
                <div>
                  <span className="text-[10px] font-black text-[#0054ec] uppercase tracking-widest block">Patrimônio Geral em Custódia</span>
                  <p className="text-3xl font-black text-slate-900 font-sans tracking-tight mt-1">{formatCurrency(content.total)}</p>
                </div>
                
                {/* Horizontal Segment Bar */}
                <div className="flex-1 max-w-xl w-full flex flex-col gap-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 select-none">
                    <span>Proporções por Categoria</span>
                    <span className="text-slate-500">100% Patrimônio Protegido</span>
                  </div>
                  <div className="w-full h-4.5 rounded-full overflow-hidden flex shadow-inner border border-slate-100 bg-slate-50">
                    {content.groups.map((g: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`${g.color} h-full transition-all hover:brightness-95`} 
                        style={{ width: `${g.percentage}%` }}
                        title={`${g.name}: ${g.percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-slate-400 select-none">
                    {content.groups.map((g: any, idx: number) => {
                      const textClass = g.color.replace('bg-', 'text-');
                      return (
                        <span key={idx} className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${g.color}`} />
                          {g.name}: <span className={`${textClass} font-black`}>{g.percentage}%</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Collapsed content categories switcher */}
              <div className={`flex p-1 rounded-xl self-start gap-1 ${tabBg}`}>
                <button
                  onClick={() => setActiveStockTab('topNf')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeStockTab === 'topNf' ? (dk ? 'bg-[#1a1c27] text-[#00fafb] shadow-sm' : 'bg-white text-[#0054ec] shadow-sm') : (dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                >
                  <Database size={12} />
                  Top Projetos (com NF)
                </button>
                <button
                  onClick={() => setActiveStockTab('semNf')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeStockTab === 'semNf' ? (dk ? 'bg-[#1a1c27] text-pink-400 shadow-sm' : 'bg-white text-pink-600 shadow-sm') : (dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                >
                  <Layers size={12} />
                  Sem NF (Fila Reversa)
                </button>
                <button
                  onClick={() => setActiveStockTab('guarda')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeStockTab === 'guarda' ? (dk ? 'bg-[#1a1c27] text-cyan-400 shadow-sm' : 'bg-white text-cyan-600 shadow-sm') : (dk ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')}`}
                >
                  <ShieldCheck size={12} />
                  Guarda de Técnico
                </button>
              </div>

              {/* Dynamic TAB views */}
              <div className={isFullscreen ? "min-h-[35vh]" : "min-h-[190px]"}>
                {activeStockTab === 'topNf' && (() => {
                  // Group by first token (e.g. NTT, PROJETO)
                  const getPrefix = (name: string) => {
                    const m = name.match(/^([A-Z0-9]+)[_ -]/);
                    return m ? m[1] : name;
                  };
                  const groupMap: Record<string, { prefix: string; items: any[]; totalValue: number; totalQty: number }> = {};
                  [...content.topProjectsWithNF]
                    .sort((a: any, b: any) => b.value - a.value)
                    .forEach((proj: any) => {
                      const p = getPrefix(proj.project);
                      if (!groupMap[p]) groupMap[p] = { prefix: p, items: [], totalValue: 0, totalQty: 0 };
                      groupMap[p].items.push(proj);
                      groupMap[p].totalValue += proj.value;
                      groupMap[p].totalQty += proj.itemQty;
                    });
                  const sortedGroups = Object.values(groupMap).sort((a, b) => b.totalValue - a.totalValue);
                  const maxGroupVal = sortedGroups[0]?.totalValue || 1;
                  const rankColors = ['#0054ec','#2226c0','#fd11a4','#ec4899','#06b6d4','#10b981'];
                  const fmtExact = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

                  return (
                    <div className="flex flex-col gap-2 animate-fadeIn">
                      {sortedGroups.map((group, gIdx) => {
                        const rankColor = rankColors[gIdx % rankColors.length];
                        const ratio = Math.min((group.totalValue / maxGroupVal) * 100, 100);
                        const isMulti = group.items.length > 1;
                        const isOpen = expandedStockGroups.includes(group.prefix);
                        const toggle = () => setExpandedStockGroups(prev =>
                          prev.includes(group.prefix) ? prev.filter(p => p !== group.prefix) : [...prev, group.prefix]
                        );

                        return (
                          <div key={group.prefix}>
                            {/* Group header row */}
                            <div
                              className={`border rounded-2xl p-4 flex items-center gap-4 transition-all ${isMulti ? 'cursor-pointer' : ''} hover:shadow-md ${dk ? 'bg-[#0d0f17]/60 border-slate-800/50 hover:bg-[#0d0f17]' : 'bg-white border-slate-100/80 hover:border-[#0054ec]/30'}`}
                              onClick={isMulti ? toggle : undefined}
                            >
                              {/* Rank badge */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm" style={{ backgroundColor: rankColor }}>
                                {gIdx + 1}
                              </div>

                              {/* Name + info */}
                              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <span className={`font-black text-[13px] leading-snug truncate ${dk ? 'text-white' : 'text-slate-900'}`}>
                                  {isMulti ? group.prefix : group.items[0].project}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {isMulti ? `${group.items.length} projetos • ${group.totalQty} equipamentos` : `${group.items[0].itemQty} equipamentos`}
                                </span>
                                {/* Value below name */}
                                <span className="font-mono font-black text-[15px] mt-0.5" style={{ color: rankColor }}>
                                  {formatCompact(group.totalValue)}
                                  <span className={`text-[10px] font-semibold ml-2 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>{fmtExact(group.totalValue)}</span>
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="flex-1 max-w-[130px] flex flex-col gap-1 hidden md:flex">
                                <div className={`w-full h-2 rounded-full overflow-hidden ${dk ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ratio}%` }}
                                    transition={{ duration: 1.1, delay: gIdx * 0.06 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: rankColor }}
                                  />
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold">{ratio.toFixed(0)}% do maior</span>
                              </div>

                              {/* Expand chevron */}
                              {isMulti && (
                                <div className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${dk ? 'text-slate-500 hover:text-slate-300 bg-slate-800/40' : 'text-slate-400 hover:text-slate-600 bg-slate-100'}`}>
                                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </div>
                              )}
                            </div>

                            {/* Expanded sub-items */}
                            <AnimatePresence>
                              {isMulti && isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex flex-col gap-1.5 ml-12 mt-1.5">
                                    {group.items.map((proj: any, pIdx: number) => {
                                      const subRatio = Math.min((proj.value / group.totalValue) * 100, 100);
                                      return (
                                        <div key={pIdx} className={`border rounded-xl p-3 flex items-center gap-3 transition-colors ${dk ? 'bg-[#0d0f17]/40 border-slate-800/30 hover:bg-[#0d0f17]/70' : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'}`}>
                                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: rankColor }} />
                                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                            <span className={`font-bold text-[11px] leading-snug ${dk ? 'text-slate-200' : 'text-slate-800'}`} title={proj.project}>{proj.project}</span>
                                            <span className="text-[9px] text-slate-400 font-semibold">{proj.itemQty} equipamentos</span>
                                            {/* Value below sub-item name */}
                                            <span className="font-mono font-black text-[13px]" style={{ color: rankColor }}>
                                              {formatCompact(proj.value)}
                                              <span className={`text-[9px] font-semibold ml-1.5 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>{fmtExact(proj.value)}</span>
                                            </span>
                                          </div>
                                          <div className={`w-16 flex flex-col gap-0.5 hidden sm:flex`}>
                                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${dk ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                              <div className="h-full rounded-full" style={{ width: `${subRatio}%`, backgroundColor: rankColor }} />
                                            </div>
                                            <span className="text-[8px] text-slate-400 font-bold">{subRatio.toFixed(0)}% do grupo</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {activeStockTab === 'semNf' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="bg-gradient-to-r from-[#fd11a4]/5 to-[#2226c0]/5 border border-[#fd11a4]/20 p-4 rounded-2xl text-[11.5px] font-semibold text-[#151720] leading-relaxed flex items-center gap-3">
                      <Layers size={16} className="text-[#fd11a4] animate-pulse flex-shrink-0" />
                      <p>
                        O <span className="font-bold">Estoque Sem NF</span> corresponde a produtos provenientes de fluxos de troca técnica (TRAG / RMA) de clientes que encontram-se temporariamente sem nota fiscal emitida.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {content.semNf.map((item: any, idx: number) => {
                        const ratio = Math.min((item.value / 3200000) * 100, 100); // comparison with max value client
                        return (
                          <div key={idx} className="border border-pink-100/30 p-4 rounded-2xl bg-gradient-to-br from-white to-pink-50/5 hover:to-pink-50/15 hover:border-pink-300 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between gap-3 group">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] bg-pink-50 text-pink-600 border border-pink-100/60 font-black px-2 py-0.5 rounded-lg tracking-wider">OPERAÇÃO DE FILA</span>
                              <RefreshCw size={13} className="text-slate-300 group-hover:text-pink-400 transition-colors" />
                            </div>
                            <span className="text-[12.5px] font-extrabold text-slate-800 tracking-tight leading-snug truncate block">{item.client}</span>
                            
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100/50">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-slate-400 font-semibold">{item.qty} equipamentos</span>
                                <span className="font-mono font-black text-slate-950 text-[14.5px] group-hover:text-pink-600 transition-colors">{formatCompact(item.value)}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ratio}%` }}
                                  transition={{ duration: 1.2, delay: idx * 0.05 }}
                                  className="bg-pink-500 h-full rounded-full" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeStockTab === 'guarda' && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="bg-gradient-to-r from-cyan-50/60 to-slate-50/30 border border-cyan-100/40 p-4 rounded-2xl text-[11.5px] font-semibold text-cyan-950 leading-relaxed flex items-center gap-3">
                      <ShieldCheck size={16} className="text-cyan-500 animate-pulse flex-shrink-0" />
                      <p>
                        A <span className="font-bold">Guarda de Técnico</span> representa peças alocadas fisicamente com técnicos autorizados e prestadores externos sob responsabilidade direta de campo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {content.guardaTecnica.map((item: any, idx: number) => {
                        const ratio = Math.min((item.value / 500000) * 100, 100); // comparison with R$ 500k max
                        return (
                          <div key={idx} className="border border-cyan-100/30 p-4 rounded-2xl bg-gradient-to-br from-white to-cyan-50/5 hover:to-cyan-50/15 hover:border-cyan-300 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between gap-3 group">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-cyan-50 rounded-xl text-cyan-600 group-hover:bg-cyan-100 transition-colors shadow-xs">
                                <Shield size={16} className="stroke-[2.5]" />
                              </div>
                              <div className="flex flex-col gap-0.5 truncate flex-1">
                                <span className="font-black text-slate-800 text-[12.5px] truncate">{item.client}</span>
                                <span className="text-[10px] font-bold text-slate-400">{item.qty} equipamentos</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100/50">
                              <div className="flex justify-between items-baseline font-mono">
                                <span className="text-[9px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded-lg font-bold uppercase tracking-wide">Valor Guardado</span>
                                <span className="font-black text-slate-950 text-sm group-hover:text-cyan-600 transition-colors">{formatCurrency(item.value)}</span>
                              </div>
                              
                              {/* Comparative mini progress bar */}
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ratio}%` }}
                                  transition={{ duration: 1.2, delay: idx * 0.05 }}
                                  className="bg-cyan-500 h-full rounded-full" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TODO GERENCIAL DA LOGÍSTICA DE CUSTOS (Slide 12) --- */}
        {slide.id === 'todo-gerencial' && (
          <div className="flex flex-col gap-6">
            {/* Top KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`rounded-3xl p-5 border col-span-1 flex flex-col gap-1 bg-gradient-to-br from-[#0054ec] via-[#2226c0] to-[#fd11a4] text-white border-transparent shadow-lg`}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00fafb]">Total Gasto (MAI.26)</span>
                <span className="text-3xl font-black font-sans tracking-tight">{formatCurrency(content.totalSpent)}</span>
                <span className="text-[10px] text-white/60 font-semibold mt-1">Custo logístico consolidado</span>
              </div>
              <div className={`rounded-3xl p-5 border flex flex-col gap-1 ${dk ? 'bg-[#12131a] border-[#1c1f2e]' : 'bg-white border-slate-200/90'}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Total Saving</span>
                <span className="text-3xl font-black font-sans tracking-tight text-emerald-500">{formatCurrency(content.totalSavings)}</span>
                <span className={`text-[10px] font-semibold mt-1 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Economia realizada no período</span>
              </div>
              <div className={`rounded-3xl p-5 border flex flex-col gap-1 ${dk ? 'bg-[#12131a] border-[#1c1f2e]' : 'bg-white border-slate-200/90'}`}>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0054ec]">Taxa de Saving</span>
                <span className="text-3xl font-black font-sans tracking-tight text-[#0054ec]">{content.savingsRate}%</span>
                <span className={`text-[10px] font-semibold mt-1 ${dk ? 'text-slate-500' : 'text-slate-400'}`}>Sobre o gasto total do mês</span>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-7 ${cardCls}`}>
                <h3 className={`text-xs font-black uppercase tracking-widest border-b pb-3 mb-4 flex items-center gap-2 ${dk ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-100'}`}>
                  <DollarSign size={14} className="text-[#0054ec]" />
                  Gasto vs. Saving por Modalidade
                </h3>
                <div className="flex flex-col gap-3">
                  {content.breakdown.map((item: any, idx: number) => {
                    const total = item.spent + item.saving;
                    const spentRatio = (item.spent / total) * 100;
                    const savingRatio = (item.saving / total) * 100;
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold ${dk ? 'text-slate-200' : 'text-slate-800'}`}>{item.category}</span>
                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            <span className={`font-black ${dk ? 'text-white' : 'text-slate-950'}`}>{formatCurrency(item.spent)}</span>
                            <span className="text-emerald-500 font-bold">−{formatCurrency(item.saving)}</span>
                          </div>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden flex ${dk ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${spentRatio}%` }}
                            transition={{ duration: 1.1, delay: idx * 0.06 }}
                            className="h-full rounded-l-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${savingRatio}%` }}
                            transition={{ duration: 1.1, delay: idx * 0.06 + 0.2 }}
                            className="h-full rounded-r-full bg-emerald-400/60"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions / insights */}
              <div className={`lg:col-span-5 ${cardCls}`}>
                <h3 className={`text-xs font-black uppercase tracking-widest border-b pb-3 mb-4 flex items-center gap-2 ${dk ? 'text-slate-400 border-slate-800' : 'text-slate-400 border-slate-100'}`}>
                  <TrendingUp size={14} className="text-[#fd11a4]" />
                  Ações e Insights
                </h3>
                <div className="flex flex-col gap-3">
                  {content.actions.map((action: any, idx: number) => {
                    const isSaving = action.type === 'saving';
                    const isAlert = action.type === 'alert';
                    const accentColor = isSaving ? '#10b981' : isAlert ? '#fd11a4' : '#0054ec';
                    return (
                      <div
                        key={idx}
                        className={commentItemCls}
                        style={{ borderLeftColor: accentColor }}
                      >
                        <span
                          className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center border transition-colors ${dk ? 'bg-[#0d0f17] border-slate-800' : 'bg-slate-50 border-slate-150'}`}
                          style={{ color: accentColor }}
                        >
                          {isSaving ? <CheckCircle2 size={13} strokeWidth={2.5} /> :
                           isAlert ? <Info size={13} strokeWidth={2.5} /> :
                           <TrendingUp size={13} strokeWidth={2.5} />}
                        </span>
                        <p className={`font-bold text-[12px] leading-relaxed mt-0.5 ${dk ? 'text-slate-300' : 'text-slate-700'}`}>{action.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DESCARTE SUSTENTÁVEL (Slide 11) --- */}
        {slide.id === 'descarte-sustentavel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left KPIs and descriptive list */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {content.kpis.map((kpi: any, idx: number) => (
                <KPICard 
                  key={idx} 
                  label={kpi.label} 
                  value={kpi.value} 
                  type={kpi.type} 
                  isHighlight={kpi.isHighlight}
                  borderAccent="#fd11a4"
                  isDarkMode={isDarkMode}
                />
              ))}

              <div className="bg-emerald-50 text-emerald-950 border border-emerald-100 p-4.5 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-black text-emerald-900 uppercase tracking-wide">Reciclagem Ativa</span>
                  <p className="font-medium text-emerald-800 leading-relaxed">
                    Arrecadação e reciclagem direcionada de componentes sucateados, minimizando o impacto ambiental de metais pesados com rentabilização financeira de lotes descontinuados.
                  </p>
                </div>
              </div>
            </div>

            {/* Right lotes breakdown */}
            <div className={`lg:col-span-8 ${cardCls}`}>
              <div className="flex justify-between items-center border-b border-slate-150 pb-3 mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-[#fd11a4]" />
                  Destaque de Lotes Processados
                </h3>
                <span className="text-[10px] bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-lg text-slate-500 font-extrabold uppercase tracking-tight">
                  Reciclagem Certificada
                </span>
              </div>

              <div className={`flex flex-col gap-3.5 overflow-y-auto pr-1 ${isFullscreen ? "max-h-[58vh]" : "max-h-[320px]"}`}>
                {content.lotes.map((item: any, idx: number) => {
                  const valProgress = Math.max((item.value / 3000.00) * 100, 2);
                  const isLastItem = idx === content.lotes.length - 1;
                  
                  // Dynamically map lote specifications based on description
                  const getLoteSpecs = (desc: string) => {
                    const lowercase = desc.toLowerCase();
                    if (lowercase.includes('switch')) {
                      return {
                        icon: Network,
                        colorClass: 'text-[#0054ec] bg-[#0054ec]/8 border-[#0054ec]/20',
                        badge: 'Rede & Ativos de Conectividade',
                        gradient: 'from-[#0054ec] to-[#2226c0]'
                      };
                    }
                    if (lowercase.includes('cable') || lowercase.includes('cabo')) {
                      return {
                        icon: Cable,
                        colorClass: 'text-amber-600 bg-amber-50 border-amber-100/80',
                        badge: 'Metais Mistas & Cobre',
                        gradient: 'from-amber-500 to-orange-400'
                      };
                    }
                    if (lowercase.includes('gabinete') || lowercase.includes('servidor')) {
                      return {
                        icon: Server,
                        colorClass: 'text-[#fd11a4] bg-[#fd11a4]/8 border-[#fd11a4]/20',
                        badge: 'Hardware Pesado & Carcaças',
                        gradient: 'from-[#fd11a4] to-[#0054ec]'
                      };
                    }
                    if (lowercase.includes('bateri')) {
                      return {
                        icon: BatteryCharging,
                        colorClass: 'text-rose-600 bg-rose-50 border-rose-100',
                        badge: 'Células de Chumbo/Lítio',
                        gradient: 'from-rose-500 to-red-500'
                      };
                    }
                    if (lowercase.includes('placa') || lowercase.includes('circuito')) {
                      return {
                        icon: Cpu,
                        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                        badge: 'Placas & Componentes de Silício',
                        gradient: 'from-emerald-500 to-teal-500'
                      };
                    }
                    return {
                      icon: Wifi,
                      colorClass: 'text-cyan-600 bg-cyan-50 border-cyan-100',
                      badge: 'Rede Wireless',
                      gradient: 'from-cyan-500 to-sky-400'
                    };
                  };

                  const specs = getLoteSpecs(item.desc);
                  const IconComponent = specs.icon;

                  const borderClass = isLastItem 
                    ? "border-emerald-300 bg-emerald-50/10 shadow-sm shadow-emerald-100/50 ring-2 ring-emerald-500/10" 
                    : "border-slate-200/80 bg-white/40";

                  return (
                    <div 
                      key={idx} 
                      className={`border p-4 rounded-2xl hover:bg-slate-50/50 hover:border-slate-350 hover:shadow-xs transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group relative overflow-hidden ${borderClass}`}
                    >
                      {/* Subtle hover background ambient glow match */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-slate-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Left: Icon, Batch Number, Description, and Category Badge */}
                      <div className="flex items-center gap-3.5 min-w-[240px] relative z-10">
                        {/* Colored icon badge wrapper */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-sans ${specs.colorClass} shadow-xs flex-shrink-0 relative`}>
                           <IconComponent size={18} />
                           {isLastItem && (
                             <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                             </span>
                           )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black tracking-tight text-slate-400 font-mono">
                              {item.name}
                            </span>
                            {isLastItem && (
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-pulse">
                                Mais Recente
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black text-slate-800 leading-none group-hover:text-[#2226c0] transition-colors">{item.desc}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{specs.badge}</span>
                        </div>
                      </div>

                      {/* Middle: Progress Bar representing efficiency or yield */}
                      <div className="flex-1 max-w-sm flex flex-col gap-1 md:px-4">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span className="uppercase tracking-wide text-[8.5px] font-extrabold text-slate-450">Retorno Sustentável</span>
                          <span className="font-mono text-slate-700 font-black text-[10.5px]">{valProgress.toFixed(0)}% do teto</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-150 shadow-inner">
                          <div 
                            className={`bg-gradient-to-r ${specs.gradient} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${valProgress}%` }} 
                          />
                        </div>
                      </div>

                      {/* Right: Quantity and Yield Numbers */}
                      <div className="flex items-center justify-between md:justify-end gap-6 min-w-[170px] border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 relative z-10">
                        <div className="flex flex-col items-start md:items-end">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Quantidade</span>
                          <span className="text-xs font-mono font-black text-slate-700">
                            {item.qty.toLocaleString('pt-BR')} un
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Valor Recuperado</span>
                          <span className={`text-[14px] font-mono font-black tracking-tight ${isLastItem ? 'text-emerald-600' : 'text-[#2226c0]'}`}>
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- INSURANCE STANDARD VIEW (Slides 13, 14, 15, 16) --- */}
        {category === 'insurance' && slide.id !== 'custo-fatura' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="insurance-display">
            {/* Left insurance details, KPIs / commentaries */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {content.kpis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {content.kpis.map((kpi: any, idx: number) => (
                    <KPICard 
                      key={idx} 
                      label={kpi.label} 
                      value={kpi.value} 
                      type={kpi.type} 
                      isHighlight={kpi.isHighlight}
                      borderAccent="#10b981"
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              )}

              {/* Sub-group layout if slide has nested text commentary sections */}
              {content.comentarios ? (
                <div className={commentWrapCls}>
                  <div className="flex flex-col gap-3.5">
                    {content.comentarios.map((cText: string, idx: number) => (
                      <div
                        key={idx}
                        className={commentItemCls}
                        style={{ borderLeftColor: '#0054ec' }}
                      >
                        <span className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center border ${dk ? 'bg-[#0d0f17] border-slate-800 text-[#00fafb]' : 'bg-slate-50 border-slate-150 text-blue-600'}`}>
                          <Sparkles size={13} strokeWidth={2.5} />
                        </span>
                        <p className={`font-bold text-[12px] leading-relaxed mt-0.5 ${dk ? 'text-slate-300' : 'text-slate-700'}`}>{cText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`border border-l-4 border-l-blue-500 p-5 rounded-2xl text-[12px] font-bold leading-relaxed flex flex-col gap-2 shadow-sm transition-all hover:scale-[1.01] ${dk ? 'bg-[#12131a] border-slate-800 text-slate-300' : 'bg-white border-slate-200/75 text-slate-700'}`}>
                  <span className="font-black text-blue-600 uppercase text-[10px] tracking-wider block flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck size={14} />
                    Garantia Regulamentar de Custódia
                  </span>
                  Apólices formatadas sob taxa mensal simplificada visando mitigar quaisquer contingências judiciais ou perdas em transporte, postagem reversa e campo técnico avançado.
                </div>
              )}
            </div>

            {/* Right detailed policy tables */}
            <div className={`lg:col-span-7 ${cardCls}`}>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-3 mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500 animate-pulse" />
                Estrutura de Cobertura Ativa
              </h3>

              {/* Coberturas breakdown for Patrimonial */}
              {slide.id === 'seguros-patrimonial' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Distribuição Seguro Geral patrimonial</h4>
                    <DonutChart data={content.coberturas.map((c: any) => ({ label: c.name, value: c.value, percentage: c.share }))} />
                  </div>
                  
                  <div className="border-t border-slate-50 pt-3 flex flex-col">
                    <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-2">Detalhamento dos Clientes Sem NF Protegidos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {content.semNfBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate" title={item.name}>{item.name}</span>
                          <span className="font-mono font-black text-slate-900 text-xs block mt-1.5">{formatCurrency(item.value)}</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">Qtd: {item.qty} peças</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Breakdown sections for Extra / Satélites and others */}
              {content.sections && (
                <div className={`flex flex-col gap-5 overflow-y-auto pr-1 ${isFullscreen ? "max-h-[55vh]" : "max-h-[340px]"}`}>
                  {content.sections.map((sec: any, idx: number) => {
                    // Match visual icon decoration based on title or context
                    let SectionIcon = Shield;
                    let iconColorClass = "text-[#0054ec] bg-[#0054ec]/8";
                    let borderLeftColor = "border-l-[#0054ec]";
                    
                    const titleLower = sec.title.toLowerCase();
                    if (titleLower.includes("extra") || titleLower.includes("trân")) {
                      SectionIcon = Truck;
                      iconColorClass = "text-cyan-500 bg-cyan-50";
                      borderLeftColor = "border-l-cyan-500";
                    } else if (titleLower.includes("zamp") || titleLower.includes("servidores")) {
                      SectionIcon = Database;
                      iconColorClass = "text-[#fd11a4] bg-pink-50";
                      borderLeftColor = "border-l-[#fd11a4]";
                    } else if (titleLower.includes("trag") || titleLower.includes("reversa")) {
                      SectionIcon = RefreshCw;
                      iconColorClass = "text-[#fd11a4] bg-[#fd11a4]/8";
                      borderLeftColor = "border-l-[#fd11a4]";
                    } else if (titleLower.includes("arcos") || titleLower.includes("instala")) {
                      SectionIcon = ShieldCheck;
                      iconColorClass = "text-emerald-500 bg-emerald-50";
                      borderLeftColor = "border-l-emerald-500";
                    } else if (titleLower.includes("starlink") || titleLower.includes("antena")) {
                      SectionIcon = Globe;
                      iconColorClass = "text-blue-500 bg-blue-50";
                      borderLeftColor = "border-l-blue-500";
                    } else if (titleLower.includes("fluke") || titleLower.includes("mediç")) {
                      SectionIcon = Smartphone;
                      iconColorClass = "text-amber-500 bg-amber-50";
                      borderLeftColor = "border-l-amber-500";
                    }

                    return (
                      <div key={idx} className={`border border-l-4 ${borderLeftColor} p-5 rounded-2xl shadow-sm flex flex-col gap-3 hover:scale-[1.01] transition-all group ${dk ? 'bg-[#12131a] border-[#1c1f2e]' : 'bg-white border-slate-150/60 hover:border-r-slate-300'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${iconColorClass} flex items-center justify-center shadow-xs mt-0.5`}>
                              <SectionIcon size={16} className="stroke-[2.5]" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-900 group-hover:text-[#2226c0] transition-colors">{sec.title}</span>
                              <p className="text-[10px] text-slate-500 font-semibold max-w-sm mt-0.5 leading-relaxed">{sec.desc}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`font-mono font-black text-base tracking-tight px-2 py-0.5 rounded-lg border ${dk ? 'text-white bg-[#0d0f17] border-slate-800' : 'text-slate-900 bg-slate-50 border-slate-100'}`}>{formatCompact(sec.totalValue)}</span>
                            {sec.monthlyCost && (
                              <span className="text-[9.5px] bg-[#0054ec]/8 border border-[#0054ec]/20 text-[#0054ec] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider block">
                                Mês: {formatCompact(sec.monthlyCost)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Items breakdown list */}
                        {sec.subItems && (
                          <div className="flex flex-col gap-2 mt-1.5 pt-2 border-t border-slate-100/60">
                            {sec.subItems.map((sub: any, sIdx: number) => {
                              // Calculate ratio representing its visual weight compared to the section total value
                              const subRatio = Math.min((sub.value / (sec.totalValue || 1)) * 100, 100);
                              return (
                                <div key={sIdx} className={subItemCls}>
                                  <div className="flex justify-between items-center text-[11.5px] font-semibold text-slate-700">
                                    <span className="truncate max-w-[65%] font-extrabold text-slate-800">{sub.name}</span>
                                    <div className="flex items-center gap-3 font-mono">
                                      <span className="text-[9.5px] text-slate-400 font-bold bg-white border border-slate-100 px-1.5 py-0.2 rounded">Taxa: {sub.rate}</span>
                                      <span className="font-black text-slate-950">{formatCompact(sub.value)}</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-slate-200/50 h-1 rounded-full overflow-hidden">
                                    <div className="bg-slate-400 h-full rounded-full" style={{ width: `${subRatio}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Phase sub-items for TRAGs */}
                        {sec.phases && (
                          <div className="flex flex-col gap-2 mt-1.5 pt-2 border-t border-slate-100/60">
                            {sec.phases.map((pha: any, phaIdx: number) => {
                              const phaRatio = Math.min((pha.val / (sec.totalValue || 1)) * 100, 100);
                              return (
                                <div key={phaIdx} className={subItemCls}>
                                  <div className="flex justify-between items-center text-[11.5px] font-semibold text-slate-700">
                                    <span className="font-extrabold text-slate-800">{pha.client}</span>
                                    <div className="flex items-center gap-3 font-mono">
                                      <span className="text-[9.5px] text-[#0054ec] font-bold bg-[#0054ec]/8 border border-[#0054ec]/20 px-1.5 py-0.2 rounded">Mínimo: {formatCurrency(pha.minCost)}</span>
                                      <span className="font-black text-slate-950">{formatCurrency(pha.val)}</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-slate-200/50 h-1 rounded-full overflow-hidden">
                                    <div className="bg-[#0054ec] h-full rounded-full" style={{ width: `${phaRatio}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Starlink customized list */}
                        {sec.apolices && (
                          <div className="grid grid-cols-3 gap-2.5 mt-1.5 pt-2 border-t border-slate-100/60">
                            {sec.apolices.map((ap: any, apIdx: number) => (
                              <div key={apIdx} className="bg-gradient-to-br from-white to-slate-50 p-2.5 rounded-xl text-[10px] border border-slate-100 shadow-xs flex flex-col gap-1 text-center font-bold">
                                <span className="text-slate-400 uppercase tracking-wider text-[8.5px]">{ap.name}</span>
                                <span className="text-slate-950 font-mono text-xs font-black">{formatCompact(ap.value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- COMPOSIÇÃO DE CUSTOS DE SEGURO (Slide 17) --- */}
        {slide.id === 'custo-fatura' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Area Line Chart */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {content.kpis.map((kpi: any, idx: number) => (
                  <KPICard 
                    key={idx} 
                    label={kpi.label} 
                    value={kpi.value} 
                    type={kpi.type} 
                    isHighlight={kpi.isHighlight}
                    borderAccent="#db2777"
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
              
              <div className="bg-gradient-to-tr from-[#fd11a4]/5 to-[#2226c0]/5 border border-[#fd11a4]/20 border-l-4 border-l-[#fd11a4] p-5 rounded-2xl flex flex-col gap-3 shadow-xs hover:shadow-sm hover:scale-[1.01] transition-all">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={14} className="text-pink-600 animate-pulse" />
                  Observações de Conciliação
                </h3>
                <div className="flex flex-col gap-3 text-[11.5px] leading-relaxed text-[#151720] font-bold">
                  {content.comments.map((comment: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-1 bg-white/45 border border-pink-100/30 rounded-xl">
                      <span className="p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center bg-[#fd11a4]/10 text-pink-600 mt-0.5">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                      </span>
                      <p className="mt-0.5 leading-snug">{comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Faturas list with credit vs value highlights */}
            <div className={`lg:col-span-8 ${cardCls}`}>
              <div className={`flex items-center justify-between border-b pb-3 mb-4 ${divCls}`}>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-[#0054ec]" />
                  Composição Financeira Detalhada
                </h3>
                
                {/* Horizontal simple chart switcher representation */}
                <div className={`flex p-1 rounded-xl gap-1 ${tabBg}`}>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tabActiveCls(activeTab === 'summary')}`}
                  >
                    Curva Fatura
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tabActiveCls(activeTab === 'table')}`}
                  >
                    Itens da Fatura
                  </button>
                </div>
              </div>

              {/* TAB CONTENT 1: Curva Fatura Area Chart */}
              {activeTab === 'summary' && (
                <div className={`flex-1 flex flex-col justify-center ${isFullscreen ? "min-h-[45vh]" : "min-h-[290px]"}`}>
                  <div className={isFullscreen ? "h-96 lg:h-[42vh]" : "h-60"}>
                    <ResponsiveAreaChart data={content.invoiceItems} />
                  </div>
                  <span className="text-center text-[10px] text-slate-400 font-bold block uppercase tracking-wider mt-3">Análise de conciliação de faturas de seguros processadas</span>
                </div>
              )}

              {/* TAB CONTENT 2: Detailed list of invoice parts */}
              {activeTab === 'table' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 ${isFullscreen ? "max-h-[45vh]" : "max-h-[260px]"}`}>
                    {content.invoiceItems.map((item: any, idx: number) => {
                      const isCredit = item.isCredit;
                      return (
                        <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${isCredit ? (dk ? 'border-emerald-800/40 bg-emerald-900/10 hover:bg-emerald-900/20' : 'border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/20') : (dk ? 'border-slate-800 bg-[#0d0f17] hover:bg-[#12131a]' : 'border-slate-100 bg-white hover:bg-slate-50')}`}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-black text-slate-800">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{item.sub}</span>
                          </div>
                          
                          {/* Credit badge vs value */}
                          <div className="text-right flex flex-col items-end gap-1 font-mono">
                            <span className={`text-xs font-extrabold ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {formatCurrency(item.value)}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-lg font-bold uppercase ${isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {isCredit ? 'Crédito' : 'Débito'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-3 mt-3 text-center uppercase tracking-wider">
                    Total Fatura Líquida Líquida Pago: R$ 59.656,30
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
