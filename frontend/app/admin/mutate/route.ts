import { adminBasePath } from "@/lib/admin-path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { performAdminMutation } from "@/lib/admin-mutations";
import { siteUrl } from "@/lib/site-url";
import { parseAdminSort } from "@/lib/admin-sort";

export async function POST(request: NextRequest) {
  if (request.headers.get("x-admin-entry") !== adminBasePath()) return NextResponse.json({ message: "Không tìm thấy trang." }, { status: 404 });
  if (request.headers.get("origin") !== (siteUrl() ?? request.nextUrl.origin)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ." }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }, { status: 401 });
  }
  const params = request.nextUrl.searchParams;
  const operation = params.get("operation") ?? "";
  const id = Number(params.get("id"));
  if ((operation.startsWith("update-") || operation.startsWith("delete-")) && (!Number.isSafeInteger(id) || id < 1)) {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 25 * 1024 * 1024) {
    return NextResponse.json({ message: "Tổng dung lượng ảnh vượt quá 25 MB." }, { status: 413 });
  }
  try {
    const page = Number(params.get("page"));
    const context = { page: Number.isSafeInteger(page) && page > 0 ? page : 1, keyword: params.get("keyword") ?? undefined, sort: parseAdminSort(params.get("sort") ?? undefined) };
    const redirectTo = await performAdminMutation(operation, id, context, await request.formData());
    return NextResponse.json({ redirectTo });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Không lưu được dữ liệu. Vui lòng thử lại." }, { status: 422 });
  }
}
