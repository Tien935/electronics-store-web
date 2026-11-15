'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // Xử lý đăng nhập thông minh tự động nhận diện Role theo Email
  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    // 1. Kiểm tra nếu là tài khoản Quản trị viên (ADMIN)
    if (email.trim().toLowerCase() === 'admin@techmart.vn') {
      if (password === 'admin123') {
        const adminData = {
          name: 'Administrator',
          email: 'admin@techmart.vn',
          role: 'ADMIN',
        };
        // Lưu riêng vào adminUser, không đè lên tài khoản khách của trang chủ
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        localStorage.removeItem('currentUser');
        setAlertMsg('');
        router.push('/admin'); // Chuyển thẳng vào Dashboard Admin
      } else {
        setAlertMsg('Mật khẩu Admin không chính xác! (Mật khẩu mặc định: admin123)');
      }
      return;
    }

    // 2. Nếu là tài khoản Khách hàng thông thường (CUSTOMER)
    const customerName = email.includes('@') ? email.split('@')[0] : 'Khách Hàng VIP';
    const customerUser = {
      name: customerName,
      email: email,
      role: 'CUSTOMER',
    };
    localStorage.setItem('currentUser', JSON.stringify(customerUser));
    setAlertMsg('');
    router.push('/'); // Chuyển về trang chủ mua sắm
  };

  // Điền nhanh tài khoản mẫu để test nhanh
  const fillSampleAccount = (sampleType) => {
    if (sampleType === 'admin') {
      setEmail('admin@techmart.vn');
      setPassword('admin123');
      setAlertMsg('');
    } else {
      setEmail('khachhang@gmail.com');
      setPassword('123456');
      setAlertMsg('');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0" style={{ maxWidth: '460px', width: '100%', borderRadius: '16px' }}>
        <div
          className="card-header text-white text-center py-4 rounded-top-4"
          style={{ backgroundColor: '#d70018' }}
        >
          <Link href="/" className="text-decoration-none">
            <h4 className="fw-bold text-white mb-1">
              <i className="bi bi-phone-flip me-2 text-warning"></i>TECH-MART
            </h4>
          </Link>
          <span className="small text-white-50">Đăng nhập tài khoản thành viên hệ thống</span>
        </div>

        <div className="card-body p-4 p-md-5">
          <h5 className="fw-bold text-center mb-4 text-dark">Đăng Nhập</h5>

          {alertMsg && (
            <div className="alert alert-danger alert-dismissible fade show small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {alertMsg}
            </div>
          )}

          <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">Email đăng nhập</label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="invalid-feedback">Vui lòng nhập địa chỉ email hợp lệ.</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label fw-semibold small text-muted">Mật khẩu</label>
                <a href="#" className="small text-decoration-none">Quên mật khẩu?</a>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu..."
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="invalid-feedback">Vui lòng nhập mật khẩu.</div>
              </div>
            </div>

            <div className="mb-4 form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" defaultChecked />
              <label className="form-check-label small text-muted" htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm">
              <i className="bi bi-box-arrow-in-right me-1"></i>Đăng Nhập
            </button>
          </form>

          {/* Chưa có tài khoản -> Sang Đăng ký */}
          <div className="text-center mt-4 pt-3 border-top">
            <span className="small text-muted">Chưa có tài khoản? </span>
            <Link href="/register" className="small fw-bold text-primary text-decoration-none">
              Đăng ký ngay
            </Link>
          </div>

          {/* Gợi ý tài khoản demo */}
          <div className="mt-3 p-3 bg-light rounded-3 border small">
            <span className="fw-bold text-muted d-block mb-1">
              <i className="bi bi-info-circle me-1"></i>Gợi ý tài khoản thử nghiệm:
            </span>
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger w-50"
                onClick={() => fillSampleAccount('admin')}
              >
                👑 Tài khoản Admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary w-50"
                onClick={() => fillSampleAccount('user')}
              >
                👤 Tài khoản Khách
              </button>
            </div>
          </div>
        </div>

        <div className="card-footer bg-light text-center py-3 rounded-bottom-4">
          <Link href="/" className="small text-decoration-none text-secondary">
            &larr; Về trang chủ mua hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
