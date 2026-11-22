'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dữ liệu mẫu sản phẩm thiết bị điện tử chuẩn chuỗi bán lẻ
  const initialProducts = [
    {
      id: 'SP001',
      name: 'iPhone 16 Pro Max 256GB',
      category: 'Điện thoại',
      branch: 'Hà Nội (Cầu Giấy)',
      price: 34990000,
      stock: 18,
      sales: 432,
      description: 'Chip Apple A18 Pro, Apple Intelligence, khung Titan sa mạc cao cấp.',
    },
    {
      id: 'SP002',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      category: 'Điện thoại',
      branch: 'TP.HCM (Quận 1)',
      price: 29990000,
      stock: 5,
      sales: 318,
      description: 'Snapdragon 8 Gen 3 for Galaxy, Galaxy AI dịch thuật 2 chiều, bút S-Pen.',
    },
    {
      id: 'SP003',
      name: 'MacBook Air M3 15 inch 16GB/512GB',
      category: 'Laptop',
      branch: 'Đà Nẵng (Hải Châu)',
      price: 32490000,
      stock: 12,
      sales: 145,
      description: 'Apple Silicon M3 8-core CPU / 10-core GPU, màn hình Liquid Retina sắc nét.',
    },
    {
      id: 'SP004',
      name: 'iPad Pro M4 11 inch Wi-Fi 256GB',
      category: 'Tablet',
      branch: 'Hà Nội (Thái Hà)',
      price: 28990000,
      stock: 3,
      sales: 86,
      description: 'Màn hình Ultra Retina XDR Tandem OLED đột phá, siêu mỏng 5.3mm.',
    },
    {
      id: 'SP005',
      name: 'Tai nghe AirPods Pro 2 USB-C',
      category: 'Phụ kiện',
      branch: 'TP.HCM (Quận 1)',
      price: 5790000,
      stock: 45,
      sales: 620,
      description: 'Chip H2, chống ồn chủ động ANC gấp 2 lần, cổng sạc Type-C tiện lợi.',
    },
    {
      id: 'SP006',
      name: 'Laptop Gaming ASUS ROG Zephyrus G16',
      category: 'Laptop',
      branch: 'Hà Nội (Cầu Giấy)',
      price: 52990000,
      stock: 6,
      sales: 54,
      description: 'Intel Core Ultra 9, RTX 4070, màn hình OLED 2.5K 240Hz siêu mượt.',
    },
    {
      id: 'SP007',
      name: 'Đồng hồ Apple Watch Series 10 46mm',
      category: 'Phụ kiện',
      branch: 'Đà Nẵng (Hải Châu)',
      price: 11490000,
      stock: 14,
      sales: 198,
      description: 'Màn hình OLED góc rộng sáng hơn 40%, phát hiện ngưng thở khi ngủ bằng AI.',
    },
    {
      id: 'SP008',
      name: 'Xiaomi 14 Ultra 5G 512GB Leica',
      category: 'Điện thoại',
      branch: 'Cần Thơ (Ninh Kiều)',
      price: 26990000,
      stock: 2,
      sales: 72,
      description: 'Ống kính quang học Leica Vario-Summilux, cảm biến 1 inch đỉnh cao.',
    },
  ];

  // State danh sách sản phẩm phục vụ DEMO CRUD
  const [products, setProducts] = useState(initialProducts);

  // Search & Filter State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  // Modal State cho Thêm & Sửa CRUD
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Form State & Validation
  const [validated, setValidated] = useState(false);
  const [alertNotice, setAlertNotice] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    category: 'Điện thoại',
    branch: 'Hà Nội (Cầu Giấy)',
    price: '',
    stock: '',
    description: '',
  });

  // Auth Guard: Kiểm tra phiên đăng nhập ADMIN
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        if (Array.isArray(user.roles) && user.roles.includes('ADMIN')) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Không thể đọc thông tin người dùng:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    router.replace('/login');
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
      name: '',
      category: 'Điện thoại',
      branch: 'Hà Nội (Cầu Giấy)',
      price: '',
      stock: '',
      description: '',
    });
    setValidated(false);
    setShowModal(true);
  };

  // 2. MỞ MODAL SỬA (UPDATE)
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentEditId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      branch: item.branch,
      price: item.price,
      stock: item.stock,
      description: item.description || '',
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

    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);

    if (isEditing && currentEditId) {
      // UPDATE
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === currentEditId) {
            return {
              ...p,
              name: formData.name,
              category: formData.category,
              branch: formData.branch,
              price: priceNum,
              stock: stockNum,
              description: formData.description,
            };
          }
          return p;
        })
      );
      showAlert(`Đã cập nhật thành công thiết bị [${formData.name}]!`, 'success');
    } else {
      // CREATE
      const nextId = `SP00${products.length + 1}`;
      const newProduct = {
        id: nextId,
        name: formData.name,
        category: formData.category,
        branch: formData.branch,
        price: priceNum,
        stock: stockNum,
        sales: 0,
        description: formData.description,
      };
      setProducts([newProduct, ...products]);
      showAlert(`Đã thêm mới thiết bị [${formData.name}] vào hệ thống kho!`, 'success');
    }

    setShowModal(false);
    setValidated(false);
  };

  // 4. XỬ LÝ XÓA (DELETE)
  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thiết bị "${name}" (Mã: ${id}) khỏi hệ thống chuỗi?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showAlert(`Đã xóa thiết bị mã [${id}] khỏi danh sách thành công!`, 'danger');
    }
  };

  // 5. KHÔI PHỤC DỮ LIỆU GỐC
  const handleResetData = () => {
    if (window.confirm('Khôi phục toàn bộ danh sách sản phẩm mẫu ban đầu?')) {
      setProducts(initialProducts);
      showAlert('Đã khôi phục dữ liệu ban đầu thành công!', 'info');
    }
  };

  // 6. XUẤT BÁO CÁO CSV (DEMO BÁO CÁO BTL)
  const handleExportCSV = () => {
    const headers = 'Mã SP,Tên thiết bị,Ngành hàng,Chi nhánh,Đơn giá (VNĐ),Tồn kho,Số lượng đã bán\n';
    const rows = products
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.category}","${p.branch}",${p.price},${p.stock},${p.sales}`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BaoCao_ThietBi_TechMart_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('Đã xuất báo cáo danh sách thiết bị thành công (file CSV)!', 'success');
  };

  // Tính toán KPI tự động từ danh sách
  const totalStock = useMemo(() => products.reduce((acc, cur) => acc + cur.stock, 0), [products]);
  const lowStockCount = useMemo(() => products.filter((p) => p.stock <= 5).length, [products]);
  const totalInventoryValue = useMemo(
    () => products.reduce((acc, cur) => acc + cur.price * cur.stock, 0),
    [products]
  );

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.branch.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchBranch = branchFilter === 'ALL' || p.branch.includes(branchFilter);
      return matchSearch && matchCat && matchBranch;
    });

    if (sortBy === 'PRICE_ASC') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'PRICE_DESC') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'STOCK_ASC') result.sort((a, b) => a.stock - b.stock);
    if (sortBy === 'STOCK_DESC') result.sort((a, b) => b.stock - a.stock);

    return result;
  }, [products, searchKeyword, categoryFilter, branchFilter, sortBy]);

  // Route Guard kiểm tra quyền truy cập 403
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải CoolAdmin...</span>
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
            <Link href="/login" className="btn btn-primary fw-bold py-2 shadow-sm">
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
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f4f6f9', fontFamily: 'system-ui, -apple-system, Roboto, sans-serif' }}>
      {/* ================= 1. COOLADMIN SIDEBAR ================= */}
      <aside
        className="d-flex flex-column flex-shrink-0 bg-white border-end shadow-sm"
        style={{
          width: sidebarOpen ? '255px' : '75px',
          transition: 'width 0.25s ease',
          zIndex: 1040,
        }}
      >
        {/* Brand Logo CoolAdmin */}
        <div
          className="d-flex align-items-center justify-content-between px-3 border-bottom"
          style={{ height: '70px' }}
        >
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 bg-danger text-white fw-bold shadow-sm"
              style={{ width: '38px', height: '38px', fontSize: '18px', flexShrink: 0 }}
            >
              <i className="bi bi-cpu-fill"></i>
            </span>
            {sidebarOpen && (
              <div className="d-flex flex-column" style={{ lineHeight: '1.2' }}>
                <span className="fw-bold fs-6 text-dark tracking-wide">
                  TECH<span className="text-danger">ADMIN</span>
                </span>
                <span className="text-muted" style={{ fontSize: '10.5px' }}>Quản lý chuỗi bán lẻ</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-link text-muted p-0 text-decoration-none"
            title="Thu nhỏ/Mở rộng sidebar"
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'} fs-6`}></i>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-grow-1 overflow-auto py-3">
          <ul className="nav flex-column px-2 gap-1">
            <li className="nav-item">
              <a
                href="#"
                className="nav-link active rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-3 text-primary"
                style={{ backgroundColor: '#eef2ff' }}
              >
                <i className="bi bi-speedometer2 fs-5"></i>
                {sidebarOpen && <span>Tổng Quan (Dashboard)</span>}
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#crudTable"
                className="nav-link rounded-3 px-3 py-2 text-secondary d-flex align-items-center gap-3 hover-primary"
              >
                <i className="bi bi-phone fs-5"></i>
                {sidebarOpen && <span>Quản Lý Thiết Bị & Kho</span>}
              </a>
            </li>

            <li className="nav-item">
              <button
                onClick={handleOpenAdd}
                className="nav-link rounded-3 px-3 py-2 text-secondary d-flex align-items-center gap-3 w-100 text-start border-0 bg-transparent hover-primary"
              >
                <i className="bi bi-plus-circle fs-5 text-success"></i>
                {sidebarOpen && <span className="text-dark fw-semibold">Thêm Thiết Bị Mới</span>}
              </button>
            </li>

            <li className="nav-item">
              <a
                href="#activitySection"
                className="nav-link rounded-3 px-3 py-2 text-secondary d-flex align-items-center gap-3 hover-primary"
              >
                <i className="bi bi-clock-history fs-5"></i>
                {sidebarOpen && <span>Hoạt Động Chi Nhánh</span>}
              </a>
            </li>



            <li className="nav-item">
              <a
                href="#"
                className="nav-link rounded-3 px-3 py-2 text-secondary d-flex align-items-center gap-3 hover-primary"
              >
                <i className="bi bi-cart-check fs-5"></i>
                {sidebarOpen && <span>Đơn Hàng Chuỗi</span>}
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#"
                className="nav-link rounded-3 px-3 py-2 text-secondary d-flex align-items-center gap-3 hover-primary"
              >
                <i className="bi bi-geo-alt fs-5"></i>
                {sidebarOpen && <span>150 Chi Nhánh</span>}
              </a>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-top d-flex align-items-center justify-content-between">
          {sidebarOpen && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                ● Hệ Thống Online
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline-danger border-0"
            title="Đăng xuất khỏi hệ thống"
          >
            <i className="bi bi-power fs-5"></i>
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN CONTENT WRAPPER ================= */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        {/* CoolAdmin Desktop Header */}
        <header
          className="bg-white border-bottom sticky-top shadow-sm px-4 d-flex align-items-center justify-content-between"
          style={{ height: '70px' }}
        >
          {/* Search box with shortcut badge */}
          <div className="input-group input-group-sm" style={{ maxWidth: '360px' }}>
            <span className="input-group-text bg-light border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 border-end-0 ps-0"
              placeholder="Tìm kiếm thiết bị, mã sản phẩm, chi nhánh..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <span className="input-group-text bg-light border-start-0">
              <kbd className="bg-white text-muted border px-1" style={{ fontSize: '10px' }}>⌘K</kbd>
            </span>
          </div>

          {/* Right Action Widgets */}
          <div className="d-flex align-items-center gap-3">
            {/* Link xem Storefront */}
            <Link href="/" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold">
              <i className="bi bi-shop me-1"></i>Xem Cửa Hàng
            </Link>

            {/* Notification icons */}
            <div className="d-flex align-items-center gap-3 text-secondary border-start ps-3">
              <button className="btn btn-link text-secondary p-0 position-relative text-decoration-none" title="Tin nhắn">
                <i className="bi bi-chat-dots fs-5"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px' }}>
                  2
                </span>
              </button>
              <button className="btn btn-link text-secondary p-0 position-relative text-decoration-none" title="Hộp thư">
                <i className="bi bi-envelope fs-5"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '9px' }}>
                  3
                </span>
              </button>
              <button className="btn btn-link text-secondary p-0 position-relative text-decoration-none" title="Cảnh báo hệ thống">
                <i className="bi bi-bell fs-5"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: '9px' }}>
                  {lowStockCount}
                </span>
              </button>
            </div>

            {/* User Profile */}
            <div className="d-flex align-items-center gap-2 border-start ps-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold shadow-sm"
                style={{ width: '38px', height: '38px', fontSize: '14px', flexShrink: 0 }}
              >
                AD
              </div>
              <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
                <span className="fw-bold small text-dark d-block">Admin</span>
                <span className="text-muted" style={{ fontSize: '11px' }}>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Toast Notification Alert */}
        {alertNotice.show && (
          <div className="px-4 pt-3">
            <div className={`alert alert-${alertNotice.type} alert-dismissible fade show shadow-sm mb-0 py-2 small`} role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>{alertNotice.message}</strong>
              <button
                type="button"
                className="btn-close py-2"
                onClick={() => setAlertNotice({ show: false, message: '', type: 'success' })}
              ></button>
            </div>
          </div>
        )}

        {/* Main Dashboard Scrollable Area */}
        <main className="flex-grow-1 overflow-auto p-4">
          {/* CoolAdmin Page Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">Dashboard Quản Trị</h3>
              <p className="text-muted small mb-0">
                Hệ thống quản lý chuỗi bán lẻ thiết bị di động TECH-MART tích hợp kiến trúc Microservices Spring Boot & Next.js.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="btn btn-white btn-sm bg-white border text-secondary shadow-sm rounded-2 px-3 fw-semibold"
                title="Xuất dữ liệu bảng ra file CSV"
              >
                <i className="bi bi-download me-1 text-primary"></i>Xuất Excel / CSV
              </button>
              <button
                onClick={handleResetData}
                className="btn btn-white btn-sm bg-white border text-secondary shadow-sm rounded-2 px-3"
                title="Khôi phục dữ liệu ban đầu"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>Làm mới mẫu
              </button>
              <button
                onClick={handleOpenAdd}
                className="btn btn-primary btn-sm rounded-2 px-3 fw-semibold shadow-sm d-flex align-items-center gap-1"
              >
                <i className="bi bi-plus-lg"></i>
                <span>+ Thêm thiết bị mới</span>
              </button>
            </div>
          </div>

          {/* ================= 3. KPI CARDS STRIP ================= */}
          <div className="row g-3 mb-4">
            {/* Card 1: Tổng Doanh Thu Tồn Kho */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Giá Trị Tồn Kho Chuỗi</span>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                    style={{ width: '40px', height: '40px', backgroundColor: '#eef2ff' }}
                  >
                    <i className="bi bi-currency-dollar fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">
                  {(totalInventoryValue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr ₫
                </h4>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-success fw-semibold">
                    <i className="bi bi-arrow-up-short"></i>+14.8%
                  </span>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Tổng: {totalStock} máy sẵn sàng</span>
                </div>
              </div>
            </div>

            {/* Card 2: Đơn Hàng Hôm Nay */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Đơn Hàng Hôm Nay</span>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-success"
                    style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5' }}
                  >
                    <i className="bi bi-bag-check fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">1.284 Đơn</h4>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-success fw-semibold">
                    <i className="bi bi-arrow-up-short"></i>+8.2%
                  </span>
                  <span className="text-muted" style={{ fontSize: '11px' }}>1.210 đơn thành công</span>
                </div>
              </div>
            </div>

            {/* Card 3: Tương Tác AI */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Tương Tác Trợ Lý AI</span>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-info"
                    style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe' }}
                  >
                    <i className="bi bi-robot fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">8.492 Lượt</h4>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-success fw-semibold">
                    <i className="bi bi-arrow-up-short"></i>+15.8%
                  </span>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Tỉ lệ chốt đơn: 34%</span>
                </div>
              </div>
            </div>

            {/* Card 4: Cảnh Báo Tồn Kho */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small fw-semibold text-uppercase">Cảnh Báo Tồn Kho</span>
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center text-warning"
                    style={{ width: '40px', height: '40px', backgroundColor: '#fffbeb' }}
                  >
                    <i className="bi bi-exclamation-triangle fs-5"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-dark mb-1">{lowStockCount} Thiết bị</h4>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-danger fw-semibold">
                    <i className="bi bi-box-seam me-1"></i>Tồn kho &le; 5 máy
                  </span>
                  <span className="text-muted" style={{ fontSize: '11px' }}>Cần luân chuyển hàng</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 4. REVENUE TREND CHART & RECENT ACTIVITY ================= */}
          <div className="row g-3 mb-4" id="activitySection">
            {/* Revenue Trend SVG Chart */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-3 bg-white h-100">
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Xu Hướng Doanh Thu Bán Lẻ (Revenue Trend)</h5>
                    <small className="text-muted">Doanh thu thiết bị di động, laptop & máy tính bảng 30 ngày qua</small>
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                    Tháng 11 / 2026
                  </span>
                </div>
                <div className="card-body p-4">
                  {/* SVG Line Wave Chart */}
                  <div style={{ height: '190px', width: '100%' }}>
                    <svg viewBox="0 0 600 190" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <linearGradient id="coolGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#4272d7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#4272d7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,120 C80,110 140,60 200,80 C260,100 320,35 380,55 C440,75 500,20 600,40 L600,190 L0,190 Z"
                        fill="url(#coolGradient)"
                      />
                      <path
                        d="M0,120 C80,110 140,60 200,80 C260,100 320,35 380,55 C440,75 500,20 600,40"
                        fill="none"
                        stroke="#4272d7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-2 pt-2 border-top">
                    <span>Tuần 1: 85.000.000₫</span>
                    <span>Tuần 2: 112.500.000₫</span>
                    <span>Tuần 3: 104.000.000₫</span>
                    <span className="text-primary fw-bold">Tuần 4: 127.000.000₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 bg-white h-100">
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-dark mb-0">Hoạt Động Chi Nhánh</h5>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">Real-time</span>
                </div>
                <div className="card-body p-3">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex gap-2">
                      <span className="badge bg-success rounded-circle p-2" style={{ height: 'fit-content' }}>
                        <i className="bi bi-check2"></i>
                      </span>
                      <div>
                        <div className="small fw-semibold text-dark">Chi nhánh Cầu Giấy xuất 3 iPhone 16 Pro Max</div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>10 phút trước · Đơn hàng #4287</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <span className="badge bg-primary rounded-circle p-2" style={{ height: 'fit-content' }}>
                        <i className="bi bi-box-arrow-in-down"></i>
                      </span>
                      <div>
                        <div className="small fw-semibold text-dark">Nhập kho 15 máy Samsung Galaxy S24 Ultra</div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>35 phút trước · Chi nhánh Quận 1</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <span className="badge bg-info rounded-circle p-2" style={{ height: 'fit-content' }}>
                        <i className="bi bi-robot"></i>
                      </span>
                      <div>
                        <div className="small fw-semibold text-dark">Khách hàng hỏi tư vấn MacBook qua AI</div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>1 giờ trước · Đã thêm vào giỏ hàng</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <span className="badge bg-warning text-dark rounded-circle p-2" style={{ height: 'fit-content' }}>
                        <i className="bi bi-exclamation"></i>
                      </span>
                      <div>
                        <div className="small fw-semibold text-dark">iPad Pro M4 sắp hết hàng tại Thái Hà</div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>2 giờ trước · Còn 3 máy trong kho</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 5. COOLADMIN DATA TABLE (CRUD) ================= */}
          <div className="card border-0 shadow-sm rounded-3 bg-white mb-4" id="crudTable">
            <div className="card-header bg-white py-3 border-bottom">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-table text-primary me-2"></i>
                    Bảng Quản Lý Thiết Bị Di Động & Tồn Kho Chi Nhánh
                  </h5>
                  <small className="text-muted">Quản lý trực tiếp dữ liệu thiết bị phục vụ Live Demo CRUD</small>
                </div>

                {/* Filter and Search Bar */}
                <div className="d-flex flex-wrap align-items-center gap-2">
                  {/* Category Filter */}
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '135px' }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">Tất cả ngành</option>
                    <option value="Điện thoại">Điện thoại</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>

                  {/* Branch Filter */}
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '135px' }}
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                  >
                    <option value="ALL">Tất cả chi nhánh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP.HCM">TP.HCM</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>

                  {/* Sort By */}
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '140px' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="DEFAULT">Sắp xếp: Mặc định</option>
                    <option value="PRICE_DESC">Giá cao &rarr; thấp</option>
                    <option value="PRICE_ASC">Giá thấp &rarr; cao</option>
                    <option value="STOCK_ASC">Tồn kho ít &rarr; nhiều</option>
                    <option value="STOCK_DESC">Tồn kho nhiều &rarr; ít</option>
                  </select>

                  {/* Search box */}
                  <div className="input-group input-group-sm" style={{ width: '220px' }}>
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm thiết bị..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleOpenAdd}
                    className="btn btn-primary btn-sm rounded-2 px-3 fw-semibold shadow-sm"
                  >
                    <i className="bi bi-plus-lg me-1"></i>Thêm Mới
                  </button>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted" style={{ fontSize: '11.5px', letterSpacing: '0.4px' }}>
                  <tr>
                    <th className="ps-4">Mã SP</th>
                    <th>Thiết Bị & Dòng Máy</th>
                    <th>Ngành Hàng</th>
                    <th>Chi Nhánh Tiếp Nhận</th>
                    <th>Đơn Giá Niêm Yết</th>
                    <th>Tồn Kho</th>
                    <th>Trạng Thái</th>
                    <th className="text-center pe-4" style={{ width: '150px' }}>Thao tác (CRUD)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        <i className="bi bi-inbox fs-3 d-block mb-1"></i>
                        Không tìm thấy thiết bị nào phù hợp với bộ lọc!
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-4">
                          <span className="badge bg-light text-dark border font-monospace">{p.id}</span>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{p.name}</div>
                          {p.description && (
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: '320px' }}>
                              {p.description}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                            {p.category}
                          </span>
                        </td>
                        <td>
                          <i className="bi bi-geo-alt text-danger me-1"></i>
                          <span className="small text-secondary">{p.branch}</span>
                        </td>
                        <td>
                          <span className="fw-bold text-danger">
                            {Number(p.price).toLocaleString('vi-VN')} ₫
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark">{p.stock} máy</span>
                        </td>
                        <td>
                          {p.stock === 0 ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                              ● Hết hàng
                            </span>
                          ) : p.stock <= 5 ? (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">
                              ● Sắp hết ({p.stock})
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                              ● Còn hàng
                            </span>
                          )}
                        </td>
                        <td className="text-center pe-4">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="btn btn-outline-primary"
                              title="Chỉnh sửa thiết bị"
                            >
                              <i className="bi bi-pencil me-1"></i>Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
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
              <span>Hiển thị <strong>{filteredProducts.length}</strong> trên tổng số <strong>{products.length}</strong> thiết bị</span>
              <span className="text-success fw-semibold">
              </span>
            </div>
          </div>


        </main>
      </div>

      {/* ================= 7. MODAL THÊM / SỬA THIẾT BỊ (CRUD MODAL) ================= */}
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
                  {isEditing ? `Chỉnh Sửa Thiết Bị [${currentEditId}]` : 'Nhập Liệu Thiết Bị Mới (CoolAdmin)'}
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
                        Ngành hàng <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Điện thoại">Điện thoại di động</option>
                        <option value="Laptop">Laptop / Máy tính xách tay</option>
                        <option value="Tablet">Máy tính bảng (iPad/Tablet)</option>
                        <option value="Phụ kiện">Tai nghe & Phụ kiện</option>
                      </select>
                    </div>

                    <div className="col-6">
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
                        placeholder="20"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                      <div className="invalid-feedback">Tối thiểu 1 máy.</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Mô tả thông số kỹ thuật & Tính năng AI
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="VD: Chip Snapdragon 8 Gen 3, Camera Leica, hỗ trợ AI dịch thuật..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
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
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold shadow-sm">
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
