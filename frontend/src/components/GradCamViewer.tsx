interface Props {
  gradcamSrc: string;
}

export default function GradCamViewer({ gradcamSrc }: Props) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-slate-900">
      <img
        src={gradcamSrc}
        alt="Grad-CAM visual attention heatmap"
        className="h-auto w-full object-contain"
      />
    </div>
  );
}
