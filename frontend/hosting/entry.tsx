import SiteStatistics from "@/components/SiteStatistics";
import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteBackground from "@/components/SiteBackground";
import SiteSplash from "@/components/SiteSplash";
import RouteViewport from "@/components/RouteViewport";
import Home from "@/app/page";
import Games from "@/app/games/page";
import Game from "@/app/games/[slug]/page";
import Categories from "@/app/categories/page";
import Category from "@/app/categories/[slug]/page";
import Progress from "@/app/in-progress/page";
import About from "@/app/about/page";
import Contact from "@/app/contact/page";
import NotFound from "@/app/not-found";
import { site, setSite, installNavigation, notifyNavigation, type SitePayload } from "./runtime";

const root = createRoot(document.getElementById("site-root")!);
let navigationId = 0;
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main className="page-shell"><h1>Chưa tải được trang</h1><button onClick={() => location.reload()}>Thử lại</button></main> : this.props.children; }
}
async function page() {
  const path = site.path.replace(/\/$/, "") || "/";
  const props = { searchParams: Promise.resolve(Object.fromEntries(new URLSearchParams(location.search))), params: Promise.resolve({ slug: decodeURIComponent(path.split("/")[2] ?? "") }) };
  if (path === "/") return Home();
  if (path === "/games") return Games(props);
  if (path.startsWith("/games/")) return Game(props);
  if (path === "/categories") return Categories();
  if (path.startsWith("/categories/")) return Category(props);
  if (path === "/in-progress") return Progress();
  if (path === "/about") return About();
  if (path === "/contact") return Contact();
  if (site.adminBase && path === site.adminBase + "/login") return (await import("@/app/admin/login/page")).default(props);
  if (site.adminBase && path === site.adminBase) return (await import("@/app/admin/page")).default(props);
  return NotFound();
}
async function render(revision = navigationId) {
  const content = await page();
  if (revision !== navigationId) return;
  const hottest = [...site.games].filter(g => g.background_image || g.image).sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))[0];
  document.title = site.title;
  const canonical = new URL(site.path, location.origin).href;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', site.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', site.description);
  document.querySelector('meta[name="robots"]')?.setAttribute('content', site.adminBase ? 'noindex,nofollow' : 'index,follow');
  document.querySelector('meta[name="description"]')?.setAttribute("content", site.description);
  document.querySelector('meta[name="csrf-token"]')?.setAttribute("content", site.csrf);
  root.render(<ErrorBoundary><SiteStatistics path={site.path + location.search} privatePage={Boolean(site.adminBase)} /><SiteBackground image={hottest?.background_image ?? hottest?.image} name={hottest?.name} /><SiteSplash /><Header /><RouteViewport><div key={site.path + location.search} className="hosting-page">{content}</div></RouteViewport><Footer /></ErrorBoundary>);
}
async function navigate(url: URL, replace = false, scroll = true) {
  const id = ++navigationId;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, credentials: "same-origin", signal: AbortSignal.timeout(15000) });
    if (!response.ok || response.redirected) { location.assign(response.url || url.href); return; }
    const payload = await response.json() as SitePayload;
    if (id !== navigationId) return;
    history[replace ? "replaceState" : "pushState"]({}, "", url);
    setSite(payload);
    await render(id);
    notifyNavigation();
    if (url.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView());
    else if (scroll) window.scrollTo({ top: 0, behavior: "instant" });
  } catch { location.assign(url.href); }
}
installNavigation(navigate);
window.addEventListener("popstate", () => { void navigate(new URL(location.href), true, false); });
document.addEventListener("submit", event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.method.toLowerCase() !== "get" || event.defaultPrevented) return;
  const url = new URL(form.action, location.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  url.search = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
  void navigate(url);
});
void render().catch(() => { document.getElementById("site-root")!.textContent = "Không tải được trang. Vui lòng tải lại."; });
