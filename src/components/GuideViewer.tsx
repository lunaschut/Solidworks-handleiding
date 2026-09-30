import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import {
  BookOpen,
  Copy,
  CheckCircle2,
  Download,
  Sparkles,
  RefreshCw,
  HelpCircle,
  CheckSquare,
  Square,
  Maximize2,
  X,
  MapPin,
  ExternalLink,
  Keyboard,
  Info,
  ZoomIn
} from 'lucide-react';
import { findSolidWorksTool, SolidWorksToolInfo } from '../utils/solidworksTools';

interface GuideViewerProps {
  guideMarkdown: string;
  onRegenerate: (notes: string) => void;
  onSaveGuide?: () => void;
  isLoading: boolean;
  partTitle?: string;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

export const GuideViewer: React.FC<GuideViewerProps> = ({
  guideMarkdown,
  onRegenerate,
  onSaveGuide,
  isLoading,
  partTitle = 'SolidWorks Model',
  isSaved = false,
  showSaveButton = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [extraNotes, setExtraNotes] = useState('');
  const [showRegenerateBox, setShowRegenerateBox] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string; tool?: SolidWorksToolInfo | null } | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(guideMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([guideMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = partTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `solidworks-handleiding-${safeTitle || 'product'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Robust parser to extract numbered steps for the student progress checklist
  const stepMatches = useMemo(() => {
    const primaryMatches = Array.from(
      guideMarkdown.matchAll(/(?:^|\n)(?:###\s*)?(Stap\s+\d+:[^\n]+)/gi),
      (m) => m[1].replace(/\*\*/g, '').trim()
    );

    if (primaryMatches.length > 0) {
      return primaryMatches;
    }

    // Fallback if numbered list or other format was returned
    const fallbackMatches = Array.from(
      guideMarkdown.matchAll(/(?:^|\n)\d+\.\s+\*?\*?(Stap\s+\d+:[^\n*]+)\*?\*?/gi),
      (m) => m[1].trim()
    );
    return fallbackMatches;
  }, [guideMarkdown]);

  const toggleStep = (stepIdx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepIdx]: !prev[stepIdx] }));
  };

  const scrollToStep = (stepIdx: number) => {
    const el = document.getElementById(`step-anchor-${stepIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = stepMatches.length > 0 ? Math.round((completedCount / stepMatches.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 ring-4 ring-red-50/50">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Stap-voor-stap Handleiding voor SolidWorks CAD
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                Met Visuele Knopmarkeringen
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Iedere stap bevat een duidelijke uitleg, de exacte SolidWorks-functie en een gemarkeerde CommandManager-afbeelding met een rode cirkel.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showSaveButton && (
            <button
              onClick={onSaveGuide}
              disabled={!onSaveGuide || isSaved}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Opgeslagen' : 'Handleiding opslaan'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Gekopieerd!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Kopieer Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>

          <button
            onClick={() => setShowRegenerateBox(!showRegenerateBox)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Maten opgeven / Aanpassen</span>
          </button>
        </div>
      </div>

      {/* Optional regeneration / extra guidance box */}
      {showRegenerateBox && (
        <div className="bg-red-50/40 rounded-2xl border border-red-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Handleiding verfijnen met specifieke maten of voorkeuren
            </h4>
            <button
              onClick={() => setShowRegenerateBox(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Sluiten
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Wil je concrete maten invullen voor de [VUL IN] parameters (bijv. "buitendiameter 150 mm, dikte 12 mm, asgat 40 mm") of een specifieke feature forceren? Voer ze hier in:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Bijv. 'Basisdiameter is 160mm, flensdikte 15mm, 6x M8 gaten op PCD 130mm'..."
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <button
              onClick={() => {
                onRegenerate(extraNotes);
                setShowRegenerateBox(false);
              }}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Bezig...' : 'Handleiding Bijwerken'}
            </button>
          </div>
        </div>
      )}

      {/* Two Column Layout: Quick Checklist on Left / Rendered Markdown Guide on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick SolidWorks Checklist (if steps exist) */}
        {stepMatches.length > 0 && (
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs sticky top-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-red-600" />
                  Voortgang Student
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {completedCount} / {stepMatches.length} stappen ({progressPct}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 mb-3">
                Vink de stappen af terwijl je ze in SolidWorks bouwt:
              </p>

              <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-1">
                {stepMatches.map((stepStr, idx) => {
                  const stepNumberMatch = stepStr.match(/Stap\s+(\d+):/i);
                  const stepNum = stepNumberMatch ? stepNumberMatch[1] : `${idx + 1}`;
                  const stepText = stepStr.replace(/Stap\s+\d+:\s*/i, '');
                  const isChecked = !!completedSteps[idx];

                  // Check if tool can be inferred from text
                  const toolInfo = findSolidWorksTool(stepText);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`group flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 shrink-0 cursor-pointer"
                        aria-label="Toggle step"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(idx);
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isChecked ? 'bg-emerald-200/60 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            Stap {stepNum}
                          </span>
                          {toolInfo && (
                            <span className="text-[9px] font-medium text-slate-500 truncate max-w-[120px]">
                              {toolInfo.name}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToStep(idx);
                            }}
                            className="text-[10px] text-slate-400 hover:text-red-600 transition-colors ml-auto opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Spring naar stap in handleiding"
                          >
                            Bekijk ↓
                          </button>
                        </div>
                        <p className={`text-[11px] leading-snug mt-1 line-clamp-2 ${isChecked ? 'line-through opacity-70' : ''}`}>
                          {stepText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Tip: Klik op een werkbalkafbeelding om in te zoomen op de knop!</span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Rendered Markdown Content with distinct step blocks and visual button callouts */}
        <div className={stepMatches.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-xl prose-h1:text-slate-900 prose-h2:text-sm prose-h2:font-bold prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-red-700 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4 prose-p:text-xs prose-p:leading-relaxed prose-p:text-slate-700 prose-li:text-xs prose-li:text-slate-700 prose-strong:text-slate-900 prose-code:text-red-700 prose-code:bg-red-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-table:text-xs">
              <Markdown
                components={{
                  // Render paragraphs that start with "Stap X:" as prominent, beautifully structured step cards
                  p: ({ children }) => {
                    const childNodes = React.Children.toArray(children);
                    const firstChild = childNodes[0];
                    const firstString = typeof firstChild === 'string' ? firstChild.trim() : '';

                    // 1. Check for "Stap X:"
                    const stepMatch = firstString.match(/^Stap\s+(\d+):\s*(.*)/i);
                    if (stepMatch) {
                      const stepNum = parseInt(stepMatch[1], 10);
                      const stepIdx = stepNum - 1;
                      const restText = stepMatch[2];
                      const otherChildren = childNodes.slice(1);
                      const isCompleted = !!completedSteps[stepIdx];

                      return (
                        <div
                          id={`step-anchor-${stepIdx}`}
                          className={`mt-7 mb-4 p-4 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-gradient-to-r from-red-50/50 via-white to-slate-50/30 border-red-200/90 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-600 text-white shadow-xs tracking-wide shrink-0">
                                Stap {stepNum}
                              </span>
                              <div className="text-xs font-bold text-slate-900 leading-relaxed mt-0.5">
                                {restText}
                                {otherChildren}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleStep(stepIdx)}
                              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                              title={isCompleted ? 'Markeer als onvoltooid' : 'Markeer stap als voltooid'}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Klaar</span>
                                </>
                              ) : (
                                <>
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Afvinken</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // 2. Check for "SolidWorks-functie:" line
                    if (firstString.startsWith('SolidWorks-functie:') || firstString.startsWith('**SolidWorks-functie:**')) {
                      const cleanFunctionText = firstString
                        .replace(/^(\*\*)?SolidWorks-functie:(\*\*)?\s*/i, '')
                        .trim();
                      const toolInfo = findSolidWorksTool(cleanFunctionText);

                      return (
                        <div className="my-3 p-3 rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-xs font-black text-xs text-white">
                              SW
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                  SolidWorks-functie
                                </span>
                                {toolInfo && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-sky-400 border border-slate-700">
                                    Tab: {toolInfo.tab}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                                <span>{cleanFunctionText}</span>
                                {toolInfo?.shortcut && (
                                  <span className="text-[10px] font-mono text-amber-300 font-normal">
                                    ({toolInfo.shortcut})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {toolInfo?.location && (
                            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 max-w-full sm:max-w-xs">
                              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="truncate">{toolInfo.location}</span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 3. Check for "Afbeelding van de knop:" fallback text (when no direct image is available)
                    if (
                      firstString.startsWith('Afbeelding van de knop: Locatie in SolidWorks:') ||
                      firstString.startsWith('Afbeelding van de knop:') && firstString.includes('Geen directe')
                    ) {
                      return (
                        <div className="my-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-[11px] text-amber-950 uppercase tracking-wide">
                              Knoplocatie in SolidWorks
                            </span>
                            <span className="text-xs leading-relaxed text-amber-900">
                              {firstString.replace(/^Afbeelding van de knop:\s*/i, '')}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return <p className="text-xs leading-relaxed text-slate-700 my-2">{children}</p>;
                  },

                  // Custom render for Images: Provide authentic SolidWorks preview frame with zoom & red circle callout
                  img: ({ src, alt }) => {
                    const safeSrc = String(src || '');
                    const safeAlt = String(alt || 'SolidWorks knop');
                    const toolInfo = findSolidWorksTool(safeAlt);

                    return (
                      <div className="my-4 rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs hover:border-red-400 transition-all group">
                        {/* Image Ribbon Header Bar */}
                        <div className="px-3 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-200 animate-pulse" />
                            <span className="font-bold text-slate-800 text-[11px]">
                              Afbeelding van de knop (CommandManager weergave)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setZoomedImage({ src: safeSrc, alt: safeAlt, tool: toolInfo })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-300 cursor-pointer transition-colors"
                            title="Klik om te vergroten"
                          >
                            <ZoomIn className="w-3 h-3 text-red-600" />
                            <span>Vergroot</span>
                          </button>
                        </div>

                        {/* Interactive Image Container */}
                        <div
                          className="relative p-2.5 bg-slate-50 flex items-center justify-center cursor-zoom-in group-hover:bg-slate-100/60 transition-colors"
                          onClick={() => setZoomedImage({ src: safeSrc, alt: safeAlt, tool: toolInfo })}
                        >
                          <img
                            src={safeSrc}
                            alt={safeAlt}
                            className="w-full max-h-56 object-contain rounded-lg border border-slate-200/80 bg-white shadow-2xs"
                            loading="lazy"
                          />

                          {/* Hover floating badge */}
                          <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md">
                            <Maximize2 className="w-3 h-3 text-red-400" />
                            <span>Klik voor groot formaat</span>
                          </div>
                        </div>

                        {/* Image Caption & Location reminder */}
                        <div className="px-3.5 py-2 bg-slate-50/80 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span className="font-semibold text-slate-800">
                              Rode cirkel markeert de vereiste knop:
                            </span>
                            <span className="text-red-700 font-bold">{toolInfo?.name || safeAlt}</span>
                          </div>
                          {toolInfo?.location && (
                            <span className="text-slate-500 text-[10px]">
                              {toolInfo.location}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  },

                  // Also handle h3 if generated as heading
                  h3: ({ children }) => {
                    const textContent = React.Children.toArray(children)
                      .map((c) => (typeof c === 'string' ? c : ''))
                      .join('');
                    const stepMatch = textContent.match(/Stap\s+(\d+):\s*(.*)/i);

                    if (stepMatch) {
                      const stepNum = parseInt(stepMatch[1], 10);
                      const stepIdx = stepNum - 1;
                      const restText = stepMatch[2];
                      const isCompleted = !!completedSteps[stepIdx];

                      return (
                        <div
                          id={`step-anchor-${stepIdx}`}
                          className={`mt-7 mb-4 p-4 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-gradient-to-r from-red-50/50 via-white to-slate-50/30 border-red-200/90 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-red-600 text-white shadow-xs tracking-wide shrink-0">
                                Stap {stepNum}
                              </span>
                              <div className="text-xs font-bold text-slate-900 leading-relaxed mt-0.5">
                                {restText || children}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleStep(stepIdx)}
                              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Klaar</span>
                                </>
                              ) : (
                                <>
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Afvinken</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return <h3 className="text-sm font-bold text-slate-900 mt-6 mb-2">{children}</h3>;
                  },

                  // Custom bullet list items with distinct red dot
                  ul: ({ children }) => <ul className="space-y-1.5 my-2.5 pl-1">{children}</ul>,
                  li: ({ children }) => (
                    <li className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span className="flex-1">{children}</span>
                    </li>
                  ),

                  // Custom highlighted badges for [VUL IN] and [VRAAG]
                  code: ({ children }) => {
                    const str = String(children);
                    if (str.includes('[VUL IN') || str.includes('[VRAAG')) {
                      return (
                        <span className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-mono text-[11px] font-semibold">
                          {children}
                        </span>
                      );
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-red-600 font-mono text-[11px]">
                        {children}
                      </code>
                    );
                  },

                  // Styled tables for the parameters section
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-xs">
                      <table className="w-full text-xs text-left divide-y divide-slate-200">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-slate-50 font-semibold text-slate-700">{children}</thead>,
                  th: ({ children }) => <th className="px-3.5 py-2.5">{children}</th>,
                  td: ({ children }) => <td className="px-3.5 py-2 border-t border-slate-100 text-slate-700">{children}</td>,
                }}
              >
                {guideMarkdown}
              </Markdown>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for SolidWorks button screenshot */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                  SW
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    SolidWorks CommandManager Weergave
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    De vereiste knop is duidelijk gemarkeerd met een rode cirkel en kader
                  </p>
                </div>
              </div>

              <button
                onClick={() => setZoomedImage(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Sluiten"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Big Zoomed Image */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-center border border-slate-200 overflow-hidden">
              <img
                src={zoomedImage.src}
                alt={zoomedImage.alt}
                className="w-full max-h-[60vh] object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Footer tips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Locatie:</strong> {zoomedImage.tool?.location || 'CommandManager in SolidWorks'}
                </span>
              </div>
              {zoomedImage.tool?.shortcut && (
                <div className="flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    <strong>Sneltoets:</strong>{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-800">
                      {zoomedImage.tool.shortcut}
                    </kbd>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
