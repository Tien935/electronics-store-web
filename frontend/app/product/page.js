'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProductDetailPage() {
  // Trạng thái chọn phiên bản & màu sắc
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Titan Sa Mạc');
  const [selectedBranch, setSelectedBranch] = useState('Hà Nội - 123 Cầu Giấy');
  const [selectedImage, setSelectedImage] = useState('/bazaar/img/p-phone.jpg');
  const [cartCount, setCartCount] = useState(3);
  const [addedToast, setAddedToast] = useState(false);

  // Bảng giá theo dung lượng
  const storagePrices = {
    '256GB': { price: '34.990.000₫', old: '37.990.000₫', save: '3.000.000₫' },
    '512GB': { price: '40.490.000₫', old: '43.990.000₫', save: '3.500.000₫' },
    '1TB': { price: '46.990.000₫', old: '49.990.000₫', save: '3.000.000₫' },
  };

  const colors = [
    { name: 'Titan Sa Mạc', hex: '#d4af88', bg: 'bg-warning-subtle' },
    { name: 'Titan Tự Nhiên', hex: '#9f9e9a', bg: 'bg-secondary-subtle' },
    { name: 'Titan Trắng', hex: '#e8e8e6', bg: 'bg-light' },
    { name: 'Titan Đen', hex: '#343538', bg: 'bg-dark' },
  ];

  const thumbnails = [
    '/bazaar/img/p-phone.jpg',
    '/bazaar/img/hero-electronics.jpg',
    '/bazaar/img/hero-audio.jpg',
    '/bazaar/img/p-camera.jpg',
  ];

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  return (
    <>
      {/* ===== TOPBAR THÔNG TIN CHUỖI CỬA HÀNG ===== */}
      <div className="topbar">
        <div className="wrap d-flex justify-content-between align-items-center">
          <div className="tb-left">
            <span>
              <i className="bi bi-geo-alt-fill text-warning me-1"></i>
              Hệ thống <strong>150 chi nhánh toàn quốc</strong> · Hotline: <strong>1800.2097</strong> (Miễn phí)
            </span>
          </div>
          <div className="tb-right d-flex align-items-center gap-3">
            <span className="small text-white">
              <i className="bi bi-truck me-1 text-warning"></i>Giao hàng 2 Giờ
            </span>
            <span className="small text-white">
              <i className="bi bi-shield-check me-1 text-warning"></i>Bảo hành chính hãng 12 tháng
            </span>
            <span className="small text-white">
              <i className="bi bi-arrow-repeat me-1 text-warning"></i>Đổi mới trong 30 ngày
            </span>
          </div>
        </div>
      </div>

      {/* ===== HEADER NỀN ĐỎ CELLPHONES ===== */}
      <header className="site-header">
        <div className="wrap">
          <div className="header-main">
            <Link className="brand text-decoration-none" href="/" aria-label="TECH-MART home">
              <span className="brand-mark bg-white text-danger" aria-hidden="true" style={{ borderRadius: '10px' }}>
                <i className="bi bi-phone-flip fs-3 text-danger"></i>
              </span>
              <span>
                <span className="brand-word text-white">TECH<b className="text-warning">MART</b></span>
                <span className="brand-sub text-white-50">Hệ Thống Thiết Bị Di Động</span>
              </span>
            </Link>

            {/* Ô tìm kiếm */}
            <form className="searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
              <label className="visually-hidden" htmlFor="searchInput">Tìm kiếm</label>
              <input
                id="searchInput"
                type="search"
                placeholder="Bạn cần tìm điện thoại, laptop, phụ kiện gì..."
                autoComplete="off"
              />
              <button className="search-btn text-danger" type="submit" aria-label="Tìm kiếm">
                <i className="bi bi-search fs-5"></i>
              </button>
            </form>

            {/* Nút Đăng nhập & Đăng ký */}
            <div className="header-actions d-flex align-items-center flex-nowrap" style={{ flexShrink: 0 }}>
              <div className="d-flex align-items-center gap-2">
                <Link
                  href="/login"
                  className="btn bg-white text-danger btn-sm fw-bold px-3 py-2 shadow-sm rounded-pill d-flex align-items-center gap-1 text-nowrap"
                >
                  <i className="bi bi-box-arrow-in-right fs-6"></i>
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  href="/register"
                  className="btn btn-outline-light btn-sm fw-bold px-3 py-2 shadow-sm rounded-pill d-flex align-items-center gap-1 text-nowrap"
                >
                  <i className="bi bi-person-plus fs-6"></i>
                  <span>Đăng ký</span>
                </Link>
              </div>

              <button className="hact cart ms-2 text-white" type="button" aria-label="Giỏ hàng">
                <i className="bi bi-cart3 fs-4 text-white"></i>
                <span className="hact-txt text-white">Giỏ hàng</span>
                <span className="count bg-warning text-dark">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== BREADCRUMB ===== */}
      <div className="bg-white border-bottom py-2">
        <div className="wrap">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item"><Link href="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
              <li className="breadcrumb-item"><a href="#" className="text-decoration-none text-muted">Điện thoại</a></li>
              <li className="breadcrumb-item"><a href="#" className="text-decoration-none text-muted">Apple</a></li>
              <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">iPhone 16 Pro Max 256GB</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Thông báo thêm vào giỏ */}
      {addedToast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3">
          <div className="alert alert-success shadow-lg border-0 d-flex align-items-center gap-2 py-2 px-4 rounded-pill">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <strong>Thành công!</strong> Đã thêm iPhone 16 Pro Max ({selectedStorage} - {selectedColor}) vào giỏ hàng.
          </div>
        </div>
      )}

      {/* ===== CHI TIẾT SẢN PHẨM CHÍNH (PDP) ===== */}
      <main className="py-4" style={{ backgroundColor: '#f4f6f8' }}>
        <div className="wrap">
          {/* Tiêu đề & Đánh giá */}
          <div className="d-flex align-items-center flex-wrap gap-3 pb-3 border-bottom mb-4">
            <h1 className="h4 fw-bold mb-0 text-dark">
              iPhone 16 Pro Max {selectedStorage} Chính Hãng (VN/A)
            </h1>
            <div className="d-flex align-items-center gap-2 small">
              <span className="text-warning">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-half"></i>
              </span>
              <strong className="text-dark">4.9/5</strong>
              <span className="text-muted">(186 đánh giá từ khách mua)</span>
              <span className="badge bg-danger-subtle text-danger ms-2">Chính Hãng Apple VN/A</span>
            </div>
          </div>

          <div className="row g-4">
            {/* CỘT TRÁI: GALLERY HÌNH ẢNH & CHÍNH SÁCH BẢO HÀNH */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm p-3 bg-white rounded-3 mb-3 text-center">
                <div className="position-relative py-3">
                  <span className="badge bg-danger position-absolute top-0 start-0 m-2 px-3 py-2">
                    Trả góp 0%
                  </span>
                  <img
                    src={selectedImage}
                    alt="iPhone 16 Pro Max"
                    className="img-fluid rounded-3"
                    style={{ maxHeight: '380px', objectFit: 'contain' }}
                  />
                </div>

                {/* Dải ảnh Thumbnail */}
                <div className="d-flex justify-content-center gap-2 mt-3 pt-3 border-top">
                  {thumbnails.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`btn p-1 border rounded-2 ${selectedImage === img ? 'border-danger border-2' : 'border-light'}`}
                      style={{ width: '60px', height: '60px' }}
                    >
                      <img src={img} alt="thumb" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Hộp cam kết dịch vụ CellphoneS */}
              <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
                <h6 className="fw-bold mb-3 text-dark">
                  <i className="bi bi-shield-check text-danger me-2"></i>Đặc Quyền Mua Hàng Tại TECH-MART
                </h6>
                <div className="row g-2 small">
                  <div className="col-6 d-flex align-items-center gap-2 text-muted">
                    <i className="bi bi-box-seam text-danger fs-5"></i>
                    <span>Bộ máy mới 100% nguyên seal hộp</span>
                  </div>
                  <div className="col-6 d-flex align-items-center gap-2 text-muted">
                    <i className="bi bi-arrow-repeat text-danger fs-5"></i>
                    <span>1 Đổi 1 trong 30 ngày nếu lỗi NSX</span>
                  </div>
                  <div className="col-6 d-flex align-items-center gap-2 text-muted">
                    <i className="bi bi-award text-danger fs-5"></i>
                    <span>Bảo hành chính hãng 12 tháng Apple</span>
                  </div>
                  <div className="col-6 d-flex align-items-center gap-2 text-muted">
                    <i className="bi bi-truck text-danger fs-5"></i>
                    <span>Giao nhanh miễn phí tận nhà trong 2H</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: GIÁ BÁN, CHỌN DUNG LƯỢNG, MÀU SẮC, ĐẶT MUA */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                {/* Khối Giá */}
                <div className="d-flex align-items-baseline gap-3 mb-3 p-3 bg-light rounded-3">
                  <span className="display-6 fw-bold text-danger">
                    {storagePrices[selectedStorage].price}
                  </span>
                  <s className="text-muted fs-5">
                    {storagePrices[selectedStorage].old}
                  </s>
                  <span className="badge bg-danger">
                    Tiết kiệm {storagePrices[selectedStorage].save}
                  </span>
                </div>

                {/* 1. Chọn Dung lượng bộ nhớ */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    1. Chọn dung lượng bộ nhớ:
                  </label>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.keys(storagePrices).map((storage) => (
                      <button
                        key={storage}
                        type="button"
                        onClick={() => setSelectedStorage(storage)}
                        className={`btn px-4 py-2 fw-bold rounded-3 ${
                          selectedStorage === storage
                            ? 'btn-danger text-white border-danger'
                            : 'btn-outline-secondary'
                        }`}
                      >
                        <div>{storage}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                          {storagePrices[storage].price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Chọn Màu sắc */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    2. Chọn màu sắc: <span className="text-danger fw-bold">{selectedColor}</span>
                  </label>
                  <div className="d-flex gap-2 flex-wrap">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 border ${
                          selectedColor === c.name ? 'border-danger border-2 text-danger fw-bold' : 'text-dark'
                        }`}
                      >
                        <span
                          className="rounded-circle d-inline-block border"
                          style={{ width: '18px', height: '18px', backgroundColor: c.hex }}
                        ></span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Kiểm tra chi nhánh còn hàng */}
                <div className="mb-4 p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold text-dark">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>Kiểm tra chi nhánh còn hàng:
                    </span>
                    <span className="badge bg-success">Còn hàng sẵn sàng giao</span>
                  </div>
                  <select
                    className="form-select form-select-sm"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="Hà Nội - 123 Cầu Giấy">Chi nhánh 01: Hà Nội - 123 Cầu Giấy (Còn 8 máy)</option>
                    <option value="Hà Nội - 25 Thái Hà">Chi nhánh 02: Hà Nội - 25 Thái Hà (Còn 5 máy)</option>
                    <option value="TP.HCM - 134 Nguyễn Thái Học">Chi nhánh 03: TP.HCM - 134 Nguyễn Thái Học (Còn 12 máy)</option>
                    <option value="TP.HCM - 377 Quang Trung">Chi nhánh 04: TP.HCM - 377 Quang Trung, Gò Vấp (Còn 4 máy)</option>
                    <option value="Đà Nẵng - 88 Nguyễn Văn Linh">Chi nhánh 05: Đà Nẵng - 88 Nguyễn Văn Linh (Còn 6 máy)</option>
                  </select>
                </div>

                {/* 4. Khối Khuyến mãi đặc quyền */}
                <div className="border border-danger-subtle rounded-3 p-3 mb-4 bg-danger-subtle bg-opacity-10">
                  <h6 className="fw-bold text-danger mb-2">
                    <i className="bi bi-gift-fill me-2"></i>Ưu Đãi Khuyến Mãi Độc Quyền
                  </h6>
                  <ul className="list-unstyled small mb-0 lh-lg text-dark">
                    <li><i className="bi bi-check2 text-danger me-1"></i>Giảm thêm <strong>5% (tối đa 1.000.000đ)</strong> cho Học sinh - Sinh viên.</li>
                    <li><i className="bi bi-check2 text-danger me-1"></i>Trợ giá thu cũ lên đời <strong>4.000.000đ</strong> khi bán máy cũ.</li>
                    <li><i className="bi bi-check2 text-danger me-1"></i>Tặng kèm gói ốp lưng MagSafe & Củ sạc nhanh GaN 35W chính hãng.</li>
                    <li><i className="bi bi-check2 text-danger me-1"></i>Hỗ trợ cài đặt trợ lý Apple Intelligence miễn phí trọn đời máy.</li>
                  </ul>
                </div>

                {/* 5. Cụm nút Mua Hàng */}
                <div className="d-flex flex-column gap-2">
                  <div className="row g-2">
                    <div className="col-12 col-md-8">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="btn btn-danger w-100 py-3 fw-bold text-uppercase shadow-sm"
                        style={{ backgroundColor: '#d70018', fontSize: '1.05rem' }}
                      >
                        <i className="bi bi-bag-check-fill me-2"></i>MUA NGAY
                        <div style={{ fontSize: '0.75rem', fontWeight: 'normal', textTransform: 'none' }}>
                          Giao hàng tận nơi miễn phí hoặc nhận tại cửa hàng
                        </div>
                      </button>
                    </div>

                    <div className="col-12 col-md-4">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="btn btn-outline-danger w-100 py-3 fw-bold h-100 d-flex flex-column align-items-center justify-content-center"
                      >
                        <i className="bi bi-cart-plus fs-5 mb-1"></i>
                        <span style={{ fontSize: '0.85rem' }}>Thêm Vào Giỏ</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary py-2 fw-semibold"
                  >
                    <i className="bi bi-credit-card me-2"></i>TRẢ GÓP 0% QUA THẺ TÍN DỤNG HOẶC CÔNG TY TÀI CHÍNH
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BẢNG THÔNG SỐ KỸ THUẬT & TÍNH NĂNG AI NỔI BẬT ===== */}
          <div className="row g-4 mt-2">
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                <h5 className="fw-bold mb-3 text-dark">
                  <i className="bi bi-stars text-danger me-2"></i>Tính Năng Đột Phá Với Trí Tuệ Nhân Tạo (AI Inside)
                </h5>
                <p className="text-secondary">
                  iPhone 16 Pro Max được trang bị chip <strong>Apple A18 Pro 3nm</strong> với bộ xử lý thần kinh NPU 16 lõi thế hệ mới, tích hợp sâu vào hệ điều hành iOS để mang đến quyền năng <strong>Apple Intelligence</strong>:
                </p>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <h6 className="fw-bold text-dark"><i className="bi bi-chat-left-text-fill text-danger me-2"></i>Công cụ viết AI</h6>
                      <p className="small text-muted mb-0">Tự động hiệu đính, tóm tắt email và viết lại văn bản theo nhiều văn phong linh hoạt.</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <h6 className="fw-bold text-dark"><i className="bi bi-camera-fill text-danger me-2"></i>Visual Intelligence</h6>
                      <p className="small text-muted mb-0">Nút Camera Control cho phép nhận diện thông tin vật thể, nhà hàng và động vật tức thì qua camera.</p>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-3 text-dark">Mô tả sản phẩm</h5>
                <p className="text-muted lh-base">
                  Thiết kế viền Titan Cấp 5 bền bỉ và nhẹ nhất từ trước đến nay, màn hình 6.9 inch Super Retina XDR với viền mỏng kỷ lục. Thời lượng pin đạt đến 33 giờ xem video liên tục, đưa trải nghiệm giải trí và làm việc di động lên một tầm cao hoàn toàn mới.
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                <h5 className="fw-bold mb-3 text-dark">Thông số kỹ thuật</h5>
                <table className="table table-striped table-sm small mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: '40%' }}>Kích thước màn hình:</td>
                      <td className="fw-semibold text-dark">6.9 inches</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Công nghệ màn hình:</td>
                      <td className="fw-semibold text-dark">Super Retina XDR OLED, 120Hz</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Camera sau:</td>
                      <td className="fw-semibold text-dark">Chính 48MP + 48MP Ultra + 12MP Tele 5x</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Camera trước:</td>
                      <td className="fw-semibold text-dark">12MP TrueDepth</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Chipset:</td>
                      <td className="fw-semibold text-danger">Apple A18 Pro 3nm</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Dung lượng RAM:</td>
                      <td className="fw-semibold text-dark">8 GB</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Bộ nhớ trong:</td>
                      <td className="fw-semibold text-dark">{selectedStorage}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Hệ điều hành:</td>
                      <td className="fw-semibold text-dark">iOS 18</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Cổng sạc:</td>
                      <td className="fw-semibold text-dark">Type-C (USB 3 tốc độ 10Gb/s)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER CHUỖI CỬA HÀNG ===== */}
      <footer className="site-footer bg-dark text-white pt-5 pb-3">
        <div className="wrap">
          <div className="row g-4">
            <div className="col-lg-4">
              <h5 className="fw-bold text-warning mb-3">
                <i className="bi bi-phone-flip me-2"></i>TECH-MART STORE
              </h5>
              <p className="text-secondary small">
                Chuỗi bán lẻ thiết bị di động, điện thoại thông minh, laptop chính hãng hàng đầu Việt Nam. Tích hợp giải pháp đề xuất thông minh theo kiến trúc Microservices và Trí tuệ nhân tạo.
              </p>
              <p className="small mb-1"><i className="bi bi-geo-alt me-2 text-warning"></i>Trụ sở: 123 Cầu Giấy, Hà Nội</p>
              <p className="small mb-1"><i className="bi bi-telephone me-2 text-warning"></i>Hotline mua hàng: 1800.2097</p>
            </div>

            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3 text-light">Thông Tin Chuỗi</h6>
              <ul className="list-unstyled text-secondary small lh-lg">
                <li><a href="#" className="text-decoration-none text-secondary">Hệ thống 150 cửa hàng</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Chính sách bảo hành</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Đổi mới trong 30 ngày</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Giao hàng 2 giờ</a></li>
              </ul>
            </div>

            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3 text-light">Dòng Thiết Bị</h6>
              <ul className="list-unstyled text-secondary small lh-lg">
                <li><a href="#" className="text-decoration-none text-secondary">iPhone 16 Series</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Samsung Galaxy AI</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">MacBook Pro & Air</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">iPad Pro OLED M4</a></li>
              </ul>
            </div>

            <div className="col-lg-4">
              <h6 className="fw-bold mb-3 text-light">Phương Thức Thanh Toán</h6>
              <p className="text-secondary small">Hỗ trợ trả góp 0% lãi suất qua thẻ và các ví điện tử phổ biến.</p>
              <div className="d-flex gap-2">
                <span className="badge bg-secondary">Visa</span>
                <span className="badge bg-secondary">Mastercard</span>
                <span className="badge bg-secondary">MoMo</span>
                <span className="badge bg-secondary">VNPay</span>
              </div>
            </div>
          </div>
          <hr className="border-secondary my-4" />
          <div className="d-flex justify-content-between align-items-center flex-wrap small text-secondary">
            <span>© 2026 TECH-MART. Hệ thống chuỗi bán lẻ thiết bị di động chính hãng.</span>
            <span>Giao diện thiết kế theo phong cách CellphoneS & Bootstrap 5.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
