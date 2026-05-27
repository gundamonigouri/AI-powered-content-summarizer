import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  Globe,
  Upload,
  History,
  Search,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/text', label: 'Text', icon: FileText },
  { to: '/url', label: 'URL', icon: Globe },
  { to: '/pdf', label: 'PDF', icon: Upload },
  { to: '/history', label: 'History', icon: History },
  { to: '/search', label: 'Search', icon: Search },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'}`;

  const NavContent = () => (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-accent shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-slate-900 dark:text-white">SummarizeAI</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Groq · Pinecone · LangSmith</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-200/60 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2 text-xs text-accent-800 dark:bg-accent-900/20 dark:text-accent-300">
          <Activity className="h-3.5 w-3.5" />
          LangSmith tracing enabled on API
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="nav-link w-full hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white/90 p-2.5 shadow-lg backdrop-blur lg:hidden dark:border-slate-700 dark:bg-slate-900/90"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/60 bg-white/80 p-5 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 dark:border-slate-800/60 dark:bg-slate-950/80 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
