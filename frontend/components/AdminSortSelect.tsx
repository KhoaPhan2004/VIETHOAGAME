"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { AdminSort } from "@/lib/admin-sort";

export default function AdminSortSelect({ value, downloads = true }: { value: AdminSort; downloads?: boolean }) {
  const router = useRouter();
  const base = "/" + usePathname().split("/")[1];
  const searchParams = useSearchParams();
  return <label className="admin-sort-label">Sắp xếp
    <select aria-label="Sắp xếp danh sách" value={value} onChange={(event) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", event.target.value);
      params.set("page", "1");
      params.delete("notice");
      router.push(base + "?" + params.toString() + "#admin-list", { scroll: false });
    }}>
      <option value="name">A–Z</option>
      <option value="updated">Ngày cập nhật</option>
      {downloads && <option value="downloads">Lượt tải</option>}
    </select>
  </label>;
}
