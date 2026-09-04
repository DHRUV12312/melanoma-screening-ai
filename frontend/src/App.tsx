import { useState, useCallback } from "react";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import AnalyzeButton from "./components/AnalyzeButton";
import ResultCard from "./components/ResultCard";
import UnsupportedResultCard from "./components/UnsupportedResultCard";
import ProbabilityDisplay from "./components/ProbabilityDisplay";
import ImageComparison from "./components/ImageComparison";
import CaseSummary from "./components/CaseSummary";
import Disclaimer from "./components/Disclaimer";
import { analyzeSkinLesion, ApiError } from "./services/api";
import type { AnalysisState } from "./types/prediction";
import { isUnsupportedResult } from "./types/prediction";

const initialState: AnalysisState = {
  status: "idle",
  result: null,
  error: null,
  timestamp: null,
  fileName: null,
  fileSize: null,
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>(initialState);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setAnalysis(initialState);
  }, [previewUrl]);

  const handleFileRemove = useCallback(() => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setAnalysis(initialState);
  }, [previewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setAnalysis((prev) => ({
        ...prev,
        status: "error",
        error: "Please select an image before analyzing.",
      }));
      return;
    }

    setAnalysis({
      status: "analyzing",
      result: null,
      error: null,
      timestamp: null,
      fileName: file.name,
      fileSize: file.size,
    });

    try {
      const result = await analyzeSkinLesion(file);

      setAnalysis({
        status: "complete",
        result,
        error: null,
        timestamp: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "An unexpected error occurred during analysis.";
      setAnalysis((prev) => ({
        ...prev,
        status: "error",
        error: message,
      }));
    }
  }, [file]);

  const isAnalyzing = analysis.status === "analyzing";
  const result = analysis.result;
  const isUnsupported = result !== null && isUnsupportedResult(result);
  const isSuitableSuccess = result !== null && !isUnsupportedResult(result);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {/* Intro Hero */}
        <section className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            AI-Assisted Melanoma Screening
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Upload a skin-lesion image to receive an AI-assisted benign or malignant classification and visual model analysis.
          </p>
          <p className="mt-2 text-xs font-mono text-slate-400">
            EfficientNet-B0 • Research Prototype
          </p>
        </section>

        {/* Main Workspace: Two-Column Layout */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Image Upload & Action */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Image Input
                </span>
                {file && (
                  <span className="text-[11px] text-slate-400">Image selected</span>
                )}
              </div>

              <ImageUploader
                file={file}
                previewUrl={previewUrl}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                disabled={isAnalyzing}
              />

              {/* Informational Scope Section */}
              <div className="mt-3 rounded border border-slate-200 bg-slate-50/70 p-3 space-y-1 text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-800">
                  Upload a clear, close-up image of a skin lesion.
                </p>
                <p>
                  <strong className="text-slate-700">Model scope:</strong> benign vs malignant skin-lesion classification.
                </p>
                <p className="text-slate-500">
                  This model performs benign vs malignant skin-lesion classification and is not a general skin-disease classifier.
                </p>
              </div>

              <div className="mt-4">
                <AnalyzeButton
                  onClick={handleAnalyze}
                  loading={isAnalyzing}
                  disabled={!file}
                />
              </div>
            </div>

            {/* Error Message */}
            {analysis.error && (
              <div className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-800" role="alert">
                <p className="font-semibold text-red-900">Analysis Notice</p>
                <p className="mt-0.5 text-red-700">{analysis.error}</p>
              </div>
            )}
          </div>

          {/* Right Column: Screening Result */}
          <div className="lg:col-span-7">
            <div className="h-full rounded border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Screening Outcome
                  </span>
                  {isSuitableSuccess && (
                    <span className="text-[11px] text-emerald-600 font-medium">Evaluation Complete</span>
                  )}
                  {isUnsupported && (
                    <span className="text-[11px] text-amber-600 font-medium">Suitability Check</span>
                  )}
                </div>

                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                    <p className="mt-4 text-sm font-medium text-slate-800">
                      Analyzing lesion with EfficientNet-B0…
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Computing suitability, classification probabilities, and Grad-CAM heatmap
                    </p>
                  </div>
                ) : isUnsupported && result ? (
                  <UnsupportedResultCard result={result} />
                ) : isSuitableSuccess && result ? (
                  <div className="space-y-6">
                    <ResultCard result={result} />
                    <ProbabilityDisplay result={result} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <svg className="mb-2 h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs text-slate-500">No analysis performed yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Upload a clear, close-up skin lesion image and click Analyze Image to view results.</p>
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  {isSuitableSuccess ? (
                    <>
                      <span>Device: {result.device.toUpperCase()}</span>
                      <span>EfficientNet-B0</span>
                    </>
                  ) : (
                    <>
                      <span>Suitability Gate: Active</span>
                      <span>EfficientNet-B0</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Model Analysis Section & Case Info (Only shown for suitable images) */}
        {isSuitableSuccess && result && (
          <section className="mt-12 space-y-8">
            <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
              <ImageComparison
                originalSrc={previewUrl!}
                gradcamSrc={result.gradcam}
              />
            </div>

            <div className="rounded border border-slate-200 bg-white p-6 shadow-2xs">
              <CaseSummary
                result={result}
                fileName={analysis.fileName!}
                timestamp={analysis.timestamp!}
              />
            </div>
          </section>
        )}

        {/* Clinical Disclaimer */}
        <div className="mt-12">
          <Disclaimer />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between text-xs text-slate-500">
          <span>Melanoma AI Screening — Capstone Project</span>
          <span>PyTorch • EfficientNet-B0</span>
        </div>
      </footer>
    </div>
  );
}
