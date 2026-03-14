
import chromadb
import pdfplumber
from gov_agent.config import GEMINI_API_KEY
import google.generativeai as genai
genai.configure(api_key=GEMINI_API_KEY)


chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(
    name="scheme_rules",
    metadata={"hnsw:space": "cosine"}
)


async def ingest_document(pdf_path: str) -> int:
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ""
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    chunks = []
    i = 0
    while i < len(full_text):
        chunks.append(full_text[i:i + 500])
        i += 450

    for idx, chunk in enumerate(chunks):
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=chunk,
            task_type="retrieval_document"
        )
        collection.upsert(
            ids=[f"chunk_{idx}"],
            embeddings=[result["embedding"]],  # type: ignore
            documents=[chunk],
            metadatas=[{"source": pdf_path, "chunk_index": idx}]
        )

    return len(chunks)


async def query_eligibility(question: str) -> str:
    q_embed = genai.embed_content(
        model="models/gemini-embedding-001",
        content=question,
        task_type="retrieval_query"
    )

    results = collection.query(
        query_embeddings=[q_embed["embedding"]],  # type: ignore
        n_results=3
    )

    docs = results.get("documents")
    chunks = "\n\n".join(docs[0]) if docs and docs[0] else ""

    prompt = f"""
    You are a government scheme
    eligibility expert for India.

    Scheme Rules:
    {chunks}

    Citizen Question: {question}

    Answer clearly with:
    - Eligibility: Yes/No/Maybe
    - Required age range if applicable
    - Income limit if applicable
    - Documents needed
    - If unsure, say clearly

    Keep answer under 200 words.
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text
