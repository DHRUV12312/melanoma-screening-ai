import GradCamViewer from "./GradCamViewer";

interface Props {
  originalSrc: string;
  gradcamSrc: string;
}

export default function ImageComparison({ originalSrc, gradcamSrc }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Visual Model Analysis
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Compare the uploaded lesion with the model's Grad-CAM attention map.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Original Image</span>
          </div>
          <div className="overflow-hidden rounded border border-slate-200 bg-slate-900">
            <img
              src={originalSrc}
              alt="Original skin lesion"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Model Attention (Grad-CAM)</span>
          </div>
          <GradCamViewer gradcamSrc={gradcamSrc} />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        Grad-CAM highlights image regions that contributed to the model prediction.
      </p>
    </div>
  );
}
