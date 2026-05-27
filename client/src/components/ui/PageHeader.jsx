export default function PageHeader({ title, description, badge }) {
  return (
    <header className="mb-8">
      {badge && (
        <span className="badge-accent mb-3 inline-block">{badge}</span>
      )}
      <h1 className="page-title">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </header>
  );
}
