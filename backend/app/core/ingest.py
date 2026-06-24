from .extract import extract_document
from .chunk import chunk_text
from .embed import embed_document
from .store import store_chunks
import hashlib

def get_document_id(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def ingest_document(filepath: str, file_bytes: bytes):
    # extract & get document_id
    document_id = get_document_id(file_bytes)
    pages = extract_document(filepath)
    # chunk
    chunks = chunk_text(pages, document_id)
    # embed
    embeddings = embed_document(chunk["content"] for chunk in chunks)
    # store
    store_chunks(chunks, embeddings)