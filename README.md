# 🧠 MindForge
 
> An AI research assistant that answers questions about your documents — grounded in the source, not made up. Built from scratch, by hand, no high-level frameworks.
 
**Live demo:** [mind-forge-coral.vercel.app](https://mind-forge-coral.vercel.app)
 

https://github.com/user-attachments/assets/f02940e5-21a3-4104-a4ed-86df813acf36


<img width="1920" height="1080" alt="Screenshot 2026-07-13 at 2 58 53 AM" src="https://github.com/user-attachments/assets/e854ccba-1239-4a39-988c-42003ec2dbd4" />

 
---
 
## Status
 
✅ **v1 complete and deployed.** A working, secure, public RAG assistant — end to end, every layer built by hand.
🔭 **v2 in planning** — multi-document library, live upload, and conversational multi-chat (see [Roadmap](#roadmap-v2)).
 
Built in public over ~2 months, one component at a time.
 
---
 
## What It Does
 
Ask a natural-language question about an ingested research paper and get an answer drawn **only** from the paper's actual text. When the answer isn't in the document, MindForge says so instead of hallucinating.
 
The demo is loaded with *PaLM: Scaling Language Modeling with Pathways* — ask it about the model's parameters, training data, hardware, or benchmarks.
 
---
 
## How It Works
 
A Retrieval-Augmented Generation (RAG) pipeline, built without LangChain or other high-level frameworks so every step is explicit and understood:
 
1. **Extract** — pull text from PDFs
2. **Chunk** — split text into overlapping segments so no fact is lost at a boundary
3. **Embed & Store** — encode chunks as vectors in a persistent ChromaDB store, with namespaced IDs so multiple documents coexist without collisions
4. **Retrieve** — semantic search returns the most relevant chunks for a question
5. **Generate** — an LLM answers using only the retrieved context, under a strict anti-hallucination instruction
<!-- 🖼️ ARCHITECTURE DIAGRAM (optional) — a simple flow of the 5 stages
     reads really well here. Drop an image if you make one. -->
 
---
 
## Architecture
 
```
Browser (React, Vercel, HTTPS)
        │  POST /ask
        ▼
nginx reverse proxy  ──►  SSL via Let's Encrypt
        │
        ▼
FastAPI backend (Uvicorn, systemd service, AWS EC2)
        │
        ▼
RAG core ──► ChromaDB (vectors) ──► Groq / Llama 3.1 (generation)
```
 
- **Frontend** and **backend** are deployed separately and communicate over HTTPS.
- The backend runs as a self-healing `systemd` service that survives reboots and crashes.
- TLS is terminated by nginx with an auto-renewing Let's Encrypt certificate.
---
 
## Tech Stack
 
**Core**
- Python
- ChromaDB (vector store)
- sentence-transformers (embeddings)
- Groq / Llama 3.1 (generation)
**Backend & serving**
- FastAPI + Uvicorn
- nginx (reverse proxy) + Let's Encrypt (HTTPS)
- systemd (process management)
**Frontend**
- React (Vite)
**Infrastructure**
- AWS EC2 (backend)
- Vercel (frontend)
---
 
## Progress
 
- [x] Project architecture & setup
- [x] PDF ingestion (extract + overlapping chunking)
- [x] Vector storage with ChromaDB (namespaced, multi-document)
- [x] Semantic retrieval
- [x] Grounded generation with anti-hallucination
- [x] FastAPI backend
- [x] React frontend
- [x] AWS deployment (EC2 + systemd)
- [x] HTTPS (nginx + Let's Encrypt) + Vercel frontend
- [x] **v1 shipped — live and public**
---
 
## Roadmap (v2)
 
The next version turns MindForge from a single-paper demo into a proper research workspace:
 
- [ ] **Live document upload** — ingest a PDF from the browser, no redeploy
- [ ] **Multi-document library** — hold many papers at once and query across them
- [ ] **Conversational chat** — follow-up questions with memory, not one-shot Q&A
- [ ] **Multi-chat sessions** — separate, auto-named conversations per paper
- [ ] **Source citations** — show which passage each answer came from
- [ ] **Agentic layer** — multi-step reasoning and tool use for questions a single retrieval can't answer
> **A note on scope:** earlier plans listed MLflow monitoring. MindForge calls a hosted model and doesn't train anything, so there's nothing meaningful for MLflow to track here — it was removed rather than added for the sake of a checklist. (It lives, appropriately, in my [FinRisk Copilot](https://github.com/RohanKatyayani) project instead.)
 
---
 
## Run It Locally
 
```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# add a .env file with: GROQ_API_KEY=your_key_here
uvicorn api.main:app --reload
 
# Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```
 
---
 
## Contributing
 
MindForge is open source and I welcome ideas, issues, and pull requests — especially around the v2 roadmap. If you want to build a piece of it, open an issue first so we can talk through the approach.
 
---
 
## Why I Built This
 
To go from *understanding* AI concepts to *shipping* a real, production-style AI system end to end — building every line by hand so I can explain any part of it, from the chunking strategy to the SSL certificate.
 
📍 Building toward a move to Germany, 2026. 🇩🇪
