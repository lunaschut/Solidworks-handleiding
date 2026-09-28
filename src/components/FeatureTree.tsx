import React from 'react';
import { SuggestedSolidWorksFeature, ConfidenceLevel } from '../types';
import {
  Layers,
  Box,
  Scissors,
  RotateCw,
  CircleDot,
  Grid,
  Maximize,
  Compass,
  ChevronsRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FeatureTreeProps {
  features: SuggestedSolidWorksFeature[];
}

function getFeatureIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('sketch')) return <Layers className="w-4 h-4 text-sky-600" />;
  if (lower.includes('cut')) return <Scissors className="w-4 h-4 text-rose-600" />;
  if (lower.includes('revolve')) return <RotateCw className="w-4 h-4 text-indigo-600" />;
  if (lower.includes('hole') || lower.includes('wizard')) return <CircleDot className="w-4 h-4 text-purple-600" />;
  if (lower.includes('pattern')) return <Grid className="w-4 h-4 text-emerald-600" />;
  if (lower.includes('shell')) return <Maximize className="w-4 h-4 text-amber-600" />;
  if (lower.includes('fillet') || lower.includes('chamfer')) return <Compass className="w-4 h-4 text-teal-600" />;
  return <Box className="w-4 h-4 text-blue-600" />;
}

function getConfidenceBadge(level: ConfidenceLevel) {
  switch (level) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Zeker (High)
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3 h-3" /> Gemiddeld (Medium)
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
          <AlertCircle className="w-3 h-3" /> Indicatief (Low)
        </span>
      );
  }
}

export const FeatureTree: React.FC<FeatureTreeProps> = ({ features }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              SolidWorks FeatureManager Design Tree
            </h3>
            <p className="text-xs text-slate-500">
              Aanbevolen opbouw- en modelleervolgorde voor dit onderdeel
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
          {features.length} features
        </span>
      </div>

      <div className="p-5">
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
          {features.map((item, index) => (
            <div key={index} className="relative group">
              {/* Step indicator node on tree line */}
              <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-[11px] font-bold text-blue-600 shadow-xs">
                {index + 1}
              </div>

              <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-4 rounded-xl border border-slate-200/80">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white shadow-xs border border-slate-200">
                      {getFeatureIcon(item.feature)}
                    </div>
                    <span className="font-semibold text-sm text-slate-900 font-mono">
                      {item.feature}
                    </span>
                  </div>
                  {getConfidenceBadge(item.confidence)}
                </div>

                <p className="text-xs leading-relaxed text-slate-600 mt-1">
                  <strong className="text-slate-800 font-medium">Waarom:</strong> {item.why}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
