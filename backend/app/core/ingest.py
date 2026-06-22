from .extract import extract_document
from .chunk import chunk_text
from .embed import embed_document

def ingest_document(filepath: str):
    # extract
    text = extract_document(filepath)
    # chunk
    chunks = chunk_text(text)
    # embed
    embedded_chunks = embed_document(chunks)
    # store
    