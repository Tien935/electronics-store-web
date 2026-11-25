// Frontend demo fixture based on the Order Service schema.
export const DEMO_ORDERS = [
  { id: 1, order_code: 'ORD-20261114-001', user_id: 1, customer_name: 'Đỗ Đức Tiền', customer_phone: '0987654321', customer_email: 'tien.do@techmart.vn', shipping_address: '79B Kim Ngưu, Thanh Lương, Hai Bà Trưng, Hà Nội', branch_id: 1, branch_name: 'FPT Shop 79B Kim Ngưu', status: 'DELIVERED', payment_method: 'COD', payment_status: 'PAID', voucher_code: 'GIAM10', total_amount: 34990000, discount_amount: 1000000, final_amount: 33990000, note: 'Giao giờ hành chính, gọi trước khi giao', created_at: '2026-11-14T09:15:00', updated_at: '2026-11-14T17:00:00' },
  { id: 2, order_code: 'ORD-20261114-002', user_id: 2, customer_name: 'Cao Đình Long', customer_phone: '0912345678', customer_email: 'long.cao@techmart.vn', shipping_address: '216 Thái Hà, Đống Đa, Hà Nội', branch_id: 2, branch_name: 'FPT Shop 216 Thái Hà', status: 'CONFIRMED', payment_method: 'VNPAY', payment_status: 'PAID', voucher_code: 'CHAOBANMOI', total_amount: 29990000, discount_amount: 500000, final_amount: 29490000, note: 'Khách đến nhận máy trực tiếp tại quầy', created_at: '2026-11-14T10:42:00', updated_at: '2026-11-14T11:10:00' },
  { id: 3, order_code: 'ORD-20261114-003', user_id: 3, customer_name: 'Võ Xuân Quang', customer_phone: '0977889900', customer_email: 'quang.vo@techmart.vn', shipping_address: '378 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội', branch_id: 3, branch_name: 'FPT Shop 378 Cầu Giấy', status: 'PENDING', payment_method: 'COD', payment_status: 'UNPAID', voucher_code: null, total_amount: 27990000, discount_amount: 0, final_amount: 27990000, note: 'Đơn hàng mới tạo, đang chờ xác nhận', created_at: '2026-11-14T12:00:00', updated_at: '2026-11-14T12:00:00' },
];

export const DEMO_ORDER_ITEMS = [
  { id: 1, order_id: 1, product_id: 1, sku: 'IP16PM-256-DESERT', product_name: 'iPhone 16 Pro Max', product_image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=240&h=240&fit=crop', variant_name: 'Desert Titanium / 256GB', imei: '356789123456785', unit_price: 34990000, quantity: 1, total_price: 34990000 },
  { id: 2, order_id: 2, product_id: 2, sku: 'SS-S24U-256-GRAY', product_name: 'Samsung Galaxy S24 Ultra', product_image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=240&h=240&fit=crop', variant_name: 'Titanium Gray / 256GB', imei: '864201234567893', unit_price: 29990000, quantity: 1, total_price: 29990000 },
  { id: 3, order_id: 3, product_id: 3, sku: 'MI-14U-512-WHITE', product_name: 'Xiaomi 14 Ultra', product_image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=240&h=240&fit=crop', variant_name: 'White Vegan Leather / 512GB', imei: '861357924681351', unit_price: 27990000, quantity: 1, total_price: 27990000 },
];

export const DEMO_ORDER_STATUS_HISTORY = [
  { id: 1, order_id: 1, previous_status: null, current_status: 'PENDING', action_event: 'CREATE_ORDER', reason: 'Khởi tạo đơn hàng online thành công', changed_by: 'CUSTOMER', created_at: '2026-11-14T09:15:00' },
  { id: 2, order_id: 1, previous_status: 'PENDING', current_status: 'CONFIRMED', action_event: 'CONFIRM', reason: 'Nhân viên xác nhận đơn và giữ hàng', changed_by: 'STAFF_TIEN', created_at: '2026-11-14T09:35:00' },
  { id: 3, order_id: 1, previous_status: 'CONFIRMED', current_status: 'PROCESSING', action_event: 'START_PROCESSING', reason: 'Kho đang đóng gói sản phẩm', changed_by: 'STAFF_KHO', created_at: '2026-11-14T10:00:00' },
  { id: 4, order_id: 1, previous_status: 'PROCESSING', current_status: 'SHIPPING', action_event: 'DISPATCH', reason: 'Bàn giao cho đơn vị vận chuyển', changed_by: 'SHIPPER', created_at: '2026-11-14T13:00:00' },
  { id: 5, order_id: 1, previous_status: 'SHIPPING', current_status: 'DELIVERED', action_event: 'DELIVER', reason: 'Khách đã nhận hàng', changed_by: 'SHIPPER', created_at: '2026-11-14T17:00:00' },
  { id: 6, order_id: 2, previous_status: null, current_status: 'PENDING', action_event: 'CREATE_ORDER', reason: 'Khởi tạo đơn hàng và thanh toán VNPAY', changed_by: 'CUSTOMER', created_at: '2026-11-14T10:42:00' },
  { id: 7, order_id: 2, previous_status: 'PENDING', current_status: 'CONFIRMED', action_event: 'CONFIRM', reason: 'Thanh toán thành công, đơn được xác nhận', changed_by: 'SYSTEM_VNPAY', created_at: '2026-11-14T11:10:00' },
  { id: 8, order_id: 3, previous_status: null, current_status: 'PENDING', action_event: 'CREATE_ORDER', reason: 'Khởi tạo đơn hàng COD chờ xác nhận', changed_by: 'CUSTOMER', created_at: '2026-11-14T12:00:00' },
];

export const DEMO_VOUCHERS = [
  { id: 1, code: 'CHAOBANMOI', title: 'Mã Chào Bạn Mới Giảm 500K', discount_type: 'FIXED_AMOUNT', discount_value: 500000, min_order_amount: 10000000, max_discount_amount: null, usage_limit: 500, used_count: 12, start_date: '2026-11-01T00:00:00', end_date: '2027-01-01T00:00:00', status: 'ACTIVE', created_at: '2026-11-01T00:00:00' },
  { id: 2, code: 'GIAM10', title: 'Giảm 10% Tối Đa 1 Triệu', discount_type: 'PERCENTAGE', discount_value: 10, min_order_amount: 5000000, max_discount_amount: 1000000, usage_limit: 200, used_count: 45, start_date: '2026-11-01T00:00:00', end_date: '2027-01-01T00:00:00', status: 'ACTIVE', created_at: '2026-11-01T00:00:00' },
  { id: 3, code: 'TECHMART1TR', title: 'Khuyến Mãi Flagship Giảm 1 Triệu', discount_type: 'FIXED_AMOUNT', discount_value: 1000000, min_order_amount: 25000000, max_discount_amount: null, usage_limit: 100, used_count: 5, start_date: '2026-11-01T00:00:00', end_date: '2027-01-01T00:00:00', status: 'ACTIVE', created_at: '2026-11-01T00:00:00' },
  { id: 4, code: 'IPHONE16', title: 'Ưu Đãi iPhone 16 Series Giảm 800K', discount_type: 'FIXED_AMOUNT', discount_value: 800000, min_order_amount: 20000000, max_discount_amount: null, usage_limit: 300, used_count: 18, start_date: '2026-11-01T00:00:00', end_date: '2027-01-01T00:00:00', status: 'ACTIVE', created_at: '2026-11-01T00:00:00' },
];

export const ORDER_STATUS_LABELS = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', REFUNDED: 'Đã hoàn tiền',
};
export const ORDER_STATUS_BADGES = {
  PENDING: 'bg-warning-subtle text-warning-emphasis', CONFIRMED: 'bg-primary-subtle text-primary',
  PROCESSING: 'bg-info-subtle text-info-emphasis', SHIPPING: 'bg-info-subtle text-info-emphasis',
  DELIVERED: 'bg-success-subtle text-success', CANCELLED: 'bg-danger-subtle text-danger', REFUNDED: 'bg-secondary-subtle text-secondary',
};
export const PAYMENT_STATUS_LABELS = { UNPAID: 'Chưa thanh toán', PAID: 'Đã thanh toán', REFUNDED: 'Đã hoàn tiền' };
export const PAYMENT_METHOD_LABELS = { COD: 'Thanh toán khi nhận hàng', VNPAY: 'VNPay', MOMO: 'MoMo' };
export const getOrderItems = (orderId) => DEMO_ORDER_ITEMS.filter((item) => item.order_id === orderId);
export const getOrderHistory = (orderId) => DEMO_ORDER_STATUS_HISTORY.filter((item) => item.order_id === orderId);
export const getVoucherByCode = (code) => DEMO_VOUCHERS.find((voucher) => voucher.code === code) || null;
export const formatOrderDate = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
const ORDER_STORAGE_KEY = 'techmart-demo-order-data';

export const loadDemoOrderData = () => {
  if (typeof window === 'undefined') return { orders: DEMO_ORDERS, items: DEMO_ORDER_ITEMS, history: DEMO_ORDER_STATUS_HISTORY, vouchers: DEMO_VOUCHERS };
  try {
    const saved = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.orders) && Array.isArray(saved.items) && Array.isArray(saved.history) && Array.isArray(saved.vouchers)) return saved;
  } catch { /* Use the schema-aligned fixtures below if local data is invalid. */ }
  return { orders: DEMO_ORDERS, items: DEMO_ORDER_ITEMS, history: DEMO_ORDER_STATUS_HISTORY, vouchers: DEMO_VOUCHERS };
};

export const saveDemoOrderData = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('orders-updated'));
};

export const createDemoOrder = ({ user, cartItems, shippingAddress, paymentMethod, voucherCode, note }) => {
  const data = loadDemoOrderData();
  const now = new Date().toISOString();
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalizedCode = voucherCode?.trim().toUpperCase() || null;
  const voucher = normalizedCode ? data.vouchers.find((item) => item.code === normalizedCode) : null;
  let discountAmount = 0;
  if (voucher && voucher.status === 'ACTIVE' && new Date(voucher.start_date) <= new Date(now) && new Date(voucher.end_date) >= new Date(now) && voucher.used_count < voucher.usage_limit && totalAmount >= voucher.min_order_amount) {
    discountAmount = voucher.discount_type === 'PERCENTAGE' ? totalAmount * voucher.discount_value / 100 : voucher.discount_value;
    if (voucher.max_discount_amount != null) discountAmount = Math.min(discountAmount, voucher.max_discount_amount);
    discountAmount = Math.min(Math.round(discountAmount), totalAmount);
  }
  const orderId = Math.max(0, ...data.orders.map((item) => item.id)) + 1;
  const orderCode = `ORD-${now.slice(0, 10).replaceAll('-', '')}-${String(orderId).padStart(3, '0')}`;
  const order = {
    id: orderId, order_code: orderCode, user_id: Number(user.id),
    customer_name: user.full_name || user.fullName || user.name || '', customer_phone: user.phone || '', customer_email: user.email || null,
    shipping_address: shippingAddress.trim(), branch_id: null, branch_name: null,
    status: 'PENDING', payment_method: paymentMethod, payment_status: 'UNPAID', voucher_code: discountAmount ? normalizedCode : null,
    total_amount: totalAmount, discount_amount: discountAmount, final_amount: Math.max(totalAmount - discountAmount, 0), note: note.trim() || null,
    created_at: now, updated_at: now,
  };
  const newItems = cartItems.map((item, index) => ({
    id: Math.max(0, ...data.items.map((entry) => entry.id)) + index + 1, order_id: orderId,
    product_id: Number(item.id), sku: item.sku, product_name: item.name, product_image: item.image_url || null,
    variant_name: item.color || null, imei: null, unit_price: Number(item.price), quantity: Number(item.quantity), total_price: Number(item.price) * Number(item.quantity),
  }));
  const historyEntry = { id: Math.max(0, ...data.history.map((entry) => entry.id)) + 1, order_id: orderId, previous_status: null, current_status: 'PENDING', action_event: 'CREATE_ORDER', reason: 'Tạo đơn hàng từ giao diện demo', changed_by: 'CUSTOMER', created_at: now };
  const vouchers = data.vouchers.map((item) => item.code === order.voucher_code ? { ...item, used_count: item.used_count + 1 } : item);
  saveDemoOrderData({ orders: [...data.orders, order], items: [...data.items, ...newItems], history: [...data.history, historyEntry], vouchers });
  return order;
};
