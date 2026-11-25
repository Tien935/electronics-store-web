import Link from 'next/link';
import BrandLogo from './BrandLogo';

export default function StoreFooter() {
  return (
<footer className="site-footer bg-dark text-white pt-5 pb-3">
          <div className="wrap">
            <div className="row g-4">
              <div className="col-lg-4">
                <BrandLogo tone="light" className="mb-3" />

                <p className="text-secondary small">
                  Chuỗi bán lẻ thiết bị di động, điện thoại thông minh,
                  laptop chính hãng hàng đầu Việt Nam. Tích hợp giải pháp
                  đề xuất thông minh theo kiến trúc Microservices và
                  Trí tuệ nhân tạo.
                </p>

                <p className="small mb-1">
                  <i className="bi bi-geo-alt me-2 text-warning"></i>
                  Trụ sở: 123 Cầu Giấy, Hà Nội
                </p>

                <p className="small mb-1">
                  <i className="bi bi-telephone me-2 text-warning"></i>
                  Tổng đài khiếu nại: 1800.6868
                </p>

                <p className="small">
                  <i className="bi bi-envelope me-2 text-warning"></i>
                  Email: hotro@techmart.vn
                </p>
              </div>

              <div className="col-6 col-lg-2">
                <h6 className="fw-bold mb-3 text-light">
                  Thông Tin Chuỗi
                </h6>

                <ul className="list-unstyled text-secondary small lh-lg">
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Hệ thống 150 cửa hàng
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Chính sách bảo hành
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Chính sách đổi trả 30 ngày
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Giao hàng & Lắp đặt
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-6 col-lg-2">
                <h6 className="fw-bold mb-3 text-light">
                  Sản Phẩm Hot
                </h6>

                <ul className="list-unstyled text-secondary small lh-lg">
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      iPhone 16 Series
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      Samsung Galaxy S24
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      MacBook Pro M3
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-decoration-none text-secondary">
                      iPad Air & Pro M4
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-lg-4">
                <h6 className="fw-bold mb-3 text-light">
                  Đăng Ký Nhận Thông Báo
                </h6>

                <p className="text-secondary small">
                  Nhận ngay thông báo khi có đợt Flash Sale hoặc voucher
                  giảm 500k cho thiết bị bạn quan tâm.
                </p>

                <div className="input-group mb-3">
                  <input
                      type="email"
                      className="form-control"
                      placeholder="Nhập email của bạn..."
                  />

                  <button className="btn btn-warning fw-bold">
                    Đăng ký
                  </button>
                </div>

                <div className="d-flex gap-2">
                  <span className="badge bg-secondary">Visa</span>
                  <span className="badge bg-secondary">Mastercard</span>
                  <span className="badge bg-secondary">MoMo</span>
                  <span className="badge bg-secondary">VNPay</span>
                </div>
              </div>
            </div>

            <hr className="border-secondary my-4" />

            <div className="d-flex justify-content-between align-items-center flex-wrap small text-secondary">
            <span>
              © 2026 TECH-MART made by Student
            </span>

            </div>
          </div>
        </footer>
  );
}
