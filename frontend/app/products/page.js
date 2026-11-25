'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart, isUserLoggedIn } from '../lib/cart';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import ProductCard from '../../components/ProductCard';

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

const formatPrice = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [brandId, setBrandId] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sort, setSort] = useState('created');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const loadCatalog = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/categories`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/brands`, { signal: controller.signal }),
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok || !brandsResponse.ok) {
          throw new Error('Không thể tải dữ liệu sản phẩm.');
        }

        const [productsData, categoriesData, brandsData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json(),
        ]);

        setProducts(productsData.map(mapProductFromApi));
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Lỗi tải trang sản phẩm:', error);
          setLoadError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadCatalog();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const requestedCategory = searchParams.get('category');
    const requestedQuery = searchParams.get('q');
    const match = categories.find(
      (item) => item.name === requestedCategory || item.slug === requestedCategory
    );
    setCategoryId(match ? String(match.id) : 'all');
    setQuery(requestedQuery || '');
  }, [searchParams, categories]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('vi');
    const range = priceRanges.find((item) => item.value === priceRange) || priceRanges[0];
    const items = products.filter((product) => {
      const category = categories.find((item) => item.id === product.category_id)?.name || '';
      const brand = brands.find((item) => item.id === product.brand_id)?.name || '';
      const matchesSearch = !search || `${product.sku} ${product.name} ${product.description} ${category} ${brand}`.toLocaleLowerCase('vi').includes(search);
      return matchesSearch && (categoryId === 'all' || product.category_id === Number(categoryId)) && (brandId === 'all' || product.brand_id === Number(brandId)) && range.test(Number(product.price));
    });
    if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    if (sort === 'updated') items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    if (sort === 'created') items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return items;
  }, [products, categories, brands, query, categoryId, brandId, priceRange, sort]);

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
            <div className="col-12 col-md-4"><select className="form-select" value={brandId} onChange={(event) => setBrandId(event.target.value)} aria-label="Lọc theo thương hiệu"><option value="all">Tất cả thương hiệu</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></div>
            <div className="col-12 col-md-4"><select className="form-select" value={priceRange} onChange={(event) => setPriceRange(event.target.value)} aria-label="Lọc theo giá"><option value="all">Tất cả mức giá</option>{priceRanges.slice(1).map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}</select></div>
            <div className="col-12 col-md-4"><select className="form-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Lọc theo danh mục"><option value="all">Tất cả danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          </div>
        </section>

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div><h2 className="h4 fw-bold mb-1">Sản phẩm</h2><span className="text-muted">{filteredProducts.length} sản phẩm</span></div>
          <div className="d-flex align-items-center gap-2"><label htmlFor="product-sort" className="text-nowrap">Sắp xếp:</label><select id="product-sort" className="form-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="created">Ngày tạo mới nhất</option><option value="updated">Cập nhật gần đây</option><option value="price-low">Giá thấp đến cao</option><option value="price-high">Giá cao đến thấp</option><option value="name">Tên A–Z</option></select></div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-4 p-5 text-center">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-muted mt-3 mb-0">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : loadError ? (
          <div className="alert alert-danger" role="alert">{loadError}</div>
        ) : filteredProducts.length ? (
          <div className="row g-3 g-lg-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={product.category_name}
                brandName={product.brand_name}
                onAddToCart={addProductToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-4 p-5 text-center text-muted">
            Không có sản phẩm phù hợp với bộ lọc.
          </div>
        )}
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

