'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DEMO_ORDERS, DEMO_ORDER_ITEMS, DEMO_ORDER_STATUS_HISTORY, ORDER_STATUS_BADGES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, DEMO_VOUCHERS, formatOrderDate, loadDemoOrderData, saveDemoOrderData } from '../../lib/demo-orders';
import BrandLogo from '../../../components/BrandLogo';

export default function StaffOrdersPage() {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [history, setHistory] = useState(DEMO_ORDER_STATUS_HISTORY);
  const [orderItems, setOrderItems] = useState(DEMO_ORDER_ITEMS);
  const [vouchers, setVouchers] = useState(DEMO_VOUCHERS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
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
    return orders.filter((order) =>
      (!term || `${order.order_code} ${order.customer_name} ${order.customer_phone} ${order.customer_email}`.toLocaleLowerCase('vi').includes(term)) &&
      (status === 'ALL' || order.status === status) &&
      (paymentMethod === 'ALL' || order.payment_method === paymentMethod)
    );
  }, [orders, query, status, paymentMethod]);
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

  const statusTabs = [
    { value: 'ALL', label: 'Tất cả' },
    ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return <main className="min-vh-100" style={{ background: '#f4f6f8' }}>
    <header className="bg-white border-bottom shadow-sm">
      <div className="container py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <BrandLogo tone="dark" />
          <span className="badge bg-danger-subtle text-danger">NHÂN VIÊN</span>
        </div>
        <div className="d-flex align-items-center gap-2 gap-lg-3 flex-wrap">
          <span className="text-secondary">Xin chào, <strong>{staff.full_name || staff.fullName || staff.name || staff.email}</strong></span>
          <Link href="/" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"><i className="bi bi-shop me-1" />Xem cửa hàng</Link>
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold" onClick={logout}><i className="bi bi-box-arrow-right me-1" />Đăng xuất</button>
        </div>
      </div>
    </header>
    <div className="container py-4 py-lg-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div><div className="small text-muted mb-1">Khu vực nhân viên / Đơn hàng</div><h1 className="h3 fw-bold mb-1">Quản lý đơn hàng</h1><p className="text-muted mb-0">Tra cứu và cập nhật các đơn hàng của cửa hàng.</p></div>
        <span className="badge bg-white text-dark shadow-sm px-3 py-2">{orders.length} đơn hàng</span>
      </div>
      <section className="card border-0 shadow-sm rounded-3 bg-white mb-4 overflow-hidden">
        <div className="card-header bg-white py-3 px-3 px-lg-4 border-bottom d-flex justify-content-between align-items-center gap-3">
          <div><h2 className="h5 fw-bold text-dark mb-1"><i className="bi bi-receipt me-2 text-primary" />Quản lý đơn hàng</h2><span className="small text-muted">Theo dõi và xử lý các đơn hàng</span></div>
          <span className="badge bg-primary-subtle text-primary px-3 py-2">{orders.length} đơn hàng</span>
        </div>
        <div className="d-flex overflow-auto bg-white border-bottom px-2 px-lg-3" role="tablist" aria-label="Lọc đơn hàng theo trạng thái">
          {statusTabs.map((tab) => {
            const count = tab.value === 'ALL' ? orders.length : orders.filter((order) => order.status === tab.value).length;
            const selected = status === tab.value;
            return <button key={tab.value} type="button" role="tab" aria-selected={selected} onClick={() => setStatus(tab.value)} className={`btn rounded-0 border-0 border-bottom border-3 px-3 py-3 text-nowrap ${selected ? 'border-primary text-primary fw-bold' : 'border-transparent text-secondary'}`}><span className="d-block">{tab.label}</span><small className={selected ? 'text-primary' : 'text-muted'}>{count} đơn</small></button>;
          })}
        </div>
        <div className="p-3 p-lg-4 bg-white border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-lg-7"><div className="input-group"><span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span><input type="search" className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn hàng, tên hoặc số điện thoại khách..." /></div></div>
            <div className="col-12 col-lg-4"><select className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} aria-label="Lọc theo phương thức thanh toán"><option value="ALL">Tất cả thanh toán</option>{[...new Set(orders.map((order) => order.payment_method))].map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method] || method}</option>)}</select></div>
          </div>
          <div className="small text-muted mt-3"><i className="bi bi-info-circle me-1" />Đang hiển thị {filteredOrders.length} đơn hàng phù hợp</div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th className="ps-3">Mã đơn hàng</th><th>Ngày đặt</th><th>Khách hàng</th><th>Sản phẩm</th><th className="text-center">Số lượng</th><th>Thanh toán</th><th className="text-end">Tổng tiền</th><th>Trạng thái</th><th className="text-center">Thao tác</th></tr></thead>
            <tbody>
              {filteredOrders.length === 0 ? <tr><td colSpan="9" className="text-center py-5 text-muted"><i className="bi bi-inbox fs-2 d-block mb-2" />Không tìm thấy đơn hàng phù hợp.</td></tr> : filteredOrders.map((order) => {
                const items = orderItems.filter((item) => item.order_id === order.id);
                const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                return <tr key={order.id}>
                  <td className="ps-3"><button type="button" className="btn btn-link p-0 fw-semibold text-primary text-decoration-none" onClick={() => setSelectedOrder(order)}>{order.order_code}</button></td>
                  <td className="text-nowrap">{formatOrderDate(order.created_at)}</td>
                  <td><div className="fw-semibold">{order.customer_name}</div><small className="text-muted">{order.customer_phone}</small></td>
                  <td style={{ minWidth: 210 }}>{items.map((item) => item.product_name).join(', ') || '—'}</td>
                  <td className="text-center">{quantity}</td>
                  <td><div>{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</div><small className={order.payment_status === 'PAID' ? 'text-success' : 'text-secondary'}>{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</small></td>
                  <td className="text-end fw-bold text-nowrap">{Number(order.final_amount || 0).toLocaleString('vi-VN')} ₫</td>
                  <td style={{ minWidth: 165 }}><select className={`form-select form-select-sm ${ORDER_STATUS_BADGES[order.status] || ''}`} value={order.status} onChange={(event) => updateStatus(order, event.target.value)} aria-label={`Cập nhật trạng thái đơn ${order.order_code}`}>{Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td>
                  <td className="text-center text-nowrap"><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelectedOrder(order)} title="Xem chi tiết đơn hàng"><i className="bi bi-eye me-1" />Chi tiết</button></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white py-3 px-3 px-lg-4 small text-muted d-flex justify-content-between"><span>Đang xem {filteredOrders.length} / {orders.length} đơn hàng</span><span>Trang 1 / 1</span></div>
      </section>
    </div>
    {selectedOrder && (() => { const items = orderItems.filter((item) => item.order_id === selectedOrder.id); const voucher = vouchers.find((item) => item.code === selectedOrder.voucher_code); const events = history.filter((item) => item.order_id === selectedOrder.id); return <div className="modal d-block" role="dialog" aria-modal="true" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1080 }} onClick={() => setSelectedOrder(null)}><div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}><div className="modal-content border-0 rounded-4"><div className="modal-header"><div><h2 className="h5 modal-title fw-bold mb-1">Chi tiết đơn hàng</h2><span className="text-primary">{selectedOrder.order_code}</span></div><button className="btn-close" onClick={() => setSelectedOrder(null)} aria-label="Đóng" /></div><div className="modal-body"><div className="row g-3 mb-4"><div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Khách hàng · user_id {selectedOrder.user_id}</div><strong>{selectedOrder.customer_name}</strong><div>{selectedOrder.customer_phone}</div><div>{selectedOrder.customer_email || '—'}</div></div></div><div className="col-md-6"><div className="p-3 bg-light rounded-3 h-100"><div className="small text-muted">Đơn hàng</div><div>Tạo: {formatOrderDate(selectedOrder.created_at)}</div><div>Cập nhật: {formatOrderDate(selectedOrder.updated_at)}</div><span className={`badge mt-1 ${ORDER_STATUS_BADGES[selectedOrder.status]}`}>{ORDER_STATUS_LABELS[selectedOrder.status]}</span></div></div><div className="col-12"><div className="p-3 bg-light rounded-3"><div className="small text-muted">Địa chỉ giao hàng</div><strong>{selectedOrder.shipping_address}</strong><div className="mt-2 small text-muted">Chi nhánh: {selectedOrder.branch_name || '—'}{selectedOrder.branch_id ? ` (ID: ${selectedOrder.branch_id})` : ''}</div></div></div></div>
          <h3 className="h6 fw-bold">Sản phẩm trong đơn</h3><div className="table-responsive border rounded-3 mb-4"><table className="table align-middle mb-0"><thead className="table-light"><tr><th>Sản phẩm</th><th>Phân loại / IMEI</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="d-flex align-items-center gap-2">{item.product_image && <img src={item.product_image} alt={item.product_name} width="48" height="48" className="object-fit-contain" />}<div><strong>{item.product_name}</strong><small className="d-block text-muted">{item.sku}</small></div></div></td><td>{item.variant_name || '—'}<small className="d-block text-muted">IMEI: {item.imei || '—'}</small></td><td>{item.unit_price.toLocaleString('vi-VN')}₫</td><td>{item.quantity}</td><td>{item.total_price.toLocaleString('vi-VN')}₫</td></tr>)}</tbody></table></div>
          <div className="row g-4"><div className="col-md-6"><h3 className="h6 fw-bold">Thanh toán</h3><div className="small d-flex justify-content-between py-1"><span>Phương thức</span><strong>{PAYMENT_METHOD_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method}</strong></div><div className="small d-flex justify-content-between py-1"><span>Trạng thái</span><strong>{PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status}</strong></div><div className="small d-flex justify-content-between py-1"><span>Voucher</span><strong>{voucher ? `${voucher.code} · ${voucher.title}` : 'Không áp dụng'}</strong></div><div className="small d-flex justify-content-between py-1"><span>Ghi chú</span><span>{selectedOrder.note || '—'}</span></div></div><div className="col-md-6"><h3 className="h6 fw-bold">Tổng kết</h3><div className="d-flex justify-content-between py-1"><span>Tổng tiền hàng</span><span>{selectedOrder.total_amount.toLocaleString('vi-VN')}₫</span></div><div className="d-flex justify-content-between py-1 text-success"><span>Giảm giá</span><span>− {selectedOrder.discount_amount.toLocaleString('vi-VN')}₫</span></div><div className="d-flex justify-content-between border-top pt-2 mt-2 fw-bold"><span>Thành tiền</span><span className="text-danger">{selectedOrder.final_amount.toLocaleString('vi-VN')}₫</span></div></div></div>
          <h3 className="h6 fw-bold mt-4">Lịch sử trạng thái</h3><div className="list-group list-group-flush">{events.map((event) => <div className="list-group-item px-0" key={event.id}><strong>{ORDER_STATUS_LABELS[event.current_status] || event.current_status}</strong><span className="small text-muted ms-2">{formatOrderDate(event.created_at)} · {event.changed_by}</span><div className="small text-secondary">{event.action_event}{event.reason ? ` — ${event.reason}` : ''}</div></div>)}</div>
        </div></div></div></div>; })()}
  </main>;
}
