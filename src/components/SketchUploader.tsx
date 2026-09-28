import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, PenTool, Image as ImageIcon, Sparkles, X, CheckCircle2, ChevronRight, FileCode } from 'lucide-react';
import { PRESET_SKETCHES } from '../data/presets';
import { PresetSketch } from '../types';

interface SketchUploaderProps {
  onSelectImage: (imageUrl: string) => void;
  selectedImageUrl: string | null;
  onAnalyze: (notes: string) => void;
  isLoading: boolean;
  onOpenSketchPad: () => void;
  onOpenPasteJson: () => void;
}

export const SketchUploader: React.FC<SketchUploaderProps> = ({
  onSelectImage,
  selectedImageUrl,
  onAnalyze,
  isLoading,
  onOpenSketchPad,
  onOpenPasteJson,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Global paste handler to allow pasting screenshots directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                onSelectImage(event.target.result as string);
                setActivePresetId(null);
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onSelectImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSelectImage(event.target.result as string);
        setActivePresetId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelectImage(event.target.result as string);
          setActivePresetId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (preset: PresetSketch) => {
    setActivePresetId(preset.id);
    onSelectImage(preset.svgDataUrl);
  };

  return (
    <div className="space-y-6">
      {/* Upload Box / Preview Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {!selectedImageUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-red-500 bg-red-50/50'
                : 'border-slate-300 hover:border-red-400 bg-slate-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 ring-8 ring-red-50/50">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-base font-semibold text-slate-800">
              Sleep een handgetekende schets hierheen
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Of klik om een foto of scan te uploaden (PNG, JPG, SVG). Plakken met <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Ctrl+V</kbd> werkt ook direct!
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                Bestand kiezen
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSketchPad();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
              >
                <PenTool className="w-3.5 h-3.5 text-red-400" />
                Zelf schets tekenen
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPasteJson();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors shadow-2xs"
              >
                <FileCode className="w-3.5 h-3.5 text-red-600" />
                Plak Analyse-JSON
              </button>
            </div>

          </div>
        ) : (
          /* Preview state */
          <div className="space-y-4">
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-hidden flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-64 h-48 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={selectedImageUrl}
                  alt="Geselecteerde technische schets"
                  className="w-full h-full object-contain p-2"
                />
              </div>

              <div className="flex-1 space-y-2 text-left w-full">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Schets Klaar voor CAD Analyse
                  </span>

                  <button
                    onClick={() => {
                      onSelectImage('');
                      setActivePresetId(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Verwijder schets"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-slate-900">
                  {activePresetId
                    ? PRESET_SKETCHES.find((p) => p.id === activePresetId)?.title
                    : 'Geüploade handgetekende schets'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activePresetId
                    ? PRESET_SKETCHES.find((p) => p.id === activePresetId)?.description
                    : 'De AI analyseert de 2D geometrieën, 3D bewerkingen (Extrude, Revolve, Cut, Fillet, Hole Wizard) en ontbrekende toleranties.'}
                </p>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                  >
                    Andere afbeelding kiezen
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={onOpenSketchPad}
                    className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Schets bewerken in canvas
                  </button>
                </div>
              </div>
            </div>

            {/* Optional notes input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Optionele ontwerpinstructies of specificaties:
              </label>
              <input
                type="text"
                placeholder="Bijv. 'Materiaal RVS 316, bedoeld voor CNC-draaiwerk' of 'Let op symmetrie van de gaten'..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Action button */}
            <button
              onClick={() => onAnalyze(additionalNotes)}
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>CAD Vision Expert analyseert schets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start SolidWorks Modellering Analyse</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Preset Sketches Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            Of test direct met een voorbeeld-schets:
          </h4>
          <span className="text-[11px] text-slate-400">1-klik selectie</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SKETCHES.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`group rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="w-full h-24 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden mb-2.5 flex items-center justify-center p-1 group-hover:scale-[1.02] transition-transform">
                    <img
                      src={preset.svgDataUrl}
                      alt={preset.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="inline-block text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded mb-1">
                    {preset.category}
                  </span>

                  <h5 className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {preset.title}
                  </h5>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Gebruik schets</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
