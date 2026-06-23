from .llm_clients import client

def embed_document(chunks: list[str]) -> list[list[float]]:
    embeddings = []
    for chunk in chunks:
        res = client.models.embed_content(
            model="gemini-embedding-2",
            contents=chunk
        )
        embeddings.append(res.embeddings[0].values)
    return embeddings