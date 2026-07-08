# 🧠 MindForge

> An AI research assistant you can ask questions about your documents — built from scratch, by hand.

## Status
🚧 Active development — started June 2026. Building in public, one component at a time.

## What It Does (today)
Upload a document and ask questions about it. MindForge retrieves the most
relevant passages and generates an answer grounded in the source — and says
"I don't know" when the answer isn't in the document, instead of hallucinating.

## How It Works
A Retrieval-Augmented Generation (RAG) pipeline, built without high-level
frameworks so every step is explicit and understood:

1. **Extract** — pull text from PDFs
2. **Chunk** — split text into overlapping segments so no fact is lost at a boundary
3. **Embed & Store** — encode chunks as vectors in a persistent ChromaDB store,
   with namespaced IDs so multiple documents coexist without collisions
4. **Retrieve** — semantic search returns the most relevant chunks for a question
5. **Generate** — an LLM answers using only the retrieved context

## Tech Stack
**Currently used**
- Python
- ChromaDB (vector store)
- sentence-transformers (embeddings)
- Groq / Llama 3.1 (generation)

**Planned**
- FastAPI backend
- React frontend
- AWS (EC2 + S3) deployment
- MLflow monitoring
- Agentic layer (tool use + multi-step reasoning)

## Progress
- [x] Project architecture & setup
- [x] PDF ingestion (extract + overlapping chunking)
- [x] Vector storage with ChromaDB (namespaced, multi-document)
- [x] Semantic retrieval
- [x] Grounded generation with anti-hallucination
- [x] FastAPI backend
- [x] React frontend
- [x] AWS deployment
- [ ] MLflow monitoring
- [ ] Agentic capabilities

## Why I'm Building This
To go from understanding AI concepts to shipping a real, production-style AI
system end to end — building every line by hand so I can explain any part of it.

📍 Building toward a move back to London, 2026. 🇬🇧
