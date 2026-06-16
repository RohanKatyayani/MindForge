from pypdf import PdfReader
import chromadb

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

def store_chunks(chunks):
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection(name="papers")
    ids = [str(i) for i in range(len(chunks))]
    collection.add(documents=chunks, ids=ids)

def retrieve(question, n_results=3):
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection(name="papers")
    results = collection.query(
        query_texts=[question],
        n_results=n_results
    )
    return results["documents"][0]
     
if __name__ == "__main__":
    question = "What did transformers change?"
    results = retrieve(question)
    print(results)