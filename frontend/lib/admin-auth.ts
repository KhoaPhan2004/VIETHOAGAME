import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { API_BASE_URL } from "./api-config";
import { adminBasePath } from "./admin-path";

const ADMIN_COOKIE = "admin_session";
const cookieOptions = () => ({
  httpOnly: true, sameSite: "lax" as const, path: adminBasePath(),
  secure: process.env.NODE_ENV === "production",
});
export async function adminAuthHeaders() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value ?? "";
  return { Authorization: `Bearer ${token}` };
}
export const isAdminAuthenticated = cache(async () => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/session`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch { return false; }
});
export async function signInAdmin(password: string): Promise<"ok" | "invalid" | "limited" | "unavailable"> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
      headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ password }),
    });
    if (response.status === 429) return "limited";
    if (response.status === 401 || response.status === 422) return "invalid";
    if (!response.ok) return "unavailable";
    const result = await response.json() as { token: string; expires_at: string };
    if (!/^[a-f0-9]{64}$/.test(result.token)) return "unavailable";
    (await cookies()).set(ADMIN_COOKIE, result.token, { ...cookieOptions(), maxAge: 8 * 60 * 60 });
    return "ok";
  } catch { return "unavailable"; }
}
export async function signOutAdmin() {
  const headers = await adminAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
    method: "POST", headers, cache: "no-store", signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Chưa đăng xuất được. Vui lòng thử lại.");
  (await cookies()).set(ADMIN_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}
