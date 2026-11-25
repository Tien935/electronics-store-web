import Link from 'next/link';

export default function BrandLogo({ tone = 'light', showText = true, className = '' }) {
  const isLight = tone === 'light';

  return (
    <Link
      href="/"
      aria-label="TECH-MART trang chủ"
      className={`d-inline-flex flex-shrink-0 align-items-center gap-2 text-decoration-none ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 40, height: 40, borderRadius: 10, background: '#fff' }}
      >
        <i className="bi bi-phone-flip fs-3" style={{ color: '#d70018' }} />
      </span>
      {showText && (
        <span className="d-inline-flex flex-column" style={{ lineHeight: 1.05 }}>
          <span
            className="fw-bold text-uppercase"
            style={{ color: isLight ? '#fff' : '#20242a', fontSize: '1.25rem', letterSpacing: '-.035em' }}
          >
            TECH<b className="text-warning">MART</b>
          </span>
          <span
            className="text-uppercase"
            style={{ color: isLight ? 'rgba(255,255,255,.7)' : '#6c757d', fontSize: '.52rem', letterSpacing: '.12em' }}
          >
            Hệ Thống Thiết Bị Di Động
          </span>
        </span>
      )}
    </Link>
  );
}
