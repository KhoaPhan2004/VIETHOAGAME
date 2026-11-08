import { adminHref } from "@/lib/admin-path";
import Link from "next/link";
import { adminPageNumbers, getAdminPagination } from "@/lib/admin-pagination";

export default function AdminPagination({ total, page: rawPage, tab, keyword, inputName, sort }: {
  total: number;
  page?: string;
  tab: string;
  keyword?: string;
  inputName?: string;
  sort?: string;
}) {
  const { page, pages, start, end } = getAdminPagination(total, rawPage);
  function href(number: number) {
    const params = new URLSearchParams({ tab, page: String(number) });
    if (sort) params.set("sort", sort);
    if (keyword && inputName) params.set(inputName, keyword);
    return adminHref("?" + params + "#admin-list");
  }

  return <div className="admin-pagination">
    <p>Hiển thị {start}–{end} / {total}</p>
    {pages > 1 ? <nav aria-label="Phân trang danh sách">
      {page > 1 ? <Link href={href(page - 1)} aria-label="Trang trước">‹</Link> : <span aria-disabled="true">‹</span>}
      {adminPageNumbers(page, pages).map((number, index) => number === "gap"
        ? <span className="admin-pagination-gap" key={`gap-${index}`}>…</span>
        : <Link href={href(number)} key={number} aria-label={`Trang ${number}`} aria-current={page === number ? "page" : undefined}>{number}</Link>)}
      {page < pages ? <Link href={href(page + 1)} aria-label="Trang sau">›</Link> : <span aria-disabled="true">›</span>}
    </nav> : null}
  </div>;
}
