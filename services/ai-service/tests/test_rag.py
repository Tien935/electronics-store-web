"""Test luồng RAG + đo độ trễ.

Chạy (cần ai-service đang chạy ở :8085 và có GEMINI_API_KEY):
    pytest tests/test_rag.py -v -s
Test tools không cần mạng.
"""
import json
import os
import time

import httpx
import pytest

from app.core.tools import check_inventory, get_product_price

BASE = os.getenv("AI_SERVICE_URL", "http://localhost:8085")

QUESTIONS = [
    "So sánh iPhone 15 Pro Max và Galaxy S24 Ultra về camera",
    "Máy nào pin trâu, sạc nhanh nhất?",
    "iPhone 15 Pro Max còn hàng ở Hà Nội không?",
    "Tôi có 10 triệu, nên mua máy nào?",
]


@pytest.mark.asyncio
async def test_tool_inventory_mock():
    r = await check_inventory("iPhone 15 Pro Max", "Hà Nội")
    assert r["found"] and r["quantity"] == 5
    r = await check_inventory("Nokia 3310")
    assert r["found"] is False


@pytest.mark.asyncio
async def test_tool_price_mock():
    r = await get_product_price("xiaomi 14")
    assert r["price_vnd"] == 19_990_000


@pytest.mark.integration
@pytest.mark.parametrize("question", QUESTIONS)
def test_chat_stream_latency(question):
    t0 = time.perf_counter()
    first_token = None
    tokens, tools = [], []

    with httpx.stream("POST", f"{BASE}/api/v1/chat/stream", json={"message": question}, timeout=60) as r:
        assert r.status_code == 200
        for line in r.iter_lines():
            if not line.startswith("data: "):
                continue
            ev = json.loads(line[6:])
            if ev["type"] == "token":
                first_token = first_token or time.perf_counter() - t0
                tokens.append(ev["data"])
            elif ev["type"] == "tool":
                tools.append(ev["data"]["name"])
            elif ev["type"] == "error":
                pytest.fail(ev["data"])

    total = time.perf_counter() - t0
    print(f"\n[{question}]\n  TTFT={first_token:.2f}s  total={total:.2f}s  tools={tools}")
    assert "".join(tokens).strip()
    assert first_token < 6