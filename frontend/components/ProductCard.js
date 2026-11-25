import Link from 'next/link';

const formatPrice = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;

export default function ProductCard({ product, categoryName, brandName, onAddToCart }) {
  const isActive = product.status === 'ACTIVE';

  return (
    <div className="col-6 col-md-4 col-xl-3">
      <article className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
        <Link href={`/product?id=${product.id}`} className="position-relative bg-white p-3 d-block text-center">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-100"
            style={{ height: 190, objectFit: 'contain' }}
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
            <small className="text-muted">{product.sku}</small>
            <span className={`badge ${isActive ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
              {isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
            </span>
          </div>
          <Link href={`/product?id=${product.id}`} className="text-decoration-none text-dark">
            <h3 className="h6 fw-bold lh-base">{product.name}</h3>
          </Link>
          <div className="small text-muted mb-2">{categoryName} · {brandName}</div>
          <p className="small text-secondary">{product.description}</p>
          <div className="mt-auto">
            <div className="fw-bold text-danger fs-5 mb-2">{formatPrice(product.price)}</div>
            <div className="d-flex gap-2">
              <Link href={`/product?id=${product.id}`} className="btn btn-outline-secondary rounded-pill flex-grow-1">
                Chi tiết
              </Link>
              <button
                type="button"
                className="btn btn-outline-danger rounded-pill"
                onClick={() => onAddToCart(product)}
                aria-label={`Thêm ${product.name} vào giỏ`}
              >
                <i className="bi bi-cart-plus" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
