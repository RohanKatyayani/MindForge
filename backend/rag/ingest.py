from pypdf import PdfReader

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

if __name__ == "__main__":
    sample = "A" * 1000
    result = chunk_text(sample)
    print(f"Number of chunks: {len(result)}")
    for i, c in enumerate(result):
        print(f"Chunk {i}: length {len(c)}")