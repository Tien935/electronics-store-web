'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI của TECH-MART. Bạn đang cần tìm điện thoại chuyên chụp ảnh, pin trâu hay chiến game trong khoảng giá bao nhiêu?'
    }
  ]);

  // Đọc thông tin đăng nhập từ localStorage (Chỉ dành cho khách hàng)
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Nếu là tài khoản Admin cũ còn sót lại trong máy, xóa sạch để trang chủ luôn là khách
        if (user.role === 'ADMIN') {
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Giả lập AI phản hồi thông minh sau 600ms
    setTimeout(() => {
      let reply = `Dạ với nhu cầu "${userText}", AI gợi ý bạn tham khảo Samsung Galaxy S24 Ultra (có trợ lý Galaxy AI) hoặc iPhone 16 Pro Max đang có ưu đãi giảm 3.000.000đ tại chi nhánh Hà Nội & TP.HCM!`;
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <>
      <a className="skip-link" href="#main">Chuyển đến nội dung chính</a>

      {/* ===== TOP UTILITY BAR (CHUỖI CỬA HÀNG CELLPHONES) ===== */}
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

            {/* Ô tìm kiếm thông minh */}
            <form className="searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
              <label className="visually-hidden" htmlFor="searchCat">Danh mục</label>
              <select className="cat-select" id="searchCat" defaultValue="all">
                <option value="all">Tất cả</option>
                <option value="phones">Điện thoại</option>
                <option value="tablets">Máy tính bảng</option>
                <option value="laptops">Laptop</option>
                <option value="accessories">Phụ kiện</option>
              </select>
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

            {/* KHU VỰC TÀI KHOẢN: PHÂN ĐỊNH RÕ RÀNG GIỮA CHƯA ĐĂNG NHẬP VÀ ĐÃ ĐĂNG NHẬP */}
            <div className="header-actions d-flex align-items-center flex-nowrap" style={{ flexShrink: 0 }}>
              {!currentUser ? (
                /* KHI CHƯA ĐĂNG NHẬP: CHỈ CÓ ĐĂNG NHẬP & ĐĂNG KÝ (TUYỆT ĐỐI KHÔNG CÓ CHỮ ĐĂNG XUẤT) */
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
              ) : (
                /* KHI ĐÃ ĐĂNG NHẬP: HIỂN THỊ TÊN VÀ NÚT ĐĂNG XUẤT */
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white text-danger px-3 py-1 rounded-pill fw-bold small d-flex align-items-center gap-1 shadow-sm text-nowrap">
                    <i className="bi bi-person-check-fill fs-5"></i>
                    <span>Chào, {currentUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm fw-bold rounded-pill px-3 py-2 text-nowrap"
                    title="Đăng xuất khỏi tài khoản"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>Đăng xuất
                  </button>
                </div>
              )}

              <button className="hact cart ms-2 text-white" type="button" aria-label="Giỏ hàng">
                <i className="bi bi-cart3 fs-4 text-white"></i>
                <span className="hact-txt text-white">Giỏ hàng</span>
                <span className="count bg-warning text-dark">3</span>
              </button>
            </div>
          </div>
        </div>

        {/* MENU ĐIỀU HƯỚNG DANH MỤC */}
        <nav className="deptnav" aria-label="Danh mục thiết bị">
          <div className="wrap">
            <a className="dept-all" href="#categories">
              <i className="bi bi-grid-fill me-2"></i>Tất cả danh mục
            </a>
            <a className="dept-link hot" href="#flash">
              <i className="bi bi-lightning-charge-fill me-1"></i>Hotsale Cuối Tuần
            </a>
            <a className="dept-link" href="#bestsellers">Điện thoại iPhone</a>
            <a className="dept-link" href="#bestsellers">Samsung Galaxy AI</a>
            <a className="dept-link" href="#bestsellers">Laptop & MacBook</a>
            <a className="dept-link" href="#bestsellers">iPad & Tablet</a>
            <a className="dept-link" href="#bestsellers">Đồng hồ Smartwatch</a>
            <span className="dept-spacer"></span>
            <span className="dept-phone">
              <i className="bi bi-telephone-inbound me-1"></i>Mua hàng: 1800.6868 (Miễn phí)
            </span>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* ===== HERO CAROUSEL ===== */}
        <section className="hero" aria-label="Ưu đãi nổi bật">
          <div className="wrap">
            <div className="hero-grid">
              <div className="deal-carousel" id="dealCarousel">
                <div className="deal-slide active">
                  <div className="deal-media">
                    <img src="/bazaar/img/hero-electronics.jpg" alt="Đại tiệc công nghệ di động" />
                  </div>
                  <div className="deal-body">
                    <span className="tag tag-gold">Mùa Siêu Phẩm AI 2026</span>
                    <h2>iPhone 16 Pro Max & Galaxy S24 Ultra</h2>
                    <p>Sở hữu quyền năng AI thế hệ mới nhất với đặc quyền trợ giá thu cũ đổi mới lên đến 5.000.000 VNĐ tại 150 chi nhánh.</p>
                    <div className="deal-price">
                      Giá từ <span className="big">29.990.000₫</span> <s>34.990.000₫</s>
                    </div>
                    <a className="btn-bz btn-gold" href="#flash">
                      Khám phá ngay
                      <i className="bi bi-arrow-right ms-2"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div className="promo-stack">
                <article className="promo-card">
                  <div className="promo-bg" aria-hidden="true">
                    <img src="/bazaar/img/p-phone.jpg" alt="Khuyến mãi thành viên" />
                  </div>
                  <div>
                    <span className="tag tag-gold">Đặc quyền Smember</span>
                    <h3>Giảm thêm 5% cho học sinh - sinh viên</h3>
                    <p>Áp dụng ngay cho mọi dòng Laptop, iPhone và iPad phục vụ học tập, nghiên cứu.</p>
                  </div>
                  <a className="promo-link" href="#flash">
                    Đăng ký nhận mã
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </article>

                <article className="promo-card alt">
                  <div className="promo-bg" aria-hidden="true">
                    <img src="/bazaar/img/p-vacuum.jpg" alt="Xả kho phụ kiện" />
                  </div>
                  <div>
                    <span className="tag tag-red">Xả Kho Công Nghệ</span>
                    <h3>Phụ kiện chính hãng giảm đến 50%</h3>
                    <p>Củ sạc nhanh GaN, pin dự phòng MagSafe, tai nghe không dây bảo hành 12 tháng 1 đổi 1.</p>
                  </div>
                  <a className="promo-link" href="#bestsellers">
                    Xem danh sách
                    <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CATEGORY RAIL ===== */}
        <section className="catrail reveal" id="categories" aria-label="Danh mục thiết bị">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Khám phá theo ngành hàng</span>
                <h2>Danh Mục Thiết Bị Di Động</h2>
              </div>
              <a className="see-all" href="#bestsellers">
                Xem toàn bộ 8 ngành hàng
                <i className="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
            <div className="catrail-track">
              <a className="cat-tile" href="#bestsellers">
                <span className="cat-ic"><i className="bi bi-phone fs-3 text-primary"></i></span>
                <span className="cat-name">Điện thoại</span>
                <span className="cat-count">245 mẫu</span>
              </a>
              <a className="cat-tile" href="#bestsellers">
                <span className="cat-ic"><i className="bi bi-laptop fs-3 text-success"></i></span>
                <span className="cat-name">Laptop</span>
                <span className="cat-count">180 mẫu</span>
              </a>
              <a className="cat-tile" href="#bestsellers">
                <span className="cat-ic"><i className="bi bi-tablet fs-3 text-info"></i></span>
                <span className="cat-name">iPad / Tablet</span>
                <span className="cat-count">92 mẫu</span>
              </a>
              <a className="cat-tile" href="#bestsellers">
                <span className="cat-ic"><i className="bi bi-headphones fs-3 text-warning"></i></span>
                <span className="cat-name">Tai nghe & Âm thanh</span>
                <span className="cat-count">310 mẫu</span>
              </a>
              <a className="cat-tile" href="#bestsellers">
                <span className="cat-ic"><i className="bi bi-smartwatch fs-3 text-danger"></i></span>
                <span className="cat-name">Đồng hồ thông minh</span>
                <span className="cat-count">65 mẫu</span>
              </a>
              <a className="cat-tile" href="#bestsellers">
                <span className="cat-ic"><i className="bi bi-battery-charging fs-3 text-secondary"></i></span>
                <span className="cat-name">Phụ kiện & Cáp sạc</span>
                <span className="cat-count">480 mẫu</span>
              </a>
            </div>
          </div>
        </section>

        {/* ===== FLASH DEALS CÓ BỘ ĐẾM NGƯỢC ===== */}
        <section className="flash reveal" id="flash" aria-label="Flash sale">
          <div className="wrap">
            <div className="flash-panel">
              <div className="flash-top">
                <div className="flash-title">
                  <span className="bolt">⚡</span>
                  <div>
                    <h2>Giờ Vàng Giá Sốc (Flash Sale)</h2>
                    <span className="sub">Giá ưu đãi đặc biệt - Giới hạn 20 suất mỗi chi nhánh</span>
                  </div>
                </div>
                <div className="countdown" id="countdown">
                  <span className="cd-label">Kết thúc sau</span>
                  <div className="cd-units">
                    <span className="cd-box"><b>06</b><span>giờ</span></span>
                    <span className="cd-colon">:</span>
                    <span className="cd-box"><b>42</b><span>phút</span></span>
                    <span className="cd-colon">:</span>
                    <span className="cd-box"><b>15</b><span>giây</span></span>
                  </div>
                </div>
              </div>

              <div className="flash-grid">
                <article className="flash-item">
                  <div className="fi-frame">
                    <img src="/bazaar/img/p-phone.jpg" alt="iPhone 15 Pro Max" />
                    <span className="tag tag-red disc">-18%</span>
                  </div>
                  <div className="fi-body">
                    <span className="fi-cat">Apple Authorized</span>
                    <h4>iPhone 15 Pro Max 256GB - Titan Tự Nhiên</h4>
                    <div className="fi-price">
                      <span className="cur">28.990.000₫</span>
                      <s className="old">34.990.000₫</s>
                    </div>
                    <div className="stock-meter">
                      <div className="bar" style={{ width: '75%' }}></div>
                    </div>
                    <span className="stock-lbl">Đã bán 15/20 máy</span>
                  </div>
                </article>

                <article className="flash-item">
                  <div className="fi-frame">
                    <img src="/bazaar/img/hero-electronics.jpg" alt="Galaxy S24 Ultra" />
                    <span className="tag tag-red disc">-22%</span>
                  </div>
                  <div className="fi-body">
                    <span className="fi-cat">Galaxy AI Flagship</span>
                    <h4>Samsung Galaxy S24 Ultra 12GB/256GB</h4>
                    <div className="fi-price">
                      <span className="cur">25.490.000₫</span>
                      <s className="old">31.990.000₫</s>
                    </div>
                    <div className="stock-meter">
                      <div className="bar" style={{ width: '90%' }}></div>
                    </div>
                    <span className="stock-lbl">Chỉ còn 2 máy tại Hà Nội</span>
                  </div>
                </article>

                <article className="flash-item">
                  <div className="fi-frame">
                    <img src="/bazaar/img/p-headphones.jpg" alt="AirPods Pro 2" />
                    <span className="tag tag-red disc">-28%</span>
                  </div>
                  <div className="fi-body">
                    <span className="fi-cat">Âm thanh cao cấp</span>
                    <h4>Tai nghe Apple AirPods Pro 2 Type-C (Chống ồn)</h4>
                    <div className="fi-price">
                      <span className="cur">4.890.000₫</span>
                      <s className="old">6.190.000₫</s>
                    </div>
                    <div className="stock-meter">
                      <div className="bar" style={{ width: '60%' }}></div>
                    </div>
                    <span className="stock-lbl">Đã bán 32 sản phẩm</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SẢN PHẨM BÁN CHẠY (BEST SELLERS) ===== */}
        <section className="bestsellers" id="bestsellers" style={{ padding: '60px 0', background: '#f8f9fa' }}>
          <div className="wrap">
            <div className="section-head mb-4">
              <div>
                <span className="eyebrow text-primary fw-bold">Chuỗi thiết bị di động hàng đầu</span>
                <h2 className="fw-bold">Thiết Bị Công Nghệ Nổi Bật 2026</h2>
              </div>
              <span className="badge bg-primary px-3 py-2 fs-6">
                <i className="bi bi-shield-check me-1"></i>100% Chính Hãng VN/A
              </span>
            </div>

            <div className="row g-4">
              {/* Product Card 1 */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-danger position-absolute top-0 start-0 m-3">Trả góp 0%</span>
                  <Link href="/product" className="text-decoration-none">
                    <img src="/bazaar/img/p-phone.jpg" className="card-img-top p-2" alt="iPhone 16 Pro Max" />
                  </Link>
                  <div className="card-body d-flex flex-column px-0">
                    <span className="text-muted small">Apple</span>
                    <Link href="/product" className="text-decoration-none text-dark">
                      <h6 className="card-title fw-bold hover-title">iPhone 16 Pro Max 256GB</h6>
                    </Link>
                    <p className="text-secondary small mb-2">Chip A18 Pro · Nút Camera Control · Màn hình 6.9 inch</p>
                    <div className="mt-auto">
                      <p className="text-danger fw-bold fs-5 mb-2">34.990.000₫</p>
                      <Link href="/product" className="btn btn-outline-primary btn-sm w-100 fw-bold">
                        <i className="bi bi-eye me-1"></i> Xem Chi Tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Card 2 */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-info text-dark position-absolute top-0 start-0 m-3">Galaxy AI</span>
                  <img src="/bazaar/img/hero-electronics.jpg" className="card-img-top p-2" alt="Samsung Galaxy S24" />
                  <div className="card-body d-flex flex-column px-0">
                    <span className="text-muted small">Samsung</span>
                    <h6 className="card-title fw-bold">Samsung Galaxy S24 Ultra 512GB</h6>
                    <p className="text-secondary small mb-2">Snapdragon 8 Gen 3 · Bút S-Pen · Khung viền Titan</p>
                    <div className="mt-auto">
                      <p className="text-danger fw-bold fs-5 mb-2">29.990.000₫</p>
                      <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                        <i className="bi bi-cart-plus me-1"></i> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Card 3 */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-success position-absolute top-0 start-0 m-3">Bán chạy nhất</span>
                  <img src="/bazaar/img/hero-audio.jpg" className="card-img-top p-2" alt="MacBook Air M3" />
                  <div className="card-body d-flex flex-column px-0">
                    <span className="text-muted small">Apple</span>
                    <h6 className="card-title fw-bold">MacBook Air M3 16GB / 256GB</h6>
                    <p className="text-secondary small mb-2">Apple M3 8-core CPU · Màn hình Liquid Retina 13.6"</p>
                    <div className="mt-auto">
                      <p className="text-danger fw-bold fs-5 mb-2">27.490.000₫</p>
                      <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                        <i className="bi bi-cart-plus me-1"></i> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Card 4 */}
              <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-3">Mới ra mắt</span>
                  <img src="/bazaar/img/p-camera.jpg" className="card-img-top p-2" alt="iPad Pro M4" />
                  <div className="card-body d-flex flex-column px-0">
                    <span className="text-muted small">Apple</span>
                    <h6 className="card-title fw-bold">iPad Pro M4 11 inch Ultra Retina</h6>
                    <p className="text-secondary small mb-2">Chip M4 thế hệ mới · Màn hình OLED Tandem siêu mỏng</p>
                    <div className="mt-auto">
                      <p className="text-danger fw-bold fs-5 mb-2">28.990.000₫</p>
                      <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                        <i className="bi bi-cart-plus me-1"></i> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER CHUỖI CỬA HÀNG ===== */}
      <footer className="site-footer bg-dark text-white pt-5 pb-3">
        <div className="wrap">
          <div className="row g-4">
            <div className="col-lg-4">
              <h5 className="fw-bold text-warning mb-3">
                <i className="bi bi-cpu-fill me-2"></i>TECH-MART AI STORE
              </h5>
              <p className="text-secondary small">
                Chuỗi bán lẻ thiết bị di động, điện thoại thông minh, laptop chính hãng hàng đầu Việt Nam. Tích hợp giải pháp đề xuất thông minh theo kiến trúc Microservices và Trí tuệ nhân tạo.
              </p>
              <p className="small mb-1"><i className="bi bi-geo-alt me-2 text-warning"></i>Trụ sở: 123 Cầu Giấy, Hà Nội</p>
              <p className="small mb-1"><i className="bi bi-telephone me-2 text-warning"></i>Tổng đài khiếu nại: 1800.6868</p>
              <p className="small"><i className="bi bi-envelope me-2 text-warning"></i>Email: hotro@techmart.vn</p>
            </div>

            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3 text-light">Thông Tin Chuỗi</h6>
              <ul className="list-unstyled text-secondary small lh-lg">
                <li><a href="#" className="text-decoration-none text-secondary">Hệ thống 150 cửa hàng</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Chính sách bảo hành</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Chính sách đổi trả 30 ngày</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Giao hàng & Lắp đặt</a></li>
              </ul>
            </div>

            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3 text-light">Sản Phẩm Hot</h6>
              <ul className="list-unstyled text-secondary small lh-lg">
                <li><a href="#" className="text-decoration-none text-secondary">iPhone 16 Series</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">Samsung Galaxy S24</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">MacBook Pro M3</a></li>
                <li><a href="#" className="text-decoration-none text-secondary">iPad Air & Pro M4</a></li>
              </ul>
            </div>

            <div className="col-lg-4">
              <h6 className="fw-bold mb-3 text-light">Đăng Ký Nhận Bản Tin AI Deals</h6>
              <p className="text-secondary small">Nhận ngay thông báo khi có đợt Flash Sale hoặc voucher giảm 500k cho thiết bị bạn quan tâm.</p>
              <div className="input-group mb-3">
                <input type="email" className="form-control" placeholder="Nhập email của bạn..." />
                <button className="btn btn-warning fw-bold">Đăng ký</button>
              </div>
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
            <span>© 2026 TECH-MART AI. Đồ án xây dựng Website Bán Hàng Microservices Spring Boot & Next.js.</span>
            <span>Thiết kế UI/UX trên nền tảng Bootstrap 5 Responsive.</span>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING AI CHATBOT WIDGET ===== */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1050 }}>
        {!chatOpen ? (
          <button
            className="btn btn-primary rounded-pill shadow-lg p-3 d-flex align-items-center gap-2 border-0"
            type="button"
            onClick={() => setChatOpen(true)}
            style={{ backgroundColor: '#0d6efd' }}
          >
            <span className="spinner-grow spinner-grow-sm text-warning" role="status"></span>
            <i className="bi bi-robot fs-5"></i>
            <span className="fw-bold">AI Tư Vấn Chọn Máy</span>
          </button>
        ) : (
          <div className="card shadow-lg border-primary" style={{ width: '340px', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
              <span className="fw-bold d-flex align-items-center gap-2">
                <i className="bi bi-robot fs-5 text-warning"></i>
                Trợ Lý AI Tư Vấn
              </span>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setChatOpen(false)}
                aria-label="Đóng"
              ></button>
            </div>

            <div className="card-body p-3" style={{ height: '240px', overflowY: 'auto', background: '#f8f9fa' }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-2 rounded-3 small ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white text-dark shadow-sm border'
                    }`}
                    style={{ maxWidth: '85%' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer bg-white p-2">
              <form onSubmit={handleSendChat} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Hỏi AI: Điện thoại dưới 10tr..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-primary">
                  <i className="bi bi-send-fill"></i>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
