'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCart } from './lib/cart';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const mapProductFromApi = (product) => ({
  ...product,
  image_url: product.imageUrl,
  category_id: product.categoryId,
  category_name: product.categoryName,
  brand_id: product.brandId,
  brand_name: product.brandName,
  created_at: product.createdAt,
  updated_at: product.updatedAt,
});

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');


  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await fetch(
            `${API_BASE_URL}/api/categories`,
            {
              signal: controller.signal,
            }
        );

        if (!response.ok) {
          throw new Error('Không thể tải danh mục sản phẩm.');
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Lỗi tải danh mục:', error);
        }
      }
    };

    loadCategories();

    return () => controller.abort();
  }, []);

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

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductError('');

        const response = await fetch(
            `${API_BASE_URL}/api/products`,
            {
              signal: controller.signal,
            }
        );

        if (!response.ok) {
          throw new Error('Không thể tải danh sách sản phẩm.');
        }

        const data = await response.json();

        setProducts(data.map(mapProductFromApi));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Lỗi tải sản phẩm:', error);
          setProductError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => controller.abort();
  }, []);

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
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
  };


  const handleSearch = (event) => {
    event.preventDefault();

    setSearchKeyword(searchInput.trim());

    document
        .getElementById('bestsellers')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
  };

  const getCategoryIcon = (slug) => {
    const iconMap = {
      'dien-thoai': 'bi-phone',
      'laptop': 'bi-laptop',
      'may-tinh-bang': 'bi-tablet',
      'tai-nghe': 'bi-headphones',
      'dong-ho-thong-minh': 'bi-smartwatch',
      'phu-kien': 'bi-battery-charging',
    };

    return iconMap[slug] || 'bi-grid';
  };

  const countProductsByCategory = (categoryId) => {
    return products.filter(
        (product) =>
            product.category_id === Number(categoryId)
    ).length;
  };

  const normalizedSearchKeyword =
      searchKeyword.trim().toLowerCase();

  const displayedProducts = products.filter((product) => {
    const matchesCategory =
        selectedCategoryId === 'ALL' ||
        product.category_id === Number(selectedCategoryId);

    const matchesName =
        normalizedSearchKeyword === '' ||
        product.name
            .toLowerCase()
            .includes(normalizedSearchKeyword);

    return matchesCategory && matchesName;
  });

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
            <form
                className="searchbar"
                role="search"
                onSubmit={handleSearch}
            >
              <label
                  className="visually-hidden"
                  htmlFor="searchCat"
              >
                Danh mục
              </label>

              <select
                  className="cat-select"
                  id="searchCat"
                  value={selectedCategoryId}
                  onChange={(event) =>
                      setSelectedCategoryId(event.target.value)
                  }
              >
                <option value="ALL">Tất cả</option>

                {categories.map((category) => (
                    <option
                        key={category.id}
                        value={String(category.id)}
                    >
                      {category.name}
                    </option>
                ))}
              </select>

              <label
                  className="visually-hidden"
                  htmlFor="searchInput"
              >
                Tìm kiếm
              </label>

              <input
                  id="searchInput"
                  type="search"
                  placeholder="Nhập tên sản phẩm cần tìm..."
                  autoComplete="off"
                  value={searchInput}
                  onChange={(event) => {
                    const value = event.target.value;

                    setSearchInput(value);

                    if (value.trim() === '') {
                      setSearchKeyword('');
                    }
                  }}
              />

              <button
                  className="search-btn text-danger"
                  type="submit"
                  aria-label="Tìm kiếm"
              >
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

              <Link href="/cart" className="hact cart ms-2 text-white text-decoration-none" aria-label="Giỏ hàng">
                <i className="bi bi-cart3 fs-4 text-white"></i>
                <span className="hact-txt text-white">Giỏ hàng</span>
                <span className="count bg-warning text-dark">{cartCount}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* MENU ĐIỀU HƯỚNG DANH MỤC */}
        <nav className="deptnav" aria-label="Danh mục thiết bị">
          <div className="wrap">
            {/* Hiển thị toàn bộ sản phẩm */}
            <a
                className={`dept-all ${
                    selectedCategoryId === 'ALL' ? 'fw-bold' : ''
                }`}
                href="#bestsellers"
                onClick={() => {
                  setSelectedCategoryId('ALL');
                  setSearchInput('');
                  setSearchKeyword('');
                }}
            >
              <i className="bi bi-grid-fill me-2"></i>
              Tất cả danh mục
            </a>

            {/* Giữ lại mục khuyến mãi */}
            <a className="dept-link hot" href="#flash">
              <i className="bi bi-lightning-charge-fill me-1"></i>
              Hotsale Cuối Tuần
            </a>

            {/* Danh mục lấy từ database */}
            {categories.map((category) => (
                <a
                    key={category.id}
                    className={`dept-link ${
                        String(category.id) === selectedCategoryId
                            ? 'fw-bold text-danger'
                            : ''
                    }`}
                    href="#bestsellers"
                    onClick={() =>
                        setSelectedCategoryId(String(category.id))
                    }
                >
                  {category.name}
                </a>
            ))}

            <span className="dept-spacer"></span>

            <span className="dept-phone">
      <i className="bi bi-telephone-inbound me-1"></i>
      Mua hàng: 1800.6868 (Miễn phí)
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
        <section className="catrail" id="categories" aria-label="Danh mục thiết bị">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow">Khám phá theo ngành hàng</span>
                <h2>Danh Mục Thiết Bị Di Động</h2>
              </div>
              <a
                  className="see-all"
                  href="#bestsellers"
                  onClick={() => setSelectedCategoryId('ALL')}
              >
                Xem toàn bộ {categories.length} danh mục
                <i className="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
            <div className="catrail-track">
              {categories.map((category) => (
                  <a
                      key={category.id}
                      className="cat-tile"
                      href="#bestsellers"
                      onClick={() =>
                          setSelectedCategoryId(String(category.id))
                      }
                  >
      <span className="cat-ic">
        <i
            className={`bi ${getCategoryIcon(
                category.slug
            )} fs-3 text-primary`}
        ></i>
      </span>

                    <span className="cat-name">
        {category.name}
      </span>

                    <span className="cat-count">
        {countProductsByCategory(category.id)} sản phẩm
      </span>
                  </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FLASH DEALS CÓ BỘ ĐẾM NGƯỢC ===== */}
        <section className="flash" id="flash" aria-label="Flash sale">
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
              {isLoadingProducts ? (
                  <div className="col-12 text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="text-muted mt-3 mb-0">
                      Đang tải sản phẩm...
                    </p>
                  </div>
              ) : productError ? (
                  <div className="col-12">
                    <div className="alert alert-danger text-center">
                      {productError}
                    </div>
                  </div>
              ) : displayedProducts.length === 0 ? (
                  <div className="col-12 text-center text-muted py-5">
                    Hiện chưa có sản phẩm đang kinh doanh.
                  </div>
              ) : (
                  displayedProducts.map((product) => (
                      <div
                          key={product.id}
                          className="col-12 col-sm-6 col-md-4 col-lg-3"
                      >
                        <div className="card h-100 shadow-sm border-0 position-relative p-3">
          <span className="badge bg-danger position-absolute top-0 start-0 m-3">
            Chính hãng
          </span>

                          <Link
                              href={`/product?id=${product.id}`}
                              className="text-decoration-none"
                          >
                            <img
                                src={product.image_url}
                                className="card-img-top p-2"
                                alt={product.name}
                                style={{
                                  height: '220px',
                                  objectFit: 'contain',
                                }}
                                onError={(event) => {
                                  event.currentTarget.src =
                                      'https://placehold.co/600x600/png?text=No+Image';
                                }}
                            />
                          </Link>

                          <div className="card-body d-flex flex-column px-0">
            <span className="text-muted small">
              {product.brand_name}
            </span>

                            <Link
                                href={`/product?id=${product.id}`}
                                className="text-decoration-none text-dark"
                            >
                              <h6 className="card-title fw-bold hover-title">
                                {product.name}
                              </h6>
                            </Link>

                            <p
                                className="text-secondary small mb-2"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                            >
                              {product.description || 'Chưa có mô tả sản phẩm'}
                            </p>

                            <div className="mt-auto">
                              <p className="text-danger fw-bold fs-5 mb-2">
                                {Number(product.price).toLocaleString('vi-VN')}₫
                              </p>

                              <Link
                                  href={`/product?id=${product.id}`}
                                  className="btn btn-outline-primary btn-sm w-100 fw-bold"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Xem Chi Tiết
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                  ))
              )}
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
    </>
  );
}


