from .clients import gemini

BATCH_SIZE = 50

def embed_document(chunks: list[str]) -> list[list[float]]:
    embeddings = []
    for i in range(0, len(chunks), BATCH_SIZE):
        chunk = chunks[i:i + BATCH_SIZE]
        res = gemini.models.embed_content(
            model="gemini-embedding-2",
            contents=chunk
        )
        embeddings.extend(emb.values for emb in res.embeddings)
    return embeddings