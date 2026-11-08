import Link from "next/link";

type BreadcrumbItem = { label: string; href?: string };

export default function PageBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="page-breadcrumb" aria-label="Đường dẫn">
      <Link href="/">Trang chủ</Link>
      {items.map((item, index) => (
        <span className="page-breadcrumb-item" key={item.href ?? item.label}>
          <span aria-hidden="true">/</span>
          {item.href ? <Link href={item.href}>{item.label}</Link> : (
            <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
