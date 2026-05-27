import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Upload, File } from 'lucide-react';
import { fetchFileSummary } from '../store/summarySlice';
import PageHeader from '../components/ui/PageHeader';
import SummaryOptions from '../components/ui/SummaryOptions';
import SummaryResult from '../components/ui/SummaryResult';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MAX_MB = 4;

export default function PdfSummarizer() {
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((s) => s.summary);
  const [file, setFile] = useState(null);
  const [summaryType, setSummaryType] = useState('short');
  const [length, setLength] = useState('medium');
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB}MB (Vercel limit)`);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload a PDF');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('summaryType', summaryType);
    formData.append('length', length);
    try {
      await dispatch(fetchFileSummary(formData)).unwrap();
      toast.success('PDF summarized!');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        badge="PDF"
        title="PDF Summarizer"
        description={`Upload PDFs up to ${MAX_MB}MB. Text is extracted and summarized with full LangSmith tracing.`}
      />

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent-300/50 bg-accent-50/30 p-12 transition hover:border-accent-400 hover:bg-accent-50/50 dark:border-accent-800/50 dark:bg-accent-950/20"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          {file ? (
            <>
              <File className="mb-3 h-12 w-12 text-accent-600" />
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <Upload className="mb-3 h-12 w-12 text-accent-500" />
              <p className="font-semibold">Drop or click to upload PDF</p>
              <p className="text-sm text-slate-500">Max {MAX_MB}MB for Vercel deployment</p>
            </>
          )}
        </div>
        <SummaryOptions
          summaryType={summaryType}
          length={length}
          onTypeChange={setSummaryType}
          onLengthChange={setLength}
        />
        <button type="submit" className="btn-primary" disabled={loading || !file}>
          {loading ? 'Processing...' : 'Summarize PDF'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Extracting PDF & summarizing..." />}
      {error && !loading && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <SummaryResult result={current} />
    </div>
  );
}
