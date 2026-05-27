import { useState } from 'react';
import { Copy, Download, FileText, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadAsTxt, downloadAsPdf } from '../../utils/download';

export default function SummaryResult({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { summary, sourceTitle, sourceType, summaryType, length, tokenUsage, model, langsmithTraced } =
    result;

  const handleCopy = async () => {
    try {
      await copyToClipboard(summary);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const safeName = (sourceTitle || 'summary').replace(/[^a-z0-9]/gi, '_').slice(0, 40);

  return (
    <div className="card mt-8 overflow-hidden border-accent-200/40 dark:border-accent-800/30">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {sourceTitle || 'Summary'}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="badge-accent">{sourceType}</span>
            <span className="badge bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
              {summaryType}
            </span>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {length}
            </span>
            {langsmithTraced && (
              <span className="badge bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Zap className="mr-1 inline h-3 w-3" />
                LangSmith traced
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleCopy} className="btn-secondary text-xs">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            Copy
          </button>
          <button
            type="button"
            onClick={() => {
              downloadAsTxt(summary, `${safeName}.txt`);
              toast.success('Downloaded TXT');
            }}
            className="btn-secondary text-xs"
          >
            <FileText className="h-4 w-4" /> TXT
          </button>
          <button
            type="button"
            onClick={() => {
              downloadAsPdf(summary, sourceTitle, `${safeName}.pdf`);
              toast.success('Downloaded PDF');
            }}
            className="btn-secondary text-xs"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50/80 p-5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap dark:bg-slate-950/50 dark:text-slate-200">
        {summary}
      </div>

      {tokenUsage && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-100/80 p-3 text-center text-xs dark:bg-slate-800/50">
          <div>
            <p className="text-slate-500">Input</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {tokenUsage.input}
              {tokenUsage.estimated && '*'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Output</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {tokenUsage.output}
              {tokenUsage.estimated && '*'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Total</p>
            <p className="font-semibold text-accent-700 dark:text-accent-400">{tokenUsage.total}</p>
          </div>
        </div>
      )}
      {model && (
        <p className="mt-2 text-xs text-slate-400">Model: {model}</p>
      )}
    </div>
  );
}
