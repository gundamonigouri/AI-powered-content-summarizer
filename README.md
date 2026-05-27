# AI-Powered Content Summarizer

A full-stack web application that summarizes **text**, **webpages (URLs)**, and **PDF documents** using **Groq AI**, stores vector embeddings in **Pinecone**, and supports **semantic search** over your summary history.

![Stack](https://img.shields.io/badge/React-Vite-61DAFB)
![Stack](https://img.shields.io/badge/Node-Express-339933)
![Stack](https://img.shields.io/badge/AI-Groq-F55036)
![Stack](https://img.shields.io/badge/Vector-Pinecone-000000)

## Features

- **Text Summarizer** — Paste raw text and get AI summaries
- **URL Summarizer** — Scrape webpages (Cheerio + Axios) and summarize
- **PDF Summarizer** — Upload PDFs, extract text with `pdf-parse`
- **Summary types** — Short, detailed, bullet points, key insights
- **Length options** — Short, medium, long
- **History dashboard** — Searchable list of past summaries (Pinecone)
- **Semantic search** — Natural language search via vector embeddings
- **UI** — Tailwind CSS, dark/light mode, toasts, loading states, responsive layout
- **Export** — Copy, download as TXT or PDF
- **Token usage** — Estimated or actual token counts from Groq

## Project Structure

```
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Theme (dark/light)
│   │   ├── pages/          # Route pages
│   │   └── store/          # Redux Toolkit state
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, upload, rate limit
│   │   ├── routes/         # API routes
│   │   ├── services/       # Groq, Pinecone, scraping, PDF
│   │   └── utils/          # Helpers
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **Groq API key** — [console.groq.com](https://console.groq.com)
- **OpenAI API key** — For embeddings only ([platform.openai.com](https://platform.openai.com)) — small cost per embed
- **Pinecone account** — [app.pinecone.io](https://app.pinecone.io)

## Quick Start

### 1. Clone and install

```bash
cd "AI-powered content summarizer"
npm run install:all
```

### 2. Configure environment

**Server** (`server/.env`):

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your API keys.

**Client** (`client/.env`):

```bash
cp client/.env.example client/.env
```

### 3. Create Pinecone index

See [server/scripts/setup-pinecone.md](server/scripts/setup-pinecone.md):

- Index name: `content-summarizer`
- Dimensions: **1536**
- Metric: **cosine**

### 4. Run locally

Terminal 1 — Backend:

```bash
npm run dev:server
```

Terminal 2 — Frontend:

```bash
npm run dev:client
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/summarize/text` | Summarize raw text |
| POST | `/api/summarize/url` | Summarize webpage |
| POST | `/api/summarize/file` | Summarize PDF (multipart) |
| GET | `/api/history` | List summary history |
| DELETE | `/api/history/:id` | Delete a record |
| POST | `/api/search` | Semantic search |

### Request body (text / url)

```json
{
  "text": "Your content here...",
  "title": "Optional title",
  "summaryType": "short | detailed | bullets | insights",
  "length": "short | medium | long"
}
```

### Response format

```json
{
  "success": true,
  "message": "Text summarized successfully",
  "data": {
    "id": "uuid",
    "summary": "...",
    "sourceType": "text",
    "sourceTitle": "My Doc",
    "summaryType": "bullets",
    "length": "medium",
    "model": "llama-3.3-70b-versatile",
    "tokenUsage": { "input": 120, "output": 80, "total": 200, "estimated": false },
    "createdAt": "2026-05-25T12:00:00.000Z"
  }
}
```

## API Testing Examples

### cURL — Text

```bash
curl -X POST http://localhost:5000/api/summarize/text \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Artificial intelligence is transforming how we work and learn.\",\"summaryType\":\"bullets\",\"length\":\"short\"}"
```

### cURL — URL

```bash
curl -X POST http://localhost:5000/api/summarize/url \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://en.wikipedia.org/wiki/Artificial_intelligence\",\"summaryType\":\"short\",\"length\":\"medium\"}"
```

### cURL — PDF

```bash
curl -X POST http://localhost:5000/api/summarize/file \
  -F "file=@document.pdf" \
  -F "summaryType=detailed" \
  -F "length=long"
```

### cURL — History

```bash
curl http://localhost:5000/api/history?limit=20
```

### cURL — Semantic Search

```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"machine learning and ethics\",\"topK\":5}"
```

## Deployment (Vercel — Full Stack)

**Frontend + API deploy together on Vercel.** See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete step-by-step guide including:

- LangSmith tracing setup
- Vercel environment variables
- Pinecone index creation
- Local dev vs production config

Quick Vercel steps:

1. Push repo to GitHub
2. Import on [Vercel](https://vercel.com) (root = project root, uses `vercel.json`)
3. Add all env vars from `server/.env.example` in Vercel dashboard
4. Set `CLIENT_URL` to `https://your-app.vercel.app`
5. Deploy — API at `/api`, app at `/`

### LangSmith Tracing

Set `LANGCHAIN_API_KEY` in env. View traces at [smith.langchain.com](https://smith.langchain.com) under project `content-summarizer`.

### Production checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS `CLIENT_URL` to production frontend URL
- [ ] Use strong rate limits
- [ ] Never commit `.env` files
- [ ] Pinecone index created with dimension 1536

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios |
| Backend | Node.js, Express, Helmet, CORS, rate limiting, Multer |
| AI | Groq via LangChain (`llama-3.3-70b-versatile`) |
| Observability | LangSmith (LLM + embedding traces) |
| Embeddings | LangChain + OpenAI `text-embedding-3-small` |
| Vector DB | Pinecone |
| Deploy | Vercel (SPA + serverless API) |
| PDF | pdf-parse |
| Scraping | Cheerio + Axios |

## Why OpenAI for embeddings?

Groq provides fast LLM inference but does not offer embedding models. We use OpenAI's `text-embedding-3-small` (via LangChain) only for creating vectors stored in Pinecone. Summarization always uses Groq.

## License

MIT — free for learning and portfolio use.
