'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { addToCart, readCart } from '../lib/cart';

// ================= DỮ LIỆU SẢN PHẨM ĐỒNG BỘ 100% CSDL =================
// Mỗi sản phẩm chỉ có đúng 1 giá duy nhất (cột price DECIMAL(15,2)) chuẩn theo Database
const DB_PRODUCTS = [
  {
    id: 1,
    sku: 'IP16PM-256-TN',
    name: 'iPhone 16 Pro Max 256GB',
    description: 'iPhone 16 Pro Max thiết kế Titan Cấp 5 bền bỉ và nhẹ nhất. Màn hình Super Retina XDR 6.9 inch với viền mỏng kỷ lục. Sức mạnh đột phá từ chip Apple A18 Pro 3nm cùng bộ xử lý thần kinh 16 lõi, hỗ trợ toàn diện hệ thống trí tuệ Apple Intelligence. Cụm 3 camera 48MP Fusion hỗ trợ nút điều khiển Camera Control độc quyền thế hệ mới.',
    price: 34990000,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
    category_id: 1,
    brand_id: 1,
    category_name: 'Điện thoại di động',
    brand_name: 'Apple',
    status: 'ACTIVE',
    created_at: '2026-11-15 08:30:00',
    updated_at: '2026-11-20 14:20:00',
    colors: [
      { name: 'Titan Sa Mạc', hex: '#d4af88' },
      { name: 'Titan Tự Nhiên', hex: '#9f9e9a' },
      { name: 'Titan Trắng', hex: '#e8e8e6' },
      { name: 'Titan Đen', hex: '#343538' },
    ],
  },
  {
    id: 2,
    sku: 'SS-S24U-512-TI',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Samsung Galaxy S24 Ultra trang bị khung viền Titan cao cấp và bút S-Pen tích hợp. Quyền năng Galaxy AI đỉnh cao với tính năng dịch thuật cuộc gọi trực tiếp, khoanh vùng tìm kiếm đa năng Circle to Search và trợ lý chỉnh sửa ảnh thông minh. Chip Snapdragon 8 Gen 3 for Galaxy cho hiệu năng đỉnh cao.',
    price: 29990000,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop',
    category_id: 1,
    brand_id: 2,
    category_name: 'Điện thoại di động',
    brand_name: 'Samsung',
    status: 'ACTIVE',
    created_at: '2026-11-15 09:00:00',
    updated_at: '2026-11-20 15:00:00',
    colors: [
      { name: 'Xám Titan', hex: '#8a8d8f' },
      { name: 'Đen Titan', hex: '#2b2c2d' },
      { name: 'Tím Titan', hex: '#635b75' },
      { name: 'Vàng Titan', hex: '#e8d8b8' },
    ],
  },
  {
    id: 3,
    sku: 'MBA-M3-15-16GB',
    name: 'MacBook Air M3 15 inch 16GB/512GB',
    description: 'MacBook Air M3 15 inch trang bị chip Apple M3 thế hệ mới với CPU 8 lõi và GPU 10 lõi, màn hình Liquid Retina 15.3 inch hiển thị 1 tỷ màu. Thời lượng pin ấn tượng lên tới 18 giờ liên tục trong thân máy nhôm tái chế mỏng nhẹ chỉ 11.5mm.',
    price: 32490000,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
    category_id: 2,
    brand_id: 1,
    category_name: 'Laptop / Máy tính xách tay',
    brand_name: 'Apple',
    status: 'ACTIVE',
    created_at: '2026-11-15 09:30:00',
    updated_at: '2026-11-20 15:30:00',
    colors: [
      { name: 'Midnight', hex: '#1e2430' },
      { name: 'Starlight', hex: '#f0e5d8' },
      { name: 'Space Gray', hex: '#7d7e80' },
      { name: 'Silver', hex: '#e3e4e6' },
    ],
  },
  {
    id: 4,
    sku: 'IPP-M4-11-256',
    name: 'iPad Pro M4 11 inch Wi-Fi 256GB',
    description: 'iPad Pro M4 sở hữu màn hình Ultra Retina XDR Tandem OLED tiên phong với độ sáng đỉnh cao 1600 nits. Chip Apple M4 thế hệ kế tiếp cho sức mạnh xử lý AI vượt trội. Thiết kế siêu mỏng chỉ 5.3mm và hỗ trợ bút Apple Pencil Pro mới.',
    price: 28990000,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
    category_id: 3,
    brand_id: 1,
    category_name: 'Máy tính bảng (Tablet)',
    brand_name: 'Apple',
    status: 'ACTIVE',
    created_at: '2026-11-16 08:00:00',
    updated_at: '2026-11-20 16:00:00',
    colors: [
      { name: 'Đen Không Gian', hex: '#2e2e2e' },
      { name: 'Bạc', hex: '#e5e5e5' },
    ],
  },
  {
    id: 5,
    sku: 'APP2-USBC-WHITE',
    name: 'Tai nghe Apple AirPods Pro 2 USB-C',
    description: 'AirPods Pro 2 trang bị chip Apple H2 với khả năng chống ồn chủ động ANC gấp đôi thế hệ trước. Chế độ âm thanh thích ứng Adaptive Audio, chuẩn kháng bụi nước IP54 và hộp sạc MagSafe cổng Type-C.',
    price: 5790000,
    image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop',
    category_id: 4,
    brand_id: 1,
    category_name: 'Phụ kiện & Tai nghe',
    brand_name: 'Apple',
    status: 'ACTIVE',
    created_at: '2026-11-16 09:00:00',
    updated_at: '2026-11-20 16:30:00',
    colors: [{ name: 'Trắng', hex: '#ffffff' }],
  },
  {
    id: 6,
    sku: 'ASUS-ROG-G16-4070',
    name: 'Laptop Gaming ASUS ROG Zephyrus G16',
    description: 'ASUS ROG Zephyrus G16 là cỗ máy gaming cao cấp mỏng nhẹ. Trang bị vi xử lý Intel Core Ultra 9 185H và card đồ họa NVIDIA GeForce RTX 4070 8GB. Màn hình ROG Nebula OLED 2.5K tần số quét 240Hz thời gian phản hồi 0.2ms.',
    price: 52990000,
    image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=600&fit=crop',
    category_id: 2,
    brand_id: 3,
    category_name: 'Laptop / Máy tính xách tay',
    brand_name: 'ASUS',
    status: 'ACTIVE',
    created_at: '2026-11-17 08:00:00',
    updated_at: '2026-11-21 10:00:00',
    colors: [
      { name: 'Xám Eclipse', hex: '#3d3d3d' },
      { name: 'Trắng Platinum', hex: '#f0f0f0' },
    ],
  },
  {
    id: 7,
    sku: 'XM-14U-512-LEICA',
    name: 'Xiaomi 14 Ultra 5G 512GB Leica',
    description: 'Xiaomi 14 Ultra hợp tác cùng Leica với hệ thống 4 camera quang học đỉnh cao, khẩu độ vô cấp f/1.63 - f/4.0 trên cảm biến Sony LYT-900 1 inch. Màn hình cong siêu mỏng WQHD+ 120Hz và chip Snapdragon 8 Gen 3 siêu mạnh.',
    price: 26990000,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
    category_id: 1,
    brand_id: 5,
    category_name: 'Điện thoại di động',
    brand_name: 'Xiaomi',
    status: 'ACTIVE',
    created_at: '2026-11-17 09:00:00',
    updated_at: '2026-11-21 11:00:00',
    colors: [
      { name: 'Đen Da Thuần Chay', hex: '#1c1c1c' },
      { name: 'Trắng Da Thuần Chay', hex: '#f5f5f5' },
    ],
  },
  {
    id: 8,
    sku: 'SONY-WH1000XM5-BLK',
    name: 'Tai nghe không dây Sony WH-1000XM5',
    description: 'Sony WH-1000XM5 sở hữu công nghệ chống ồn hàng đầu với hai bộ xử lý V1 và HD QN1 cùng 8 micro thu âm. Hỗ trợ truyền tải âm thanh chuẩn Hi-Res Audio Wireless qua codec LDAC. Thời lượng pin 30 giờ và công nghệ đàm thoại AI.',
    price: 7990000,
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop',
    category_id: 4,
    brand_id: 4,
    category_name: 'Phụ kiện & Tai nghe',
    brand_name: 'Sony',
    status: 'ACTIVE',
    created_at: '2026-11-18 08:00:00',
    updated_at: '2026-11-21 12:00:00',
    colors: [
      { name: 'Đen Nhám', hex: '#262626' },
      { name: 'Bạc Khói', hex: '#cfcfcf' },
    ],
  },
];

function CellphoneSProductDetail() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id');
  const rawSku = searchParams.get('sku');

  // Lấy sản phẩm dựa vào id hoặc sku theo CSDL
  const product = useMemo(() => {
    if (rawId) {
      const found = DB_PRODUCTS.find((p) => p.id === Number(rawId));
      if (found) return found;
    }
    if (rawSku) {
      const found = DB_PRODUCTS.find((p) => p.sku.toLowerCase() === rawSku.toLowerCase());
      if (found) return found;
    }
    return DB_PRODUCTS[0];
  }, [rawId, rawSku]);

  // Các sản phẩm khác
  const otherProducts = useMemo(() => {
    return DB_PRODUCTS.filter((p) => p.id !== product.id);
  }, [product]);

  // State người dùng chọn
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Tiêu chuẩn');
  const [cartCount, setCartCount] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Hà Nội');

  useEffect(() => {
    const updateCount = () => setCartCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('cart-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const handleAddToCart = () => {
    addToCart(product, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontSize: '15px' }}>
      
      {/* ===== 1. TOPBAR ===== */}
      <div style={{ backgroundColor: '#e0052b', color: '#fff', fontSize: '13px', padding: '4px 0' }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-geo-alt-fill text-warning me-1"></i>
            Xem giá và tồn kho tại: <strong>{selectedLocation}</strong>
          </div>
          <div className="d-none d-md-flex gap-4">
            <span><i className="bi bi-telephone-fill text-warning me-1"></i>Hotline: <strong>1800.2097</strong> (Miễn phí)</span>
            <span><i className="bi bi-truck text-warning me-1"></i>Giao nhanh 2h</span>
            <span><i className="bi bi-shield-check text-warning me-1"></i>Bảo hành chính hãng 12 tháng</span>
          </div>
        </div>
      </div>

      {/* ===== 2. HEADER CELLPHONES CHÍNH ===== */}
      <header style={{ backgroundColor: '#d70018', padding: '12px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between gap-3">
            
            {/* Logo TechMart */}
            <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
              <div
                style={{
                  backgroundColor: '#fff',
                  color: '#d70018',
                  borderRadius: '10px',
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '24px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                <i className="bi bi-phone-fill"></i>
              </div>
              <div style={{ lineHeight: '1.1' }}>
                <span className="fw-black text-white d-block" style={{ fontWeight: '900', letterSpacing: '-0.5px', fontSize: '22px' }}>
                  Tech<b className="text-warning">Mart</b>
                </span>
              </div>
            </Link>

            {/* Thanh tìm kiếm */}
            <div className="d-none d-md-block flex-grow-1 mx-3" style={{ maxWidth: '480px' }}>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bạn cần tìm điện thoại, laptop, phụ kiện gì?..."
                  style={{
                    borderRadius: '10px',
                    padding: '9px 40px 9px 15px',
                    fontSize: '13px',
                    border: 'none',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <button
                  type="button"
                  className="btn p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-secondary border-0"
                >
                  <i className="bi bi-search fs-6"></i>
                </button>
              </div>
            </div>

            {/* Cụm chức năng bên phải */}
            <div className="d-flex align-items-center gap-2">
              <Link
                href="/admin"
                className="btn btn-sm text-white d-none d-lg-flex align-items-center gap-1 px-3 py-2 fw-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '13px' }}
              >
                <i className="bi bi-speedometer2 fs-6"></i>
                <span>Trang Admin</span>
              </Link>

              {/* Giỏ Hàng CellphoneS */}
              <Link
                href="/cart"
                className="btn btn-sm text-white d-flex align-items-center gap-2 px-3 py-2 fw-semibold position-relative"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '13px', border: 'none' }}
              >
                <i className="bi bi-cart3 fs-5"></i>
                <div className="text-start d-none d-sm-block" style={{ lineHeight: '1.1' }}>
                  <span style={{ fontSize: '11px', display: 'block', opacity: 0.85 }}>Giỏ hàng</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{cartCount} món</span>
                </div>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== 3. BREADCRUMB CELLPHONES ===== */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ebebeb', padding: '8px 0', fontSize: '13px' }}>
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none text-muted">
                  <i className="bi bi-house-door-fill me-1"></i>Trang chủ
                </Link>
              </li>
              <li className="breadcrumb-item text-muted">{product.category_name}</li>
              <li className="breadcrumb-item text-muted">{product.brand_name}</li>
              <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Toast thông báo giỏ hàng */}
      {addedToast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3">
          <div className="alert alert-success shadow-lg border-0 d-flex align-items-center gap-2 py-2 px-4 rounded-pill">
            <i className="bi bi-check-circle-fill fs-5 text-success"></i>
            <div>Đã thêm <strong>{product.name}</strong> ({selectedColor}) vào giỏ hàng!</div>
          </div>
        </div>
      )}

      {/* ===== 4. KHỐI NỘI DUNG CHI TIẾT SẢN PHẨM ===== */}
      <main className="py-3">
        <div className="container">
          
          {/* Header Sản phẩm: Tên + Đánh giá + SKU */}
          <div className="bg-white p-3 rounded-3 shadow-sm mb-3 border">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h1 className="h5 fw-bold mb-1 text-dark" style={{ fontSize: '20px' }}>
                  {product.name} Chính Hãng VN/A
                </h1>
                <div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '14px' }}>
                  <span className="text-warning">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-half"></i>
                  </span>
                  <strong className="text-dark">4.9</strong>
                  <span className="text-muted">(128 đánh giá)</span>
                  <span className="text-muted">|</span>
                  <span className="text-muted">|</span>
                  <span className="text-muted">
    Mã SKU: <strong className="text-dark font-monospace">{product.sku}</strong>
  </span>
                  <span className="text-muted">|</span>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                    Chính hãng {product.brand_name}
                  </span>
                </div>
              </div>


            </div>
          </div>

          <div className="row g-3">
            {/* CỘT TRÁI: GALLERY ẢNH & THÔNG TIN BẢO HÀNH CHUẨN CELLPHONES */}
            <div className="col-12 col-lg-5">
              
              {/* Box Ảnh Chính */}
              <div className="bg-white p-3 rounded-3 shadow-sm border text-center position-relative mb-3">
                <span
                  className="badge position-absolute top-0 start-0 m-3 fw-bold"
                  style={{ backgroundColor: '#d70018', fontSize: '12px', padding: '6px 10px', borderRadius: '8px' }}
                >

                </span>
                <span
                  className="badge position-absolute top-0 end-0 m-3 fw-bold bg-warning text-dark"
                  style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '8px' }}
                >
                  Chính hãng VN/A
                </span>

                <div className="py-4 d-flex align-items-center justify-content-center" style={{ minHeight: '340px' }}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="img-fluid"
                    style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop';
                    }}
                  />
                </div>


              </div>

              {/* Box Cam Kết Dịch Vụ CellphoneS Style */}
              <div className="bg-white p-3 rounded-3 shadow-sm border">
                <h6 className="fw-bold mb-3 text-dark d-flex align-items-center" style={{ fontSize: '14px' }}>
                  <i className="bi bi-shield-check text-danger me-2 fs-5"></i>
                  Thông Tin Bảo Hành & Cam Kết
                </h6>
                <div className="d-flex flex-column gap-2" style={{ fontSize: '13px' }}>
                  <div className="d-flex align-items-start gap-2 text-secondary">
                    <i className="bi bi-shield-shaded text-danger fs-6 mt-1"></i>
                    <span>Bảo hành <strong>12 tháng chính hãng</strong> tại trung tâm bảo hành ủy quyền của <strong>{product.brand_name}</strong>.</span>
                  </div>
                  <div className="d-flex align-items-start gap-2 text-secondary">
                    <i className="bi bi-arrow-repeat text-danger fs-6 mt-1"></i>
                    <span><strong>1 đổi 1 trong 30 ngày</strong> đầu tiên nếu phát sinh lỗi phần cứng do nhà sản xuất.</span>
                  </div>
                  <div className="d-flex align-items-start gap-2 text-secondary">
                    <i className="bi bi-box-seam text-danger fs-6 mt-1"></i>
                    <span>Bộ sản phẩm gồm: Hộp máy mới 100% nguyên seal, sách hướng dẫn, cáp kết nối chính hãng.</span>
                  </div>
                  <div className="d-flex align-items-start gap-2 text-secondary">
                    <i className="bi bi-truck text-danger fs-6 mt-1"></i>
                    <span>Giao hàng miễn phí nội thành trong <strong>2 giờ</strong> hoặc nhận trực tiếp tại cửa hàng.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: ĐÚNG 1 GIÁ DUY NHẤT THEO DATABASE, CHỌN MÀU SẮC, ĐẶT MUA */}
            <div className="col-12 col-lg-7">
              <div className="bg-white p-3 rounded-3 shadow-sm border">
                
                {/* 1. Khối Giá Đồng Bộ 100% Database (Chỉ 1 giá duy nhất) */}
                <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#fff5f5', border: '1px solid #ffd2d2' }}>
                  <div className="d-flex align-items-baseline gap-2 flex-wrap mb-1">
                    <span className="fs-1 fw-black text-danger" style={{ fontWeight: '900' }}>
                      {Number(product.price).toLocaleString('vi-VN')}₫
                    </span>
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1" style={{ fontSize: '12px' }}>
                      Giá niêm yết chính hãng (Đã gồm VAT)
                    </span>
                  </div>
                  <div className="small text-muted d-flex align-items-center gap-2 mt-1 flex-wrap">
                    <span><i className="bi bi-truck text-danger me-1"></i>Miễn phí giao hàng</span>
                  </div>
                </div>

                {/* 2. Phiên bản hiện tại (Theo mã SKU trong CSDL) */}
                <div className="mb-3">
                  <div className="fw-bold small text-dark mb-2">Phiên bản sản phẩm:</div>
                  <div
                    className="p-2 px-3 rounded-2 d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', fontSize: '13px' }}
                  >
                    <i className="bi bi-tag-fill text-danger"></i>
                    <strong className="text-dark">{product.name}</strong>
                    <span className="text-muted">| SKU: <span className="font-monospace text-dark">{product.sku}</span></span>
                  </div>
                </div>

                {/* 3. Chọn Màu Sắc (Áp dụng cùng 1 giá duy nhất) */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-3">
                    <div className="fw-bold small text-dark mb-2">
                      Chọn màu sắc: <span className="text-danger fw-semibold">{selectedColor}</span>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      {product.colors.map((c) => {
                        const isSelected = selectedColor === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.name)}
                            className="btn d-flex align-items-center gap-2 text-start position-relative"
                            style={{
                              border: isSelected ? '2px solid #d70018' : '1px solid #e0e0e0',
                              backgroundColor: isSelected ? '#fff5f5' : '#fff',
                              borderRadius: '8px',
                              padding: '8px 14px',
                            }}
                          >
                            <span
                              className="rounded-circle border d-inline-block shadow-sm"
                              style={{ width: '16px', height: '16px', backgroundColor: c.hex }}
                            ></span>
                            <span className="fw-semibold" style={{ color: isSelected ? '#d70018' : '#333', fontSize: '13px' }}>
                              {c.name}
                            </span>
                            {isSelected && (
                              <span
                                className="position-absolute top-0 end-0 translate-middle-y me-1 badge rounded-circle bg-danger p-1"
                                style={{ fontSize: '8px' }}
                              >
                                <i className="bi bi-check"></i>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Khối Khuyến Mại Hộp Quà Đặc Trưng CellphoneS */}
                <div
                  className="rounded-3 p-3 mb-3 position-relative"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px dashed #d70018',
                  }}
                >
                  <div
                    className="d-inline-flex align-items-center gap-1 text-white fw-bold px-2 py-1 rounded"
                    style={{ backgroundColor: '#d70018', fontSize: '12px', marginTop: '-24px', marginBottom: '8px' }}
                  >
                    <i className="bi bi-gift-fill"></i>
                    <span>KHUYẾN MẠI ĐẶC QUYỀN</span>
                  </div>

                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2" style={{ fontSize: '13px', color: '#333' }}>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-danger rounded-circle p-1 mt-1" style={{ fontSize: '6px' }}> </span>
                      <span>Giảm thêm <strong>5% (tối đa 1.000.000đ)</strong> qua cổng VNPAY / MoMo.</span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-danger rounded-circle p-1 mt-1" style={{ fontSize: '6px' }}> </span>
                      <span>Thu cũ đổi mới - <strong>Trợ giá đến 4.000.000đ</strong> cho khách lên đời máy.</span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-danger rounded-circle p-1 mt-1" style={{ fontSize: '6px' }}> </span>
                      <span>Giảm thêm <strong>500.000đ</strong> cho thành viên Member và Học sinh - Sinh viên.</span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge bg-danger rounded-circle p-1 mt-1" style={{ fontSize: '6px' }}> </span>
                      <span>Tặng kèm gói củ sạc nhanh và ốp lưng bảo vệ chính hãng.</span>
                    </li>
                  </ul>
                </div>

                {/* 5. Vị trí và số lượng cửa hàng còn hàng */}
                <div className="p-2 mb-3 rounded-2 bg-light border d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '12px' }}>
                  <div>
                    <i className="bi bi-shop me-1 text-danger"></i>
                    Có <strong>18 cửa hàng</strong> tại <strong>{selectedLocation}</strong> sẵn hàng giao ngay.
                  </div>
                  <select
                    className="form-select form-select-sm border-0 bg-transparent fw-bold text-danger w-auto"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="Hà Nội">Khu vực Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">Khu vực TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Khu vực Đà Nẵng</option>
                  </select>
                </div>

                {/* 6. Cụm Nút Mua Hàng & Trả Góp CellphoneS */}
                <div className="d-flex flex-column gap-2">
                  <div className="row g-2">
                    {/* Nút MUA NGAY to bản màu đỏ */}
                    <div className="col-12 col-md-9">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="btn w-100 py-2 text-white fw-bold shadow-sm"
                        style={{
                          backgroundColor: '#d70018',
                          borderRadius: '10px',
                          border: 'none',
                        }}
                      >
                        <div style={{ fontSize: '16px', fontWeight: '800' }}>MUA NGAY</div>
                        <div style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.9 }}>
                          Giao tận nơi hoặc nhận tại cửa hàng
                        </div>
                      </button>
                    </div>

                    {/* Nút Thêm vào giỏ viền đỏ */}
                    <div className="col-12 col-md-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="btn w-100 py-2 fw-bold d-flex flex-column align-items-center justify-content-center h-100"
                        style={{
                          border: '2px solid #d70018',
                          borderRadius: '10px',
                          color: '#d70018',
                          backgroundColor: '#fff',
                        }}
                      >
                        <i className="bi bi-cart-plus fs-5"></i>
                        <span style={{ fontSize: '11px' }}>Thêm vào giỏ</span>
                      </button>
                    </div>
                  </div>


                </div>

              </div>
            </div>
          </div>

          {/* ===== 5. MÔ TẢ ĐẶC ĐIỂM NỔI BẬT & BẢNG THÔNG SỐ KỸ THUẬT ===== */}
          <div className="row g-3 mt-3">
            
            {/* Cột Trái: Đặc điểm nổi bật */}
            <div className="col-12 col-lg-8">
              <div className="bg-white p-4 rounded-3 shadow-sm border">
                <h5 className="fw-bold mb-3 text-dark d-flex align-items-center" style={{ fontSize: '16px' }}>
                  <i className="bi bi-card-text text-danger me-2"></i>
                  Đặc Điểm Nổi Bật
                </h5>

                <p className="text-secondary lh-base mb-4" style={{ fontSize: '15px', lineHeight: '1.8' }}>
                  {product.description}
                </p>

                <div className="p-3 rounded-3" style={{ backgroundColor: '#f9f9f9', borderLeft: '4px solid #d70018' }}>
                  <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>Cam kết sản phẩm</h6>
                  <ul className="mb-0 text-muted small lh-lg">
                    <li>Hàng chính hãng phân phối ủy quyền bởi <strong>{product.brand_name} Việt Nam</strong>.</li>
                    <li>Sản phẩm mới 100% nguyên seal hộp và đầy đủ phụ kiện theo tiêu chuẩn nhà sản xuất.</li>
                    <li>Áp dụng chính sách bảo hành toàn diện tại Techmart và các trung tâm ủy quyền.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cột Phải: Bảng thông số kỹ thuật CellphoneS */}
            <div className="col-12 col-lg-4">
              <div className="bg-white p-3 rounded-3 shadow-sm border">
                <h5 className="fw-bold mb-3 text-dark d-flex align-items-center" style={{ fontSize: '16px' }}>
                  <i className="bi bi-gear-wide-connected text-danger me-2"></i>
                  Thông Số Kỹ Thuật
                </h5>

                <table className="table table-striped table-sm mb-0" style={{ fontSize: '14px' }}>
                  <tbody>
                    <tr>
                      <td className="text-muted py-2" style={{ width: '45%' }}>Mã SKU:</td>
                      <td className="fw-bold text-dark font-monospace py-2">{product.sku}</td>
                    </tr>
                    <tr>
                      <td className="text-muted py-2">Giá niêm yết:</td>
                      <td className="fw-bold text-danger py-2">{Number(product.price).toLocaleString('vi-VN')}₫</td>
                    </tr>
                    <tr>
                      <td className="text-muted py-2">Danh mục:</td>
                      <td className="fw-semibold text-danger py-2">{product.category_name}</td>
                    </tr>
                    <tr>
                      <td className="text-muted py-2">Hãng sản xuất:</td>
                      <td className="fw-semibold text-dark py-2">{product.brand_name}</td>
                    </tr>
                    <tr>
                      <td className="text-muted py-2">Trạng thái:</td>
                      <td className="fw-semibold text-success py-2">{product.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ===== 6. SẢN PHẨM TƯƠNG TỰ CELLPHONES ===== */}
          {otherProducts.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center" style={{ fontSize: '16px' }}>
                  <i className="bi bi-fire text-danger me-2"></i>
                  Sản Phẩm Tương Tự Được Quan Tâm
                </h5>
                <Link href="/" className="text-danger small fw-semibold text-decoration-none">
                  Xem tất cả <i className="bi bi-chevron-right"></i>
                </Link>
              </div>

              <div className="row g-2">
                {otherProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="col-6 col-md-3">
                    <div className="card h-100 border-0 shadow-sm rounded-3 p-2 bg-white position-relative">
                      <span
                        className="badge position-absolute top-0 start-0 m-2 fw-bold"
                        style={{ backgroundColor: '#d70018', fontSize: '10px', borderRadius: '4px' }}
                      >
                        Chính hãng
                      </span>

                      <div className="text-center py-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          style={{ height: '140px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop';
                          }}
                        />
                      </div>

                      <div className="card-body p-1 d-flex flex-column">
                        <h6 className="card-title fw-bold text-dark text-truncate mb-1" style={{ fontSize: '13px' }} title={p.name}>
                          {p.name}
                        </h6>
                        <div className="mt-auto">
                          <div className="text-danger fw-bold mb-1" style={{ fontSize: '14px' }}>
                            {Number(p.price).toLocaleString('vi-VN')}₫
                          </div>
                          <Link
                            href={`/product?id=${p.id}`}
                            className="btn btn-outline-danger btn-sm w-100 fw-semibold rounded-2 py-1"
                            style={{ fontSize: '12px' }}
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ===== 7. FOOTER CHUỖI CỬA HÀNG CELLPHONES ===== */}
      <footer className="bg-white border-top mt-5 pt-4 pb-3" style={{ fontSize: '12px', color: '#666' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-3">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>TỔNG ĐÀI HỖ TRỢ (MIỄN PHÍ)</h6>
              <ul className="list-unstyled mb-0 lh-lg">
                <li>Gọi mua hàng: <strong className="text-danger">1800.2097</strong> (7h30 - 22h00)</li>
                <li>Khiếu nại: <strong className="text-danger">1800.2063</strong> (8h00 - 21h30)</li>
                <li>Bảo hành: <strong className="text-danger">1800.2064</strong> (8h00 - 21h00)</li>
              </ul>
            </div>

            <div className="col-6 col-md-3">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>THÔNG TIN VÀ CHÍNH SÁCH</h6>
              <ul className="list-unstyled mb-0 lh-lg">
                <li>Mua hàng và thanh toán online</li>
                <li>Chính sách giao hàng</li>
                <li>Tra cứu hóa đơn điện tử</li>
                <li>Chính sách bảo hành chính hãng</li>
              </ul>
            </div>

            <div className="col-6 col-md-3">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>DỊCH VỤ VÀ TIỆN ÍCH</h6>
              <ul className="list-unstyled mb-0 lh-lg">
                <li>Khách hàng thành viên Smember</li>
                <li>Trung tâm bảo hành ủy quyền CareS</li>
                <li>Thu cũ đổi mới trợ giá cao</li>
                <li>Hợp tác bán hàng doanh nghiệp</li>
              </ul>
            </div>

            <div className="col-12 col-md-3">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>KẾT NỐI VỚI TECHMART</h6>
              <p className="mb-2">Hệ thống 150 cửa hàng trải dài trên toàn quốc luôn sẵn sàng phục vụ quý khách.</p>
              <div className="d-flex gap-2">
                <span className="badge bg-light text-dark border p-2">Visa</span>
                <span className="badge bg-light text-dark border p-2">MasterCard</span>
                <span className="badge bg-light text-dark border p-2">MoMo</span>
                <span className="badge bg-light text-dark border p-2">VNPAY</span>
              </div>
            </div>
          </div>

          <hr className="my-3" />
          <div className="d-flex justify-content-between align-items-center flex-wrap small text-muted">
            <span>© 2026 TechMart - Hệ thống bán lẻ điện thoại, máy tính, thiết bị di động chính hãng.</span>
            <span>Dữ liệu quản lý đồng bộ theo Database categories - brands - products.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center min-vh-100 d-flex align-items-center justify-content-center">Đang tải sản phẩm...</div>}>
      <CellphoneSProductDetail />
    </Suspense>
  );
}

