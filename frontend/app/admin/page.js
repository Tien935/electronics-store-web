'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hàm tính viết tắt ký tự đại diện cho Avatar (Initials)
  const getInitials = (name) => {
    if (!name) return 'TM';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const badgeColors = [
    'bg-primary text-white',
    'bg-success text-white',
    'bg-warning text-dark',
    'bg-danger text-white',
    'bg-info text-white',
    'bg-dark text-white',
  ];

  // State danh sách sản phẩm & người dùng phục vụ DEMO CRUD (Dùng Avatar Initials chuyên nghiệp)
  const [items, setItems] = useState([
    {
      id: 'SP001',
      name: 'iPhone 16 Pro Max 256GB',
      user: 'Nguyễn Văn An',
      initials: 'NA',
      badgeColor: 'bg-primary text-white',
      email: 'nguyenvanan@techmart.vn',
      country: 'VN',
      branch: 'Hà Nội (Cầu Giấy)',
      usage: 73,
      price: 34990000,
      stock: 10,
      activity: '10 sec ago',
    },
    {
      id: 'SP002',
      name: 'Samsung Galaxy S24 Ultra',
      user: 'Trần Quốc Bảo',
      initials: 'TB',
      badgeColor: 'bg-success text-white',
      email: 'tranbaocp@techmart.vn',
      country: 'VN',
      branch: 'TP.HCM (Quận 1)',
      usage: 45,
      price: 29990000,
      stock: 5,
      activity: '5 minutes ago',
    },
    {
      id: 'SP003',
      name: 'MacBook Air M3 16GB',
      user: 'Lê Hoàng Long',
      initials: 'LL',
      badgeColor: 'bg-warning text-dark',
      email: 'lehoanglong@techmart.vn',
      country: 'VN',
      branch: 'Đà Nẵng (Hải Châu)',
      usage: 90,
      price: 27490000,
      stock: 12,
      activity: '1 hour ago',
    },
    {
      id: 'SP004',
      name: 'iPad Pro M4 11 inch',
      user: 'Phạm Minh Tuấn',
      initials: 'PT',
      badgeColor: 'bg-info text-white',
      email: 'phamminhtuan@techmart.vn',
      country: 'VN',
      branch: 'Hà Nội (Thái Hà)',
      usage: 25,
      price: 28990000,
      stock: 4,
      activity: 'Last month',
    },
  ]);

  // Search keyword state
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal State cho Thêm & Sửa CRUD
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Form State & Validation
  const [validated, setValidated] = useState(false);
  const [alertNotice, setAlertNotice] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    user: '',
    name: '',
    branch: 'Hà Nội (Cầu Giấy)',
    price: '',
    stock: '',
    usage: '70',
  });

  // Auth Guard: Chỉ cho phép người dùng ADMIN
  useEffect(() => {
    const saved = localStorage.getItem('adminUser') || localStorage.getItem('currentUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user.role === 'ADMIN') {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const showAlert = (message, type = 'success') => {
    setAlertNotice({ show: true, message, type });
    setTimeout(() => setAlertNotice({ show: false, message: '', type: 'success' }), 4000);
  };

  // 1. MỞ MODAL THÊM MỚI (CREATE)
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({
      user: '',
      name: '',
      branch: 'Hà Nội (Cầu Giấy)',
      price: '',
      stock: '',
      usage: '75',
    });
    setValidated(false);
    setShowModal(true);
  };

  // 2. MỞ MODAL SỬA (UPDATE)
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentEditId(item.id);
    setFormData({
      user: item.user,
      name: item.name,
      branch: item.branch,
      price: item.price,
      stock: item.stock,
      usage: item.usage || '50',
    });
    setValidated(false);
    setShowModal(true);
  };

  // 3. XỬ LÝ LƯU (SUBMIT FORM CRUD)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (isEditing && currentEditId) {
      // UPDATE
      setItems(
        items.map((it) => {
          if (it.id === currentEditId) {
            return {
              ...it,
              user: formData.user,
              initials: getInitials(formData.user),
              name: formData.name,
              branch: formData.branch,
              price: Number(formData.price),
              stock: Number(formData.stock),
              usage: Number(formData.usage),
            };
          }
          return it;
        })
      );
      showAlert(`Đã cập nhật thành công thiết bị [${formData.name}]!`, 'success');
    } else {
      // CREATE
      const nextId = `SP00${items.length + 1}`;
      const colorIndex = items.length % badgeColors.length;
      const newItem = {
        id: nextId,
        name: formData.name,
        user: formData.user,
        initials: getInitials(formData.user),
        badgeColor: badgeColors[colorIndex],
        email: `${formData.user.toLowerCase().replace(/\s+/g, '')}@techmart.vn`,
        country: 'VN',
        branch: formData.branch,
        usage: Number(formData.usage) || 60,
        price: Number(formData.price),
        stock: Number(formData.stock),
        activity: 'Just now',
      };
      setItems([newItem, ...items]);
      showAlert(`Đã thêm mới thiết bị [${formData.name}] vào hệ thống!`, 'success');
    }

    setShowModal(false);
    setValidated(false);
  };

  // 4. XỬ LÝ XÓA (DELETE)
  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thiết bị "${name}" (Mã: ${id}) khỏi hệ thống chuỗi?`)) {
      setItems(items.filter((it) => it.id !== id));
      showAlert(`Đã xóa thiết bị mã [${id}] thành công!`, 'danger');
    }
  };

  // Lọc dữ liệu theo Search Keyword
  const filteredItems = items.filter(
    (it) =>
      it.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      it.user.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      it.branch.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      it.id.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  // Màn hình loading hoặc 403 Guard
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div className="card shadow border-0 rounded-4 p-4 text-center" style={{ maxWidth: '480px' }}>
          <div className="mb-3 text-danger fs-1">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <h4 className="fw-bold text-danger mb-2">Quyền Truy Cập Bị Từ Chối (403)</h4>
          <p className="text-secondary small mb-4">
            Trang Dashboard Quản Trị Hệ Thống yêu cầu tài khoản với vai trò <strong>ADMIN</strong>. Vui lòng đăng nhập với tài khoản quản trị để tiếp tục.
          </p>
          <div className="d-flex flex-column gap-2">
            <Link href="/login" className="btn btn-danger fw-bold py-2 shadow-sm">
              <i className="bi bi-box-arrow-in-right me-1"></i>Đăng Nhập Tài Khoản Quản Trị
            </Link>
            <Link href="/" className="btn btn-outline-secondary py-2">
              &larr; Quay Lại Cửa Hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#ebedef', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      {/* ================= 1. SIDEBAR (LOGO TECH-MART AI CHUẨN ĐỒ ÁN) ================= */}
      <aside
        className="d-flex flex-column text-white shadow-sm flex-shrink-0"
        style={{
          width: sidebarCollapsed ? '70px' : '256px',
          backgroundColor: '#212631',
          transition: 'width 0.25s ease',
          zIndex: 1040,
        }}
      >
        {/* Brand header với Logo TECH-MART công nghệ sang trọng */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom"
          style={{ borderColor: 'rgba(255,255,255,0.08)', minHeight: '62px' }}
        >
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <span
              className="d-inline-flex align-items-center justify-content-center bg-danger rounded-3 text-white fw-bold shadow-sm"
              style={{ width: '35px', height: '35px', fontSize: '18px', flexShrink: 0 }}
            >
              <i className="bi bi-cpu-fill"></i>
            </span>
            {!sidebarCollapsed && (
              <div className="d-flex flex-column" style={{ lineHeight: '1.15' }}>
                <span className="fw-bold fs-6 tracking-wide d-flex align-items-center gap-1 text-white">
                  TECH-MART <span className="badge bg-danger" style={{ fontSize: '9px', padding: '2px 5px' }}>ADMIN</span>
                </span>
                <span className="text-white-50" style={{ fontSize: '10px' }}>Hệ thống quản lý chuỗi</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn btn-link text-white-50 p-0 text-decoration-none"
            title="Thu nhỏ sidebar"
          >
            <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-6`}></i>
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-grow-1 overflow-auto py-2">
          {/* Dashboard item */}
          <div className="px-2 mb-2">
            <a
              href="#"
              className="nav-link active d-flex align-items-center justify-content-between px-3 py-2 rounded text-white"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-speedometer2 text-info"></i>
                {!sidebarCollapsed && <span className="small fw-semibold">Dashboard</span>}
              </div>
              {!sidebarCollapsed && <span className="badge bg-info" style={{ fontSize: '9px' }}>NEW</span>}
            </a>
          </div>

          {/* Group: COMPONENTS */}
          {!sidebarCollapsed && (
            <div className="px-3 pt-2 pb-1 text-uppercase text-white-50 small fw-bold" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
              Components
            </div>
          )}
          <ul className="nav flex-column px-2 mb-2">
            <li className="nav-item">
              <a href="#crudTable" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white">
                <i className="bi bi-phone"></i>
                {!sidebarCollapsed && <span>Sản phẩm & Kho</span>}
              </a>
            </li>
            <li className="nav-item">
              <button
                onClick={handleOpenAdd}
                className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white w-100 text-start border-0 bg-transparent"
              >
                <i className="bi bi-plus-circle text-success"></i>
                {!sidebarCollapsed && <span className="text-white fw-semibold">Thêm thiết bị mới</span>}
              </button>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white">
                <i className="bi bi-receipt"></i>
                {!sidebarCollapsed && <span>Đơn hàng chuỗi</span>}
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white">
                <i className="bi bi-people"></i>
                {!sidebarCollapsed && <span>Khách hàng</span>}
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white">
                <i className="bi bi-bell"></i>
                {!sidebarCollapsed && <span>Thông báo</span>}
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center justify-content-between small hover-white">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-calculator"></i>
                  {!sidebarCollapsed && <span>Widgets</span>}
                </div>
                {!sidebarCollapsed && <span className="badge bg-info" style={{ fontSize: '9px' }}>NEW</span>}
              </a>
            </li>
          </ul>

          {/* Group: PLUGINS */}
          {!sidebarCollapsed && (
            <div className="px-3 pt-2 pb-1 text-uppercase text-white-50 small fw-bold" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
              Plugins
            </div>
          )}
          <ul className="nav flex-column px-2 mb-2">
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center justify-content-between small hover-white">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-calendar3"></i>
                  {!sidebarCollapsed && <span>Calendar</span>}
                </div>
                {!sidebarCollapsed && <span className="badge bg-danger" style={{ fontSize: '9px' }}>PRO</span>}
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center justify-content-between small hover-white">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-pie-chart"></i>
                  {!sidebarCollapsed && <span>Charts AI</span>}
                </div>
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center justify-content-between small hover-white">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-table"></i>
                  {!sidebarCollapsed && <span>DataTables</span>}
                </div>
                {!sidebarCollapsed && <span className="badge bg-danger" style={{ fontSize: '9px' }}>PRO</span>}
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center justify-content-between small hover-white">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt"></i>
                  {!sidebarCollapsed && <span>150 Chi nhánh</span>}
                </div>
                {!sidebarCollapsed && <span className="badge bg-danger" style={{ fontSize: '9px' }}>PRO</span>}
              </a>
            </li>
          </ul>

          {/* Group: EXTRAS */}
          {!sidebarCollapsed && (
            <div className="px-3 pt-2 pb-1 text-uppercase text-white-50 small fw-bold" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>
              Extras
            </div>
          )}
          <ul className="nav flex-column px-2 mb-2">
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white">
                <i className="bi bi-file-earmark-text"></i>
                {!sidebarCollapsed && <span>Pages</span>}
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-white-50 px-3 py-2 d-flex align-items-center gap-2 small hover-white">
                <i className="bi bi-diagram-3"></i>
                {!sidebarCollapsed && <span>Microservices</span>}
              </a>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-top d-flex align-items-center justify-content-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {!sidebarCollapsed ? (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>
                <i className="bi bi-exclamation-circle me-1"></i>1 Issue ×
              </span>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="btn btn-link text-danger p-0 text-decoration-none"
            title="Đăng xuất"
          >
            <i className="bi bi-box-arrow-right fs-5"></i>
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT WRAPPER ================= */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="bg-white border-bottom sticky-top shadow-sm px-4 py-2 d-flex align-items-center justify-content-between" style={{ minHeight: '62px' }}>
          {/* Search bar */}
          <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 ps-0"
              placeholder="Search..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Right actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Link sang trang bán hàng */}
            <Link href="/" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-shop me-1"></i>Xem Cửa Hàng
            </Link>

            {/* Notification icons */}
            <div className="d-flex align-items-center gap-3 text-secondary border-start ps-3">
              <button className="btn btn-link text-secondary p-0 position-relative text-decoration-none">
                <i className="bi bi-bell fs-5"></i>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
              </button>
              <button className="btn btn-link text-secondary p-0 text-decoration-none">
                <i className="bi bi-list-check fs-5"></i>
              </button>
              <button className="btn btn-link text-secondary p-0 text-decoration-none">
                <i className="bi bi-envelope fs-5"></i>
              </button>
            </div>

            {/* User Profile với Avatar Icon Chuyên Nghiệp */}
            <div className="d-flex align-items-center gap-2 border-start ps-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger text-white fw-bold shadow-sm"
                style={{ width: '36px', height: '36px', fontSize: '16px', flexShrink: 0 }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
              <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
                <span className="fw-bold small text-dark d-block">Quản Trị Viên</span>
                <span className="text-success small" style={{ fontSize: '11px' }}>
                  <span className="d-inline-block rounded-circle bg-success me-1" style={{ width: '7px', height: '7px' }}></span>
                  Online
                </span>
              </div>
              <button className="btn btn-link text-secondary p-0 ms-1 text-decoration-none">
                <i className="bi bi-grid-3x3-gap-fill fs-5"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Toast / Notification Banner */}
        {alertNotice.show && (
          <div className="px-4 pt-3">
            <div className={`alert alert-${alertNotice.type} alert-dismissible fade show shadow-sm mb-0 py-2 small`} role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>{alertNotice.message}</strong>
              <button
                type="button"
                className="btn-close py-2"
                onClick={() => setAlertNotice({ show: false, message: '', type: 'success' })}
              ></button>
            </div>
          </div>
        )}

        {/* Main scrollable body */}
        <main className="flex-grow-1 overflow-auto p-4">
          {/* Breadcrumb & Title */}
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-0">Dashboard</h3>
            <span className="text-muted small">Home / Dashboard</span>
          </div>

          {/* ================= 3. TOP ROW: SALE & TRAFFIC CHARTS ================= */}
          <div className="row g-4 mb-4">
            {/* Card 1: Sale Wave Chart */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold text-dark mb-0">Sale</h5>
                        <small className="text-muted">January - July 2026</small>
                      </div>
                      <h3 className="fw-bold text-primary mb-0">$613.200</h3>
                    </div>

                    {/* Smooth Wave SVG Chart */}
                    <div className="my-3" style={{ height: '140px', width: '100%' }}>
                      <svg viewBox="0 0 500 140" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <defs>
                          <linearGradient id="saleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#321fdb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#321fdb" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,70 C100,70 150,95 200,85 C250,75 280,110 350,75 C420,40 460,70 500,60 L500,140 L0,140 Z"
                          fill="url(#saleGradient)"
                        />
                        <path
                          d="M0,70 C100,70 150,95 200,85 C250,75 280,110 350,75 C420,40 460,70 500,60"
                          fill="none"
                          stroke="#321fdb"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Stat Counters below chart */}
                  <div className="row g-3 pt-3 border-top">
                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <span className="text-muted small d-block">Customers</span>
                          <span className="fw-bold fs-5 text-dark">44.725</span>
                          <span className="text-danger small ms-1" style={{ fontSize: '11px' }}>(-12.4% ↓)</span>
                        </div>
                        <div className="bg-primary-subtle p-2 rounded text-primary">
                          <i className="bi bi-people-fill fs-5"></i>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <span className="text-muted small d-block">Orders</span>
                          <span className="fw-bold fs-5 text-dark">385</span>
                          <span className="text-success small ms-1" style={{ fontSize: '11px' }}>(17.2% ↑)</span>
                        </div>
                        <div className="bg-info-subtle p-2 rounded text-info">
                          <i className="bi bi-cart-fill fs-5"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Traffic Bar Chart */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div className="mb-2">
                    <h5 className="fw-bold text-dark mb-0">Traffic</h5>
                    <small className="text-muted">January 01, 2026 - December 31, 2026</small>
                  </div>

                  {/* 12 Months Bar Chart */}
                  <div className="d-flex align-items-end justify-content-between gap-1 my-3" style={{ height: '140px' }}>
                    {[
                      { m: 'Jan', h: 65 },
                      { m: 'Feb', h: 68 },
                      { m: 'Mar', h: 67 },
                      { m: 'Apr', h: 35 },
                      { m: 'May', h: 32 },
                      { m: 'Jun', h: 18 },
                      { m: 'Jul', h: 42 },
                      { m: 'Aug', h: 70 },
                      { m: 'Sep', h: 50 },
                      { m: 'Oct', h: 22 },
                      { m: 'Nov', h: 12 },
                      { m: 'Dec', h: 95 },
                    ].map((b, idx) => (
                      <div key={idx} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
                        <div className="w-100 d-flex align-items-end flex-grow-1">
                          <div
                            className="w-100 rounded-top"
                            style={{
                              height: `${b.h}%`,
                              backgroundColor: '#321fdb',
                              transition: 'height 0.4s ease',
                            }}
                          ></div>
                        </div>
                        <span className="text-muted mt-2" style={{ fontSize: '9px' }}>{b.m}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center small text-muted">
                    <span><i className="bi bi-circle-fill text-primary me-1" style={{ fontSize: '8px' }}></i>Tổng lượt truy cập</span>
                    <span className="fw-semibold text-dark">297.324 Users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 4. BOTTOM ROW: CRUD TABLE & COLORFUL CARDS ================= */}
          <div className="row g-4">
            {/* Table Users & Thiết Bị Chuỗi (CÓ ĐẦY ĐỦ CRUD) */}
            <div className="col-12 col-xl-8" id="crudTable">
              <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Users & Thiết Bị Chuỗi</h5>
                    <small className="text-muted">1,232,150 registered users - Quản lý chuỗi chi nhánh</small>
                  </div>
                  <button
                    onClick={handleOpenAdd}
                    className="btn btn-outline-dark btn-sm rounded-2 px-3 fw-semibold shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-lg text-primary"></i>
                    <span>+ Add new user / Thiết bị</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-uppercase small text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                      <tr>
                        <th className="ps-4">Quản lý & Thiết Bị</th>
                        <th>Country</th>
                        <th>Usage / Tồn Kho</th>
                        <th>Activity</th>
                        <th className="text-center pe-4" style={{ width: '140px' }}>Thao tác (CRUD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            <i className="bi bi-inbox fs-3 d-block mb-1"></i>
                            Không tìm thấy thiết bị phù hợp với từ khóa!
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr key={item.id}>
                            {/* Cột 1: User & Thiết Bị với Avatar Initials chuyên nghiệp */}
                            <td className="ps-4">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm ${item.badgeColor || 'bg-primary text-white'}`}
                                  style={{ width: '40px', height: '40px', fontSize: '14px', flexShrink: 0 }}
                                >
                                  {item.initials || getInitials(item.user)}
                                </div>
                                <div>
                                  <div className="fw-bold text-dark small">{item.user}</div>
                                  <div className="small text-primary fw-semibold">
                                    {item.name} · {Number(item.price).toLocaleString('vi-VN')}₫
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Cột 2: Country & Chi nhánh */}
                            <td>
                              <div className="fw-bold small text-dark">{item.country}</div>
                              <div className="text-muted small" style={{ fontSize: '11px' }}>{item.branch}</div>
                            </td>

                            {/* Cột 3: Usage / Tồn Kho */}
                            <td>
                              <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '11px' }}>
                                <span className="fw-bold text-dark">{item.usage}%</span>
                                <span className="text-muted">Kho: {item.stock} máy</span>
                              </div>
                              <div className="progress" style={{ height: '4px' }}>
                                <div
                                  className={`progress-bar ${
                                    item.usage > 70 ? 'bg-success' : item.usage > 40 ? 'bg-info' : 'bg-warning'
                                  }`}
                                  style={{ width: `${item.usage}%` }}
                                ></div>
                              </div>
                            </td>

                            {/* Cột 4: Activity */}
                            <td>
                              <div className="text-muted small" style={{ fontSize: '11px' }}>Last login</div>
                              <div className="small text-dark fw-semibold">{item.activity}</div>
                            </td>

                            {/* Cột 5: THAO TÁC CRUD (SỬA & XÓA) */}
                            <td className="text-center pe-4">
                              <div className="btn-group btn-group-sm">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="btn btn-outline-primary"
                                  title="Chỉnh sửa thiết bị"
                                >
                                  <i className="bi bi-pencil me-1"></i>Sửa
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.name)}
                                  className="btn btn-outline-danger"
                                  title="Xóa khỏi hệ thống"
                                >
                                  <i className="bi bi-trash me-1"></i>Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center small text-muted">
                  <span>Hiển thị <strong>{filteredItems.length}</strong> thiết bị trong cơ sở dữ liệu</span>
                  <span className="text-success fw-semibold">
                    <i className="bi bi-check-all me-1"></i>Microservices Live Demo Sẵn Sàng
                  </span>
                </div>
              </div>
            </div>

            {/* Cột phải: 2 Colorful Cards (26K Users & 2.49% Conversion) */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">
              {/* Blue Card: 26K Users */}
              <div className="card border-0 shadow-sm rounded-3 text-white position-relative overflow-hidden" style={{ backgroundColor: '#321fdb' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h3 className="fw-bold mb-1">
                        26K <span className="small opacity-75 fw-normal" style={{ fontSize: '13px' }}>(-12.4% ↓)</span>
                      </h3>
                      <span className="small opacity-75">Users</span>
                    </div>
                    <button className="btn btn-link text-white-50 p-0 text-decoration-none">
                      <i className="bi bi-three-dots-vertical fs-5"></i>
                    </button>
                  </div>

                  {/* Sparkline Wave */}
                  <div style={{ height: '70px', width: '100%' }}>
                    <svg viewBox="0 0 200 70" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M0,50 Q40,65 70,40 T140,25 T200,45"
                        fill="none"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Yellow Card: 2.49% Conversion Rate */}
              <div className="card border-0 shadow-sm rounded-3 text-white position-relative overflow-hidden" style={{ backgroundColor: '#f9b115' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h3 className="fw-bold mb-1">
                        2.49% <span className="small opacity-75 fw-normal" style={{ fontSize: '13px' }}>(84.7% ↑)</span>
                      </h3>
                      <span className="small opacity-75">Conversion Rate</span>
                    </div>
                    <button className="btn btn-link text-white-50 p-0 text-decoration-none">
                      <i className="bi bi-three-dots-vertical fs-5"></i>
                    </button>
                  </div>

                  {/* Sparkline Bars */}
                  <div className="d-flex align-items-end justify-content-between gap-1 mt-4" style={{ height: '50px' }}>
                    {[40, 60, 50, 75, 90, 65, 80, 55, 95, 70, 85].map((val, idx) => (
                      <div
                        key={idx}
                        className="rounded-top flex-grow-1"
                        style={{
                          height: `${val}%`,
                          backgroundColor: 'rgba(255,255,255,0.6)',
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= 5. MODAL THÊM / SỬA THIẾT BỊ (CRUD MODAL) ================= */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-light py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                  <i className={`bi ${isEditing ? 'bi-pencil-square text-primary' : 'bi-plus-circle-fill text-success'} me-2`}></i>
                  {isEditing ? `Chỉnh Sửa Thiết Bị [${currentEditId}]` : 'Thêm Mới Thiết Bị / User'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmitForm}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Tên người quản lý / Phụ trách <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Nguyễn Văn An"
                      required
                      value={formData.user}
                      onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                    />
                    <div className="invalid-feedback">Vui lòng nhập tên người dùng.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Tên thiết bị điện tử <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Xiaomi 14 Ultra 512GB"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="invalid-feedback">Vui lòng nhập tên thiết bị.</div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">
                        Đơn giá niêm yết (VNĐ) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1000"
                        placeholder="24990000"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                      <div className="invalid-feedback">Đơn giá tối thiểu 1.000₫.</div>
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">
                        Số lượng tồn kho <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        placeholder="10"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                      <div className="invalid-feedback">Tối thiểu 1 máy.</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Chi nhánh phân phối <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    >
                      <option value="Hà Nội (Cầu Giấy)">Hà Nội (Cầu Giấy)</option>
                      <option value="TP.HCM (Quận 1)">TP.HCM (Quận 1)</option>
                      <option value="Đà Nẵng (Hải Châu)">Đà Nẵng (Hải Châu)</option>
                      <option value="Hà Nội (Thái Hà)">Hà Nội (Thái Hà)</option>
                      <option value="Cần Thơ (Ninh Kiều)">Cần Thơ (Ninh Kiều)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small d-flex justify-content-between">
                      <span>Mức độ đáp ứng / Usage</span>
                      <span className="text-primary fw-bold">{formData.usage}%</span>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="10"
                      max="100"
                      value={formData.usage}
                      onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">
                    <i className="bi bi-check-lg me-1"></i>
                    {isEditing ? 'Cập Nhật Thiết Bị' : 'Lưu Thiết Bị'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
