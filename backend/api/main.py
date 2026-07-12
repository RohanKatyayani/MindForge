from fastapi import FastAPI
from backend.rag.ingest import generate_answer
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class Question(BaseModel):
    question: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://mind-forge-coral.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"Message": "MindForge is Alive"}

@app.post("/ask")
def ask(item: Question):
    answer = generate_answer(item.question)
    return {"answer": answer}