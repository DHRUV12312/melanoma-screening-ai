import type { SuitablePredictionResult } from "../types/prediction";

interface Props {
  result: SuitablePredictionResult;
}

export default function ProbabilityDisplay({ result }: Props) {
  const malPct = result.malignant_probability * 100;
  const benPct = result.benign_probability * 100;
  const threshPct = result.threshold * 100;

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Model Probabilities
        </span>
        <span className="text-[11px] text-slate-400">
          Threshold: <strong className="font-medium text-slate-700">{threshPct.toFixed(0)}%</strong>
        </span>
      </div>

      <div className="space-y-3">
        {/* Malignant */}
        <div>
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="text-slate-700 font-medium">Malignant</span>
            <span className="font-mono font-semibold text-slate-900">{malPct.toFixed(2)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
            <div
              className="h-full rounded-full bg-red-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(malPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Benign */}
        <div>
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="text-slate-700 font-medium">Benign</span>
            <span className="font-mono font-semibold text-slate-900">{benPct.toFixed(2)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(benPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {result.suitability && (
        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Image Suitability: <span className="font-medium text-slate-700">Suitable</span></span>
          <span className="text-slate-400">
            {result.suitability.suitable_probability.toFixed(1)}% confidence
          </span>
        </div>
      )}
    </div>
  );
}
