"use client";

import { useRef, useState, type ReactNode } from "react";

export default function AdminMutationForm({ action, children, className }: { action: string; children: ReactNode; className?: string }) {
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return <form action={action} method="post" encType="multipart/form-data" className={className} aria-busy={pending}
    onSubmit={async (event) => {
      event.preventDefault();
      if (busy.current) return;
      busy.current = true;
      setPending(true);
      setError(null);
      let leaving = false;
      try {
        const response = await fetch(action, { method: "POST", body: new FormData(event.currentTarget), headers: { Accept: "application/json", ...(document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ? { "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')!.content } : {}) }, signal: AbortSignal.timeout(60000) });
        const result = await response.json() as { redirectTo?: string; message?: string };
        if (!response.ok) throw new Error(result.message ?? "Không lưu được dữ liệu.");
        const base = new URL(action, window.location.origin).pathname.replace(/\/mutate$/, "");
        const destination = result.redirectTo ? new URL(result.redirectTo, window.location.origin) : null;
        if (!destination || destination.origin !== window.location.origin || !(destination.pathname === base || destination.pathname.startsWith(base + "/"))) throw new Error("Không mở được trang sau khi lưu.");
        leaving = true;
        window.location.assign(destination.href);
      } catch (error) {
        setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Máy chủ phản hồi chậm. Hãy kiểm tra danh sách trước khi lưu lại.");
      } finally {
        if (!leaving) { busy.current = false; setPending(false); }
      }
    }}>
    {children}
    {pending ? <p className="admin-form-feedback" role="status">Đang xử lý…</p> : null}
    {error ? <p className="admin-form-feedback admin-form-error" role="alert">{error}</p> : null}
  </form>;
}
