export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white font-semibold text-xs tracking-wider">
            M
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900 tracking-tight">Melanoma AI</span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-normal">AI-Assisted Skin Lesion Screening</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-xs text-slate-600 font-medium">System Online</span>
        </div>
      </div>
    </header>
  );
}
