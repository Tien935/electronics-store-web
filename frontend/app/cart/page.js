'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { readCart, removeFromCart, updateCartQuantity } from '../lib/cart';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const nextItems = readCart();
      setItems(nextItems);
      setSelectedKeys((current) => current.filter((key) => nextItems.some((item) => item.key === key)));
    };
    const initialItems = readCart();
    setItems(initialItems);
    setSelectedKeys(initialItems.map((item) => item.key));
    setReady(true);
    window.addEventListener('cart-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cart-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const selectedItems = useMemo(() => items.filter((item) => selectedKeys.includes(item.key)), [items, selectedKeys]);
  const selectedTotal = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [selectedItems]);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = items.length > 0 && selectedKeys.length === items.length;
  const toggleItem = (key) => setSelectedKeys((current) => current.includes(key) ? current.filter((itemKey) => itemKey !== key) : [...current, key]);
  const toggleAll = () => setSelectedKeys(allSelected ? [] : items.map((item) => item.key));
  const changeQuantity = (item, quantity) => setItems(updateCartQuantity(item.key, quantity));
  const deleteItem = (item) => {
    setItems(removeFromCart(item.key));
    setSelectedKeys((current) => current.filter((key) => key !== item.key));
  };

  return (
    <main className="py-3 py-md-4" style={{ minHeight: '100vh', background: '#e8e8eb' }}>
      <div className="container" style={{ maxWidth: 1150 }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-white rounded-3 px-3 px-md-4 py-3 mb-3 shadow-sm">
          <div className="small"><Link href="/" className="text-dark text-decoration-none fw-semibold">‹ Tiếp tục mua sắm</Link><span className="text-secondary mx-3">/</span><span className="text-secondary">Giỏ hàng của bạn</span></div>
          <div className="rounded-2 bg-primary-subtle text-primary text-center px-3 py-2 small fw-semibold">Thông tin vận chuyển sẽ được xác nhận khi đặt hàng</div>
        </div>

        {!ready ? null : items.length === 0 ? (
          <section className="bg-white rounded-3 shadow-sm text-center p-5">
            <i className="bi bi-cart3 text-secondary" style={{ fontSize: 48 }} />
            <h1 className="h5 fw-bold mt-3">Giỏ hàng đang trống</h1>
            <p className="text-secondary">Hãy chọn sản phẩm bạn muốn mua nhé.</p>
            <Link href="/" className="btn btn-danger px-4">Khám phá sản phẩm</Link>
          </section>
        ) : (
          <div className="row g-3">
            <section className="col-lg-8">
              <div className="bg-white rounded-3 shadow-sm px-3 px-md-4 py-3 mb-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <label className="d-flex align-items-center gap-2 mb-0 fw-medium">
                  <input type="checkbox" className="form-check-input mt-0" checked={allSelected} onChange={toggleAll} aria-label="Chọn tất cả sản phẩm" />
                  Tất cả ({items.length})
                </label>
                <button type="button" className="btn btn-outline-primary rounded-pill px-4 fw-semibold" disabled={selectedItems.length === 0}>Mua ngay ({selectedCount})</button>
              </div>

              <div className="d-flex flex-column gap-3">
                {items.map((item) => (
                  <article key={item.key} className="bg-white rounded-3 shadow-sm p-3 p-md-4">
                    <div className="d-flex align-items-center gap-3">
                      <input type="checkbox" className="form-check-input mt-0" checked={selectedKeys.includes(item.key)} onChange={() => toggleItem(item.key)} aria-label={`Chọn ${item.name}`} />
                      <img src={item.image_url} alt={item.name} width="86" height="86" className="rounded border p-1" style={{ objectFit: 'contain', flexShrink: 0 }} />
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div><h2 className="h6 fw-bold mb-1">{item.name}</h2><div className="text-secondary small">Màu: {item.color}</div></div>
                          <button type="button" className="btn btn-sm text-secondary" onClick={() => deleteItem(item)} aria-label={`Xóa ${item.name}`} title="Xóa sản phẩm"><i className="bi bi-trash3" /></button>
                        </div>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
                          <span className="small text-secondary">Mã sản phẩm: {item.sku}</span>
                          <div className="d-flex align-items-center gap-3">
                            <strong className="text-danger">{formatPrice(item.price)}</strong>
                            <div className="input-group input-group-sm" style={{ width: 116 }}>
                              <button type="button" className="btn btn-outline-secondary" onClick={() => changeQuantity(item, item.quantity - 1)} aria-label="Giảm số lượng">−</button>
                              <span className="form-control text-center">{item.quantity}</span>
                              <button type="button" className="btn btn-outline-secondary" onClick={() => changeQuantity(item, item.quantity + 1)} aria-label="Tăng số lượng">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="col-lg-4">
              <div className="bg-white rounded-3 shadow-sm p-3 p-md-4">
                <h2 className="h6 fw-bold mb-3">Thông tin đơn hàng</h2>
                <div className="d-flex justify-content-between mb-3"><span>Số lượng sản phẩm</span><strong>{selectedCount}</strong></div>
                <div className="d-flex justify-content-between mb-3"><span>Tổng tiền hàng</span><strong>{formatPrice(selectedTotal)}</strong></div>
                <div className="d-flex justify-content-between mb-3"><span>Phí vận chuyển</span><span className="text-secondary">Tính khi đặt hàng</span></div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-3"><strong>TỔNG TIỀN</strong><strong className="text-danger fs-5">{formatPrice(selectedTotal)}</strong></div>
                <button type="button" className="btn btn-danger w-100 fw-bold py-3" disabled={selectedCount === 0}>MUA NGAY ({selectedCount})</button>
                <p className="small text-secondary text-center mt-2 mb-0">Bước đặt hàng sẽ khả dụng khi hoàn thiện kết nối đơn hàng.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
