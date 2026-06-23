from pypdf import PdfReader
import chromadb
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()

groq_api = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api)

def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def chunk_text(text, chunk_size=500, chunk_overlap=100):
    chunks = []
    step = chunk_size - chunk_overlap
    for i in range(0, len(text), step):
        chunk = text[i : i + chunk_size]
        chunks.append(chunk)
    return chunks

def store_chunks(chunks, name):
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection(name="papers")
    name_ids = [f"{name}_{i}" for i in range(len(chunks))]
    collection.upsert(documents=chunks, ids=name_ids)

def retrieve(question, n_results=8):
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection(name="papers")
    results = collection.query(
        query_texts=[question],
        n_results=n_results
    )
    return results["documents"][0]

def generate_answer(question):
    chunks = "\n".join(retrieve(question, n_results=8))

    prompt = f""" Answer the following question from the provided information only.
    DO not use your own data and only answer from the context provided. 
    If you do not have the information or the chunks are empty simply say, "I don't know" and leave it to that.

    here are the relevant Chunks of information from the database about the question: {chunks}

    Here is the question that was asked: {question}

    Answer: """

    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

if __name__ == "__main__":

    text = extract_text("data/PaLM.pdf")

    chunks = chunk_text(text)

    print(f"\nTotal Number of Chunks = {len(chunks)}\n")

    store_chunks(chunks, "palm")
    
    q1 = "How many parameters does PaLM have?"
    print("RETRIEVED:", retrieve(q1))
    print(f"\nQ: {q1}\nA: {generate_answer(q1)}\n")