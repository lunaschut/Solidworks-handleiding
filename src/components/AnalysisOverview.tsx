import React, { useState } from 'react';
import {
  SolidWorksAnalysisResult,
  ConfidenceLevel,
  ComplexityLevel
} from '../types';
import { FeatureTree } from './FeatureTree';
import {
  Shapes,
  Box,
  HelpCircle,
  ShieldCheck,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  BookOpen
} from 'lucide-react';

interface AnalysisOverviewProps {
  data: SolidWorksAnalysisResult;
  onRefine: (answers: string) => Promise<void>;
  isRefining: boolean;
  sketchPreviewUrl: string;
  onOpenGuide?: () => void;
}


function getConfidencePill(conf: ConfidenceLevel) {
  switch (conf) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Hoog
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3 h-3" /> Middel
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">
          <AlertCircle className="w-3 h-3" /> Laag
        </span>
      );
  }
}

function getComplexityBadge(comp: ComplexityLevel) {
  switch (comp) {
    case 'low':
      return {
        label: 'Lage Complexiteit (Low)',
        desc: 'Eenvoudig prismatisch of rotatiedeel (1-3 basisfuncties)',
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      };
    case 'medium':
      return {
        label: 'Gemiddelde Complexiteit (Medium)',
        desc: 'Meerdere bewerkingen, tapgaten, afrondingen of ribben',
        classes: 'bg-amber-50 text-amber-800 border-amber-300',
      };
    case 'high':
      return {
        label: 'Hoge Complexiteit (High)',
        desc: 'Complexe gegoten/gesmede vormen, lofts, sweeps of samengestelde aanzichten',
        classes: 'bg-rose-50 text-rose-800 border-rose-300',
      };
    default:
      return {
        label: comp,
        desc: '',
        classes: 'bg-slate-50 text-slate-800 border-slate-300',
      };
  }
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  data,
  onRefine,
  isRefining,
  sketchPreviewUrl,
  onOpenGuide,
}) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [customClarification, setCustomClarification] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const complexity = getComplexityBadge(data.complexity_level);

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const compiledAnswers: string[] = [];
    data.missing_info_questions.forEach((q, idx) => {
      if (answers[idx] && answers[idx].trim()) {
        compiledAnswers.push(`Vraag: ${q.question}\nAntwoord: ${answers[idx].trim()}`);
      }
    });

    if (customClarification.trim()) {
      compiledAnswers.push(`Extra opmerkingen: ${customClarification.trim()}`);
    }

    if (compiledAnswers.length === 0) {
      alert('Vul minimaal één antwoord of opmerking in om de analyse te verfijnen.');
      return;
    }

    onRefine(compiledAnswers.join('\n\n'));
  };

  return (
    <div className="space-y-6">
      {/* Complexity and Sketch Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {sketchPreviewUrl && (
            <div className="relative group cursor-pointer" onClick={() => setShowImageModal(true)}>
              <img
                src={sketchPreviewUrl}
                alt="Geanalyseerde schets"
                className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              SolidWorks CAD Beoordeling
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${complexity.classes}`}>
                {complexity.label}
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                {complexity.desc}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Bekijk Stap-voor-stap Handleiding</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Parametrische Feature Tree gereed</span>
          </div>
        </div>
      </div>


      {/* Grid: 2D Detected Shapes & 3D Interpretations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2D Shapes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Shapes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Gedetecteerde 2D Vormen
                </h3>
                <p className="text-xs text-slate-500">
                  Lijnen, cirkels, sleufgaten en geometrische contouren
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              {data.detected_shapes.length} vormen
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {data.detected_shapes.map((shape, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-1">
                    <span className="font-semibold text-xs text-slate-900 leading-tight">
                      {shape.shape}
                    </span>
                    {getConfidencePill(shape.confidence)}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Locatie: <span className="text-slate-700 font-medium">{shape.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Intent */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Geïnterpreteerde 3D Intentie
                </h3>
                <p className="text-xs text-slate-500">
                  Volumetrische bewerkingen (extrusie, revolve, pocket, gaten)
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              {data.interpreted_3d_intent.length} intenties
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {data.interpreted_3d_intent.map((intent, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    {intent.intent}
                  </span>
                  {getConfidencePill(intent.confidence)}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-700">
                    Feature: {intent.feature_guess}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested SolidWorks Features Tree */}
      <FeatureTree features={data.suggested_solidworks_features} />

      {/* Assumptions and Missing Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engineering Assumptions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Gemaakte CAD Aannames (Assumptions)
              </h3>
              <p className="text-xs text-slate-500">
                Aannames over symmetrie, wanddiktes en toleranties wegens schetskwaliteit
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {data.assumptions.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                <h4 className="text-xs font-semibold text-slate-900 mb-1">
                  • {item.assumption}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-medium text-slate-700">Reden:</span> {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Info Questions & Interactive Clarification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Kritieke Ontbrekende Info &amp; Vragen
              </h3>
              <p className="text-xs text-slate-500">
                Informatie nodig voor exacte SolidWorks parametrisatie
              </p>
            </div>
          </div>

          <form onSubmit={handleRefineSubmit} className="space-y-3">
            {data.missing_info_questions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{q.question}</p>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      <span className="font-medium">Waarom cruciaal:</span> {q.why_it_matters}
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Typ jouw antwoord (bijv: 'Diepte is 20mm blind' of 'Symmetrisch rond as')..."
                  value={answers[idx] || ''}
                  onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            ))}

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Aanvullende wensen / ontwerpeisen (optioneel):
              </label>
              <textarea
                rows={2}
                placeholder="Bijvoorbeeld: 'Materiaal is aluminium 6061, afrondingen overal R3 tenzij anders aangegeven'..."
                value={customClarification}
                onChange={(e) => setCustomClarification(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={isRefining}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {isRefining ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>CAD Analyse wordt verfijnd...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-red-400" />
                  <span>Verfijn SolidWorks Analyse met deze Antwoorden</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Modal for full size sketch preview */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-4 shadow-xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Geanalyseerde Technische Schets</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 rounded-md bg-slate-100"
              >
                Sluiten
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto">
              <img
                src={sketchPreviewUrl}
                alt="Originele technische schets"
                className="max-h-[70vh] object-contain rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
