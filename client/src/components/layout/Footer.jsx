export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 px-6 py-5 text-center text-xs text-slate-500 dark:border-slate-800/60 dark:text-slate-500">
      <p>
        SummarizeAI · Groq LLM · Pinecone vectors ·{' '}
        <a
          href="https://smith.langchain.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-600 hover:underline dark:text-accent-400"
        >
          LangSmith traces
        </a>
      </p>
    </footer>
  );
}
