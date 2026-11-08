"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import "./header.css";

const links = [
  { href: "/games", label: "Game", detail: "Khám phá bản Việt hóa", icon: "M6 8h12l3 9a2 2 0 0 1-3 2l-3-2H9l-3 2a2 2 0 0 1-3-2l3-9ZM7 11v4m-2-2h4m7-1h.01M18 14h.01" },
  { href: "/in-progress", label: "Tiến độ", detail: "Theo dõi các dự án", icon: "M5 20V10m7 10V4m7 16v-7" },
  { href: "/categories", label: "Thể loại", detail: "Tìm game theo sở thích", icon: "M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h6v6h-6Z" },
  { href: "/about", label: "Giới thiệu", detail: "Về TKPkpin", icon: "M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
];

export default function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const expanded = openPath === pathname;
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!expanded) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpenPath(null);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
        toggleRef.current?.focus();
      }
    }
    const desktop = window.matchMedia("(min-width: 901px)");
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setOpenPath(null);
    }
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  return (
    <header className="site-header" ref={headerRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpenPath(null);
    }}>
      <div className="header-container">
        <Link href="/" className="logo" onClick={() => setOpenPath(null)}><span className="header-brand-name">TKPkpin<span className="header-logo-dot" aria-hidden="true" /></span><span className="header-brand-tagline">GAME VIỆT HÓA</span></Link>
        <button
          className="header-menu-toggle"
          type="button"
          ref={toggleRef}
          aria-label={expanded ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
          aria-expanded={expanded}
          aria-controls={menuId}
          onClick={() => setOpenPath(expanded ? null : pathname)}
        >
          <span className="header-menu-label">{expanded ? "Đóng" : "Menu"}</span>
          <span className="header-menu-icon" aria-hidden="true"><span /><span /><span /></span>
        </button>
        <nav className={`site-navigation${expanded ? " is-open" : ""}`} id={menuId} aria-label="Điều hướng chính">
          <p className="header-menu-caption">Khám phá <span>TKPkpin</span></p>
          <div className="header-menu-links">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} onClick={() => setOpenPath(null)}>
                  <span className="header-link-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={link.icon} /></svg></span>
                  <span className="header-link-text"><span>{link.label}</span><small>{link.detail}</small></span>
                  <span className="header-link-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M7 7h10v10" /></svg></span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
