'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Kiểm tra khớp mật khẩu
    if (formData.password !== formData.confirmPassword) {
      setPasswordMismatch(true);
      setValidated(true);
      return;
    } else {
      setPasswordMismatch(false);
    }

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);

    // Lưu người dùng mới vào hệ thống (giả lập lưu DB / Microservice)
    const newUser = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: 'CUSTOMER',
    };

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setSuccessMsg(true);

    // Tự động chuyển hướng về trang chủ sau 1.5 giây
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0" style={{ maxWidth: '520px', width: '100%', borderRadius: '16px' }}>
        {/* Header thẻ màu đỏ CellphoneS */}
        <div
          className="card-header text-white text-center py-4 rounded-top-4"
          style={{ backgroundColor: '#d70018' }}
        >
          <Link href="/" className="text-decoration-none">
            <h4 className="fw-bold text-white mb-1">
              <i className="bi bi-phone-flip me-2 text-warning"></i>TECH-MART
            </h4>
          </Link>
          <span className="small text-white-50">Tạo tài khoản thành viên để nhận ưu đãi & tích điểm</span>
        </div>

        <div className="card-body p-4 p-md-5">
          <h5 className="fw-bold text-center mb-3 text-dark">Đăng Ký Tài Khoản Mới</h5>

          {successMsg && (
            <div className="alert alert-success alert-dismissible fade show small" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Đăng ký thành công!</strong> Đang tự động đăng nhập và chuyển hướng về trang chủ...
            </div>
          )}

          {passwordMismatch && (
            <div className="alert alert-danger alert-dismissible fade show small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại!
            </div>
          )}

          <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleRegister}>
            {/* Họ và tên */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">
                Họ và tên khách hàng <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Nguyễn Văn A"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <div className="invalid-feedback">Vui lòng nhập họ và tên của bạn.</div>
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">
                Số điện thoại di động <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-telephone"></i>
                </span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="VD: 0988123456"
                  pattern="[0-9]{10}"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="invalid-feedback">Số điện thoại phải có đúng 10 chữ số.</div>
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-muted">
                Địa chỉ Email <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <div className="invalid-feedback">Vui lòng nhập định dạng email hợp lệ.</div>
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">
                  Mật khẩu <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <div className="invalid-feedback">Mật khẩu từ 6 ký tự trở lên.</div>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">
                  Xác nhận mật khẩu <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <div className="invalid-feedback">Vui lòng nhập lại mật khẩu.</div>
                </div>
              </div>
            </div>

            {/* Đồng ý điều khoản */}
            <div className="mb-4 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="agreeTerms"
                required
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              />
              <label className="form-check-label small text-muted" htmlFor="agreeTerms">
                Tôi đồng ý với <a href="#" className="text-primary text-decoration-none">Điều khoản sử dụng</a> và <a href="#" className="text-primary text-decoration-none">Chính sách bảo mật</a> của TECH-MART AI.
              </label>
              <div className="invalid-feedback">Bạn cần đồng ý với điều khoản để tiếp tục.</div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm">
              <i className="bi bi-person-plus me-1"></i>Đăng Ký Tài Khoản
            </button>
          </form>

          {/* Liên kết sang Đăng nhập */}
          <div className="text-center mt-4 pt-3 border-top">
            <span className="small text-muted">Bạn đã có tài khoản thành viên? </span>
            <Link href="/login" className="small fw-bold text-primary text-decoration-none">
              Đăng nhập ngay
            </Link>
          </div>
        </div>

        <div className="card-footer bg-light text-center py-3 rounded-bottom-4">
          <Link href="/" className="small text-decoration-none text-secondary">
            &larr; Quay lại trang chủ mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
