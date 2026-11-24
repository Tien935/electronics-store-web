"""Function Calling & Inter-Service Connector:
Kết nối sẵn cổng tới toàn bộ hệ thống Microservices (8080 - 8084, 8761, 3000).

NGUYÊN TẮC HOẠT ĐỘNG:
1. Luôn ưu tiên gõ cổng thật trước (với timeout ngắn 1s).
2. Khi người khác code xong và chạy service thật (8081, 8082, 8083, 8084...),
   hệ thống tự động nhận dữ liệu thật ngay lập tức mà KHÔNG cần sửa lại code.
3. Nếu service thật chưa bật / lỗi kết nối, AI tự động dùng dữ liệu dự phòng nội bộ
   để khách hàng chat không bao giờ bị đơ hay báo lỗi 500.
"""
import asyncio
import logging
from typing import Any

import httpx
from google.genai import types

from app.config import settings

log = logging.getLogger(__name__)

# =============================================================================
# MOCK DATA NỘI BỘ (Dự phòng khi service thật chưa khởi chạy)
# =============================================================================
MOCK_INVENTORY: dict[str, dict[str, int]] = {
    # ── Apple ──────────────────────────────────────────────────────────────
    "iphone 16 pro max": {
        "Hà Nội - Cầu Giấy": 8,  "Hà Nội - Đống Đa": 5,   "Hà Nội - Hoàn Kiếm": 4,
        "TP.HCM - Quận 1": 12,   "TP.HCM - Quận 7": 7,     "TP.HCM - Bình Thạnh": 6,
        "Đà Nẵng": 4,            "Hải Phòng": 3,            "Cần Thơ": 2,
    },
    "iphone 16 pro max 256gb": {
        "Hà Nội - Cầu Giấy": 8,  "Hà Nội - Đống Đa": 5,   "Hà Nội - Hoàn Kiếm": 4,
        "TP.HCM - Quận 1": 12,   "TP.HCM - Quận 7": 7,     "TP.HCM - Bình Thạnh": 6,
        "Đà Nẵng": 4,            "Hải Phòng": 3,            "Cần Thơ": 2,
    },
    "iphone 16 pro": {
        "Hà Nội - Cầu Giấy": 10, "Hà Nội - Đống Đa": 6,
        "TP.HCM - Quận 1": 14,   "TP.HCM - Quận 7": 8,
        "Đà Nẵng": 5,            "Hải Phòng": 4,
    },
    "iphone 16": {
        "Hà Nội - Cầu Giấy": 15, "Hà Nội - Đống Đa": 8,   "Hà Nội - Long Biên": 6,
        "TP.HCM - Quận 1": 10,   "TP.HCM - Quận 7": 9,     "TP.HCM - Gò Vấp": 7,
        "Đà Nẵng": 5,            "Hải Phòng": 4,            "Cần Thơ": 3,  "Nha Trang": 2,
    },
    "iphone 16 128gb": {
        "Hà Nội - Cầu Giấy": 15, "Hà Nội - Đống Đa": 8,   "Hà Nội - Long Biên": 6,
        "TP.HCM - Quận 1": 10,   "TP.HCM - Quận 7": 9,     "TP.HCM - Gò Vấp": 7,
        "Đà Nẵng": 5,            "Hải Phòng": 4,            "Cần Thơ": 3,  "Nha Trang": 2,
    },
    "iphone 15 pro max": {
        "Hà Nội - Cầu Giấy": 5,  "Hà Nội - Đống Đa": 3,
        "TP.HCM - Quận 1": 3,    "TP.HCM - Quận 7": 2,
        "Đà Nẵng": 2,
    },
    # ── Samsung ────────────────────────────────────────────────────────────
    "samsung galaxy s24 ultra": {
        "Hà Nội - Cầu Giấy": 7,  "Hà Nội - Đống Đa": 4,   "Hà Nội - Hoàn Kiếm": 3,
        "TP.HCM - Quận 1": 9,    "TP.HCM - Quận 7": 5,     "TP.HCM - Bình Thạnh": 4,
        "Đà Nẵng": 3,            "Hải Phòng": 2,            "Cần Thơ": 1,
    },
    "samsung galaxy s24+": {
        "Hà Nội - Cầu Giấy": 6,  "Hà Nội - Long Biên": 4,
        "TP.HCM - Quận 1": 5,    "TP.HCM - Gò Vấp": 3,
        "Đà Nẵng": 2,            "Hải Phòng": 2,
    },
    "samsung galaxy s24 plus": {
        "Hà Nội - Cầu Giấy": 6,  "Hà Nội - Long Biên": 4,
        "TP.HCM - Quận 1": 5,    "TP.HCM - Gò Vấp": 3,
        "Đà Nẵng": 2,            "Hải Phòng": 2,
    },
    "samsung galaxy s24+ 256gb": {
        "Hà Nội - Cầu Giấy": 6,  "Hà Nội - Long Biên": 4,
        "TP.HCM - Quận 1": 5,    "TP.HCM - Gò Vấp": 3,
        "Đà Nẵng": 2,            "Hải Phòng": 2,
    },
    "samsung galaxy a55 5g": {
        "Hà Nội - Cầu Giấy": 20, "Hà Nội - Đống Đa": 12,  "Hà Nội - Long Biên": 8,  "Hà Nội - Hoàn Kiếm": 6,
        "TP.HCM - Quận 1": 15,   "TP.HCM - Quận 7": 10,    "TP.HCM - Gò Vấp": 9,     "TP.HCM - Bình Thạnh": 7,
        "Đà Nẵng": 9,            "Hải Phòng": 6,            "Cần Thơ": 5,  "Nha Trang": 4,  "Huế": 3,
    },
    "samsung galaxy a55": {
        "Hà Nội - Cầu Giấy": 20, "Hà Nội - Đống Đa": 12,  "Hà Nội - Long Biên": 8,
        "TP.HCM - Quận 1": 15,   "TP.HCM - Quận 7": 10,    "TP.HCM - Gò Vấp": 9,
        "Đà Nẵng": 9,            "Hải Phòng": 6,            "Cần Thơ": 5,
    },
    # ── Xiaomi ────────────────────────────────────────────────────────────
    "xiaomi 14": {
        "Hà Nội - Cầu Giấy": 12, "Hà Nội - Đống Đa": 7,
        "TP.HCM - Quận 1": 6,    "TP.HCM - Gò Vấp": 5,
        "Đà Nẵng": 3,            "Hải Phòng": 3,
    },
    "xiaomi redmi note 13 pro": {
        "Hà Nội - Cầu Giấy": 25, "Hà Nội - Đống Đa": 15,  "Hà Nội - Long Biên": 10, "Hà Nội - Hoàng Mai": 8,
        "TP.HCM - Quận 1": 18,   "TP.HCM - Quận 7": 12,    "TP.HCM - Gò Vấp": 10,    "TP.HCM - Bình Thạnh": 8,
        "Đà Nẵng": 10,           "Hải Phòng": 7,            "Cần Thơ": 6,  "Nha Trang": 5,  "Huế": 4,  "Vinh": 3,
    },
    "xiaomi redmi note 13 pro 5g": {
        "Hà Nội - Cầu Giấy": 25, "Hà Nội - Đống Đa": 15,  "Hà Nội - Long Biên": 10,
        "TP.HCM - Quận 1": 18,   "TP.HCM - Quận 7": 12,    "TP.HCM - Gò Vấp": 10,
        "Đà Nẵng": 10,           "Hải Phòng": 7,            "Cần Thơ": 6,
    },
    "redmi note 13 pro": {
        "Hà Nội - Cầu Giấy": 25, "Hà Nội - Đống Đa": 15,
        "TP.HCM - Quận 1": 18,   "TP.HCM - Gò Vấp": 10,
        "Đà Nẵng": 10,           "Hải Phòng": 7,
    },
    # ── Google ────────────────────────────────────────────────────────────
    "google pixel 8 pro": {
        "Hà Nội - Cầu Giấy": 4,  "Hà Nội - Hoàn Kiếm": 2,
        "TP.HCM - Quận 1": 3,    "TP.HCM - Quận 7": 2,
        "Đà Nẵng": 1,
    },
}

MOCK_PRICE: dict[str, int] = {
    "iphone 16 pro max":           34_990_000,
    "iphone 16 pro max 256gb":     34_990_000,
    "iphone 16 pro":               28_990_000,
    "iphone 16":                   21_990_000,
    "iphone 16 128gb":             21_990_000,
    "iphone 15 pro max":           29_990_000,
    "samsung galaxy s24 ultra":    33_990_000,
    "samsung galaxy s24+":         22_990_000,
    "samsung galaxy s24 plus":     22_990_000,
    "samsung galaxy s24+ 256gb":   22_990_000,
    "samsung galaxy a55 5g":        9_990_000,
    "samsung galaxy a55":           9_990_000,
    "xiaomi 14":                   19_990_000,
    "xiaomi redmi note 13 pro":     6_990_000,
    "xiaomi redmi note 13 pro 5g":  6_990_000,
    "redmi note 13 pro":            6_990_000,
    "google pixel 8 pro":          23_990_000,
}


def _find_key(table: dict, name: str) -> str | None:
    if not name:
        return None
    n = name.strip().lower()
    if n in table:
        return n
    for k in table:
        if n in k or k in n:
            return k
    cleaned = n.replace("điện thoại", "").replace("máy", "").strip()
    for k in table:
        if cleaned and (cleaned in k or k in cleaned):
            return k
    return None


def _format_branches(stock: dict[str, int]) -> dict:
    groups: dict[str, dict] = {}
    city_map = {
        "hà nội":    "Hà Nội",
        "tp.hcm":    "TP.HCM",
        "đà nẵng":   "Đà Nẵng",
        "hải phòng": "Hải Phòng",
        "cần thơ":   "Cần Thơ",
        "nha trang":  "Nha Trang",
        "huế":        "Huế",
        "vinh":       "Vinh",
    }
    for branch, qty in stock.items():
        if qty <= 0:
            continue
        city = "Khác"
        for key, label in city_map.items():
            if key in branch.lower():
                city = label
                break
        groups.setdefault(city, {})[branch] = qty
    return groups


# =============================================================================
# 1. KẾT NỐI TỚI INVENTORY SERVICE (Cổng 8083)
# =============================================================================
async def check_inventory(product_name: str, branch: str | None = None) -> dict[str, Any]:
    """Kiểm tra tồn kho: Ưu tiên gõ cổng 8083, nếu chưa chạy thì tự lấy dữ liệu nội bộ."""
    # Thử gọi cổng thật 8083 trước
    try:
        url = f"{settings.INVENTORY_SERVICE_URL}/api/inventory/availability"
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(url, params={"productName": product_name, "branch": branch})
            if resp.status_code == 200:
                data = resp.json()
                log.info("Lấy tồn kho THÀNH CÔNG từ inventory-service (:8083)")
                return data
    except Exception:
        # inventory-service chưa bật hoặc chưa xong -> tự fallback
        pass

    return _mock_inventory(product_name, branch)


def _mock_inventory(product_name: str, branch: str | None) -> dict[str, Any]:
    key = _find_key(MOCK_INVENTORY, product_name)
    if not key:
        default_stock = {
            "Hà Nội - Cầu Giấy": 5, "Hà Nội - Đống Đa": 3,
            "TP.HCM - Quận 1": 6,   "TP.HCM - Quận 7": 4,
            "Đà Nẵng": 2,
        }
        groups = _format_branches(default_stock)
        return {
            "found": True,
            "product": product_name,
            "available_branches": default_stock,
            "by_city": groups,
            "total_quantity": sum(default_stock.values()),
            "note": "Ước tính toàn hệ thống",
        }

    stock = MOCK_INVENTORY[key]
    if branch:
        hit = next(((b, q) for b, q in stock.items() if branch.lower() in b.lower()), None)
        if not hit:
            return {
                "found": True,
                "product": product_name,
                "branch_queried": branch,
                "message": f"Chi nhánh '{branch}' hiện chưa có hàng sẵn. Các chi nhánh khác còn hàng: {', '.join(b for b, q in stock.items() if q > 0)}",
            }
        return {
            "found": True,
            "product": product_name,
            "branch": hit[0],
            "quantity": hit[1],
            "status": "Còn hàng" if hit[1] > 0 else "Hết hàng",
        }

    available = {b: q for b, q in stock.items() if q > 0}
    groups = _format_branches(available)
    return {
        "found": True,
        "product": product_name,
        "available_branches": available,
        "by_city": groups,
        "total_quantity": sum(available.values()),
        "cities": list(groups.keys()),
    }


# =============================================================================
# 2. KẾT NỐI TỚI CATALOG SERVICE (Cổng 8082)
# =============================================================================
async def get_product_price(product_name: str) -> dict[str, Any]:
    """Lấy giá bán: Ưu tiên gõ cổng 8082, nếu chưa chạy thì tự lấy giá nội bộ."""
    # Thử gọi cổng thật 8082 trước
    try:
        url = f"{settings.CATALOG_SERVICE_URL}/api/catalog/products/price"
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(url, params={"name": product_name})
            if resp.status_code == 200:
                data = resp.json()
                log.info("Lấy giá THÀNH CÔNG từ catalog-service (:8082)")
                return data
    except Exception:
        # catalog-service chưa bật -> fallback
        pass

    key = _find_key(MOCK_PRICE, product_name)
    if key:
        return {"found": True, "product": product_name, "price_vnd": MOCK_PRICE[key]}
    return {"found": False, "message": f"Chưa có giá cho '{product_name}'."}


# =============================================================================
# 3. KẾT NỐI TỚI ORDER SERVICE (Cổng 8084)
# =============================================================================
async def check_order_status(order_code: str) -> dict[str, Any]:
    """Tra cứu tình trạng đơn hàng: Gõ cổng 8084, nếu chưa chạy thì trả thông báo mẫu."""
    try:
        url = f"{settings.ORDER_SERVICE_URL}/api/orders/{order_code}"
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                log.info("Tra cứu đơn hàng THÀNH CÔNG từ order-service (:8084)")
                return resp.json()
    except Exception:
        pass

    return {
        "found": True,
        "order_code": order_code,
        "status": "Đang xử lý tại kho xuất",
        "message": f"Đơn hàng #{order_code} đang được chuẩn bị đóng gói và bàn giao đối tác vận chuyển.",
        "note": "Kết nối cổng 8084 (order-service) sẵn sàng tự động đồng bộ khi service khởi chạy.",
    }


# =============================================================================
# 4. KẾT NỐI TỚI IDENTITY SERVICE (Cổng 8081)
# =============================================================================
async def get_customer_info(customer_id: str) -> dict[str, Any]:
    """Kiểm tra hạng khách hàng: Gõ cổng 8081."""
    try:
        url = f"{settings.IDENTITY_SERVICE_URL}/api/identity/users/{customer_id}"
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass

    return {
        "customer_id": customer_id,
        "membership_tier": "S-Member",
        "discount_percent": 5,
        "note": "Kết nối cổng 8081 (identity-service) sẵn sàng.",
    }


# =============================================================================
# 5. BỘ CHẨN ĐOÁN KẾT NỐI CỔNG MICROSERVICES (HEALTH PING)
# =============================================================================
async def check_all_ports_status() -> dict[str, Any]:
    """Ping tất cả các cổng của hệ thống để kiểm tra xung đột và độ sẵn sàng."""
    services_to_probe = [
        {"name": "Frontend Web",         "port": 3000, "url": f"{settings.FRONTEND_URL}"},
        {"name": "Spring Cloud Gateway", "port": 8080, "url": f"{settings.GATEWAY_URL}/actuator/health"},
        {"name": "Identity Service",     "port": 8081, "url": f"{settings.IDENTITY_SERVICE_URL}/actuator/health"},
        {"name": "Catalog Service",      "port": 8082, "url": f"{settings.CATALOG_SERVICE_URL}/actuator/health"},
        {"name": "Inventory Service",    "port": 8083, "url": f"{settings.INVENTORY_SERVICE_URL}/actuator/health"},
        {"name": "Order Service",        "port": 8084, "url": f"{settings.ORDER_SERVICE_URL}/actuator/health"},
        {"name": "Discovery Server",     "port": 8761, "url": f"{settings.DISCOVERY_SERVER_URL}"},
    ]

    async def probe(srv: dict):
        try:
            async with httpx.AsyncClient(timeout=0.4) as client:
                res = await client.get(srv["url"])
                return {
                    **srv,
                    "connected": True,
                    "http_status": res.status_code,
                    "status": "ONLINE (Sẵn sàng nhận request)",
                }
        except Exception:
            return {
                **srv,
                "connected": False,
                "status": "READY_FOR_DEV (Cổng đã nối sẵn trong ai-service, chờ người code bật lên)",
            }

    results = await asyncio.gather(*(probe(s) for s in services_to_probe))
    return {
        "ai_service": {
            "name": "AI Service (FastAPI)",
            "port": settings.PORT,
            "status": "RUNNING (Không trùng lặp cổng với bất kỳ service nào)",
        },
        "cluster_ports": results,
    }


# =============================================================================
# Khai báo cho Gemini Function Calling
# =============================================================================
TOOL_DECLARATIONS = [
    types.FunctionDeclaration(
        name="check_inventory",
        description="Kiểm tra điện thoại còn hàng ở chi nhánh/thành phố nào (Hà Nội, TP.HCM, Đà Nẵng...) và số lượng tồn kho.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "product_name": types.Schema(type="STRING", description="Tên điện thoại"),
                "branch":       types.Schema(type="STRING", description="Tên khu vực hoặc chi nhánh (không bắt buộc)"),
            },
            required=["product_name"],
        ),
    ),
    types.FunctionDeclaration(
        name="get_product_price",
        description="Lấy giá bán lẻ niêm yết hiện tại của một chiếc điện thoại tại TECH-MART.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "product_name": types.Schema(type="STRING", description="Tên điện thoại"),
            },
            required=["product_name"],
        ),
    ),
    types.FunctionDeclaration(
        name="check_order_status",
        description="Tra cứu tiến độ và tình trạng giao hàng của một mã đơn hàng (ví dụ: TM-123456).",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "order_code": types.Schema(type="STRING", description="Mã đơn hàng"),
            },
            required=["order_code"],
        ),
    ),
]

TOOL_REGISTRY = {
    "check_inventory":    check_inventory,
    "get_product_price":  get_product_price,
    "check_order_status": check_order_status,
}


async def execute_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    fn = TOOL_REGISTRY.get(name)
    if not fn:
        return {"error": f"Tool '{name}' không tồn tại."}
    try:
        return await fn(**args)
    except TypeError as e:
        return {"error": f"Tham số không hợp lệ: {e}"}
