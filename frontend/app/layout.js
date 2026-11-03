import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "TECH-MART | Hệ thống chuỗi bán lẻ thiết bị di động chính hãng",
  description: "Hệ thống bán lẻ điện thoại di động, máy tính bảng, laptop chính hãng toàn quốc",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/bazaar/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/bazaar/css/style.css" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>

      <body>
        {children}

        {/* Scripts hỗ trợ tương tác Bootstrap & Bazaar */}
        <Script src="/bazaar/js/vendor/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/bazaar/js/main.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
