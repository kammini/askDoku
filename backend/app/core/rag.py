from app.core.clients import gemini
from .embed import embed_document
from .clients import supabase

def generate_response(question: str) -> str:
   res = gemini.models.generate_content(
        model="gemini-2.0-flash",
        input=question
   )
   return res

def retrieve_context(question: str) -> list[str]:
   embedding = embed_document([question])[0]
   result = supabase.rpc(
      "match_documents",
      {"query_embedding": embedding, "match_count": 5}
   ).execute()
   return [row["content"] for row in result.data]