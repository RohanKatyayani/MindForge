from fastapi import FastAPI
from backend.rag.ingest import generate_answer

app = FastAPI()

@app.get("/")
def home():
    return {"Message": "MindForge is Alive"}