import type { UnsupportedPredictionResult } from "../types/prediction";

interface Props {
  result: UnsupportedPredictionResult;
}

export default function UnsupportedResultCard({ result }: Props) {
  const suitablePct = result.suitability.suitable_probability;
  const unsupportedPct = result.suitability.unsupported_probability;

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Image Suitability Check
        </span>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight text-amber-700">
            IMAGE NOT SUITABLE
          </span>
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Unsupported Image
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-700 font-medium">
          {result.message || "This image is not suitable for melanoma screening. Please upload a clear, close-up image of a skin lesion."}
        </p>
      </div>

      <div className="rounded border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
        <div className="flex items-start gap-2">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-800 shrink-0 mt-0.5">
            NOTICE:
          </span>
          <p className="leading-relaxed">
            Please upload a clear, close-up image of a skin lesion. This screening model is designed specifically for dermoscopic skin-lesion images.
          </p>
        </div>
      </div>

      {/* Suitability Probabilities */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Image Suitability
          </span>
          <span className="text-[11px] text-slate-400">
            Threshold: <strong className="font-medium text-slate-700">{result.suitability.threshold.toFixed(0)}%</strong>
          </span>
        </div>

        <div className="space-y-3">
          {/* Unsupported */}
          <div>
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="text-slate-700 font-medium">Unsupported</span>
              <span className="font-mono font-semibold text-slate-900">{unsupportedPct.toFixed(2)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(unsupportedPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Suitable */}
          <div>
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="text-slate-700 font-medium">Suitable</span>
              <span className="font-mono font-semibold text-slate-900">{suitablePct.toFixed(2)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
              <div
                className="h-full rounded-full bg-slate-400 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(suitablePct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
