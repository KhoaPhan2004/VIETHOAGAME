import { adminHref } from "./admin-path";
import type { AdminSort } from "@/lib/admin-sort";
export type AdminListContext = { page: number; keyword?: string; sort?: AdminSort };
export function adminMutationUrl(operation: string, id?: number, context?: AdminListContext) {
  const params = new URLSearchParams({ operation });
  if (id) params.set("id", String(id));
  if (context) {
    params.set("page", String(context.page));
    if (context.keyword) params.set("keyword", context.keyword);
    if (context.sort) params.set("sort", context.sort);
  }
  return adminHref("/mutate?") + params.toString();
}
