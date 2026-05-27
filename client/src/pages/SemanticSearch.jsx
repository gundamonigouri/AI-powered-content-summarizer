import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { fetchSearch, clearSearch } from '../store/summarySlice';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SemanticSearch() {
  const dispatch = useDispatch();
  const { searchResults, loading, error } = useSelector((s) => s.summary);
  const [query, setQuery] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Enter a search query');
      return;
    }
    try {
      await dispatch(fetchSearch({ query, topK: 10 })).unwrap();
      toast.success('Search complete');
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        badge="Vectors"
        title="Semantic Search"
        description="Natural language search over Pinecone embeddings. Embedding calls are traced in LangSmith."
      />

      <form onSubmit={handleSubmit} className="card mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. climate change policy summaries"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            Search
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setQuery('');
              dispatch(clearSearch());
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner label="Querying Pinecone vectors..." />}
      {error && !loading && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{searchResults.length} results by similarity</p>
          {searchResults.map((item) => (
            <article key={item.id} className="card">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display font-bold">{item.sourceTitle}</h3>
                {item.score != null && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {(item.score * 100).toFixed(0)}% match
                  </span>
                )}
              </div>
              <div className="mb-2 flex gap-2">
                <span className="badge-accent">{item.sourceType}</span>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800">{item.summaryType}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {item.summary}
              </p>
            </article>
          ))}
        </div>
      )}

      {!loading && searchResults.length === 0 && query && !error && (
        <div className="card text-center text-slate-500">No matching summaries found.</div>
      )}
    </div>
  );
}
