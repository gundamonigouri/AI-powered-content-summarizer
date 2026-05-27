import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchTextSummary } from '../store/summarySlice';
import PageHeader from '../components/ui/PageHeader';
import SummaryOptions from '../components/ui/SummaryOptions';
import SummaryResult from '../components/ui/SummaryResult';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function TextSummarizer() {
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((s) => s.summary);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [length, setLength] = useState('medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }
    try {
      await dispatch(fetchTextSummary({ text, title, summaryType, length })).unwrap();
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        badge="Text"
        title="Text Summarizer"
        description="Paste raw content and get AI summaries traced in LangSmith."
      />

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Title (optional)</label>
          <input
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
          />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea
            className="input-field min-h-[220px] resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            required
          />
        </div>
        <SummaryOptions
          summaryType={summaryType}
          length={length}
          onTypeChange={setSummaryType}
          onLengthChange={setLength}
        />
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? 'Summarizing...' : 'Generate Summary'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Groq is summarizing (check LangSmith)..." />}
      {error && !loading && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <SummaryResult result={current} />
    </div>
  );
}
