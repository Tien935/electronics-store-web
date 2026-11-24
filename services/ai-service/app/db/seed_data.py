"""Đọc data/phones_spec.json -> embedding -> nạp vào ChromaDB.

Chạy:  python -m app.db.seed_data          (thêm/cập nhật)
       python -m app.db.seed_data --reset  (xoá collection rồi nạp lại)
"""
import json
import sys

from app.config import settings
from app.db.chromadb_client import embed_documents, get_chroma_client, get_collection
from app.models.schemas import ProductSpec


def phone_to_document(p: ProductSpec) -> str:
    """Biến một máy thành đoạn văn bản giàu ngữ nghĩa để embed."""
    return (
        f"{p.name} ({p.brand}). Giá tham khảo {p.price_vnd:,} VND. "
        f"Hệ điều hành: {p.os}. Chip: {p.chipset}. RAM {p.ram_gb}GB. "
        f"Bộ nhớ: {', '.join(str(s) for s in p.storage_gb)}GB. "
        f"Màn hình: {p.display}. Camera: {p.camera}. "
        f"Pin {p.battery_mah}mAh, {p.charging}. "
        f"Ưu điểm: {'; '.join(p.pros)}. Nhược điểm: {'; '.join(p.cons)}. "
        f"Tóm tắt: {p.summary}"
    )


def seed(reset: bool = False) -> int:
    if reset:
        try:
            get_chroma_client().delete_collection(settings.CHROMA_COLLECTION)
        except Exception:
            pass

    with open(settings.PHONES_SPEC_PATH, encoding="utf-8") as f:
        phones = [ProductSpec(**item) for item in json.load(f)]

    docs = [phone_to_document(p) for p in phones]
    vectors = embed_documents(docs)

    get_collection().upsert(
        ids=[p.id for p in phones],
        documents=docs,
        embeddings=vectors,
        metadatas=[
            {"name": p.name, "brand": p.brand, "price_vnd": p.price_vnd} for p in phones
        ],
    )
    return len(phones)


if __name__ == "__main__":
    n = seed(reset="--reset" in sys.argv)
    print(f"Đã nạp {n} sản phẩm vào ChromaDB.")