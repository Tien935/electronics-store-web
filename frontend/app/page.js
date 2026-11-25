
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addToCart, isUserLoggedIn } from './lib/cart';
import StoreHeader from '../components/StoreHeader';
import StoreFooter from '../components/StoreFooter';
import ProductCard from '../components/ProductCard';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    sku: 'IP16PM-256-TN',
    name: 'iPhone 16 Pro Max 256GB',
    description: 'Chip Apple A18 Pro, màn hình Super Retina XDR 6,9 inch và hệ thống camera 48MP.',
    price: 34990000,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
    category_name: 'Điện thoại di động',
    brand_name: 'Apple',
    status: 'ACTIVE',
  },
  {
    id: 2,
    sku: 'SS-S24U-512-TI',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Khung viền Titan, bút S Pen tích hợp và các tính năng Galaxy AI.',
    price: 29990000,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop',
    category_name: 'Điện thoại di động',
    brand_name: 'Samsung',
    status: 'ACTIVE',
  },
  {
    id: 3,
    sku: 'MBA-M3-15-16GB',
    name: 'MacBook Air M3 15 inch 16GB/512GB',
    description: 'Laptop Apple M3 với màn hình Liquid Retina 15,3 inch.',
    price: 32490000,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
    category_name: 'Laptop / Máy tính xách tay',
    brand_name: 'Apple',
    status: 'ACTIVE',
  },
  {
    id: 4,
    sku: 'IPP-M4-11-256',
    name: 'iPad Pro M4 11 inch Wi-Fi 256GB',
    description: 'Chip M4 và màn hình Ultra Retina XDR Tandem OLED.',
    price: 28990000,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
    category_name: 'Máy tính bảng (Tablet)',
    brand_name: 'Apple',
    status: 'ACTIVE',
  },
];

export default function Home() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(6 * 60 * 60 + 42 * 60 + 15);
  const [notice, setNotice] = useState('');

  const addProductToCart = (product) => {
    if (!isUserLoggedIn()) {
      router.push('/login');
      return;
    }
    addToCart(product, '');
    setNotice(`Đã thêm ${product.name} vào giỏ hàng`);
    window.setTimeout(() => setNotice(''), 2200);
  };

  useEffect(() => {
    const storageKey = 'techmart-flash-sale-ends-at';
    const savedEndsAt = Number(window.localStorage.getItem(storageKey));
    const endsAt = savedEndsAt > Date.now()
      ? savedEndsAt
      : Date.now() + (6 * 60 * 60 + 42 * 60 + 15) * 1000;
    window.localStorage.setItem(storageKey, String(endsAt));
    const updateCountdown = () => {
      setSecondsLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const countdownHours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const countdownMinutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const countdownSeconds = String(secondsLeft % 60).padStart(2, '0');

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
                  <span className="cat-name">Điện thoại di động</span>
                  <span className="cat-count">3 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=laptop">
                <span className="cat-ic">
                  <i className="bi bi-laptop fs-3 text-success"></i>
                </span>
                  <span className="cat-name">Laptop / Máy tính xách tay</span>
                  <span className="cat-count">2 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=tablet">
                <span className="cat-ic">
                  <i className="bi bi-tablet fs-3 text-info"></i>
                </span>
                  <span className="cat-name">Máy tính bảng (Tablet)</span>
                  <span className="cat-count">1 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=phu-kien">
                <span className="cat-ic">
                  <i className="bi bi-headphones fs-3 text-warning"></i>
                </span>
                  <span className="cat-name">Phụ kiện & Tai nghe</span>
                  <span className="cat-count">3 mẫu</span>
                </Link>

                <Link className="cat-tile" href="/products?category=smartwatch">
                <span className="cat-ic">
                  <i className="bi bi-smartwatch fs-3 text-danger"></i>
                </span>
                  <span className="cat-name">Đồng hồ thông minh</span>
                  <span className="cat-count">2 mẫu</span>
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
                      <b>{countdownHours}</b><span>giờ</span>
                    </span>
                      <span className="cd-colon">:</span>
                      <span className="cd-box">
                      <b>{countdownMinutes}</b><span>phút</span>
                    </span>
                      <span className="cd-colon">:</span>
                      <span className="cd-box">
                      <b>{countdownSeconds}</b><span>giây</span>
                    </span>
                    </div>
                  </div>
                </div>

                <div className="flash-grid flash-track">
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

                  <article className="flash-item">
                    <div className="fi-frame">
                      <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop" alt="MacBook Air M3" />
                      <span className="tag tag-red disc">-15%</span>
                    </div>
                    <div className="fi-body">
                      <span className="fi-cat">Laptop mỏng nhẹ</span>
                      <h4>MacBook Air M3 13 inch 16GB/512GB</h4>
                      <div className="fi-price"><span className="cur">27.490.000₫</span><s className="old">32.490.000₫</s></div>
                      <div className="stock-meter"><div className="bar" style={{ width: '55%' }} /></div>
                      <span className="stock-lbl">Còn 8 sản phẩm</span>
                    </div>
                  </article>

                  <article className="flash-item">
                    <div className="fi-frame">
                      <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop" alt="iPad Pro M4" />
                      <span className="tag tag-red disc">-12%</span>
                    </div>
                    <div className="fi-body">
                      <span className="fi-cat">Máy tính bảng</span>
                      <h4>iPad Pro M4 11 inch Wi-Fi 256GB</h4>
                      <div className="fi-price"><span className="cur">25.490.000₫</span><s className="old">28.990.000₫</s></div>
                      <div className="stock-meter"><div className="bar" style={{ width: '48%' }} /></div>
                      <span className="stock-lbl">Còn 6 sản phẩm</span>
                    </div>
                  </article>

                  <article className="flash-item">
                    <div className="fi-frame">
                      <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop" alt="Apple Watch Series 10" />
                      <span className="tag tag-red disc">-20%</span>
                    </div>
                    <div className="fi-body">
                      <span className="fi-cat">Đồng hồ thông minh</span>
                      <h4>Apple Watch Series 10 GPS 42mm</h4>
                      <div className="fi-price"><span className="cur">8.790.000₫</span><s className="old">10.990.000₫</s></div>
                      <div className="stock-meter"><div className="bar" style={{ width: '35%' }} /></div>
                      <span className="stock-lbl">Còn 5 sản phẩm</span>
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

              <div className="row g-3 g-lg-4">
                {FEATURED_PRODUCTS.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={product.category_name}
                    brandName={product.brand_name}
                    onAddToCart={addProductToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ===== FOOTER ===== */}
        <StoreFooter />
        {notice && (
          <div className="position-fixed bottom-0 end-0 m-4 alert alert-success shadow rounded-3" role="status" style={{ zIndex: 1100 }}>
            {notice}
          </div>
        )}
      </>
  );
}






















