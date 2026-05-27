import { Link } from 'react-router-dom';
import { FileText, Globe, Upload, History, Search, ArrowRight, Brain, Database, LineChart } from 'lucide-react';

const features = [
  { to: '/text', icon: FileText, title: 'Text', color: 'from-cyan-500 to-teal-600' },
  { to: '/url', icon: Globe, title: 'URL', color: 'from-violet-500 to-purple-600' },
  { to: '/pdf', icon: Upload, title: 'PDF', color: 'from-pink-500 to-rose-600' },
  { to: '/history', icon: History, title: 'History', color: 'from-amber-500 to-orange-600' },
  { to: '/search', icon: Search, title: 'Search', color: 'from-emerald-500 to-green-600' },
];

const stack = [
  { icon: Brain, label: 'Groq LLM', desc: 'llama-3.3-70b' },
  { icon: Database, label: 'Pinecone', desc: 'Vector memory' },
  { icon: LineChart, label: 'LangSmith', desc: 'LLM tracing' },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 p-8 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/40 sm:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-accent opacity-20 blur-3xl" />
        <div className="relative">
          <span className="badge-accent mb-4">AI-powered · Production-ready</span>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Turn any content into{' '}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              clear summaries
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
            Summarize text, webpages, and PDFs in seconds. Every LLM call is traced in LangSmith.
            Vectors stored in Pinecone for semantic search.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/text" className="btn-primary">
              Start summarizing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/search" className="btn-secondary">
              Semantic search
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stack.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <Icon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Choose a tool
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ to, icon: Icon, title, color }) => (
            <Link
              key={to}
              to={to}
              className="group card relative overflow-hidden transition hover:shadow-glow"
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg transition group-hover:scale-105`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <ArrowRight className="mt-2 h-4 w-4 text-accent-600 opacity-0 transition group-hover:opacity-100 dark:text-accent-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
