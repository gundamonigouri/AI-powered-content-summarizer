const SUMMARY_TYPES = [
  { value: 'short', label: 'Short Summary', desc: 'Executive overview' },
  { value: 'detailed', label: 'Detailed', desc: 'Full coverage' },
  { value: 'bullets', label: 'Bullet Points', desc: 'Scannable list' },
  { value: 'insights', label: 'Key Insights', desc: 'Takeaways' },
];

const LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

export default function SummaryOptions({ summaryType, length, onTypeChange, onLengthChange }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="label">Summary type</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {SUMMARY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onTypeChange(t.value)}
              className={`rounded-xl border p-3 text-left transition ${
                summaryType === t.value
                  ? 'border-accent-400 bg-accent-50/80 ring-2 ring-accent-400/30 dark:border-accent-600 dark:bg-accent-900/30'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t.label}
              </span>
              <span className="text-xs text-slate-500">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Length</label>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => onLengthChange(l.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                length === l.value
                  ? 'bg-gradient-accent text-white shadow-glow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
