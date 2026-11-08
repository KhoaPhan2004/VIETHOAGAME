import { adminHref } from "./admin-path";
export const ADMIN_PAGE_SIZE = 10;

export function getAdminPagination(total: number, rawPage?: string) {
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const requested = Number(rawPage);
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  const offset = (page - 1) * ADMIN_PAGE_SIZE;
  return { page, pages, offset, start: total ? offset + 1 : 0, end: Math.min(offset + ADMIN_PAGE_SIZE, total), total };
}

export function adminPageNumbers(page: number, pages: number): (number | "gap")[] {
  const visible = Array.from({ length: pages }, (_, index) => index + 1)
    .filter((number) => number === 1 || number === pages || Math.abs(number - page) <= 1);
  return visible.flatMap((number, index): (number | "gap")[] => index && number - visible[index - 1] > 1 ? ["gap", number] : [number]);
}

export function adminUpdateHref(tab: "games" | "in-progress" | "categories", page: number, notice: string, keyword?: string, sort?: string) {
  const params = new URLSearchParams({ tab, page: String(page), notice });
  if (sort) params.set("sort", sort);
  if (keyword && tab !== "categories") {
    params.set(tab === "games" ? "done_q" : "progress_q", keyword);
  }
  return adminHref("?") + params.toString() + "#admin-list";
}
