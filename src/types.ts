export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface DetectedShape {
  shape: string;
  location: string;
  confidence: ConfidenceLevel;
}

export interface Interpreted3DIntent {
  intent: string;
  feature_guess: string;
  confidence: ConfidenceLevel;
}

export interface SuggestedSolidWorksFeature {
  feature: string;
  why: string;
  confidence: ConfidenceLevel;
}

export interface Assumption {
  assumption: string;
  reason: string;
}

export interface MissingInfoQuestion {
  question: string;
  why_it_matters: string;
}

export interface SolidWorksAnalysisResult {
  detected_shapes: DetectedShape[];
  interpreted_3d_intent: Interpreted3DIntent[];
  suggested_solidworks_features: SuggestedSolidWorksFeature[];
  assumptions: Assumption[];
  missing_info_questions: MissingInfoQuestion[];
  complexity_level: ComplexityLevel;
}

export interface PresetSketch {
  id: string;
  title: string;
  category: string;
  description: string;
  svgDataUrl: string;
}

export interface GuideGenerationRequest {
  analysis: SolidWorksAnalysisResult;
  additionalNotes?: string;
}

