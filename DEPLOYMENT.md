# Deployment Guide — Vercel + LangSmith

This project deploys **frontend + API together on Vercel**. The Express backend runs as a serverless function at `/api`.

---

## Part 1: LangSmith Setup (Tracing)

LangSmith traces every Groq summarization and OpenAI embedding call.

### Step 1 — Create LangSmith account

1. Go to [https://smith.langchain.com](https://smith.langchain.com)
2. Sign up / log in
3. Create a project named **`content-summarizer`** (or any name — match `LANGCHAIN_PROJECT`)

### Step 2 — Get API key

1. Open **Settings → API Keys**
2. Create a key and copy it

### Step 3 — Add to environment

```env
LANGCHAIN_API_KEY=lsv2_pt_xxxxxxxx
LANGCHAIN_PROJECT=content-summarizer
LANGCHAIN_TRACING_V2=true
```

Tracing auto-enables when `LANGCHAIN_API_KEY` is set.

### Step 4 — View traces

1. Summarize any text/URL/PDF in the app
2. Open [smith.langchain.com](https://smith.langchain.com) → your project
3. You will see runs like `summarize-text`, `summarize-url`, `embed-text`

Each trace includes: model, tokens, latency, inputs/outputs, tags (`summarize`, `text`, etc.).

---

## Part 2: API Keys & Pinecone (Required)

| Variable | Where to get it |
|----------|-----------------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) (embeddings only) |
| `PINECONE_API_KEY` | [app.pinecone.io](https://app.pinecone.io) |

**Pinecone index:**

- Name: `content-summarizer`
- Dimensions: **1536**
- Metric: **cosine**

See `server/scripts/setup-pinecone.md`.

---

## Part 3: Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "SummarizeAI - Vercel ready with LangSmith"
git remote add origin https://github.com/YOUR_USER/content-summarizer.git
git push -u origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory:** leave as `.` (project root)
4. Vercel reads `vercel.json` automatically:
   - Builds `client/` → static site
   - Deploys `api/index.js` → serverless Express API

### Step 3 — Environment variables (Vercel Dashboard)

In **Project → Settings → Environment Variables**, add **all** of these for **Production** (and Preview if you want):

```
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
PINECONE_API_KEY=
PINECONE_INDEX_NAME=content-summarizer
PINECONE_NAMESPACE=summaries
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=content-summarizer
LANGCHAIN_TRACING_V2=true
NODE_ENV=production
CLIENT_URL=https://YOUR-APP.vercel.app
```

Replace `YOUR-APP` with your actual Vercel domain after first deploy.

**Optional:** `VITE_API_URL=/api` (default in client — same-origin, no CORS issues)

### Step 4 — Deploy

Click **Deploy**. Wait for build to finish.

### Step 5 — Verify

1. Open `https://your-app.vercel.app`
2. Check API: `https://your-app.vercel.app/api/health`
   - Should show `"langsmith": { "tracing": true }`
3. Summarize sample text
4. Confirm trace in LangSmith dashboard

---

## Part 4: Local Development

**Terminal 1 — API:**

```powershell
cd server
copy .env.example .env
# Fill in API keys
npm run dev
```

**Terminal 2 — Frontend:**

```powershell
cd client
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
```

Open http://localhost:5173

---

## Vercel Limits to Know

| Limit | Value |
|-------|-------|
| Serverless timeout | 60s (configured in `vercel.json`) |
| Request body (PDF upload) | ~4.5 MB on Hobby plan |
| Cold starts | First API call may be slower |

PDF uploads are capped at **4MB** in the UI for Vercel compatibility.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 500 on Vercel | Check all env vars in Vercel dashboard |
| CORS errors | Set `CLIENT_URL` to your exact Vercel URL |
| No LangSmith traces | Ensure `LANGCHAIN_API_KEY` is set; wait ~30s after request |
| Pinecone errors | Index must exist with dimension 1536 |
| PDF fails on Vercel | Use files under 4MB |

---

## Further Steps (Recommended)

1. **Custom domain** — Vercel → Domains → add your domain
2. **LangSmith monitoring** — Set up alerts for failed runs
3. **Pinecone production** — Upgrade plan if you exceed free tier
4. **Rate limits** — Tune `RATE_LIMIT_MAX` in env for production traffic
5. **Analytics** — Add Vercel Analytics in project settings
6. **Auth** — Add Clerk/Auth0 if you need user-specific history
7. **CI** — GitHub Action to run `npm run build` on PRs

---

## Architecture on Vercel

```
your-app.vercel.app
├── /              → React SPA (client/dist)
├── /text, /url... → React routes (rewritten to index.html)
└── /api/*         → Express serverless (api/index.js)
```

Single deployment — no separate backend URL needed when using `VITE_API_URL=/api`.
