import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface Props {
  file: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageUploader({ file, previewUrl, onFileSelect, onFileRemove, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (f: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError("Invalid file type. Please upload a JPG, JPEG, PNG, or WEBP image.");
        return;
      }
      if (f.size > MAX_SIZE) {
        setError("File exceeds 20 MB limit.");
        return;
      }
      onFileSelect(f);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    [disabled, validateAndSet]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) validateAndSet(f);
      if (inputRef.current) inputRef.current.value = "";
    },
    [validateAndSet]
  );

  if (file && previewUrl) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded border border-slate-200 bg-slate-900">
          <div className="flex items-center justify-center p-2 bg-slate-950/50">
            <img
              src={previewUrl}
              alt="Selected skin lesion"
              className="max-h-72 w-auto object-contain rounded"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-3">
          <div className="truncate pr-3">
            <span className="font-medium text-slate-900">{file.name}</span>
            <span className="ml-2 text-slate-400">({formatFileSize(file.size)})</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2 disabled:opacity-50"
            >
              Change
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={onFileRemove}
              disabled={disabled}
              className="font-medium text-red-600 hover:text-red-700 underline underline-offset-2 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleChange}
          className="hidden"
          aria-label="Change image file"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-[220px] flex-col items-center justify-center rounded border border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-slate-800 bg-slate-100"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <svg className="mb-3 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-sm font-semibold text-slate-900">Upload a clear, close-up image of a skin lesion.</p>
        <p className="mt-1 text-xs text-slate-500">Drag and drop an image here</p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="rounded border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            Browse Image
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">JPG • JPEG • PNG • WEBP</p>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        className="hidden"
        aria-label="Select image file"
      />
    </div>
  );
}
