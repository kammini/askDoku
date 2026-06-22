from .llm_clients import client

def embed_document(chunks: list[str]) -> list[str]:
    embedded_chunks = []
    for chunk in chunks:
        res = client.models.embed_content(
            model="gemini-embedding-2",
            contents=chunk
        )
        embedded_chunks.append(res.embeddings[0].values)
    return embedded_chunks