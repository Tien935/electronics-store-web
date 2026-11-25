
'use client';

import Link from 'next/link';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';

export default function Home() {
  return (
      <>
        <a className="skip-link" href="#main">
          Chuyển đến nội dung chính
        </a>

        {/* ===== TOP UTILITY BAR ===== */}
        <StoreHeader />

        <main id="main">
          {/* ===== HERO CAROUSEL ===== */}
          <section className="hero" aria-label="Ưu đãi nổi bật">
            <div className="wrap">
              <div className="hero-grid">
                <div className="deal-carousel" id="dealCarousel">
                  <div className="deal-slide active">
                    <div className="deal-media">
                      <img
                        className="deal-main-image"
                        src="/images/iphone-16-pro-max-banner.jpg"
                        alt="iPhone 16 Pro Max"
                      />
                    </div>

                    <div className="deal-body">
                    <span className="tag tag-gold">
                      Mùa Siêu Phẩm AI 2026
                    </span>

                      <h2>iPhone 16 Pro Max<br /></h2>

                      <p>
                        Sở hữu quyền năng AI thế hệ mới nhất với đặc quyền
                        trợ giá thu cũ đổi mới lên đến 5.000.000 VNĐ tại
                        150 chi nhánh.
                      </p>

                      <div className="deal-price">
                        Giá từ <span className="big">29.990.000₫</span>
                        {' '}<s>34.990.000₫</s>
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
                      <img
                          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop"
                          alt="Laptop dùng cho học tập"
                      />
                    </div>

                    <div>
                    <span className="tag tag-gold">
                      Đặc quyền member
                    </span>
                      <h3>Giảm thêm 5% cho học sinh - sinh viên</h3>
                      <p>
                        Áp dụng ngay cho mọi dòng Laptop, iPhone và iPad
                        phục vụ học tập, nghiên cứu.
                      </p>
                    </div>

                    <a className="btn-bz btn-gold promo-action" href="#flash">
                      Đăng ký nhận mã
                      <i className="bi bi-arrow-right ms-1"></i>
                    </a>
                  </article>

                  <article className="promo-card alt">
                    <div className="promo-bg" aria-hidden="true">
                      <img
                          src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=600&fit=crop"
                          alt="Tai nghe không dây"
                      />
                    </div>

                    <div>
                    <span className="tag tag-gold">
                      Xả Kho Công Nghệ
                    </span>
                      <h3>Phụ kiện chính hãng giảm đến 50%</h3>
                      <p>
                        Củ sạc nhanh GaN, pin dự phòng MagSafe, tai nghe
                        không dây bảo hành 12 tháng 1 đổi 1.
                      </p>
                    </div>

                    <a className="btn-bz btn-gold promo-action" href="#bestsellers">
                      Xem danh sách
                      <i className="bi bi-arrow-right ms-1"></i>
                    </a>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* ===== CATEGORY RAIL ===== */}
          <section
              className="catrail reveal"
              id="categories"
              aria-label="Danh mục thiết bị"
          >
            <div className="wrap">
              <div className="section-head">
                <div>
                <span className="eyebrow">
                  Khám phá theo ngành hàng
                </span>
                  <h2>Danh Mục Thiết Bị Di Động</h2>
                </div>

                <Link className="see-all" href="/products">
                  Xem tất cả sản phẩm
                  <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>

              <div className="catrail-track">
                <Link className="cat-tile" href="/products?category=dien-thoai">
                <span className="cat-ic">
                  <i className="bi bi-phone fs-3 text-primary"></i>
                </span>
                  <span className="cat-name">Điện thoại</span>
                  <span className="cat-count">3 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=laptop">
                <span className="cat-ic">
                  <i className="bi bi-laptop fs-3 text-success"></i>
                </span>
                  <span className="cat-name">Laptop</span>
                  <span className="cat-count">2 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=tablet">
                <span className="cat-ic">
                  <i className="bi bi-tablet fs-3 text-info"></i>
                </span>
                  <span className="cat-name">iPad / Tablet</span>
                  <span className="cat-count">1 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=phu-kien">
                <span className="cat-ic">
                  <i className="bi bi-headphones fs-3 text-warning"></i>
                </span>
                  <span className="cat-name">Tai nghe & Âm thanh</span>
                  <span className="cat-count">3 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=smartwatch">
                <span className="cat-ic">
                  <i className="bi bi-smartwatch fs-3 text-danger"></i>
                </span>
                  <span className="cat-name">Đồng hồ thông minh</span>
                  <span className="cat-count">2 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=phu-kien">
                <span className="cat-ic">
                  <i className="bi bi-battery-charging fs-3 text-secondary"></i>
                </span>
                  <span className="cat-name">Phụ kiện & Cáp sạc</span>
                  <span className="cat-count">3 mẫu</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ===== FLASH SALE ===== */}
          <section
              className="flash reveal"
              id="flash"
              aria-label="Flash sale"
          >
            <div className="wrap">
              <div className="flash-panel">
                <div className="flash-top">
                  <div className="flash-title">
                    <span className="bolt">⚡</span>
                    <div>
                      <h2>Giờ Vàng Giá Sốc (Flash Sale)</h2>
                      <span className="sub">
                      Giá ưu đãi đặc biệt - Giới hạn 20 suất mỗi chi nhánh
                    </span>
                    </div>
                  </div>

                  <div className="countdown" id="countdown">
                    <span className="cd-label">Kết thúc sau</span>
                    <div className="cd-units">
                    <span className="cd-box">
                      <b>06</b><span>giờ</span>
                    </span>
                      <span className="cd-colon">:</span>
                      <span className="cd-box">
                      <b>42</b><span>phút</span>
                    </span>
                      <span className="cd-colon">:</span>
                      <span className="cd-box">
                      <b>15</b><span>giây</span>
                    </span>
                    </div>
                  </div>
                </div>

                <div className="flash-grid">
                  <article className="flash-item">
                    <div className="fi-frame">
                      <img
                          src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop"
                          alt="iPhone 15 Pro Max"
                      />
                      <span className="tag tag-red disc">-18%</span>
                    </div>

                    <div className="fi-body">
                      <span className="fi-cat">Apple Authorized</span>
                      <h4>
                        iPhone 15 Pro Max 256GB - Titan Tự Nhiên
                      </h4>

                      <div className="fi-price">
                        <span className="cur">28.990.000₫</span>
                        <s className="old">34.990.000₫</s>
                      </div>

                      <div className="stock-meter">
                        <div
                            className="bar"
                            style={{ width: '75%' }}
                        ></div>
                      </div>

                      <span className="stock-lbl">
                      Đã bán 15/20 máy
                    </span>
                    </div>
                  </article>

                  <article className="flash-item">
                    <div className="fi-frame">
                      <img
                          src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop"
                          alt="Galaxy S24 Ultra"
                      />
                      <span className="tag tag-red disc">-22%</span>
                    </div>

                    <div className="fi-body">
                    <span className="fi-cat">
                      Galaxy AI Flagship
                    </span>
                      <h4>
                        Samsung Galaxy S24 Ultra 12GB/256GB
                      </h4>

                      <div className="fi-price">
                        <span className="cur">25.490.000₫</span>
                        <s className="old">31.990.000₫</s>
                      </div>

                      <div className="stock-meter">
                        <div
                            className="bar"
                            style={{ width: '90%' }}
                        ></div>
                      </div>

                      <span className="stock-lbl">
                      Chỉ còn 2 máy tại Hà Nội
                    </span>
                    </div>
                  </article>

                  <article className="flash-item">
                    <div className="fi-frame">
                      <img
                          src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop"
                          alt="AirPods Pro 2"
                      />
                      <span className="tag tag-red disc">-28%</span>
                    </div>

                    <div className="fi-body">
                    <span className="fi-cat">
                      Âm thanh cao cấp
                    </span>
                      <h4>
                        Tai nghe Apple AirPods Pro 2 Type-C (Chống ồn)
                      </h4>

                      <div className="fi-price">
                        <span className="cur">4.890.000₫</span>
                        <s className="old">6.190.000₫</s>
                      </div>

                      <div className="stock-meter">
                        <div
                            className="bar"
                            style={{ width: '60%' }}
                        ></div>
                      </div>

                      <span className="stock-lbl">
                      Đã bán 32 sản phẩm
                    </span>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* ===== SẢN PHẨM BÁN CHẠY ===== */}
          <section
              className="bestsellers"
              id="bestsellers"
              style={{ padding: '60px 0', background: '#f8f9fa' }}
          >
            <div className="wrap">
              <div className="section-head mb-4">
                <div>
                <span className="eyebrow text-primary fw-bold">
                  Chuỗi thiết bị di động hàng đầu
                </span>
                  <h2 className="fw-bold">
                    Thiết Bị Công Nghệ Nổi Bật 2026
                  </h2>
                </div>

                <span className="badge bg-primary px-3 py-2 fs-6">
                <i className="bi bi-shield-check me-1"></i>
                100% Chính Hãng VN/A
              </span>
              </div>

              <div className="row g-4">
                {/* Product Card 1 */}
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-danger position-absolute top-0 start-0 m-3">
                    Trả góp 0%
                  </span>

                    <Link href="/product" className="text-decoration-none">
                      <img
                          src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop"
                          className="card-img-top p-2"
                          alt="iPhone 16 Pro Max"
                      />
                    </Link>

                    <div className="card-body d-flex flex-column px-0">
                      <span className="text-muted small">Apple</span>

                      <Link
                          href="/product"
                          className="text-decoration-none text-dark"
                      >
                        <h6 className="card-title fw-bold hover-title">
                          iPhone 16 Pro Max 256GB
                        </h6>
                      </Link>

                      <p className="text-secondary small mb-2">
                        Chip A18 Pro · Nút Camera Control · Màn hình 6.9 inch
                      </p>

                      <div className="mt-auto">
                        <p className="text-danger fw-bold fs-5 mb-2">
                          34.990.000₫
                        </p>

                        <Link
                            href="/product"
                            className="btn btn-outline-primary btn-sm w-100 fw-bold"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Xem Chi Tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Card 2 */}
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-info text-dark position-absolute top-0 start-0 m-3">
                    Galaxy AI
                  </span>

                    <img
                        src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop"
                        className="card-img-top p-2"
                        alt="Samsung Galaxy S24"
                    />

                    <div className="card-body d-flex flex-column px-0">
                      <span className="text-muted small">Samsung</span>

                      <h6 className="card-title fw-bold">
                        Samsung Galaxy S24 Ultra 512GB
                      </h6>

                      <p className="text-secondary small mb-2">
                        Snapdragon 8 Gen 3 · Bút S-Pen · Khung viền Titan
                      </p>

                      <div className="mt-auto">
                        <p className="text-danger fw-bold fs-5 mb-2">
                          29.990.000₫
                        </p>

                        <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                          <i className="bi bi-cart-plus me-1"></i>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Card 3 */}
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-success position-absolute top-0 start-0 m-3">
                    Bán chạy nhất
                  </span>

                    <img
                        src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"
                        className="card-img-top p-2"
                        alt="MacBook Air M3"
                    />

                    <div className="card-body d-flex flex-column px-0">
                      <span className="text-muted small">Apple</span>

                      <h6 className="card-title fw-bold">
                        MacBook Air M3 16GB / 256GB
                      </h6>

                      <p className="text-secondary small mb-2">
                        Apple M3 8-core CPU · Màn hình Liquid Retina 13.6"
                      </p>

                      <div className="mt-auto">
                        <p className="text-danger fw-bold fs-5 mb-2">
                          27.490.000₫
                        </p>

                        <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                          <i className="bi bi-cart-plus me-1"></i>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Card 4 */}
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="card h-100 shadow-sm border-0 position-relative p-3">
                  <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-3">
                    Mới ra mắt
                  </span>

                    <img
                        src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop"
                        className="card-img-top p-2"
                        alt="iPad Pro M4"
                    />

                    <div className="card-body d-flex flex-column px-0">
                      <span className="text-muted small">Apple</span>

                      <h6 className="card-title fw-bold">
                        iPad Pro M4 11 inch Ultra Retina
                      </h6>

                      <p className="text-secondary small mb-2">
                        Chip M4 thế hệ mới · Màn hình OLED Tandem siêu mỏng
                      </p>

                      <div className="mt-auto">
                        <p className="text-danger fw-bold fs-5 mb-2">
                          28.990.000₫
                        </p>

                        <button className="btn btn-outline-primary btn-sm w-100 fw-bold">
                          <i className="bi bi-cart-plus me-1"></i>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ===== FOOTER ===== */}
        <StoreFooter />
      </>
  );
}






















