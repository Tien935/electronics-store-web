'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DEMO_ORDERS, DEMO_ORDER_ITEMS, DEMO_ORDER_STATUS_HISTORY, ORDER_STATUS_BADGES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, DEMO_VOUCHERS, formatOrderDate, loadDemoOrderData, saveDemoOrderData } from '../../lib/demo-orders';

export default function StaffOrdersPage() {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [history, setHistory] = useState(DEMO_ORDER_STATUS_HISTORY);
  const [orderItems, setOrderItems] = useState(DEMO_ORDER_ITEMS);
  const [vouchers, setVouchers] = useState(DEMO_VOUCHERS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  useEffect(() => {
    const syncOrders = () => {
      const data = loadDemoOrderData();
      setOrders(data.orders);
      setOrderItems(data.items);
      setHistory(data.history);
      setVouchers(data.vouchers);
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
    const raw = localStorage.getItem('currentUser') || localStorage.getItem('adminUser');
    if (!raw) { router.replace('/login'); return; }
    try {
      const user = JSON.parse(raw);
      const roles = Array.isArray(user.roles) ? user.roles : [];
      if (user.role === 'ADMIN' || roles.includes('ADMIN')) { router.replace('/admin'); return; }
      if (user.role === 'STAFF' || roles.includes('STAFF')) setStaff(user);
      else router.replace('/');
    } catch { router.replace('/login'); }
  }, [router]);
  const filteredOrders = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('vi');
    return orders.filter((order) => (!term || `${order.order_code} ${order.customer_name} ${order.customer_phone} ${order.customer_email}`.toLocaleLowerCase('vi').includes(term)) && (status === 'ALL' || order.status === status));
  }, [orders, query, status]);
  const updateStatus = (order, current_status) => {
    const now = new Date().toISOString();
    const nextOrders = orders.map((item) => item.id === order.id ? { ...item, status: current_status, updated_at: now } : item);
    const entry = { id: Math.max(0, ...history.map((item) => item.id)) + 1, order_id: order.id, previous_status: order.status, current_status, action_event: 'UPDATE_STATUS', reason: null, changed_by: staff?.email || 'STAFF', created_at: now };
    const nextHistory = [...history, entry];
    setOrders(nextOrders);
    setHistory(nextHistory);
    saveDemoOrderData({ orders: nextOrders, items: orderItems, history: nextHistory, vouchers });
    setSelectedOrder((prev) => prev?.id === order.id ? { ...prev, status: current_status, updated_at: now } : prev);
  };
  const logout = () => { localStorage.removeItem('currentUser'); localStorage.removeItem('adminUser'); localStorage.removeItem('accessToken'); router.replace('/login'); };
  if (!staff) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">Đang tải trang nhân viên...</div>;

  return <main className="min-vh-100" style={{ background: '#f4f6f8' }}>
    <header className="bg-white border-bottom shadow-sm"><div className="container py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap"><Link href="/" className="text-danger fw-bold fs-4 text-decoration-none">TECHMART <span className="badge bg-primary">NHÂN VIÊN</span></Link><div className="d-flex align-items-center gap-3"><span className="text-secondary">Xin chào, <strong>{staff.full_name || staff.fullName || staff.name || staff.email}</strong></span><button className="btn btn-outline-danger rounded-pill" onClick={logout}><i className="bi bi-box-arrow-right me-1" />Đăng xuất</button></div></div></header>
    <div className="container py-4 py-lg-5"><div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4"><div><div className="small text-muted mb-1">Khu vực nhân viên / Đơn hàng</div><h1 className="h3 fw-bold mb-1">Quản lý đơn hàng</h1><p className="text-muted mb-0">Tra cứu và cập nhật đơn hàng.</p></div><span className="badge bg-white text-dark shadow-sm px-3 py-2">{orders.length} đơn hàng</span></div>
      <section className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="p-3 p-lg-4 border-bottom bg-white"><div className="row g-2"><div className="col-md-8"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search" /></span><input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, tên, email hoặc số điện thoại" /></div></div><div className="col-md-4"><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">Tất cả trạng thái</option>{Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></div></div>
        <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th className="ps-3">Mã đơn</th><th>Ngày tạo</th><th>Khách hàng</th><th>Thanh toán</th><th>Giảm giá</th><th className="text-end">Thành tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
          {filteredOrders.length ? filteredOrders.map((order) => <tr key={order.id}><td className="ps-3 fw-semibold text-primary">{order.order_code}</td><td className="text-nowrap">{formatOrderDate(order.created_at)}</td><td><strong>{order.customer_name}</strong><small className="d-block text-muted">{order.customer_phone}</small></td><td><div>{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</div><small className="text-muted">{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</small></td><td className="text-nowrap">{order.discount_amount.toLocaleString('vi-VN')}₫</td><td className="text-end fw-bold text-nowrap">{order.final_amount.toLocaleString('vi-VN')}₫</td><td style={{ minWidth: 175 }}><select className="form-select form-select-sm" value={order.status} onChange={(event) => updateStatus(order, event.target.value)} aria-label={`Cập nhật đơn ${order.order_code}`}>{Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td><td><button className="btn btn-sm btn-outline-primary rounded-pill text-nowrap" onClick={() => setSelectedOrder(order)}><i className="bi bi-eye me-1" />Chi tiết</button></td></tr>) : <tr><td colSpan="8" className="text-center py-5 text-muted">Không tìm thấy đơn hàng phù hợp.</td></tr>}
        </tbody></table></div><div className="p-3 bg-white border-top small text-muted">Đang hiển thị {filteredOrders.length} / {orders.length} đơn hàng</div></section>
    </div>
    {selectedOrder && (() => { const items = orderItems.filter((item) => item.order_id === selectedOrder.id); const voucher = vouchers.find((item) => item.code === selectedOrder.voucher_code); const events = history.filter((item) => item.order_id === selectedOrder.id); return <div className="modal d-block" role="dialog" aria-modal="true" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1080 }} onClick={() => setSelectedOrder(null)}><div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}><div className="modal-content border-0 rounded-4"><div className="modal-header"><div><h2 className="h5 modal-title fw-bold mb-1">Chi tiết đơn hàng</h2><span className="text-primary">{selectedOrder.order_code}</span></div><button className="btn-close" onClick={() => setSelectedOrder(null)} aria-label="Đóng" /></div><div className="modal-body"><div className="row g-3 mb-4"><div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Khách hàng · user_id {selectedOrder.user_id}</div><strong>{selectedOrder.customer_name}</strong><div>{selectedOrder.customer_phone}</div><div>{selectedOrder.customer_email || '—'}</div></div></div><div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Đơn hàng</div><div>Tạo: {formatOrderDate(selectedOrder.created_at)}</div><div>Cập nhật: {formatOrderDate(selectedOrder.updated_at)}</div><span className={`badge mt-1 ${ORDER_STATUS_BADGES[selectedOrder.status]}`}>{ORDER_STATUS_LABELS[selectedOrder.status]}</span></div></div><div className="col-12"><div className="p-3 bg-light rounded-3"><div className="small text-muted">Địa chỉ giao hàng</div><strong>{selectedOrder.shipping_address}</strong><div className="mt-2 small text-muted">Chi nhánh: {selectedOrder.branch_name || '—'}{selectedOrder.branch_id ? ` (ID: ${selectedOrder.branch_id})` : ''}</div></div></div></div>
          <h3 className="h6 fw-bold">Sản phẩm trong đơn</h3><div className="table-responsive border rounded-3 mb-4"><table className="table align-middle mb-0"><thead className="table-light"><tr><th>Sản phẩm</th><th>Phân loại / IMEI</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="d-flex align-items-center gap-2">{item.product_image && <img src={item.product_image} alt={item.product_name} width="48" height="48" className="object-fit-contain" />}<div><strong>{item.product_name}</strong><small className="d-block text-muted">{item.sku}</small></div></div></td><td>{item.variant_name || '—'}<small className="d-block text-muted">IMEI: {item.imei || '—'}</small></td><td>{item.unit_price.toLocaleString('vi-VN')}₫</td><td>{item.quantity}</td><td>{item.total_price.toLocaleString('vi-VN')}₫</td></tr>)}</tbody></table></div>
          <div className="row g-4"><div className="col-md-6"><h3 className="h6 fw-bold">Thanh toán</h3><div className="small d-flex justify-content-between py-1"><span>Phương thức</span><strong>{PAYMENT_METHOD_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method}</strong></div><div className="small d-flex justify-content-between py-1"><span>Trạng thái</span><strong>{PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status}</strong></div><div className="small d-flex justify-content-between py-1"><span>Voucher</span><strong>{voucher ? `${voucher.code} · ${voucher.title}` : 'Không áp dụng'}</strong></div><div className="small d-flex justify-content-between py-1"><span>Ghi chú</span><span>{selectedOrder.note || '—'}</span></div></div><div className="col-md-6"><h3 className="h6 fw-bold">Tổng kết</h3><div className="d-flex justify-content-between py-1"><span>Tổng tiền hàng</span><span>{selectedOrder.total_amount.toLocaleString('vi-VN')}₫</span></div><div className="d-flex justify-content-between py-1 text-success"><span>Giảm giá</span><span>− {selectedOrder.discount_amount.toLocaleString('vi-VN')}₫</span></div><div className="d-flex justify-content-between border-top pt-2 mt-2 fw-bold"><span>Thành tiền</span><span className="text-danger">{selectedOrder.final_amount.toLocaleString('vi-VN')}₫</span></div></div></div>
          <h3 className="h6 fw-bold mt-4">Lịch sử trạng thái</h3><div className="list-group list-group-flush">{events.map((event) => <div className="list-group-item px-0" key={event.id}><strong>{ORDER_STATUS_LABELS[event.current_status] || event.current_status}</strong><span className="small text-muted ms-2">{formatOrderDate(event.created_at)} · {event.changed_by}</span><div className="small text-secondary">{event.action_event}{event.reason ? ` — ${event.reason}` : ''}</div></div>)}</div>
        </div></div></div></div>; })()}
  </main>;
}
