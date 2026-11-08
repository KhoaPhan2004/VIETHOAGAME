import PageBreadcrumb from "@/components/PageBreadcrumb";
import GameCard from "@/components/GameCard";
import { getCategories } from "@/lib/categories";
import { getGames } from "@/lib/games";
import { isGameInProgress } from "@/lib/game-status";
import Link from "next/link";

const PAGE_SIZE = 12;

export default async function GamesPage({
  searchParams,
}: PageProps<"/games">) {
  const { q, category, status, downloadable, sort, page } = await searchParams;
  const keyword = Array.isArray(q) ? q[0] : q;
  const activeCategory = Array.isArray(category) ? category[0] : category;
  const activeStatus = Array.isArray(status) ? status[0] : status;
  const activeDownloadable = Array.isArray(downloadable) ? downloadable[0] : downloadable;
  const activeSort = Array.isArray(sort) ? sort[0] : sort;
  const activePage = Math.max(1, Number(Array.isArray(page) ? page[0] : page) || 1);
  const [games, categories] = await Promise.all([
    getGames({
      query: keyword,
      category: activeCategory,
      status: activeStatus,
      downloadable: activeDownloadable,
      sort: activeSort,
    }),
    getCategories(),
  ]);
  const completedGames = games.filter((game) => !isGameInProgress(game));
  if (activeSort === "downloads") {
    completedGames.sort((first, second) => (second.download_count ?? 0) - (first.download_count ?? 0));
  }
  const totalPages = Math.max(1, Math.ceil(completedGames.length / PAGE_SIZE));
  const currentPage = Math.min(activePage, totalPages);
  const paginatedGames = completedGames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <main className="page-shell">
      <PageBreadcrumb items={[{ label: "Game đã Việt hóa" }]} />
      <section className="page-heading">
        <p className="eyebrow">Thư viện bản dịch</p>
        <h1 className="page-title-compact">Game đã Việt hóa</h1>
        <p>
          Duyệt các bản Việt hóa đã hoàn thành, có thể xem chi tiết hướng dẫn
          cài đặt và tải về.
        </p>
      </section>

      <form className="advanced-filter" action="/games">
        <label>
          Tìm kiếm
          <input name="q" defaultValue={keyword ?? ""} placeholder="Tên game, mô tả, thể loại..." />
        </label>

        <label>
          Thể loại
          <select name="category" defaultValue={activeCategory ?? ""}>
            <option value="">Tất cả thể loại</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trạng thái
          <select name="status" defaultValue={activeStatus ?? ""}>
            <option value="">Tất cả trạng thái</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đang cập nhật">Đang cập nhật</option>
          </select>
        </label>

        <label>
          Tải xuống
          <select name="downloadable" defaultValue={activeDownloadable ?? ""}>
            <option value="">Tất cả</option>
            <option value="true">Đã có link tải</option>
            <option value="false">Chưa tải được</option>
          </select>
        </label>

        <label>
          Sắp xếp
          <select name="sort" defaultValue={activeSort ?? ""}>
            <option value="">Mới cập nhật</option>
            <option value="name">Tên A-Z</option>
            <option value="downloads">Lượt tải cao nhất</option>
          </select>
        </label>

        <button className="button button-primary" type="submit">
          Lọc game
        </button>
      </form>

      <div className="filter-bar">
        <Link className={!activeCategory ? "active-filter" : ""} href="/games">
          Tất cả
        </Link>
        {categories.map((item) => (
          <Link
            className={activeCategory === item.name ? "active-filter" : ""}
            href={`/games?category=${encodeURIComponent(item.name)}`}
            key={item.id}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {keyword ? (
        <p className="result-note">
          Kết quả tìm kiếm cho: <strong>{keyword}</strong>
        </p>
      ) : null}

      {activeCategory ? (
        <p className="result-note">
          Đang lọc thể loại: <strong>{activeCategory}</strong>
        </p>
      ) : null}

      {activeStatus || activeDownloadable ? (
        <p className="result-note">
          Bộ lọc nâng cao đang bật
        </p>
      ) : null}

      <div className="game-grid">
        {paginatedGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="pagination" aria-label="Phân trang game">
          <Link
            className={currentPage === 1 ? "disabled-page" : ""}
            href={pageHref(currentPage - 1)}
            aria-disabled={currentPage === 1}
          >
            Trước
          </Link>

          {paginationItems(currentPage, totalPages).map((item) =>
            item === "..." ? (
              <span key={`${item}-${currentPage}`} className="pagination-ellipsis">
                ...
              </span>
            ) : (
              <Link
                className={item === currentPage ? "active-page" : ""}
                href={pageHref(item)}
                key={item}
              >
                {item}
              </Link>
            ),
          )}

          <Link
            className={currentPage === totalPages ? "disabled-page" : ""}
            href={pageHref(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
          >
            Sau
          </Link>
        </nav>
      ) : null}

      {completedGames.length === 0 ? (
        <div className="empty-state">
          <h2>Chưa tìm thấy game phù hợp</h2>
          <p>Thử nhập tên game, thể loại hoặc trạng thái bản dịch khác.</p>
        </div>
      ) : null}
    </main>
  );

  function pageHref(pageNumber: number) {
    const params = new URLSearchParams();

    if (keyword) params.set("q", keyword);
    if (activeCategory) params.set("category", activeCategory);
    if (activeStatus) params.set("status", activeStatus);
    if (activeDownloadable) params.set("downloadable", activeDownloadable);
    if (activeSort) params.set("sort", activeSort);
    if (pageNumber > 1) params.set("page", String(pageNumber));

    const query = params.toString();

    return `/games${query ? `?${query}` : ""}`;
  }
}

function paginationItems(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const normalizedPages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: Array<number | "..."> = [];

  normalizedPages.forEach((page, index) => {
    const previousPage = normalizedPages[index - 1];

    if (previousPage != null && page - previousPage > 1) {
      items.push("...");
    }

    items.push(page);
  });

  return items;
}
