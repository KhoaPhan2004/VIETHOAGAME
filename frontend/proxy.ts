import { NextRequest, NextResponse } from "next/server";

function missing() {
  return new NextResponse("Không tìm thấy trang.", { status: 404, headers: { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" } });
}
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const base = process.env.ADMIN_PATH;
  if (path === "/admin" || path.startsWith("/admin/") || path === "/api/admin" || path.startsWith("/api/admin/")) return missing();
  const headers = new Headers(request.headers);
  headers.delete("x-admin-entry");
  if (base && (path === base || path.startsWith(base + "/"))) {
    const suffix = path.slice(base.length);
    const destinations: Record<string, string> = { "": "/admin", "/": "/admin", "/login": "/admin/login", "/mutate": "/admin/mutate", "/authenticate": "/api/admin/login" };
    const destination = destinations[suffix];
    if (!destination) return missing();
    headers.set("x-admin-entry", base);
    const url = request.nextUrl.clone();
    url.pathname = destination;
    const response = NextResponse.rewrite(url, { request: { headers } });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|game-media/).*)"] };
