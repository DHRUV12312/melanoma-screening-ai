import type { SuitablePredictionResult } from "../types/prediction";

interface Props {
  result: SuitablePredictionResult;
  fileName: string;
  timestamp: string;
}

export default function CaseSummary({ result, fileName, timestamp }: Props) {
  const isMalignant = result.prediction === "malignant";

  const rows = [
    { label: "File", value: fileName },
    {
      label: "Prediction",
      value: (
        <span className={`font-semibold ${isMalignant ? "text-red-700" : "text-emerald-700"}`}>
          {result.prediction.toUpperCase()}
        </span>
      ),
    },
    { label: "Malignant probability", value: `${(result.malignant_probability * 100).toFixed(2)}%` },
    { label: "Benign probability", value: `${(result.benign_probability * 100).toFixed(2)}%` },
    { label: "Threshold", value: `${(result.threshold * 100).toFixed(0)}%` },
    ...(result.suitability
      ? [
          {
            label: "Image suitability",
            value: `Suitable (${result.suitability.suitable_probability.toFixed(2)}%)`,
          },
        ]
      : []),
    { label: "Device", value: result.device.toUpperCase() },
    { label: "Analysis status", value: "Complete" },
    { label: "Timestamp", value: new Date(timestamp).toLocaleString() },
  ];

  return (
    <div className="space-y-3 pt-6 border-t border-slate-200">
      <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
        Case Information
      </h3>

      <div className="overflow-hidden rounded border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-slate-50/50">
                <td className="px-4 py-2 text-slate-500 font-normal w-1/3">
                  {row.label}
                </td>
                <td className="px-4 py-2 text-slate-900 font-medium text-right sm:text-left">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
