from pypdf import PdfReader
import docx

def extract_document(filepath: str) -> list[dict]:
    if filepath.endswith(".pdf"):
        reader = PdfReader(filepath)
        return [
            {
                "page_number": i,
                "content": page.extract_text().replace("\xad", "")
            }
            for i, page in enumerate(reader.pages, start=1)
        ]
    
    elif filepath.endswith(".docx"):
        doc = docx.Document(filepath)
        text = "\n".join(p.text for p in doc.paragraphs)
        return text
    
    elif filepath.endswith((".txt", ".md")):
        with open(filepath, "r", encoding="UTF-8") as f:
            return f.read()
        
    else:
        raise ValueError(f"Unsupported file type: {filepath}")