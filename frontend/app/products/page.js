'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart, isUserLoggedIn, readCart } from '../lib/cart';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import ProductCard from '../../components/ProductCard';

// Dữ liệu demo chỉ dùng các cột products và tên danh mục/thương hiệu liên kết từ database.
const categories = [
  { id: 1, name: 'Điện thoại di động', slug: 'dien-thoai' },
  { id: 2, name: 'Laptop / Máy tính xách tay', slug: 'laptop' },
  { id: 3, name: 'Máy tính bảng (Tablet)', slug: 'tablet' },
  { id: 4, name: 'Phụ kiện & Tai nghe', slug: 'phu-kien' },
  { id: 5, name: 'Đồng hồ thông minh', slug: 'smartwatch' },
];
const brands = [
  { id: 1, name: 'Apple' }, { id: 2, name: 'Samsung' }, { id: 3, name: 'ASUS' },
  { id: 4, name: 'Sony' }, { id: 5, name: 'Xiaomi' },
];
const productsData = [
  { id: 1, sku: 'IP16PM-256-TN', name: 'iPhone 16 Pro Max 256GB', description: 'Chip Apple A18 Pro, màn hình Super Retina XDR 6,9 inch và hệ thống camera 48MP.', price: 34990000, image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop', category_id: 1, brand_id: 1, status: 'ACTIVE', created_at: '2026-11-15T08:30:00', updated_at: '2026-11-20T14:20:00' },
  { id: 2, sku: 'SS-S24U-512-TI', name: 'Samsung Galaxy S24 Ultra 512GB', description: 'Khung viền Titan, bút S Pen tích hợp và các tính năng Galaxy AI.', price: 29990000, image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop', category_id: 1, brand_id: 2, status: 'ACTIVE', created_at: '2026-11-15T09:00:00', updated_at: '2026-11-20T15:00:00' },
  { id: 3, sku: 'MBA-M3-15-16GB', name: 'MacBook Air M3 15 inch 16GB/512GB', description: 'Laptop Apple M3 với màn hình Liquid Retina 15,3 inch.', price: 32490000, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', category_id: 2, brand_id: 1, status: 'ACTIVE', created_at: '2026-11-15T09:30:00', updated_at: '2026-11-20T15:30:00' },
  { id: 4, sku: 'IPP-M4-11-256', name: 'iPad Pro M4 11 inch Wi-Fi 256GB', description: 'Chip M4 và màn hình Ultra Retina XDR Tandem OLED.', price: 28990000, image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop', category_id: 3, brand_id: 1, status: 'ACTIVE', created_at: '2026-11-16T08:00:00', updated_at: '2026-11-20T16:00:00' },
  { id: 5, sku: 'APP2-USBC-WHITE', name: 'Tai nghe Apple AirPods Pro 2 USB-C', description: 'Tai nghe không dây chống ồn chủ động và âm thanh không gian.', price: 5790000, image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop', category_id: 4, brand_id: 1, status: 'ACTIVE', created_at: '2026-11-16T09:00:00', updated_at: '2026-11-20T16:30:00' },
  { id: 6, sku: 'ASUS-ROG-G16-4070', name: 'Laptop Gaming ASUS ROG Zephyrus G16', description: 'Laptop ASUS trang bị Intel Core Ultra 9 và NVIDIA GeForce RTX 4070.', price: 52990000, image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=600&fit=crop', category_id: 2, brand_id: 3, status: 'ACTIVE', created_at: '2026-11-17T08:00:00', updated_at: '2026-11-21T10:00:00' },
  { id: 7, sku: 'XM-14U-512-LEICA', name: 'Xiaomi 14 Ultra 5G 512GB Leica', description: 'Điện thoại Xiaomi với hệ thống camera Leica và chip Snapdragon 8 Gen 3.', price: 26990000, image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop', category_id: 1, brand_id: 5, status: 'ACTIVE', created_at: '2026-11-17T09:00:00', updated_at: '2026-11-21T11:00:00' },
  { id: 8, sku: 'SONY-WH1000XM5-BLK', name: 'Tai nghe không dây Sony WH-1000XM5', description: 'Tai nghe Sony chống ồn chủ động, hỗ trợ âm thanh Hi-Res Audio Wireless.', price: 7990000, image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop', category_id: 4, brand_id: 4, status: 'ACTIVE', created_at: '2026-11-18T08:00:00', updated_at: '2026-11-21T12:00:00' },
  { id: 9, sku: 'AW-S10-42-GPS', name: 'Apple Watch Series 10 GPS 42mm', description: 'Đồng hồ Apple theo dõi sức khỏe và hoạt động hằng ngày.', price: 10990000, image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop', category_id: 5, brand_id: 1, status: 'ACTIVE', created_at: '2026-11-20T08:00:00', updated_at: '2026-11-21T08:00:00' },
  { id: 10, sku: 'GALAXY-WATCH7-44', name: 'Samsung Galaxy Watch7 44mm', description: 'Đồng hồ Samsung hỗ trợ theo dõi sức khỏe và GPS.', price: 7490000, image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop', category_id: 5, brand_id: 2, status: 'ACTIVE', created_at: '2026-11-20T09:00:00', updated_at: '2026-11-21T09:00:00' },
  { id: 11, sku: 'SONY-SRS-XB23-BLK', name: 'Loa Bluetooth Sony SRS-XB23', description: 'Loa Bluetooth Sony chống nước IP67, thời lượng pin đến 12 giờ.', price: 2490000, image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop', category_id: 4, brand_id: 4, status: 'ACTIVE', created_at: '2026-11-20T10:00:00', updated_at: '2026-11-21T10:00:00' },
];
const formatPrice = (value) => `${value.toLocaleString('vi-VN')}₫`;
const priceRanges = [
  { value: 'all', label: 'Tất cả mức giá', test: () => true },
  { value: 'under5', label: 'Dưới 5 triệu', test: (price) => price < 5000000 },
  { value: '5to15', label: '5–15 triệu', test: (price) => price >= 5000000 && price < 15000000 },
  { value: '15to30', label: '15–30 triệu', test: (price) => price >= 15000000 && price <= 30000000 },
  { value: 'over30', label: 'Trên 30 triệu', test: (price) => price > 30000000 },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [brandId, setBrandId] = useState('all');
  const [status, setStatus] = useState('ACTIVE');
  const [priceRange, setPriceRange] = useState('all');
  const [sort, setSort] = useState('created');
  const [cartCount, setCartCount] = useState(0);
  const [admin, setAdmin] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const requestedCategory = searchParams.get('category');
    const requestedQuery = searchParams.get('q');
    const match = categories.find((item) => item.name === requestedCategory || item.slug === requestedCategory);
    setCategoryId(match ? String(match.id) : 'all');
    setQuery(requestedQuery || '');
  }, [searchParams]);
  useEffect(() => {
    const update = () => setCartCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    update();
    window.addEventListener('cart-updated', update);
    window.addEventListener('storage', update);
    try {
      const user = JSON.parse(localStorage.getItem('adminUser') || localStorage.getItem('currentUser') || 'null');
      setAdmin(user?.role === 'ADMIN' || user?.roles?.includes('ADMIN'));
    } catch { setAdmin(false); }
    return () => {
      window.removeEventListener('cart-updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('vi');
    const range = priceRanges.find((item) => item.value === priceRange) || priceRanges[0];
    const items = productsData.filter((product) => {
      const category = categories.find((item) => item.id === product.category_id)?.name || '';
      const brand = brands.find((item) => item.id === product.brand_id)?.name || '';
      const matchesSearch = !search || `${product.sku} ${product.name} ${product.description} ${category} ${brand}`.toLocaleLowerCase('vi').includes(search);
      return matchesSearch && (categoryId === 'all' || product.category_id === Number(categoryId)) && (brandId === 'all' || product.brand_id === Number(brandId)) && (status === 'all' || product.status === status) && range.test(product.price);
    });
    if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    if (sort === 'updated') items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    if (sort === 'created') items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return items;
  }, [query, categoryId, brandId, status, priceRange, sort]);

  const addProductToCart = (product) => {
    if (!isUserLoggedIn()) {
      router.push('/login');
      return;
    }
    addToCart(product, '');
    setNotice(`Đã thêm ${product.name} vào giỏ hàng`);
    window.setTimeout(() => setNotice(''), 2200);
  };

  return (
    <main className="min-vh-100" style={{ background: '#f5f5f7' }}>
      <StoreHeader searchValue={query} onSearchChange={setQuery} searchPlaceholder="Tìm theo tên, mã sản phẩm..." />

      <div className="container py-4 py-lg-5">
        <div className="d-flex align-items-center gap-2 small text-muted mb-3"><Link href="/" className="text-decoration-none text-muted">Trang chủ</Link><span>/</span><span className="text-dark">{categories.find((item) => String(item.id) === categoryId)?.name || 'Sản phẩm'}</span></div>
        <section className="category-banner-image mb-4" aria-label="Banner danh mục sản phẩm">
          <img
            src="https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/xa-kho-gia-soc-2.jpg"
            alt="Banner danh mục sản phẩm"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/images/iphone-16-pro-max-banner.jpg';
            }}
          />
        </section>

        <section className="mb-4" aria-label="Danh mục sản phẩm">
          <h2 className="h5 fw-bold mb-3">Danh mục</h2>
          <div className="d-flex gap-2 overflow-auto pb-2">
            <Link href="/products" className={`btn rounded-3 text-nowrap ${categoryId === 'all' ? 'btn-outline-danger' : 'btn-light border'}`}>Tất cả</Link>
            {categories.map((item) => <Link key={item.id} href={`/products?category=${item.slug}`} className={`btn rounded-3 text-nowrap ${String(item.id) === categoryId ? 'btn-outline-danger' : 'btn-light border'}`}>{item.name}</Link>)}
          </div>
        </section>

        <section className="bg-white rounded-4 shadow-sm p-3 p-lg-4 mb-4" aria-label="Bộ lọc sản phẩm">
          <h2 className="h5 fw-bold mb-3">Chọn theo tiêu chí</h2>
          <div className="row g-2">
            <div className="col-6 col-md-3"><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Lọc theo trạng thái"><option value="ACTIVE">Đang kinh doanh</option><option value="INACTIVE">Ngừng kinh doanh</option><option value="all">Tất cả trạng thái</option></select></div>
            <div className="col-6 col-md-3"><select className="form-select" value={brandId} onChange={(event) => setBrandId(event.target.value)} aria-label="Lọc theo thương hiệu"><option value="all">Tất cả thương hiệu</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></div>
            <div className="col-12 col-md-3"><select className="form-select" value={priceRange} onChange={(event) => setPriceRange(event.target.value)} aria-label="Lọc theo giá"><option value="all">Tất cả mức giá</option>{priceRanges.slice(1).map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}</select></div>
            <div className="col-12 col-md-3"><select className="form-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Lọc theo danh mục"><option value="all">Tất cả danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          </div>
        </section>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div><h2 className="h4 fw-bold mb-1">Sản phẩm</h2><span className="text-muted">{filteredProducts.length} sản phẩm</span></div>
          <div className="d-flex align-items-center gap-2"><label htmlFor="product-sort" className="text-nowrap">Sắp xếp:</label><select id="product-sort" className="form-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="created">Ngày tạo mới nhất</option><option value="updated">Cập nhật gần đây</option><option value="price-low">Giá thấp đến cao</option><option value="price-high">Giá cao đến thấp</option><option value="name">Tên A–Z</option></select></div>
        </div>

        {filteredProducts.length ? <div className="row g-3 g-lg-4">{filteredProducts.map((product) => {
          const category = categories.find((item) => item.id === product.category_id);
          const brand = brands.find((item) => item.id === product.brand_id);
          return <ProductCard key={product.id} product={product} categoryName={category?.name} brandName={brand?.name} onAddToCart={addProductToCart} />;
        })}</div> : <div className="bg-white rounded-4 p-5 text-center text-muted">Không có sản phẩm phù hợp với bộ lọc.</div>}
      </div>
      <StoreFooter />
      {notice && <div className="position-fixed bottom-0 end-0 m-4 alert alert-success shadow rounded-3" role="status" style={{ zIndex: 1100 }}>{notice}</div>}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Đang tải danh sách sản phẩm...</main>}>
      <ProductsContent />
    </Suspense>
  );
}

