import Link from "next/link";

export default function NotFound() {
  return <main className="page-shell"><div className="empty-state">
    <p className="eyebrow">404</p><h1 className="page-title-compact">Không tìm thấy trang</h1>
    <p>Nội dung có thể đã được chuyển hoặc gỡ bỏ.</p>
    <Link className="button button-primary" href="/games">Về thư viện game</Link>
  </div></main>;
}
