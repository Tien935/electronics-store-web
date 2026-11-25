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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const demoAdminEmail = 'admin@techmart.vn';
  const demoAdminPassword = 'Admin123!';
  const demoStaffEmail = 'staff@techmart.vn';
  const demoStaffPassword = 'Staff123!';
  const demoCustomerEmail = 'customer@techmart.vn';
  const demoCustomerPassword = 'Customer123!';

  const startDemoAdminSession = () => {
    const demoAdmin = {
      id: 1,
      name: 'Admin',
      full_name: 'Admin',
      email: demoAdminEmail,
      role: 'ADMIN',
      roles: ['ADMIN'],
    };
    localStorage.setItem('accessToken', 'demo-access-token');
    localStorage.setItem('adminUser', JSON.stringify(demoAdmin));
    localStorage.setItem('currentUser', JSON.stringify(demoAdmin));
    window.dispatchEvent(new Event('auth-changed'));
    router.replace('/admin');
  };


  const startDemoStaffSession = () => {
    const demoStaff = {
      id: 2,
      name: 'Nhân viên',
      full_name: 'Nhân viên',
      email: demoStaffEmail,
      role: 'STAFF',
      roles: ['STAFF'],
    };
    localStorage.removeItem('adminUser');
    localStorage.setItem('accessToken', 'demo-staff-token');
    localStorage.setItem('currentUser', JSON.stringify(demoStaff));
    window.dispatchEvent(new Event('auth-changed'));
    router.replace('/staff/orders');
  };

  const startDemoCustomerSession = () => {
    const demoCustomer = {
      id: 3,
      full_name: 'Võ Xuân Quang',
      fullName: 'Võ Xuân Quang',
      name: 'Võ Xuân Quang',
      email: 'quang.vo@techmart.vn',
      phone: '0977889900',
      status: 'ACTIVE',
      created_at: '2026-11-20T08:00:00',
      role: 'CUSTOMER',
      roles: ['CUSTOMER'],
    };
    localStorage.removeItem('adminUser');
    localStorage.setItem('accessToken', 'demo-customer-token');
    localStorage.setItem('currentUser', JSON.stringify(demoCustomer));
    window.dispatchEvent(new Event('auth-changed'));
    router.replace('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    setAlertMsg('');

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    // Tài khoản demo frontend luôn hoạt động dù backend đang trả lỗi đăng nhập.
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === demoCustomerEmail && password === demoCustomerPassword) {
      startDemoCustomerSession();
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertMsg(data.message || 'Đăng nhập không thành công.');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-changed'));

      const roles = Array.isArray(data.user?.roles) ? data.user.roles : [];
      const isAdmin = data.user?.role === 'ADMIN' || roles.includes('ADMIN');
      const isStaff = data.user?.role === 'STAFF' || roles.includes('STAFF');
      if (!isAdmin) localStorage.removeItem('adminUser');

      if (isAdmin) {
        router.replace('/admin');
      } else if (isStaff) {
        router.replace('/staff/orders');
      } else {
        router.replace('/');
      }
    } catch (error) {
      if (email.trim().toLowerCase() === demoAdminEmail && password === demoAdminPassword) {
        startDemoAdminSession();
      } else if (email.trim().toLowerCase() === demoStaffEmail && password === demoStaffPassword) {
        startDemoStaffSession();
      } else if (email.trim().toLowerCase() === demoCustomerEmail && password === demoCustomerPassword) {
        startDemoCustomerSession();
      } else {
        setAlertMsg('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
      }
    } finally {
      setIsSubmitting(false);
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

            <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                disabled={isSubmitting}
            >
              {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                      Đang đăng nhập...
                  </>
              ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Đăng Nhập
                  </>
              )}
            </button>
          </form>

          {/* Chưa có tài khoản -> Sang Đăng ký */}
          <div className="text-center mt-4 pt-3 border-top">
            <span className="small text-muted">Chưa có tài khoản? </span>
            <Link href="/register" className="small fw-bold text-primary text-decoration-none">
              Đăng ký ngay
            </Link>
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




