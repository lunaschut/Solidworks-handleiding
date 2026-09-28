import React from 'react';
import { X, Layers, Box, RotateCw, CheckCircle2, HelpCircle } from 'lucide-react';

interface CadGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CadGuideModal: React.FC<CadGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                SolidWorks CAD Modelleerrichtlijnen
              </h3>
              <p className="text-xs text-slate-500">
                Hoe de AI handmatige schetsen vertaalt naar parametrische CAD functies
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

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              1. Sketch &amp; Referentievlakken
            </h4>
            <p>
              Elke SolidWorks feature begint met een 2D-schets op het Front, Top of Right Plane. De AI identificeert de primaire basisvorm (profiel of omtrek) om het model logisch op te bouwen.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-600" />
              2. Extruded Boss/Base vs. Revolved Boss/Base
            </h4>
            <p>
              Prismatische onderdelen (zoals blokken, beugels) worden geëxtrudeerd met <strong>Extruded Boss/Base</strong>. Cilindrische of rotatiesymmetrische onderdelen (assen, bussen, flenzen met trapdoorsnede) worden gemodelleerd met een halve contour en een rotatieas via <strong>Revolved Boss/Base</strong>.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-purple-600" />
              3. Hole Wizard vs. Extruded Cut
            </h4>
            <p>
              Standaard schroefdraadgaten (M-schroefdraad), verzonken gaten (countersunk) of getrapte kamers horen altijd gemodelleerd te worden met <strong>Hole Wizard</strong> voor correcte 2D-werktekeningannotaties. Vrije sleufgaten en kamers gebruiken <strong>Extruded Cut</strong>.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              4. Afrondingen (Fillet) &amp; Afschuiningen (Chamfer)
            </h4>
            <p>
              Volgens SolidWorks best practices worden afrondingen en afschuiningen pas als laatste toegevoegd in de feature-tree, zodat ze latere schetsreferenties niet verstoren.
            </p>
          </div>

          <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 text-red-950">
            <h4 className="font-semibold mb-1">Puur JSON Output formaat</h4>
            <p className="font-mono text-[11px] text-red-900">
              De analyse genereert exact het gewenste schema met detected_shapes, interpreted_3d_intent, suggested_solidworks_features, assumptions, missing_info_questions en complexity_level.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            Begrepen
          </button>
        </div>
      </div>
    </div>
  );
};
