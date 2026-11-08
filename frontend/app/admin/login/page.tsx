import PortalCsrf from "@/components/PortalCsrf";
import { adminHref } from "@/lib/admin-path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import "../admin.css";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdminAuthenticated()) {
    redirect(adminHref());
  }

  const { error } = await searchParams;

  return (
    <main className="admin-login-shell">
      <section className="admin-login-panel">
        <p className="eyebrow">Admin</p>
        <h1>Đăng nhập quản trị</h1>
        <p>Nhập mật khẩu admin để thêm, sửa, xóa game và thể loại.</p>

        {error ? (
          <p className="form-error">{error === "server" ? "Chưa kết nối được máy chủ. Vui lòng thử lại." : "Mật khẩu chưa đúng. Thử lại nha."}</p>
        ) : null}

        <form action={adminHref("/authenticate")} method="post" className="admin-form">
          <PortalCsrf />
          <label>
            Mật khẩu
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          <button className="button button-primary" type="submit">
            Đăng nhập admin
          </button>
        </form>
      </section>
    </main>
  );
}
