from fastapi import FastAPI
from backend.rag.ingest import generate_answer
from pydantic import BaseModel

class Question(BaseModel):
    question: str

app = FastAPI()

@app.get("/")
def home():
    return {"Message": "MindForge is Alive"}

@app.post("/ask")
def ask(item: Question):
    answer = generate_answer(item.question)
    return {"answer": answer}