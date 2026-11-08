import { signInAdmin } from "@/lib/admin-auth";
import { adminBasePath, adminHref } from "@/lib/admin-path";
import { siteUrl } from "@/lib/site-url";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.headers.get("x-admin-entry") !== adminBasePath()) return new Response("Không tìm thấy trang.", { status: 404 });
  const origin = siteUrl() ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new Response("Yêu cầu không hợp lệ.", { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 16384) return new Response("Yêu cầu quá lớn.", { status: 413 });
  const data = await request.formData();
  const result = await signInAdmin(String(data.get("password") ?? ""));
  if (result === "limited") return new Response("Thử đăng nhập quá nhiều lần. Vui lòng đợi một phút.", { status: 429, headers: { "Retry-After": "60" } });
  if (result === "unavailable") return NextResponse.redirect(new URL(adminHref("/login?error=server"), origin), 303);
  if (result === "invalid") return NextResponse.redirect(new URL(adminHref("/login?error=1"), origin), 303);
  return NextResponse.redirect(new URL(adminHref(), origin), 303);
}
