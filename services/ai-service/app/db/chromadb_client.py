"""Khởi tạo ChromaDB + hàm embedding (Gemini) kèm cơ chế tự phục hồi."""
import logging
from functools import lru_cache

import chromadb
from google import genai
from google.genai import types

from app.config import settings

log = logging.getLogger(__name__)


@lru_cache
def get_genai_client() -> genai.Client:
    return genai.Client(api_key=settings.GEMINI_API_KEY)


@lru_cache
def get_chroma_client():
    if settings.CHROMA_HOST:
        return chromadb.HttpClient(host=settings.CHROMA_HOST, port=settings.CHROMA_PORT)
    try:
        return chromadb.PersistentClient(path=settings.CHROMA_PATH)
    except Exception as e:
        log.warning("Không mở được persistent ChromaDB (%s), dùng EphemeralClient: %s", settings.CHROMA_PATH, e)
        return chromadb.EphemeralClient()


def get_collection():
    # cosine phù hợp với vector embedding văn bản
    return get_chroma_client().get_or_create_collection(
        name=settings.CHROMA_COLLECTION,
        metadata={"hnsw:space": "cosine"},
    )


def embed_documents(texts: list[str]) -> list[list[float]]:
    """Dùng cho seed (đồng bộ). API giới hạn ~100 văn bản mỗi lần gọi."""
    out: list[list[float]] = []
    for i in range(0, len(texts), 50):
        try:
            res = get_genai_client().models.embed_content(
                model=settings.EMBEDDING_MODEL,
                contents=texts[i : i + 50],
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=settings.EMBEDDING_DIM,
                ),
            )
            out.extend(e.values for e in res.embeddings)
        except Exception as e:
            log.warning("Lỗi embed_documents từ Gemini API: %s. Dùng fallback vector.", e)
            # Sinh dummy vector để không gãy tiến trình nạp
            for _ in texts[i : i + 50]:
                out.append([0.0] * settings.EMBEDDING_DIM)
    return out


async def embed_query(text: str) -> list[float]:
    try:
        res = await get_genai_client().aio.models.embed_content(
            model=settings.EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY",
                output_dimensionality=settings.EMBEDDING_DIM,
            ),
        )
        return res.embeddings[0].values
    except Exception as e:
        log.warning("Lỗi embed_query: %s. Trả về vector rỗng để trigger keyword fallback.", e)
        return []
