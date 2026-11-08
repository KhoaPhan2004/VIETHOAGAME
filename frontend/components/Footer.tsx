import Link from "next/link";

const quickLinks = [
  { href: "/games", label: "Game" },
  { href: "/in-progress", label: "Tiến độ" },
  { href: "/categories", label: "Thể Loại" },
  { href: "/about", label: "Giới thiệu" },
];

const categoryLinks = [
  { href: "/categories", label: "Nhập vai" },
  { href: "/categories", label: "Sinh tồn" },
  { href: "/categories", label: "Mô phỏng" },
  { href: "/categories", label: "Phiêu lưu" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-snow" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="footer-container">
        <section className="footer-brand">
          <Link className="footer-logo" href="/">
            Việt Hóa Game
          </Link>
          <p>
            Thư viện game Việt hóa, tiến độ dự án đang dịch và hướng dẫn cài đặt
            dành cho cộng đồng game thủ Việt.
          </p>
        </section>

        <section className="footer-links" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title">Điều hướng</h2>
          {quickLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </section>

        <section className="footer-links" aria-labelledby="footer-category-title">
          <h2 id="footer-category-title">Khám phá</h2>
          {categoryLinks.map((link) => (
            <Link href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </section>

      </div>

      <div className="footer-bottom">
        <span>© {year} Việt Hóa Game.</span>
        <span>TKPkpin Việt Hóa</span>
      </div>
    </footer>
  );
}
