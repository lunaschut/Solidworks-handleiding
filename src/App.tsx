import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SketchUploader } from './components/SketchUploader';
import { SketchPad } from './components/SketchPad';
import { AnalysisOverview } from './components/AnalysisOverview';
import { JsonViewer } from './components/JsonViewer';
import { GuideViewer } from './components/GuideViewer';
import { CadGuideModal } from './components/CadGuideModal';
import { PasteJsonModal } from './components/PasteJsonModal';
import { convertToPngBase64 } from './utils/imageHelper';
import { SolidWorksAnalysisResult } from './types';
import {
  Layers,
  FileCode,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Copy,
  BookOpen,
  CalendarDays,
  FolderOpen,
  Image as ImageIcon,
  ArrowRight,
  Home
} from 'lucide-react';

interface SavedGuide {
  id: string;
  title: string;
  createdAt: string;
  previewUrl: string | null;
  guideMarkdown: string;
  analysis: SolidWorksAnalysisResult | null;
}

const STORAGE_KEY = 'solidworks-saved-guides-v1';

function getSavedGuides(): SavedGuide[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function buildProductTitle(analysis?: SolidWorksAnalysisResult | null): string {
  if (!analysis) return 'SolidWorks product';

  const intentTitle = analysis.interpreted_3d_intent?.[0]?.intent;
  if (intentTitle && intentTitle.trim()) {
    return intentTitle.replace(/\s*met\s*.*$/i, '').replace(/\s*voor\s*.*$/i, '').trim() || 'SolidWorks product';
  }

  const shapeTitle = analysis.detected_shapes?.[0]?.shape;
  if (shapeTitle && shapeTitle.trim()) {
    return shapeTitle.trim();
  }

  const featureTitle = analysis.suggested_solidworks_features?.[0]?.feature;
  if (featureTitle && featureTitle.trim()) {
    return featureTitle.trim();
  }

  return 'SolidWorks product';
}

async function safeFetchJson<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();

  if (!text || text.trim().length === 0) {
    throw new Error(`Lege respons ontvangen van de server (HTTP ${response.status}).`);
  }

  const trimmedLower = text.trim().toLowerCase();
  if (trimmedLower.startsWith('<!doctype') || trimmedLower.startsWith('<html') || text.includes('Please wait while your application starts')) {
    throw new Error('De SolidWorks analyseserver is momenteel aan het opstarten. Probeer het over enkele ogenblikken opnieuw.');
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Ongeldig dataformaat ontvangen van de server (HTTP ${response.status}).`);
  }

  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.error || `Serveraanvraag mislukt met code ${response.status}.`);
  }

  return data as T;
}

export default function App() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SolidWorksAnalysisResult | null>(null);
  const [guideMarkdown, setGuideMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guide' | 'json'>('dashboard');
  const [showSketchPad, setShowSketchPad] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showPasteJsonModal, setShowPasteJsonModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'saved-guides' | 'saved-guide-detail'>('home');
  const [savedGuides, setSavedGuides] = useState<SavedGuide[]>(() => getSavedGuides());
  const [selectedSavedGuide, setSelectedSavedGuide] = useState<SavedGuide | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGuides));
    }
  }, [savedGuides]);

  const handleGenerateGuide = async (customNotes?: string, targetAnalysis?: SolidWorksAnalysisResult) => {
    const analysisToUse = targetAnalysis || analysisResult;
    if (!analysisToUse) return;

    setIsGeneratingGuide(true);
    setError(null);

    try {
      const resData = await safeFetchJson<{ success: boolean; guideMarkdown: string }>('/api/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: analysisToUse,
          additionalNotes: customNotes || '',
        }),
      });

      setGuideMarkdown(resData.guideMarkdown);
    } catch (err: any) {
      console.error('Handleiding genereren fout:', err);
      setError(err?.message || 'Er is een fout opgetreden bij het genereren van de handleiding.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleAnalyze = async (additionalNotes: string) => {
    if (!selectedImageUrl) return;

    setIsLoading(true);
    setError(null);
    setGuideMarkdown(null);

    try {
      const { base64, mimeType } = await convertToPngBase64(selectedImageUrl);

      const resData = await safeFetchJson<{ success: boolean; data: SolidWorksAnalysisResult }>('/api/analyze-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          additionalNotes,
        }),
      });

      setAnalysisResult(resData.data);
      setActiveTab('guide');
      handleGenerateGuide(additionalNotes, resData.data);
    } catch (err: any) {
      console.error('Analyse fout:', err);
      setError(err?.message || 'Er is een fout opgetreden bij het verwerken van de schets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (userClarifications: string) => {
    if (!analysisResult) return;

    setIsRefining(true);
    setError(null);

    try {
      let base64 = '';
      let mimeType = 'image/png';
      if (selectedImageUrl) {
        const converted = await convertToPngBase64(selectedImageUrl);
        base64 = converted.base64;
        mimeType = converted.mimeType;
      }

      const resData = await safeFetchJson<{ success: boolean; data: SolidWorksAnalysisResult }>('/api/refine-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          previousAnalysis: analysisResult,
          userClarifications,
        }),
      });

      setAnalysisResult(resData.data);
      handleGenerateGuide(userClarifications, resData.data);
    } catch (err: any) {
      console.error('Verfijn fout:', err);
      setError(err?.message || 'Fout bij het bijwerken van de analyse.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleLoadPastedJson = (parsedData: SolidWorksAnalysisResult) => {
    setAnalysisResult(parsedData);
    setSelectedImageUrl(null);
    setActiveTab('guide');
    handleGenerateGuide(undefined, parsedData);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSelectedImageUrl(null);
    setGuideMarkdown(null);
    setActiveTab('dashboard');
    setError(null);
  };

  const handleCopyJson = async () => {
    if (!analysisResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(analysisResult, null, 2));
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGuide = () => {
    if (!guideMarkdown) return;

    const newSavedGuide: SavedGuide = {
      id: `${Date.now()}`,
      title: buildProductTitle(analysisResult),
      createdAt: new Date().toISOString(),
      previewUrl: selectedImageUrl,
      guideMarkdown,
      analysis: analysisResult,
    };

    setSavedGuides((prev) => {
      const exists = prev.some(
        (item) => item.guideMarkdown === guideMarkdown && item.previewUrl === selectedImageUrl
      );

      if (exists) return prev;
      return [newSavedGuide, ...prev];
    });
  };

  const handleOpenSavedGuide = (guide: SavedGuide) => {
    setSelectedSavedGuide(guide);
    setCurrentView('saved-guide-detail');
    setAnalysisResult(guide.analysis || null);
    setSelectedImageUrl(guide.previewUrl || null);
    setGuideMarkdown(guide.guideMarkdown);
    setActiveTab('guide');
    setError(null);
  };

  const handleBackToSavedGuides = () => {
    setCurrentView('saved-guides');
    setSelectedSavedGuide(null);
    setActiveTab('guide');
  };

  const handleTabSelect = (tab: 'dashboard' | 'guide' | 'json') => {
    setActiveTab(tab);
    if (tab === 'guide' && !guideMarkdown && !isGeneratingGuide && analysisResult) {
      handleGenerateGuide();
    }
  };

  const isCurrentGuideSaved = guideMarkdown
    ? savedGuides.some((item) => item.guideMarkdown === guideMarkdown && item.previewUrl === selectedImageUrl)
    : false;

  const renderSavedGuidesPage = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Mijn handleidingen</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Opgeslagen SolidWorks handleidingen</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-xs">
          <FolderOpen className="w-4 h-4 text-red-600" />
          <span>{savedGuides.length} opgeslagen</span>
        </div>
      </div>

      {savedGuides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Nog geen handleidingen opgeslagen</h3>
          <p className="mt-2 text-sm text-slate-500">
            Genereer een handleiding op de homepagina en sla deze hier op voor later gebruik.
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>Terug naar Home</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {savedGuides.map((guide) => (
            <article key={guide.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-transform hover:-translate-y-0.5">
              <div className="relative h-40 overflow-hidden border-b border-slate-200 bg-slate-100">
                {guide.previewUrl ? (
                  <img src={guide.previewUrl} alt={guide.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                      <span className="text-xs">Geen preview beschikbaar</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{guide.title}</h3>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(guide.createdAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenSavedGuide(guide)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Handleiding bekijken</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  const renderSavedGuideDetailPage = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handleBackToSavedGuides}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>Terug naar Mijn handleidingen</span>
        </button>

        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-xs">
          {selectedSavedGuide ? new Date(selectedSavedGuide.createdAt).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }) : 'Handleiding'}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">Opgeslagen handleiding</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {selectedSavedGuide?.title || 'SolidWorks handleiding'}
            </h2>
          </div>

          {selectedSavedGuide?.previewUrl && (
            <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img src={selectedSavedGuide.previewUrl} alt={selectedSavedGuide.title} className="h-24 w-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {guideMarkdown && (
        <GuideViewer
          guideMarkdown={guideMarkdown}
          onRegenerate={() => {}}
          onSaveGuide={undefined}
          isLoading={false}
          partTitle={selectedSavedGuide?.title || 'SolidWorks handleiding'}
          showSaveButton={false}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      <Header
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateSavedGuides={() => setCurrentView('saved-guides')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-600 font-semibold hover:underline"
            >
              Sluiten
            </button>
          </div>
        )}

        {showSketchPad && (
          <SketchPad
            onSaveSketch={(dataUrl) => {
              setSelectedImageUrl(dataUrl);
              setShowSketchPad(false);
            }}
            onCancel={() => setShowSketchPad(false)}
          />
        )}

        <PasteJsonModal
          isOpen={showPasteJsonModal}
          onClose={() => setShowPasteJsonModal(false)}
          onSubmitJson={handleLoadPastedJson}
        />

        {currentView === 'saved-guides' ? (
          renderSavedGuidesPage()
        ) : currentView === 'saved-guide-detail' ? (
          renderSavedGuideDetailPage()
        ) : !analysisResult ? (
          <div className="max-w-6xl mx-auto space-y-8">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:min-h-[320px]">
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    SolidWorks CAD Vision Expert
                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    Van schets naar SolidWorks-model
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    Upload een handgetekende schets en laat de AI je helpen begrijpen welke vormen, features en stappen nodig zijn om het product in SolidWorks op te bouwen.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Waarom bestaat deze hulptool?</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Deze tool helpt productontwerpers en studenten om 2D-schetsen om te zetten naar duidelijke 3D-modelleerstappen in SolidWorks.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-amber-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Hoe werkt het?</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Upload je schets, analyseert de AI de vormen en genereert een duidelijke stap-voor-stap handleiding met de juiste SolidWorks-functies.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <SketchUploader
              onSelectImage={(url) => setSelectedImageUrl(url)}
              selectedImageUrl={selectedImageUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onOpenSketchPad={() => setShowSketchPad(true)}
              onOpenPasteJson={() => setShowPasteJsonModal(true)}
              onOpenGuide={() => setShowGuide(true)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                {activeTab === 'guide' && (
                  <button
                    onClick={handleReset}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Home className="h-4 w-4" />
                    <span>Terug naar Home</span>
                  </button>
                )}

                <button
                  onClick={() => handleTabSelect('guide')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'guide'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Stap-voor-stap Handleiding (SolidWorks CAD)</span>
                  {isGeneratingGuide && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin ml-1" />
                  )}
                </button>

                <button
                  onClick={() => handleTabSelect('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>CAD Inspectie &amp; Feature Tree</span>
                </button>

                <button
                  onClick={() => handleTabSelect('json')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Puur JSON Output</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  {copiedNotification ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">JSON Gekopieerd!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Kopieer JSON</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nieuwe Schets / JSON</span>
                </button>
              </div>
            </div>

            {activeTab === 'dashboard' && (
              <AnalysisOverview
                data={analysisResult}
                onRefine={handleRefine}
                isRefining={isRefining}
                sketchPreviewUrl={selectedImageUrl || ''}
                onOpenGuide={() => handleTabSelect('guide')}
              />
            )}

            {activeTab === 'guide' && (
              <div>
                {isGeneratingGuide && !guideMarkdown ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center animate-pulse">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      SolidWorks Modelleerhandleiding voor Beginners wordt geschreven...
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      De AI CAD-docent vertaalt de analyse naar een geordende Feature Tree handleiding met actie-instructies, [VUL IN] tags en validatiecontroles.
                    </p>
                  </div>
                ) : guideMarkdown ? (
                  <GuideViewer
                    guideMarkdown={guideMarkdown}
                    onRegenerate={(notes) => handleGenerateGuide(notes)}
                    onSaveGuide={handleSaveGuide}
                    isLoading={isGeneratingGuide}
                    partTitle={buildProductTitle(analysisResult)}
                    isSaved={isCurrentGuideSaved}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                    <p className="text-xs text-slate-600">
                      Nog geen handleiding gegenereerd voor deze analyse.
                    </p>
                    <button
                      onClick={() => handleGenerateGuide()}
                      disabled={isGeneratingGuide}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors inline-flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Genereer Handleiding Nu</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'json' && (
              <JsonViewer data={analysisResult} />
            )}
          </div>
        )}
      </main>

      <CadGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}

