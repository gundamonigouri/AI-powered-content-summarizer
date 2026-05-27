import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchUrlSummary } from '../store/summarySlice';
import PageHeader from '../components/ui/PageHeader';
import SummaryOptions from '../components/ui/SummaryOptions';
import SummaryResult from '../components/ui/SummaryResult';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function UrlSummarizer() {
  const dispatch = useDispatch();
  const { current, loading, error } = useSelector((s) => s.summary);
  const [url, setUrl] = useState('');
  const [summaryType, setSummaryType] = useState('short');
  const [length, setLength] = useState('medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    try {
      await dispatch(fetchUrlSummary({ url, summaryType, length })).unwrap();
      toast.success('URL summarized!');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        badge="URL"
        title="URL Summarizer"
        description="Scrape public webpages and summarize with Groq — traced in LangSmith."
      />

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Webpage URL</label>
          <input
            type="url"
            className="input-field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            required
          />
        </div>
        <SummaryOptions
          summaryType={summaryType}
          length={length}
          onTypeChange={setSummaryType}
          onLengthChange={setLength}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Fetching...' : 'Summarize URL'}
        </button>
      </form>

      {loading && <LoadingSpinner label="Scraping page & summarizing..." />}
      {error && !loading && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <SummaryResult result={current} />
    </div>
  );
}
