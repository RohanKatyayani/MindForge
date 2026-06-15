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

if __name__ == "__main__":
    sample_text = "Transformers changed AI forever. " * 100
    chunks = chunk_text(sample_text)
    store_chunks(chunks)
    print(f"Stored {len(chunks)} chunks in ChromaDB")