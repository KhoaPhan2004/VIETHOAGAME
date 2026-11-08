"use client";

export default function ErrorPage({ reset }: { reset(): void }) {
  return <main className="page-shell"><div className="empty-state" role="alert">
    <h1 className="page-title-compact">Chưa tải được nội dung</h1>
    <p>Kết nối đang gián đoạn. Bạn thử tải lại sau một chút nhé.</p>
    <button className="button button-primary" onClick={reset}>Thử lại</button>
  </div></main>;
}
