import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { fetchHistory } from '../store/summarySlice';
import { deleteHistoryItem } from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function History() {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((s) => s.summary);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchHistory(50));
  }, [dispatch]);

  const filtered = history.filter((item) => {
    const q = filter.toLowerCase();
    return (
      item.sourceTitle?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.sourceType?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      toast.success('Deleted');
      dispatch(fetchHistory(50));
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <PageHeader
        badge="History"
        title="Summary Dashboard"
        description="Browse summaries stored in Pinecone. Use Semantic Search for natural language lookup."
      />

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pl-11"
          placeholder="Filter by title, type, or content..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading && <LoadingSpinner label="Loading from Pinecone..." />}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card text-center text-slate-500">No summaries yet. Create your first one!</div>
      )}

      <div className="space-y-4">
        {filtered.map((item) => (
          <article key={item.id} className="card group transition hover:shadow-glow">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">
                  {item.sourceTitle}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge-accent">{item.sourceType}</span>
                  <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {item.summaryType}
                  </span>
                  {item.createdAt && (
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-lg p-2 text-rose-500 opacity-0 transition hover:bg-rose-50 group-hover:opacity-100 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {item.summary}
            </p>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-accent-600 hover:underline dark:text-accent-400"
              >
                <ExternalLink className="h-3 w-3" /> Source
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
