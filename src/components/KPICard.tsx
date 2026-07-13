import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Coins, Package, Truck, Plane, Database, Shield, DollarSign } from 'lucide-react';
import { formatCurrency } from './MiniCharts';

interface KPICardProps {
  key?: any;
  label: string;
  value: any;
  type?: 'currency' | 'number' | 'text';
  icon?: string;
  isHighlight?: boolean;
  borderAccent?: string;
  isDarkMode?: boolean;
}

export default function KPICard({ label, value, type = 'number', icon, isHighlight = false, borderAccent, isDarkMode = false }: KPICardProps) {
  // Select matching Lucide icon based on name
  const renderIcon = () => {
    const iconSize = 18;
    const baseClass = isHighlight ? "text-[#00fafb]" : isDarkMode ? "text-slate-300" : "text-slate-400";
    
    switch (icon || label.toLowerCase()) {
      case 'custo total':
      case 'custo total correios':
      case 'custo total dedicados':
      case 'custo mensal da apólice':
      case 'custo logístico total':
      case 'fatura líquida consolidada':
      case 'mensalmente':
        return <DollarSign size={iconSize} className={baseClass} />;
      case 'embarques':
      case 'total embarques':
      case 'nº de embarques':
      case 'notas fiscais / embarques':
        return <Truck size={iconSize} className={baseClass} />;
      case 'equipamentos':
      case 'qtd. equipamentos':
      case 'itens':
      case 'total geral estoque':
        return <Package size={iconSize} className={baseClass} />;
      case 'custo médio':
      case 'custo médio / emb.':
      case 'custo médio / equip.':
        return <TrendingUp size={iconSize} className={baseClass} />;
      case 'valores protegidos':
      case 'valor acumulado patrimonial':
      case 'valor patrimonial acumulado':
      case 'limite de cobertura base':
        return <Shield size={iconSize} className={baseClass} />;
      case 'estoque':
        return <Database size={iconSize} className={baseClass} />;
      default:
        return <Coins size={iconSize} className={baseClass} />;
    }
  };

  const formattedValue = () => {
    if (type === 'currency' && typeof value === 'number') {
      return formatCurrency(value);
    }
    if (type === 'number' && typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR').format(value);
    }
    return value;
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl p-5 border text-left transition-all ${
        isHighlight
          ? 'bg-gradient-to-br from-[#0054ec] via-[#2226c0] to-[#fd11a4] text-white border-transparent shadow-lg ' + (isDarkMode ? 'shadow-black/40' : 'shadow-[#0054ec]/20')
          : isDarkMode
            ? 'bg-[#12131a]/80 hover:bg-[#181a24] text-white border-slate-800 shadow-sm shadow-black/10'
            : 'bg-slate-50/75 hover:bg-white text-slate-800 border-slate-200/80 shadow-sm hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.08)]'
      }`}
      style={{
        borderTop: borderAccent && !isHighlight ? `3px solid ${borderAccent}` : undefined
      }}
    >
      {/* Decorative background radial glow */}
      {isHighlight && (
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
      )}

      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5 flex-1 select-all">
          <span className={`text-[13px] font-light uppercase tracking-wider ${isHighlight ? 'text-[#00fafb]' : 'text-slate-400'}`}>
            {label}
          </span>
          <span className={`text-2xl font-black font-sans tracking-tight leading-none ${isHighlight ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formattedValue()}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl ${isHighlight ? 'bg-white/10 border border-white/10' : isDarkMode ? 'bg-[#1a1c29] border border-slate-850' : 'bg-slate-50 border border-slate-100'}`}>
          {renderIcon()}
        </div>
      </div>
    </motion.div>
  );
}
