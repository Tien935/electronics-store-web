'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { readCart } from '../app/lib/cart';

export default function StoreHeader({ searchValue, onSearchChange, searchPlaceholder = 'Bạn cần tìm điện thoại, laptop, phụ kiện gì...' }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const searchText = searchValue ?? localSearch;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.roles?.includes('ADMIN');

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('adminUser') || localStorage.getItem('currentUser');
      if (!savedUser) { setCurrentUser(null); return; }
      try { setCurrentUser(JSON.parse(savedUser)); } catch { setCurrentUser(null); }
    };
    const updateCart = () => setCartCount(readCart().reduce((sum, item) => sum + item.quantity, 0));
    syncUser(); updateCart();
    window.addEventListener('auth-changed', syncUser);
    window.addEventListener('storage', syncUser);
    window.addEventListener('cart-updated', updateCart);
    return () => {
      window.removeEventListener('auth-changed', syncUser);
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('cart-updated', updateCart);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };
  const handleSearch = (event) => {
    event.preventDefault();
    const value = searchText.trim();
    if (onSearchChange) onSearchChange(value);
    else router.push(value ? `/products?q=${encodeURIComponent(value)}` : '/products');
  };

  return <>
    <div className="topbar"><div className="wrap d-flex justify-content-between align-items-center">
      <div className="tb-left"><span><i className="bi bi-geo-alt-fill text-warning me-1" />Hệ thống <strong>150 chi nhánh toàn quốc</strong> · Hotline: <strong>1800.2097</strong> (Miễn phí)</span></div>
      <div className="tb-right d-flex align-items-center gap-3"><span className="small text-white"><i className="bi bi-truck me-1 text-warning" />Giao hàng 2 Giờ</span><span className="small text-white"><i className="bi bi-shield-check me-1 text-warning" />Bảo hành chính hãng 12 tháng</span><span className="small text-white"><i className="bi bi-arrow-repeat me-1 text-warning" />Đổi mới trong 30 ngày</span></div>
    </div></div>
    <header className="site-header"><div className="wrap"><div className="header-main">
      <Link className="brand text-decoration-none" href="/" aria-label="TECH-MART home"><span className="brand-mark bg-white text-danger" aria-hidden="true" style={{ borderRadius: '10px' }}><i className="bi bi-phone-flip fs-3 text-danger" /></span><span><span className="brand-word text-white">TECH<b className="text-warning">MART</b></span><span className="brand-sub text-white-50">Hệ Thống Thiết Bị Di Động</span></span></Link>
      <form className="searchbar" role="search" onSubmit={handleSearch}><label className="visually-hidden" htmlFor="store-search">Tìm kiếm sản phẩm</label><input id="store-search" type="search" placeholder={searchPlaceholder} autoComplete="off" value={searchText} onChange={(event) => onSearchChange ? onSearchChange(event.target.value) : setLocalSearch(event.target.value)} /><button className="search-btn text-danger" type="submit" aria-label="Tìm kiếm"><i className="bi bi-search fs-5" /></button></form>
      <div className="header-actions d-flex align-items-center flex-nowrap" style={{ flexShrink: 0 }}>
        {!currentUser ? <div className="d-flex align-items-center gap-2"><Link href="/login" className="btn bg-white text-danger btn-sm fw-bold px-3 py-2 shadow-sm rounded-pill d-flex align-items-center gap-1 text-nowrap"><i className="bi bi-box-arrow-in-right fs-6" /><span>Đăng nhập</span></Link><Link href="/register" className="btn btn-outline-light btn-sm fw-bold px-3 py-2 shadow-sm rounded-pill d-flex align-items-center gap-1 text-nowrap"><i className="bi bi-person-plus fs-6" /><span>Đăng ký</span></Link></div> : <div className="d-flex align-items-center gap-2">
          {isAdmin && <Link href="/admin" className="btn btn-outline-light btn-sm fw-bold px-3 py-2 text-nowrap"><i className="bi bi-speedometer2 me-1" />Về trang Admin</Link>}
          {isAdmin ? <div className="bg-white text-danger px-3 py-1 rounded-pill fw-bold small d-flex align-items-center gap-1 shadow-sm text-nowrap"><i className="bi bi-person-check-fill fs-5" /><span>Chào, Admin</span></div> : <Link href="/account" className="bg-white text-danger px-3 py-2 rounded-pill fw-bold small d-flex align-items-center gap-1 shadow-sm text-nowrap text-decoration-none"><i className="bi bi-person-check-fill fs-5" /><span>Chào, {currentUser.full_name || currentUser.fullName || currentUser.name || currentUser.email}</span></Link>}
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm fw-bold rounded-pill px-3 py-2 text-nowrap" title="Đăng xuất khỏi tài khoản"><i className="bi bi-box-arrow-right me-1" />Đăng xuất</button>
        </div>}
        <Link href="/cart" className="hact cart ms-2 text-white text-decoration-none" aria-label="Giỏ hàng"><i className="bi bi-cart3 fs-4 text-white" /><span className="hact-txt text-white">Giỏ hàng</span><span className="count bg-warning text-dark">{cartCount}</span></Link>
      </div>
    </div></div>
    <nav className="deptnav" aria-label="Danh mục thiết bị"><div className="wrap">
      <Link className="dept-all" href="/products"><i className="bi bi-grid-fill me-2" />Tất cả sản phẩm</Link><Link className="dept-link hot" href="/#flash"><i className="bi bi-lightning-charge-fill me-1" />Hotsale Cuối Tuần</Link><Link className="dept-link" href="/products?category=dien-thoai">Điện thoại iPhone</Link><Link className="dept-link" href="/products?category=dien-thoai">Samsung Galaxy AI</Link><Link className="dept-link" href="/products?category=laptop">Laptop &amp; MacBook</Link><Link className="dept-link" href="/products?category=tablet">iPad &amp; Tablet</Link><Link className="dept-link" href="/products?category=smartwatch">Đồng hồ Smartwatch</Link><span className="dept-spacer" /><span className="dept-phone"><i className="bi bi-telephone-inbound me-1" />Mua hàng: 1800.6868 (Miễn phí)</span>
    </div></nav></header>
  </>;
}
