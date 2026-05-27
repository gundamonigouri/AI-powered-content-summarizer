# Pinecone Index Setup

Create an index in the [Pinecone Console](https://app.pinecone.io):

| Setting | Value |
|---------|-------|
| **Name** | `content-summarizer` (or match `PINECONE_INDEX_NAME`) |
| **Dimensions** | `1536` (for OpenAI `text-embedding-3-small`) |
| **Metric** | `cosine` |
| **Cloud** | AWS (or your preference) |

After creating the index, add your API keys to `server/.env` and restart the server.
