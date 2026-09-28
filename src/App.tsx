import React, { useState } from 'react';
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
  Download,
  Copy,
  BookOpen
} from 'lucide-react';

async function safeFetchJson<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const text = await response.text();

  if (!text || text.trim().length === 0) {
    throw new Error(`Lege respons ontvangen van de server (HTTP ${response.status}).`);
  }

  // Check if response is HTML (e.g. server warmup or proxy error)
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
      // Convert SVG or image URL to base64 PNG
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
      // Immediately switch to the Step-by-Step SolidWorks Guide for the uploaded sketch
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
      // Update guide as well with refined data
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

  const handleTabSelect = (tab: 'dashboard' | 'guide' | 'json') => {
    setActiveTab(tab);
    if (tab === 'guide' && !guideMarkdown && !isGeneratingGuide && analysisResult) {
      handleGenerateGuide();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
      <Header onOpenGuide={() => setShowGuide(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert */}
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

        {/* SketchPad Canvas Modal / View */}
        {showSketchPad && (
          <SketchPad
            onSaveSketch={(dataUrl) => {
              setSelectedImageUrl(dataUrl);
              setShowSketchPad(false);
            }}
            onCancel={() => setShowSketchPad(false)}
          />
        )}

        {/* Paste JSON Modal */}
        <PasteJsonModal
          isOpen={showPasteJsonModal}
          onClose={() => setShowPasteJsonModal(false)}
          onSubmitJson={handleLoadPastedJson}
        />

        {/* Main Content: Uploader vs Results */}
        {!analysisResult ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                SolidWorks CAD Vision Expert
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Handgetekende Schets naar SolidWorks Model
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Herken automatisch 2D geometrieën, interpreteer de 3D-modellering intentie (Extrude, Revolve, Cut, Fillet, Hole Wizard), en genereer een gestructureerde JSON-analyse en stap-voor-stap handleiding voor beginners.
              </p>
            </div>

            <SketchUploader
              onSelectImage={(url) => setSelectedImageUrl(url)}
              selectedImageUrl={selectedImageUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onOpenSketchPad={() => setShowSketchPad(true)}
              onOpenPasteJson={() => setShowPasteJsonModal(true)}
            />
          </div>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
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

            {/* Active Tab View */}
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
                    isLoading={isGeneratingGuide}
                    partTitle={analysisResult.suggested_solidworks_features[0]?.feature || 'Model'}
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

      {/* CAD Guide Modal */}
      <CadGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}

