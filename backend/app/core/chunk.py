def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    words = text.split()
    chunks = []
    step = 0
    while step < len(words):
        end = step + chunk_size
        chunk_words = words[step:end]
        chunks.append(" ".join(chunk_words))
        step += chunk_size - overlap

    return chunks 