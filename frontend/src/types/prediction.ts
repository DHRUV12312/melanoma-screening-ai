export interface SuitabilityInfo {
  suitable_probability: number;
  unsupported_probability: number;
  threshold: number;
}

export interface SuitablePredictionResult {
  status?: "success";
  prediction: "benign" | "malignant";
  malignant_probability: number;
  benign_probability: number;
  threshold: number;
  device: string;
  gradcam: string;
  suitability?: SuitabilityInfo;
}

export interface UnsupportedPredictionResult {
  status: "unsupported";
  prediction: "UNSUPPORTED";
  message: string;
  suitability: SuitabilityInfo;
  gradcam: null;
}

export type PredictionResult = SuitablePredictionResult | UnsupportedPredictionResult;

export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  result: PredictionResult | null;
  error: string | null;
  timestamp: string | null;
  fileName: string | null;
  fileSize: number | null;
}

export type RiskLevel = "benign" | "malignant" | "borderline";

export function isUnsupportedResult(result: PredictionResult): result is UnsupportedPredictionResult {
  return result.status === "unsupported" || (result as { prediction?: string }).prediction === "UNSUPPORTED";
}

export function getRiskLevel(result: SuitablePredictionResult): RiskLevel {
  const distance = Math.abs(result.malignant_probability - result.threshold);
  if (distance <= 0.10) return "borderline";
  return result.prediction;
}
