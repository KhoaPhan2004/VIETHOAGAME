"use client";

import AdminMutationForm from "@/components/AdminMutationForm";
import { useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

export default function AdminDeletePopover({ name, action }: { name: string; action: string }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  function position() {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover?.matches(":popover-open")) return;
    const bounds = trigger.getBoundingClientRect();
    const panel = popover.getBoundingClientRect();
    const left = Math.max(8, Math.min(bounds.right - panel.width, window.innerWidth - panel.width - 8));
    const below = bounds.top < panel.height + 20;
    popover.style.left = `${left}px`;
    popover.style.top = `${below ? bounds.bottom + 12 : bounds.top - panel.height - 12}px`;
    popover.style.setProperty("--arrow-left", `${Math.max(18, Math.min(panel.width - 18, bounds.left + bounds.width / 2 - left))}px`);
    popover.dataset.side = below ? "below" : "above";
  }

  useEffect(() => {
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, []);

  function close() {
    popoverRef.current?.hidePopover();
    triggerRef.current?.focus();
  }

  return <>
    <button ref={triggerRef} type="button" className="button admin-delete-trigger" popoverTarget={id} onClick={() => {
      // The browser opens its native popover after the click handler.
      requestAnimationFrame(position);
    }}>Xóa</button>
    <div ref={popoverRef} id={id} popover="auto" className="admin-delete-popover" role="alertdialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-name`}>
      <p id={`${id}-title`}>Bạn chắc chắn muốn xóa?</p>
      <span id={`${id}-name`} className="admin-sr-only">{name}</span>
      <div className="admin-delete-popover-actions">
        <button type="button" className="admin-popover-cancel" aria-label="Hủy xóa" onClick={close}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
        <AdminMutationForm action={action}><ConfirmDelete name={name} /></AdminMutationForm>
      </div>
    </div>
  </>;
}

function ConfirmDelete({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="admin-popover-confirm" disabled={pending} aria-label={pending ? "Đang xóa…" : `Xác nhận xóa ${name}`}>
    {pending ? <span className="admin-delete-spinner" aria-hidden="true" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 5 5L20 6" /></svg>}
  </button>;
}
