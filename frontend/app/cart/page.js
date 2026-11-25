'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { readCart, removeFromCart, updateCartQuantity } from '../lib/cart';
import { createDemoOrder, loadDemoOrderData, PAYMENT_METHOD_LABELS } from '../lib/demo-orders';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [note, setNote] = useState('');
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const refresh = () => {
      const nextItems = readCart();
      setItems(nextItems);
      setSelectedKeys((current) => current.filter((key) => nextItems.some((item) => item.key === key)));
    };
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) { try { setUser(JSON.parse(rawUser)); } catch { localStorage.removeItem('currentUser'); } }
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
  const calculatedDiscount = useMemo(() => {
    if (!appliedVoucher || selectedTotal < appliedVoucher.min_order_amount) return 0;
    let discount = appliedVoucher.discount_type === 'PERCENTAGE' ? selectedTotal * appliedVoucher.discount_value / 100 : appliedVoucher.discount_value;
    if (appliedVoucher.max_discount_amount != null) discount = Math.min(discount, appliedVoucher.max_discount_amount);
    return Math.min(Math.round(discount), selectedTotal);
  }, [appliedVoucher, selectedTotal]);
  const finalTotal = Math.max(selectedTotal - calculatedDiscount, 0);

  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    const voucher = loadDemoOrderData().vouchers.find((item) => item.code === code);
    const now = new Date();
    if (!voucher || voucher.status !== 'ACTIVE' || new Date(voucher.start_date) > now || new Date(voucher.end_date) < now || voucher.used_count >= voucher.usage_limit) {
      setAppliedVoucher(null); setVoucherError('Mã voucher không tồn tại hoặc đã hết hạn.'); return;
    }
    if (selectedTotal < voucher.min_order_amount) {
      setAppliedVoucher(null); setVoucherError(`Đơn cần đạt tối thiểu ${formatPrice(voucher.min_order_amount)} để dùng mã này.`); return;
    }
    setAppliedVoucher(voucher); setVoucherError('');
  };

  const openCheckout = () => {
    if (!selectedItems.length) return;
    if (!user) { router.push('/login'); return; }
    setCheckoutError(''); setShowCheckout(true);
  };

  const submitOrder = (event) => {
    event.preventDefault();
    if (!user?.id) { setCheckoutError('Tài khoản chưa có mã người dùng hợp lệ.'); return; }
    if (!shippingAddress.trim()) { setCheckoutError('Vui lòng nhập địa chỉ giao hàng.'); return; }
    const order = createDemoOrder({ user, cartItems: selectedItems, shippingAddress, paymentMethod, voucherCode: appliedVoucher?.code || '', note });
    selectedItems.forEach((item) => removeFromCart(item.key));
    setItems(readCart()); setSelectedKeys([]); setAppliedVoucher(null); setVoucherInput(''); setShowCheckout(false);
    router.push(`/account?section=orders&order_id=${order.id}`);
  };

  return (
    <>
    <StoreHeader />
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
                          <div><h2 className="h6 fw-bold mb-1">{item.name}</h2><div className="text-secondary small">Phân loại: {item.color || 'Mặc định'}</div></div>
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
                <div className="border rounded-3 p-3 mb-3"><label className="form-label fw-semibold" htmlFor="voucher-code">Mã voucher</label><div className="input-group"><input id="voucher-code" className="form-control" value={voucherInput} onChange={(event) => setVoucherInput(event.target.value)} placeholder="Nhập mã voucher" /><button className="btn btn-outline-danger" type="button" onClick={applyVoucher}>Áp dụng</button></div>{voucherError && <small className="text-danger d-block mt-2">{voucherError}</small>}{appliedVoucher && <small className="text-success d-block mt-2">{appliedVoucher.code} · {appliedVoucher.title}</small>}</div>
                <div className="d-flex justify-content-between mb-3"><span>Phí vận chuyển</span><span className="text-secondary">Tính khi đặt hàng</span></div>
                <hr />
                <div className="d-flex justify-content-between mb-2 text-success"><span>Giảm giá</span><strong>− {formatPrice(calculatedDiscount)}</strong></div>
                <div className="d-flex justify-content-between align-items-center mb-3"><strong>THÀNH TIỀN</strong><strong className="text-danger fs-5">{formatPrice(finalTotal)}</strong></div>
                <button type="button" className="btn btn-danger w-100 fw-bold py-3 rounded-3" disabled={selectedCount === 0} onClick={openCheckout}>MUA NGAY ({selectedCount})</button>
                <p className="small text-secondary text-center mt-2 mb-0">Đặt hàng demo frontend · chưa gọi backend.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
      {showCheckout && <div className="modal d-block" role="dialog" aria-modal="true" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1080 }} onClick={() => setShowCheckout(false)}><div className="modal-dialog modal-dialog-centered" onClick={(event) => event.stopPropagation()}><form className="modal-content border-0 rounded-4" onSubmit={submitOrder}><div className="modal-header"><div><h2 className="h5 modal-title fw-bold">Thông tin đặt hàng</h2><small className="text-muted">Dữ liệu tạo theo cấu trúc orders và order_items</small></div><button type="button" className="btn-close" onClick={() => setShowCheckout(false)} aria-label="Đóng" /></div><div className="modal-body"><div className="mb-3"><label className="form-label fw-semibold">Người đặt</label><div className="form-control bg-light">{user?.full_name || user?.fullName || user?.name} · {user?.phone || user?.email}</div></div><div className="mb-3"><label htmlFor="shipping-address" className="form-label fw-semibold">Địa chỉ giao hàng <span className="text-danger">*</span></label><textarea id="shipping-address" className="form-control" rows="3" required maxLength="255" value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} placeholder="Nhập địa chỉ nhận hàng" /></div><div className="mb-3"><label htmlFor="payment-method" className="form-label fw-semibold">Phương thức thanh toán</label><select id="payment-method" className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>{Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div><div className="mb-3"><label htmlFor="order-note" className="form-label fw-semibold">Ghi chú</label><textarea id="order-note" className="form-control" rows="2" maxLength="500" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" /></div>{checkoutError && <div className="alert alert-danger py-2">{checkoutError}</div>}<div className="d-flex justify-content-between"><span>Tổng tiền hàng</span><strong>{formatPrice(selectedTotal)}</strong></div><div className="d-flex justify-content-between text-success"><span>Giảm giá</span><strong>− {formatPrice(calculatedDiscount)}</strong></div><div className="d-flex justify-content-between border-top mt-2 pt-2 fw-bold"><span>Thành tiền</span><strong className="text-danger">{formatPrice(finalTotal)}</strong></div></div><div className="modal-footer"><button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setShowCheckout(false)}>Quay lại</button><button type="submit" className="btn btn-danger rounded-pill px-4">Tạo đơn hàng</button></div></form></div></div>}
    </main>
    <StoreFooter />
    </>
  );
}

