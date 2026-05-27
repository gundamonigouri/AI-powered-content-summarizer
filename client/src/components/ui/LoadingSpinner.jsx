export default function LoadingSpinner({ label = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-accent-200 dark:border-accent-900" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent-500 border-r-violet-500" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-accent opacity-20" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}
