import React, { useState } from 'react';
import { X, FileCode, Sparkles, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { SolidWorksAnalysisResult } from '../types';

interface PasteJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitJson: (data: SolidWorksAnalysisResult) => void;
}

const SAMPLE_ANALYSIS_JSON: SolidWorksAnalysisResult = {
  detected_shapes: [
    {
      shape: "Cilindrische buitenomtrek (cirkel)",
      location: "Centraal aanzicht, buitenzijde",
      confidence: "high"
    },
    {
      shape: "Steekcirkel (PCD) met 4 symmetrische gaten",
      location: "Gelijkmatig verdeeld op 90 graden",
      confidence: "high"
    },
    {
      shape: "Centrale asboring met spiebaan (rechthoekige inkeping)",
      location: "Exact in het hart / centrum",
      confidence: "high"
    },
    {
      shape: "Getrapte doorsnede / flensrand",
      location: "Zijaanzicht met doorsnedearcering",
      confidence: "medium"
    }
  ],
  interpreted_3d_intent: [
    {
      intent: "Ronde basisflensplaat met een opstaande kraag/naaf",
      feature_guess: "Extruded Boss/Base of Revolved Boss/Base",
      confidence: "high"
    },
    {
      intent: "Centrale doorlopende asdoorgang voor een aandrijfas",
      feature_guess: "Extruded Cut (Through All)",
      confidence: "high"
    },
    {
      intent: "4x doorgangen of tapgaten voor flensbouten op steekcirkel",
      feature_guess: "Hole Wizard met Circular Pattern",
      confidence: "high"
    },
    {
      intent: "Afronding bij overgang flens naar naaf ter voorkoming van kerfwerking",
      feature_guess: "Fillet",
      confidence: "medium"
    }
  ],
  suggested_solidworks_features: [
    {
      feature: "Sketch",
      why: "Teken de basiscirkel op het Top Plane met centerpunt vastgezet aan Origin (0,0,0).",
      confidence: "high"
    },
    {
      feature: "Extruded Boss/Base",
      why: "Geef de basisschijf van de flens dikte met Blind extrusie.",
      confidence: "high"
    },
    {
      feature: "Extruded Boss/Base",
      why: "Teken een tweede cirkel op het bovenvlak voor de opstaande naaf.",
      confidence: "high"
    },
    {
      feature: "Extruded Cut",
      why: "Snijd de centrale boring inclusief spiebaan loodrecht door alle body's (Through All).",
      confidence: "high"
    },
    {
      feature: "Hole Wizard",
      why: "Plaats 1 boutgat op de steekcirkel met correcte boutmaat (bijv. M10 Through All).",
      confidence: "high"
    },
    {
      feature: "Pattern",
      why: "Gebruik Circular Pattern rond de hoofdas om het gat 4x gelijkmatig (90 graden) te dupliceren.",
      confidence: "high"
    },
    {
      feature: "Fillet",
      why: "Breng een spanningsverlagende afronding aan op de binnenhoek tussen basisschijf en naaf.",
      confidence: "medium"
    },
    {
      feature: "Chamfer",
      why: "Afschuining 1x45° aan de bovenzijde van de boring voor eenvoudige asmontage.",
      confidence: "low"
    }
  ],
  assumptions: [
    {
      assumption: "Flens is rotatiesymmetrisch rond de Z-as / centrale as",
      reason: "Handmatige hartlijnen (centerlines) kruisen exact in het midden van alle concentrische cirkels."
    },
    {
      assumption: "De 4 boutgaten zijn identiek en equidistant (90° hoekverdraaiing)",
      reason: "Steekcirkelnotatie toont '4x M10 op PCD Ø136'."
    },
    {
      assumption: "Wanddikte van de naaf is overal uniform",
      reason: "Geen indicatie van excentriciteit op de schets."
    }
  ],
  missing_info_questions: [
    {
      question: "Wat is de exacte dikte van de basisflens en de hoogte van de naaf?",
      why_it_matters: "Noodzakelijk voor de diepte-invoer in 'Extruded Boss/Base' (Blind maatvoering)."
    },
    {
      question: "Zijn de 4 gaten doorlopend met tapdraad (M10 tapgat) of zijn het doorlopende pasgaten (Ø11mm clearance hole)?",
      why_it_matters: "Bepaalt of Hole Wizard moet worden ingesteld op 'Tapped Hole' of 'Hole (Clearing)'."
    },
    {
      question: "Welke radius is gewenst voor de fillet overgang (bijv. R3 of R5)?",
      why_it_matters: "Belangrijk voor sterkteleer (kerffactor) en gereedschapsradius bij verspaning."
    }
  ],
  complexity_level: "medium"
};

export const PasteJsonModal: React.FC<PasteJsonModalProps> = ({
  isOpen,
  onClose,
  onSubmitJson,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_ANALYSIS_JSON, null, 2));
    setParseError(null);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setJsonText(clipText);
        setParseError(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParseError(null);

    if (!jsonText.trim()) {
      setParseError('Plak eerst de analyse-JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText.trim());

      // Basic structure validation
      if (
        !parsed.detected_shapes ||
        !parsed.suggested_solidworks_features ||
        !Array.isArray(parsed.suggested_solidworks_features)
      ) {
        throw new Error(
          "De JSON moet minimaal 'detected_shapes' en 'suggested_solidworks_features' bevatten."
        );
      }

      onSubmitJson(parsed);
      onClose();
    } catch (err: any) {
      setParseError(err?.message || 'Ongeldige JSON syntaxis. Controleer de syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Plak Analyse-JSON (van Handgetekende Schets)
              </h3>
              <p className="text-xs text-slate-500">
                Genereer direct de beginner SolidWorks handleiding en inspecteer de CAD Feature Tree
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Plak de JSON met de schetsanalyse:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium underline inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Plak van klembord
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-red-600 hover:text-red-700 font-semibold underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Laad voorbeeld Flens-JSON
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setParseError(null);
            }}
            placeholder={`{\n  "detected_shapes": [...],\n  "interpreted_3d_intent": [...],\n  "suggested_solidworks_features": [...],\n  "assumptions": [...],\n  "missing_info_questions": [...],\n  "complexity_level": "medium"\n}`}
            className="w-full px-3.5 py-3 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 leading-relaxed"
          />

          {parseError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              De handleiding wordt automatisch opgebouwd volgens SolidWorks Feature Tree volgorde.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verwerk JSON &amp; Genereer Handleiding</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
