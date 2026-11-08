export type AdminSort = "name" | "updated" | "downloads";

export function parseAdminSort(value?: string): AdminSort {
  return value === "updated" || value === "downloads" ? value : "name";
}

export function sortAdminGames<T extends { id: number; name: string; updated_at: string | null; download_count?: number | null }>(games: T[], sort: AdminSort): T[] {
  const names = new Intl.Collator("vi", { sensitivity: "base", numeric: true });
  const timestamp = (value: string | null) => value ? Date.parse(value) || 0 : 0;
  return [...games].sort((a, b) => {
    const difference = sort === "downloads"
      ? (b.download_count ?? 0) - (a.download_count ?? 0)
      : sort === "updated" ? timestamp(b.updated_at) - timestamp(a.updated_at) : 0;
    return difference || names.compare(a.name, b.name) || a.id - b.id;
  });
}
