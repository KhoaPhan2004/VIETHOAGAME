"use client";

import { useEffect, useSyncExternalStore } from "react";

type Statistics = { page_views: number; online: number };
let statistics: Statistics | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => statistics;
const serverSnapshot = () => null;

export function StatisticValue({ field }: { field: keyof Statistics }) {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return <>{value ? new Intl.NumberFormat("vi-VN").format(value[field]) : "—"}</>;
}

export default function SiteStatistics({ path, privatePage = false }: { path: string; privatePage?: boolean }) {
  useEffect(() => {
    let cancelled = false;
    let busy = false;
    let event: string | null = crypto.randomUUID();
    let visitor: string;
    try {
      visitor = localStorage.getItem("tkpkpin-visitor") || crypto.randomUUID();
      localStorage.setItem("tkpkpin-visitor", visitor);
    } catch { visitor = crypto.randomUUID(); }
    const update = async () => {
      if (busy || document.visibilityState !== "visible") return;
      busy = true;
      try {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
        const response = await fetch("/site-statistics", {
          method: privatePage ? "GET" : "POST",
          credentials: "same-origin", cache: "no-store",
          headers: { Accept: "application/json", ...(privatePage ? {} : { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf ?? "" }) },
          body: privatePage ? undefined : JSON.stringify({ visitor, event, path: path.split("?")[0] }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) return;
        const data = await response.json() as Statistics;
        if (cancelled || !Number.isSafeInteger(data.page_views) || !Number.isSafeInteger(data.online)) return;
        event = null;
        statistics = data;
        listeners.forEach(listener => listener());
      } catch { /* Keep the last successful numbers when the network is unavailable. */ }
      finally { busy = false; }
    };
    void update();
    const interval = window.setInterval(() => { void update(); }, 30000);
    const onVisible = () => { void update(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [path, privatePage]);
  return null;
}
