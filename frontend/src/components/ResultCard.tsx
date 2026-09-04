import type { SuitablePredictionResult } from "../types/prediction";
import { getRiskLevel } from "../types/prediction";

interface Props {
  result: SuitablePredictionResult;
}

export default function ResultCard({ result }: Props) {
  const risk = getRiskLevel(result);
  const isMalignant = result.prediction === "malignant";
  const isBorderline = risk === "borderline";

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          AI Screening Result
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span
            className={`text-3xl font-bold tracking-tight ${
              isMalignant ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {result.prediction.toUpperCase()}
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
              isMalignant
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {isMalignant ? "High Attention" : "Low Suspicion"}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          {isMalignant ? (
            <>
              The model classified this image as malignant based on the selected decision threshold. Professional clinical evaluation is recommended.
            </>
          ) : (
            <>
              The model classified this image as benign based on the selected decision threshold. Clinical evaluation may still be appropriate.
            </>
          )}
        </p>
      </div>

      {isBorderline && (
        <div className="rounded border border-amber-300 bg-amber-50/70 p-3 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-800 shrink-0 mt-0.5">
              BORDERLINE RESULT:
            </span>
            <p className="leading-relaxed">
              The model score is close to the decision threshold. Clinical evaluation is recommended.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
