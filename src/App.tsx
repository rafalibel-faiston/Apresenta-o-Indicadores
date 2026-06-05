import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2,
  Layers, HelpCircle, Download, FileText, Sparkles, Menu, X
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { toPng } from 'html-to-image';
import { slidesData } from './data/slidesData';
import SlideViewer from './components/SlideViewer';
import FaistonLogo from './components/FaistonLogo';
import { formatCurrency } from './components/MiniCharts';

// Helper to convert OKLCH color space to sRGB for printers & libraries that html-to-image/canvas depend on
function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  const hRad = (h * Math.PI) / 180;
  const L = l;
  const A = c * Math.cos(hRad);
  const B = c * Math.sin(hRad);

  const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
  const s_ = L - 0.0894841775 * A - 1.2914855480 * B;

  const l_3 = l_ * l_ * l_;
  const m_3 = m_ * m_ * m_;
  const s_3 = s_ * s_ * s_;

  let r = +4.0767416621 * l_3 - 3.3077115913 * m_3 + 0.2309699292 * s_3;
  let g = -1.2684380046 * l_3 + 2.6097574011 * m_3 - 0.3413193965 * s_3;
  let b = -0.0041960863 * l_3 - 0.7034186147 * m_3 + 1.7076147012 * s_3;

  const gamma = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return clamped > 0.0031308
      ? 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055
      : 12.92 * clamped;
  };

  const R = Math.round(gamma(r) * 255);
  const G = Math.round(gamma(g) * 255);
  const B_ = Math.round(gamma(b) * 255);

  if (a < 1) {
    return `rgba(${R}, ${G}, ${B_}, ${a})`;
  }
  return `rgb(${R}, ${G}, ${B_})`;
}

// Replaces all occurrences of oklch(...) inside CSS text content with standard rgb/rgba formulas
function replaceOklchInCss(css: string): string {
  const regex = /oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/g;
  return css.replace(regex, (match, lStr, cStr, hStr, aStr) => {
    try {
      let l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      let c = parseFloat(cStr);
      let h = parseFloat(hStr);
      let a = 1;
      if (aStr) {
        a = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      }
      return oklchToRgb(l, c, h, a);
    } catch (e) {
      return 'rgb(0, 84, 236)'; // Fallback Faiston blue
    }
  });
}

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const isDarkMode = true;
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(8000); // 8 seconds default
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState<number | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [zipProgress, setZipProgress] = useState<number | null>(null);

  const mainContainerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slidesData[currentSlideIndex];

  // Handle slide change with directions
  const goToNextSlide = () => {
    setSlideDirection('forward');
    setCurrentSlideIndex((prevIdx) => (prevIdx + 1) % slidesData.length);
  };

  const goToPrevSlide = () => {
    setSlideDirection('backward');
    setCurrentSlideIndex((prevIdx) => (prevIdx - 1 + slidesData.length) % slidesData.length);
  };

  const selectSlide = (index: number) => {
    if (index > currentSlideIndex) {
      setSlideDirection('forward');
    } else {
      setSlideDirection('backward');
    }
    setCurrentSlideIndex(index);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  // Autoplay intervals
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        goToNextSlide();
      }, autoplaySpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, autoplaySpeed, currentSlideIndex]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mainContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      mainContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen request failed", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Track fullscreen changes from ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Simple feature to export current slide data as JSON file
  const exportSlideData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSlide, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `faiston_slide_${currentSlide.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export a single slide as a high-quality PNG image
  const exportSlideAsPNG = async (idx?: number) => {
    const targetIdx = idx !== undefined ? idx : currentSlideIndex;
    
    // Intercept oklch colors in style elements to prevent SVG/foreignObject stylesheet parser crashes
    const styleElements = Array.from(document.querySelectorAll('style'));
    const originalStyleContentsByElement = styleElements.map(el => ({
      el,
      textContent: el.textContent || ''
    }));

    try {
      // Temporarily convert oklch(...) colors to standard declarations
      styleElements.forEach(el => {
        if (el.textContent) {
          el.textContent = replaceOklchInCss(el.textContent);
        }
      });

      setCurrentCaptureIndex(targetIdx);
      
      // Wait for state updates and CSS transitions to settle
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const captureStage = document.getElementById('ppt-capture-stage');
      if (!captureStage) {
        throw new Error('Capture stage not found');
      }

      const imgData = await toPng(captureStage, {
        width: 1280,
        height: 720,
        style: {
          transform: 'none',
        },
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // Download the PNG immediately
      const slideTitleClean = slidesData[targetIdx].title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", imgData);
      downloadAnchor.setAttribute("download", `Faiston_Slide_${targetIdx + 1}_${slideTitleClean}.png`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Erro ao exportar o slide para imagem:", error);
    } finally {
      // Restore styles
      originalStyleContentsByElement.forEach(({ el, textContent }) => {
        el.textContent = textContent;
      });
      setCurrentCaptureIndex(null);
    }
  };

  // Export all slides as a ZIP collection of PNGs
  const exportAllAsZIP = async () => {
    // Intercept oklch colors in style elements to prevent SVG/foreignObject stylesheet parser crashes
    const styleElements = Array.from(document.querySelectorAll('style'));
    const originalStyleContentsByElement = styleElements.map(el => ({
      el,
      textContent: el.textContent || ''
    }));

    try {
      setIsPlaying(false); // Stop autoplay
      setZipProgress(1);

      // Temporarily convert oklch(...) colors
      styleElements.forEach(el => {
        if (el.textContent) {
          el.textContent = replaceOklchInCss(el.textContent);
        }
      });
      
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (let i = 0; i < slidesData.length; i++) {
        setZipProgress(i + 1);
        setCurrentCaptureIndex(i);
        
        // Wait for rendering to complete
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const captureStage = document.getElementById('ppt-capture-stage');
        if (!captureStage) {
          throw new Error('Capture stage not found');
        }

        const imgData = await toPng(captureStage, {
          width: 1280,
          height: 720,
          style: {
            transform: 'none',
          },
          backgroundColor: '#ffffff',
          cacheBust: true,
        });

        // Parse base64 from data URI
        const base64Data = imgData.split(',')[1];
        const slideTitleClean = slidesData[i].title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const fileName = `Slide_${String(i + 1).padStart(2, '0')}_${slideTitleClean}.png`;
        zip.file(fileName, base64Data, { base64: true });
      }

      setZipProgress(slidesData.length);
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download ZIP file
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = URL.createObjectURL(content);
      downloadAnchor.download = `Faiston_Apresentacao_Slides_Imagens.zip`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      console.error("Erro ao exportar apresentação para ZIP:", error);
    } finally {
      // Restore styles
      originalStyleContentsByElement.forEach(({ el, textContent }) => {
        el.textContent = textContent;
      });

      setZipProgress(null);
      setCurrentCaptureIndex(null);
    }
  };

  // Professional 1280x720 PowerPoint slide exporter
  const exportAllToPPTX = async () => {
    // Intercept oklch colors in style elements to prevent SVG/foreignObject stylesheet parser crashes
    const styleElements = Array.from(document.querySelectorAll('style'));
    const originalStyleContentsByElement = styleElements.map(el => ({
      el,
      textContent: el.textContent || ''
    }));

    try {
      setIsPlaying(false); // Stop autoplay during compile

      // Temporarily convert oklch(...) colors to standard, universally parseable rgb/rgba declarations
      styleElements.forEach(el => {
        if (el.textContent) {
          el.textContent = replaceOklchInCss(el.textContent);
        }
      });
      
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';

      for (let i = 0; i < slidesData.length; i++) {
        setExportProgress(i + 1);
        setCurrentCaptureIndex(i);
        
        // Wait for state updates and CSS transition elements to fully settle
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const captureStage = document.getElementById('ppt-capture-stage');
        if (!captureStage) {
          throw new Error('Capture stage not found');
        }

        const imgData = await toPng(captureStage, {
          width: 1280,
          height: 720,
          style: {
            transform: 'none',
          },
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
        const pptSlide = pptx.addSlide();
        pptSlide.addImage({
          data: imgData,
          x: 0,
          y: 0,
          w: 10,
          h: 5.625
        });
      }

      await pptx.writeFile({ fileName: `Faiston_Resultados_Logistica_Seguros_1280x720.pptx` });
    } catch (error) {
      console.error("Erro ao exportar para PowerPoint:", error);
    } finally {
      // Restore all original styles back to the webpage
      originalStyleContentsByElement.forEach(({ el, textContent }) => {
        el.textContent = textContent;
      });

      setExportProgress(null);
      setCurrentCaptureIndex(null);
    }
  };

  // Category tags helper for visual colors in thumbnails
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cover': return 'border-[#0054ec] text-[#0054ec] bg-blue-50';
      case 'divider': return 'border-slate-300 text-slate-600 bg-slate-50';
      case 'expeditions': return 'border-[#00fafb] text-[#0054ec] bg-cyan-50';
      case 'financials': return 'border-[#2226c0] text-[#2226c0] bg-blue-50';
      case 'operations': return 'border-[#fd11a4] text-[#fd11a4] bg-pink-50';
      case 'insurance': return 'border-emerald-400 text-emerald-600 bg-emerald-50';
      case 'contact': return 'border-amber-400 text-amber-600 bg-amber-50';
      default: return 'border-slate-200 text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f17] text-slate-100 flex flex-col justify-between antialiased font-sans" id="faiston-presentation-suite">

      {/* Faixa de gradiente da marca no topo absoluto */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#2226c0] via-[#0054ec] via-[#00fafb] via-[#fd11a4] to-[#fd5665] flex-shrink-0" />

      {/* 1. BRAND PLATFORM HEADER */}
      <header className="px-5 py-3 flex items-center justify-between border-b border-white/8 bg-[#151720] text-white z-20 shadow-lg shadow-black/30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors focus:outline-none"
            title="Alternar Painel de Slides"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="h-8 w-px bg-white/10" />

          {/* Logo Faiston no header */}
          <FaistonLogo width={130} height={36} className="opacity-95" />

          <div className="h-8 w-px bg-white/10" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black tracking-[0.18em] uppercase text-[#00fafb]/80 font-mono">
              LOGÍSTICA & SEGUROS · MAI.26
            </span>
            <h1 className="text-[11px] font-semibold font-serif text-slate-300 leading-none">
              Apresentação de Resultados
            </h1>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 font-bold px-3 py-1.5 text-[11px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10"
          >
            <HelpCircle size={13} />
            Atalhos
          </button>

          <button
            onClick={exportSlideData}
            className="flex items-center gap-1 font-semibold px-2.5 py-1.5 text-[11px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/8 border border-white/10"
            title="Exportar Dados do Slide em JSON"
          >
            <Download size={12} />
            JSON
          </button>

          <button
            onClick={() => exportSlideAsPNG()}
            className="flex items-center gap-1 font-bold px-3 py-1.5 text-[11px] rounded-lg transition-all border border-[#00fafb]/30 bg-[#00fafb]/8 text-[#00fafb] hover:bg-[#00fafb]/15 active:scale-95 cursor-pointer"
            title="Baixar Slide Atual como Imagem PNG"
          >
            <Maximize2 size={12} className="rotate-45" />
            PNG
          </button>

          <button
            onClick={exportAllAsZIP}
            disabled={zipProgress !== null || exportProgress !== null}
            className={`flex items-center gap-1 font-bold px-3 py-1.5 text-[11px] rounded-lg transition-all border cursor-pointer ${
              zipProgress !== null
                ? 'bg-[#0054ec]/15 border-[#0054ec]/30 text-[#0054ec] animate-pulse'
                : 'bg-[#0054ec]/15 border-[#0054ec]/40 text-[#0054ec] hover:bg-[#0054ec]/25 active:scale-95'
            }`}
            title="Baixar Todos os Slides em ZIP"
          >
            <Layers size={12} className={zipProgress !== null ? 'animate-spin' : ''} />
            {zipProgress !== null ? `ZIP (${zipProgress}/${slidesData.length})` : 'ZIP'}
          </button>

          <button
            onClick={exportAllToPPTX}
            disabled={exportProgress !== null || zipProgress !== null}
            className={`flex items-center gap-1 font-bold px-3 py-1.5 text-[11px] rounded-lg transition-all border cursor-pointer ${
              exportProgress !== null
                ? 'bg-[#fd11a4]/15 border-[#fd11a4]/30 text-[#fd11a4] animate-pulse'
                : 'bg-[#fd11a4]/15 border-[#fd11a4]/40 text-[#fd11a4] hover:bg-[#fd11a4]/25 active:scale-95'
            }`}
            title="Exportar para PowerPoint"
          >
            <FileText size={12} className={exportProgress !== null ? 'animate-spin' : ''} />
            {exportProgress !== null ? `PPT (${exportProgress}/${slidesData.length})` : 'PPT'}
          </button>

          <a
            href="https://faiston.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1.5 rounded-lg border border-[#0054ec]/50 bg-gradient-to-r from-[#0054ec]/20 to-[#2226c0]/20 text-[#00fafb] hover:from-[#0054ec]/35 hover:to-[#2226c0]/35 transition-all hover:scale-[1.02]"
          >
            <Sparkles size={11} className="opacity-80" />
            faiston.com
          </a>
        </div>
      </header>

      {/* 2. MAIN SPLIT PRESENTATION LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR: Table of Contents / Thumbnails Drawer --- */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 268, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="overflow-y-auto flex-shrink-0 z-10 flex flex-col justify-between select-none bg-[#12131c] border-r border-white/8"
            >
              <div className="p-3.5 flex flex-col gap-3">
                {/* Sidebar header com gradiente sutil */}
                <div className="flex justify-between items-center pb-2 border-b border-white/8">
                  <span className="text-[9px] font-black tracking-[0.18em] uppercase text-slate-500 font-mono">Índice</span>
                  <span className="rounded-md px-2 py-0.5 text-[9px] font-black font-mono bg-[#0054ec]/15 text-[#00fafb] border border-[#0054ec]/25">
                    {slidesData.length} slides
                  </span>
                </div>

                {/* Slides thumbnail stack */}
                <div className="flex flex-col gap-1">
                  {slidesData.map((item, idx) => {
                    const isActive = idx === currentSlideIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectSlide(idx)}
                        className={`w-full px-2.5 py-2 rounded-lg border text-left flex items-center gap-3 transition-all outline-none ${
                          isActive
                            ? 'bg-[#0054ec]/15 border-[#0054ec]/50 shadow-sm shadow-[#0054ec]/10'
                            : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/8'
                        }`}
                      >
                        {/* Número */}
                        <span className={`w-6 h-6 rounded-md font-mono font-black text-[10px] flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-[#0054ec] text-white' : 'bg-white/8 text-slate-400'
                        }`}>
                          {item.number}
                        </span>

                        <div className="flex flex-col gap-0 truncate flex-1">
                          <span className={`text-[11px] leading-snug font-semibold truncate ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}>
                            {item.title}
                          </span>
                          <span className="text-[8.5px] font-bold text-slate-600 tracking-wider uppercase leading-none truncate">
                            {item.category === 'cover' ? 'Capa' :
                             item.category === 'divider' ? 'Divisor' :
                             item.category === 'expeditions' ? 'Expedição' :
                             item.category === 'financials' ? 'Financeiro' :
                             item.category === 'operations' ? 'Operações' :
                             item.category === 'insurance' ? 'Seguro' : 'Contato'}
                          </span>
                        </div>

                        {/* Linha lateral ativa */}
                        {isActive && <div className="w-0.5 h-6 rounded-full bg-gradient-to-b from-[#0054ec] to-[#00fafb] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rodapé do sidebar */}
              <div className="p-3.5 border-t border-white/8 bg-[#0d0f17]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-[11px] bg-gradient-to-br from-[#0054ec] to-[#2226c0] text-white">
                    BH
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-[12px] text-slate-200 truncate">Bruna Higa</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-0.5">Gestora de Seguros</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* --- CENTRAL WORKSPACE: PowerPoint Slide Viewport --- */}
        <main
          ref={mainContainerRef}
          className={`relative overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? 'p-0 bg-[#151720] w-screen h-screen flex flex-col justify-between'
              : 'flex-1 bg-[#0d0f17] flex flex-col justify-between p-6 md:p-8 bg-[radial-gradient(#1a1d2e_1.2px,transparent_1.2px)] [background-size:28px_28px]'
          }`}
          id="slide-presentation-viewport-wrapper"
        >
          {/* Slides display frame container with premium layout border & lighting shadow */}
          <div className={`transition-colors duration-300 flex flex-col justify-between overflow-hidden relative ${
            isFullscreen 
              ? 'flex-1 bg-[#151720] rounded-none p-10 md:p-16 w-full h-full'
              : 'flex-1 bg-[#151720] border border-white/10 rounded-2xl p-6 md:p-9 shadow-2xl shadow-black/60 w-full max-w-6xl mx-auto my-auto min-h-[580px] max-h-[80vh] lg:max-h-[74vh] xl:max-h-[78vh] ring-1 ring-[#0054ec]/10'
          }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ 
                  opacity: 0, 
                  x: slideDirection === 'forward' ? 50 : -50 
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ 
                  opacity: 0, 
                  x: slideDirection === 'forward' ? -50 : 50 
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="h-full flex flex-col justify-between"
              >
                <SlideViewer slide={currentSlide} isFullscreen={isFullscreen} isDarkMode={isDarkMode} />
              </motion.div>
            </AnimatePresence>

            {/* Quick left/right floating controls */}
            <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100 z-10">
              <button
                onClick={goToPrevSlide}
                className="w-9 h-9 rounded-full bg-[#151720]/90 backdrop-blur border border-white/15 text-slate-400 hover:text-white hover:border-[#0054ec]/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                title="Slide Anterior"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100 z-10">
              <button 
                onClick={goToNextSlide}
                className="w-9 h-9 rounded-full bg-[#151720]/90 backdrop-blur border border-white/15 text-slate-400 hover:text-white hover:border-[#0054ec]/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                title="Próximo Slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Bottom play bar */}
          <div className={isFullscreen
            ? "absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#151720]/95 backdrop-blur-md shadow-2xl border border-white/10 px-6 py-2.5 rounded-2xl z-30 opacity-20 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-row items-center gap-6"
            : "mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 select-none w-full max-w-6xl mx-auto"
          }>
            {/* Timeline dotted bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {slidesData.map((slide, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => selectSlide(idx)}
                    className="group relative flex items-center justify-center py-1 outline-none"
                  >
                    <div className={`h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-6 bg-gradient-to-r from-[#0054ec] to-[#00fafb]'
                        : 'w-2 bg-white/15 hover:bg-[#0054ec]/60'
                    }`} />
                    <span className="absolute bottom-5 bg-[#151720] border border-white/15 text-white text-[9px] font-semibold px-2 py-1 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {slide.number}. {slide.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Controller */}
            <div className="flex items-center gap-3 bg-[#151720] border border-white/10 px-4 py-2 rounded-xl shadow-lg">

              {/* Autoplay controllers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                    isPlaying
                      ? 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25'
                      : 'bg-[#0054ec]/15 text-[#00fafb] border-[#0054ec]/30 hover:bg-[#0054ec]/25'
                  }`}
                  title={isPlaying ? "Pausar" : "Auto-play"}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>

                {isPlaying && (
                  <select
                    value={autoplaySpeed}
                    onChange={(e) => setAutoplaySpeed(Number(e.target.value))}
                    className="text-[10px] font-black text-slate-400 bg-white/5 border border-white/10 rounded px-2 py-1 outline-none"
                    title="Velocidade"
                  >
                    <option value={4000}>4s</option>
                    <option value={8000}>8s</option>
                    <option value={12000}>12s</option>
                    <option value={16000}>16s</option>
                  </select>
                )}
              </div>

              <div className="w-px h-5 bg-slate-200" />

              {/* Fullscreen control */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                title={isFullscreen ? "Sair da Tela Cheia" : "Apresentar em Tela Cheia (F)"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <div className="w-px h-4 bg-white/10" />

              {/* Page Navigator */}
              <span className="font-mono text-[10px] font-black text-slate-500">
                <span className="text-white">{currentSlideIndex + 1}</span>
                <span className="mx-1 text-slate-600">/</span>
                {slidesData.length}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* 3. MODAL HELP SHORTCUTS PANEL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" id="help-modal">
          <div className="bg-[#151720] border border-white/12 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
              <Sparkles size={16} className="text-[#00fafb]" />
              <h3 className="text-sm font-black text-white font-serif uppercase tracking-wide">Atalhos de Teclado</h3>
            </div>

            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-400">
              {[
                { label: 'Próximo Slide', key: 'ESPAÇO / →' },
                { label: 'Slide Anterior', key: '← ESQUERDA' },
                { label: 'Tela Cheia', key: 'Tecla F' },
                { label: 'Fechar Ajuda', key: 'ESC' },
              ].map(({ label, key }) => (
                <div key={label} className="flex justify-between items-center bg-white/5 px-3 py-2.5 rounded-lg border border-white/8">
                  <span className="text-slate-300">{label}</span>
                  <span className="font-mono bg-white/8 border border-white/12 rounded px-2 py-0.5 text-[10px] text-[#00fafb] font-black">{key}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full text-center text-white text-xs font-bold py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ backgroundColor: '#0054ec' }}
            >
              Compreendi!
            </button>
          </div>
        </div>
      )}

      {/* Hidden 1280x720 stage for PPT export capture */}
      {currentCaptureIndex !== null && (
        <div 
          className="fixed top-0 left-[-9999px] z-[-9999] pointer-events-none overflow-hidden"
          style={{ width: '1280px', height: '720px' }}
        >
          <div 
            id="ppt-capture-stage" 
            className={`w-[1280px] h-[720px] relative flex flex-col justify-between p-10 overflow-hidden ${
              isDarkMode ? 'bg-[#151720]' : 'bg-white'
            }`}
          >
            <SlideViewer 
              slide={slidesData[currentCaptureIndex]} 
              isFullscreen={true} 
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* PPTX Export Progress Overlay */}
      {exportProgress !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce" style={{ backgroundColor: '#fd11a4' + '1a', color: '#fd11a4' }}>
              <FileText size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-black text-slate-800 font-sans uppercase text-sm tracking-wide">Gerando PowerPoint 1280x720</h3>
              <p className="text-xs text-slate-400 font-medium px-4">Por favor, aguarde enquanto exportamos todos os slides mantendo o design widescreen e gráficos intactos.</p>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2 border border-slate-50 relative">
              <motion.div 
                className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(to right, #fd11a4, #fd5665)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(exportProgress / slidesData.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <span className="font-mono text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#fd11a4' }}>
              Slide {exportProgress} de {slidesData.length}
            </span>
          </div>
        </div>
      )}

      {/* ZIP Export Progress Overlay */}
      {zipProgress !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce" style={{ backgroundColor: '#2226c01a', color: '#2226c0' }}>
              <Layers size={32} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-black text-slate-800 font-sans uppercase text-sm tracking-wide">Gerando ZIP de Imagens</h3>
              <p className="text-xs text-slate-400 font-medium px-4">Por favor, aguarde enquanto capturamos e empacotamos todos os slides como imagens de alta resolução.</p>
            </div>
            
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2 border border-slate-50 relative">
              <motion.div 
                className="h-full rounded-full" style={{ background: 'linear-gradient(to right, #2226c0, #0054ec)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(zipProgress / slidesData.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <span className="font-mono text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#2226c0' }}>
              Slide {zipProgress} de {slidesData.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
