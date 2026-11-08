"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export default function AdminDialog({ title, trigger, children, defaultOpen = false, compact = false, danger = false }: {
  title: string;
  trigger: string;
  children: ReactNode;
  defaultOpen?: boolean;
  compact?: boolean;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const formId = `admin-form-${titleId}`;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const form = dialog?.querySelector("form");
    if (form) form.id = formId;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open, formId]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return <>
    <button ref={triggerRef} className={`button ${danger ? "admin-delete-trigger" : "button-secondary"}`} type="button" onClick={() => setOpen(true)}>{trigger}</button>
    {open ? <dialog ref={dialogRef} className={`admin-dialog ${compact ? "admin-dialog-compact" : ""}`} aria-labelledby={titleId} onCancel={(event) => {
      // File inputs also fire a bubbling cancel event when the picker is dismissed.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      close();
    }}>
      <div className="admin-dialog-heading"><h2 id={titleId}>{title}</h2><button className="admin-dialog-close" type="button" aria-label="Đóng" onClick={close}><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button></div>
      <div className="admin-dialog-content">{children}</div>
      <div className="admin-dialog-footer"><button className="button button-secondary" type="button" onClick={close}>{danger ? "Hủy" : "Quay lại"}</button><button className={`button ${danger ? "danger-button" : "button-primary"}`} type="submit" form={formId}>{danger ? "Xác nhận xóa" : "Lưu"}</button></div>
    </dialog> : null}
  </>;
}
