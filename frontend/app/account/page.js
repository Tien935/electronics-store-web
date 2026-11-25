'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StoreHeader from '../../components/StoreHeader';
import StoreFooter from '../../components/StoreFooter';
import {
  DEMO_ORDERS,
  DEMO_ORDER_ITEMS,
  DEMO_ORDER_STATUS_HISTORY,
  ORDER_STATUS_BADGES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  DEMO_VOUCHERS,
  formatOrderDate,
  loadDemoOrderData,
} from '../lib/demo-orders';

const formatDate = (value) => {
  if (!value) return 'Chưa có thông tin';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const formatMoney = (value = 0) => `${Number(value).toLocaleString('vi-VN')}₫`;

const sections = [
  { id: 'overview', label: 'Tổng quan', icon: 'bi-house-door' },
  { id: 'orders', label: 'Đơn hàng của tôi', icon: 'bi-box-seam' },
  { id: 'profile', label: 'Xem hồ sơ', icon: 'bi-person-vcard' },
];

function OrderCard({ order, itemCount, onDetails, compact = false }) {
  return (
    <article className="border rounded-4 bg-white overflow-hidden">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-md-4 py-3 border-bottom">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <strong>{order.order_code}</strong>
          <span className="text-muted">·</span>
          <span className="text-muted">{formatOrderDate(order.created_at)}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{itemCount} sản phẩm</span>
        </div>
        <span className={`badge rounded-pill ${ORDER_STATUS_BADGES[order.status] || 'bg-secondary'}`}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-3 px-md-4 py-3">
        <div>
          <div className="text-muted small">Tổng thanh toán</div>
          <strong className="text-danger fs-5">{formatMoney(order.final_amount)}</strong>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary rounded-pill" onClick={() => onDetails(order)}>Xem chi tiết</button>
          {!compact && <Link href="/products" className="btn btn-danger rounded-pill">Mua sắm</Link>}
        </div>
      </div>
    </article>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [orderItems, setOrderItems] = useState(DEMO_ORDER_ITEMS);
  const [orderHistory, setOrderHistory] = useState(DEMO_ORDER_STATUS_HISTORY);
  const [vouchers, setVouchers] = useState(DEMO_VOUCHERS);

  useEffect(() => {
    const syncOrders = () => {
      const data = loadDemoOrderData();
      setOrders(data.orders);
      setOrderItems(data.items);
      setOrderHistory(data.history);
      setVouchers(data.vouchers);
      const params = new URLSearchParams(window.location.search);
      if (['overview', 'orders', 'profile'].includes(params.get('section'))) {
        setActiveSection(params.get('section'));
      }
      const orderId = Number(params.get('order_id'));
      if (orderId) setSelectedOrder(data.orders.find((order) => order.id === orderId) || null);
    };
    syncOrders();
    window.addEventListener('orders-updated', syncOrders);
    window.addEventListener('storage', syncOrders);
    return () => {
      window.removeEventListener('orders-updated', syncOrders);
      window.removeEventListener('storage', syncOrders);
    };
  }, []);

  useEffect(() => {
    const rawUser = localStorage.getItem('currentUser');
    if (!rawUser) { router.replace('/login'); return; }
    try {
      const savedUser = JSON.parse(rawUser);
      const roles = Array.isArray(savedUser.roles) ? savedUser.roles : [];
      if (savedUser.role === 'ADMIN' || roles.includes('ADMIN')) { router.replace('/admin'); return; }
      if (savedUser.role === 'STAFF' || roles.includes('STAFF')) { router.replace('/staff/orders'); return; }
      setUser(savedUser);
    } catch {
      localStorage.removeItem('currentUser');
      router.replace('/login');
    }
  }, [router]);

  const customerOrders = useMemo(
    () => user ? orders.filter((order) => Number(order.user_id) === Number(user.id)) : [],
    [orders, user],
  );

  if (!user) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Đang tải tài khoản...</div>;

  const displayName = user.full_name || user.fullName || user.name || user.email || 'Khách hàng';
  const statusLabel = user.status === 'INACTIVE' ? 'Ngừng hoạt động' : 'Đang hoạt động';
  const completedOrders = customerOrders.filter((order) => order.status === 'COMPLETED').length;
  const pendingOrders = customerOrders.filter((order) => !['COMPLETED', 'CANCELLED'].includes(order.status)).length;
  const recentOrders = customerOrders.slice(0, 3);
  const orderItemCount = (order) => orderItems.filter((item) => item.order_id === order.id).length;

  return (
    <main className="min-vh-100" style={{ background: '#f4f6f8' }}>
      <StoreHeader />

      <div className="container py-4 py-lg-5">
        <div className="small text-muted mb-3"><Link href="/" className="text-muted text-decoration-none">Trang chủ</Link> / Tài khoản</div>
        <div className="row g-4 align-items-start">
          <aside className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="p-4 d-flex align-items-center gap-3 border-bottom">
                <div className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center fw-bold fs-4 flex-shrink-0" style={{ width: 58, height: 58 }}>
                  {displayName.trim().slice(0, 1).toLocaleUpperCase('vi')}
                </div>
                <div className="min-w-0">
                  <div className="fw-bold text-truncate">{displayName}</div>
                  <div className="small text-muted text-truncate">{user.phone || user.email}</div>
                </div>
              </div>
              <nav className="p-2" aria-label="Mục tài khoản">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`btn w-100 text-start rounded-3 px-3 py-3 mb-1 ${activeSection === section.id ? 'btn-danger' : 'btn-light'}`}
                    onClick={() => setActiveSection(section.id)}
                    aria-current={activeSection === section.id ? 'page' : undefined}
                  >
                    <i className={`bi ${section.icon} me-2`} />{section.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="col-lg-9">
            {activeSection === 'overview' && (
              <>
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <div className="text-danger fw-semibold mb-2">TÀI KHOẢN KHÁCH HÀNG</div>
                      <h1 className="h3 fw-bold mb-2">Xin chào, {displayName}</h1>
                      <p className="text-muted mb-0">Theo dõi đơn hàng và thông tin tài khoản của bạn tại đây.</p>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 h-100"><div className="card-body p-4"><div className="text-muted">Tổng đơn hàng</div><div className="fs-2 fw-bold mt-2">{customerOrders.length}</div></div></div></div>
                  <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 h-100"><div className="card-body p-4"><div className="text-muted">Đang xử lý</div><div className="fs-2 fw-bold text-warning mt-2">{pendingOrders}</div></div></div></div>
                  <div className="col-md-4"><div className="card border-0 shadow-sm rounded-4 h-100"><div className="card-body p-4"><div className="text-muted">Đã hoàn tất</div><div className="fs-2 fw-bold text-success mt-2">{completedOrders}</div></div></div></div>
                </div>

                <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                  <h2 className="h4 fw-bold mb-0">Đơn hàng gần đây</h2>
                  <button className="btn btn-link text-decoration-none" onClick={() => setActiveSection('orders')}>Xem tất cả <i className="bi bi-chevron-right" /></button>
                </div>
                {recentOrders.length ? (
                  <div className="d-grid gap-3">
                    {recentOrders.map((order) => <OrderCard key={order.id} order={order} itemCount={orderItemCount(order)} onDetails={setSelectedOrder} compact />)}
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 text-center p-5">
                    <i className="bi bi-box-seam text-muted" style={{ fontSize: 42 }} />
                    <p className="text-muted mt-3 mb-3">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/products" className="btn btn-danger rounded-pill px-4 align-self-center">Khám phá sản phẩm</Link>
                  </div>
                )}
              </>
            )}

            {activeSection === 'orders' && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
                    <div><h1 className="h3 fw-bold mb-1">Đơn hàng của tôi</h1><p className="text-muted mb-0">Xem trạng thái và thông tin các đơn hàng của bạn.</p></div>
                    <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">{customerOrders.length} đơn hàng</span>
                  </div>
                  {customerOrders.length ? (
                    <div className="d-grid gap-3">
                      {customerOrders.map((order) => <OrderCard key={order.id} order={order} itemCount={orderItemCount(order)} onDetails={setSelectedOrder} />)}
                    </div>
                  ) : (
                    <div className="text-center border rounded-4 p-5">
                      <i className="bi bi-receipt text-muted" style={{ fontSize: 44 }} />
                      <p className="text-muted mt-3">Chưa có đơn hàng nào gắn với tài khoản này.</p>
                      <Link href="/products" className="btn btn-danger rounded-pill px-4">Khám phá sản phẩm</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div><h1 className="h3 fw-bold mb-1">Hồ sơ của tôi</h1><p className="text-muted mb-0">Thông tin thành viên của bạn</p></div>
                    <span className={`badge rounded-pill px-3 py-2 ${user.status === 'INACTIVE' ? 'bg-secondary' : 'bg-success'}`}>{statusLabel}</span>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6"><div className="border rounded-3 p-3 h-100"><div className="small text-muted mb-1">Họ và tên</div><strong>{displayName}</strong></div></div>
                    <div className="col-md-6"><div className="border rounded-3 p-3 h-100"><div className="small text-muted mb-1">Email</div><strong>{user.email || 'Chưa có thông tin'}</strong></div></div>
                    <div className="col-md-6"><div className="border rounded-3 p-3 h-100"><div className="small text-muted mb-1">Số điện thoại</div><strong>{user.phone || 'Chưa có thông tin'}</strong></div></div>
                    <div className="col-md-6"><div className="border rounded-3 p-3 h-100"><div className="small text-muted mb-1">Ngày tạo tài khoản</div><strong>{formatDate(user.created_at || user.createdAt)}</strong></div></div>
                  </div>
                  <div className="alert alert-light border mt-4 mb-0"><i className="bi bi-info-circle text-primary me-2" />Thông tin hiển thị theo dữ liệu tài khoản hiện có.</div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <StoreFooter />

      {selectedOrder && (() => {
        const items = orderItems.filter((item) => item.order_id === selectedOrder.id);
        const events = orderHistory.filter((item) => item.order_id === selectedOrder.id);
        const voucher = vouchers.find((item) => item.code === selectedOrder.voucher_code);
        return (
          <div className="modal d-block" role="dialog" aria-modal="true" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1080 }} onClick={() => setSelectedOrder(null)}>
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}>
              <div className="modal-content border-0 rounded-4">
                <div className="modal-header">
                  <div><h2 className="h5 modal-title fw-bold">Chi tiết đơn hàng</h2><span className="text-primary">{selectedOrder.order_code}</span></div>
                  <button className="btn-close" onClick={() => setSelectedOrder(null)} aria-label="Đóng" />
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Người nhận</div><strong>{selectedOrder.customer_name}</strong><div>{selectedOrder.customer_phone}</div><div>{selectedOrder.customer_email}</div><div className="mt-2">{selectedOrder.shipping_address}</div></div></div>
                    <div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Chi nhánh nhận hàng</div><strong>{selectedOrder.branch_name || 'Giao hàng tận nơi'}</strong><div className="mt-2"><span className={`badge ${ORDER_STATUS_BADGES[selectedOrder.status]}`}>{ORDER_STATUS_LABELS[selectedOrder.status]}</span></div><div className="small text-muted mt-2">Tạo {formatOrderDate(selectedOrder.created_at)} · Cập nhật {formatOrderDate(selectedOrder.updated_at)}</div></div></div>
                  </div>
                  <h3 className="h6 fw-bold">Sản phẩm</h3>
                  <div className="list-group mb-4">{items.map((item) => <div key={item.id} className="list-group-item d-flex align-items-center gap-3"><img src={item.product_image} alt={item.product_name} width="56" height="56" className="object-fit-contain" /><div className="flex-grow-1"><strong>{item.product_name}</strong><small className="d-block text-muted">{item.sku} · {item.variant_name || '—'} · SL {item.quantity}</small><small className="text-muted">IMEI: {item.imei || '—'}</small></div><strong>{formatMoney(item.total_price)}</strong></div>)}</div>
                  <div className="row g-4">
                    <div className="col-md-6"><h3 className="h6 fw-bold">Thanh toán</h3><div>{PAYMENT_METHOD_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method} · {PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status}</div><div className="mt-2">Voucher: {voucher ? `${voucher.code} — ${voucher.title}` : 'Không áp dụng'}</div><div className="small text-muted mt-2">Ghi chú: {selectedOrder.note || '—'}</div></div>
                    <div className="col-md-6"><div className="d-flex justify-content-between"><span>Tổng tiền hàng</span><span>{formatMoney(selectedOrder.total_amount)}</span></div><div className="d-flex justify-content-between text-success"><span>Giảm giá</span><span>− {formatMoney(selectedOrder.discount_amount)}</span></div><div className="d-flex justify-content-between border-top mt-2 pt-2 fw-bold"><span>Thành tiền</span><span className="text-danger">{formatMoney(selectedOrder.final_amount)}</span></div></div>
                  </div>
                  <h3 className="h6 fw-bold mt-4">Lịch sử trạng thái</h3>
                  {events.map((event) => <div className="border-start border-3 ps-3 py-1 mb-2" key={event.id}><strong>{ORDER_STATUS_LABELS[event.current_status] || event.current_status}</strong><small className="d-block text-muted">{formatOrderDate(event.created_at)} · {event.changed_by}</small><small>{event.reason}</small></div>)}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}





