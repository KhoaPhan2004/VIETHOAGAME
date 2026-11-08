import { StatisticValue } from "@/components/SiteStatistics";
import { adminHref } from "@/lib/admin-path";
import { publicMediaUrl } from "@/lib/public-media";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminGameForm from "@/components/AdminGameForm";
import AdminInProgressGameForm from "@/components/AdminInProgressGameForm";
import AdminToast from "@/components/AdminToast";
import AdminDialog from "@/components/AdminDialog";
import AdminDeletePopover from "@/components/AdminDeletePopover";
import AdminSnow from "@/components/AdminSnow";
import AdminSortSelect from "@/components/AdminSortSelect";
import { parseAdminSort, sortAdminGames, type AdminSort } from "@/lib/admin-sort";
import AdminPagination from "@/components/AdminPagination";
import { ADMIN_PAGE_SIZE, getAdminPagination } from "@/lib/admin-pagination";
import "./admin.css";
import { isAdminAuthenticated } from "@/lib/admin-auth";

import AdminMutationForm from "@/components/AdminMutationForm";
import { adminMutationUrl, type AdminListContext } from "@/lib/admin-mutation-url";

import { getAdminGames, getAdminInProgressGames, getCategories } from "@/lib/admin-data";

type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type AdminGame = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  background_image: string | null;
  gallery_images: string[] | null;
  version: string | null;
  category: string | null;
  categories?: AdminCategory[];
  status: string | null;
  file_size: string | null;
  download_count: number | null;
  download_url: string | null;
  is_downloadable: boolean | null;
  translation_progress: number | null;
  translation_stage: string | null;
  expected_release_at: string | null;
  last_progress_update: string | null;
  video_url?: string | null;
  preview_video_url?: string | null;
  installation_guide: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AdminInProgressGame = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  background_image: string | null;
  total_text_lines: number;
  translated_text_lines: number;
  translation_progress: number | null;
  translation_stage: string | null;
  current_task: string | null;
  last_progress_update: string | null;
  released_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  if (!(await isAdminAuthenticated())) {
    redirect(adminHref("/login"));
  }

  const params = await searchParams;
  const activeTab = paramValue(params.tab) ?? "games";
  const noticeKey = paramValue(params.notice);
  const doneKeyword = paramValue(params.done_q);
  const progressKeyword = paramValue(params.progress_q);
  const page = paramValue(params.page);
  const sort = parseAdminSort(paramValue(params.sort));
  const releaseId = Number(paramValue(params.release_id) ?? 0);

  const [games, inProgressGames, categories] = await Promise.all([
    getAdminGames(),
    getAdminInProgressGames(),
    getCategories(),
  ]);
  const releaseSource = inProgressGames.find((game) => game.id === releaseId);
  const filteredGames = sortAdminGames(filterGames(games, doneKeyword), sort);
  const progressSort = sort === "downloads" ? "name" : sort;
  const filteredInProgressGames = sortAdminGames(filterInProgressGames(inProgressGames, progressKeyword), progressSort);
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base", numeric: true }));

  return (
    <main className="admin-shell">
      <AdminSnow />
      <AdminToast key={noticeKey ?? "empty"} message={noticeMessage(noticeKey)} />

      <section className="admin-heading">
        <div><p className="eyebrow">TKPkpin / Quản trị</p><h1>Thống kê</h1></div>
        <AdminMutationForm action={adminMutationUrl("logout")}><button className="button button-secondary admin-logout" type="submit">Đăng xuất admin</button></AdminMutationForm>
      </section>
      <section className="dashboard-grid" aria-label="Thống kê website">
        <article><span>Game đã Việt hóa</span><strong>{games.length}</strong><small>Bản Việt hóa đã đăng</small></article>
        <article><span>Game đang Việt hóa</span><strong>{inProgressGames.length}</strong><small>Dự án đang theo dõi</small></article>
        <article><span>Đang online</span><strong><StatisticValue field="online" /></strong><small>Khách hoạt động trong 2 phút gần nhất</small></article>
        <article><span>Tổng lượt xem website</span><strong><StatisticValue field="page_views" /></strong><small>Tổng số lần mở trang từ khi bật thống kê</small></article>
      </section>

      <nav className="admin-tabs" aria-label="Quản lý admin">
        <AdminTab href={adminHref("?tab=games")} active={activeTab === "games"} label="Game đã VH" />
        <AdminTab href={adminHref("?tab=in-progress")} active={activeTab === "in-progress"} label="Game đang Việt hóa" />
        <AdminTab href={adminHref("?tab=categories")} active={activeTab === "categories"} label="Loại game" />
      </nav>

      {activeTab === "in-progress" ? (
        <InProgressAdminSection sort={progressSort} key={noticeKey ?? "in-progress"} page={page}
          games={filteredInProgressGames}
          keyword={progressKeyword}
          totalGames={inProgressGames.length}
        />
      ) : null}

      {activeTab === "categories" ? <CategoriesAdminSection page={page} key={noticeKey ?? "categories"} categories={sortedCategories} /> : null}

      {activeTab !== "in-progress" && activeTab !== "categories" ? (
        <GamesAdminSection sort={sort} page={page} key={`${noticeKey ?? "games"}-${releaseId}`}
          categories={categories}
          games={filteredGames}
          keyword={doneKeyword}
          releaseSource={releaseSource}
        />
      ) : null}
    </main>
  );
}

function GamesAdminSection({ categories, games, keyword, releaseSource, page, sort }: {
  categories: AdminCategory[]; games: AdminGame[]; keyword?: string; releaseSource?: AdminInProgressGame; page?: string; sort: AdminSort;
}) {
  const { offset, page: currentPage } = getAdminPagination(games.length, page);
  return <section className="admin-panel" id="admin-list">
    <div className="admin-section-heading">
      <AdminDialog title={releaseSource ? `Tạo bản phát hành: ${releaseSource.name}` : "Thêm game đã Việt hóa"} trigger="+ Thêm game" defaultOpen={Boolean(releaseSource)}>
        {releaseSource ? <p className="admin-empty-note">Dữ liệu đã lấy từ game đang Việt hóa. Khi lưu thành công, dự án sẽ chuyển sang giai đoạn Phát hành.</p> : null}
        <AdminGameForm action={adminMutationUrl("create-game")} categories={categories} releaseSource={releaseSource ? gameFromInProgress(releaseSource) : undefined} releaseSourceId={releaseSource?.id} />
      </AdminDialog>
      <div className="admin-list-tools"><AdminSortSelect value={sort} /><AdminSearchForm sort={sort} inputName="done_q" placeholder="Tìm game đã Việt hóa..." tab="games" value={keyword} /></div>
    </div>
    <h2 className="admin-list-heading">Game đã Việt hóa <span>{games.length} game</span></h2>
    <div className="admin-table">{games.slice(offset, offset + ADMIN_PAGE_SIZE).map((game) => <AdminGameRow categories={categories} game={game} context={{ page: currentPage, keyword, sort }} key={game.id} />)}</div>
    {!games.length ? <p className="admin-empty-note">Không tìm thấy game đã Việt hóa phù hợp.</p> : null}
    <AdminPagination total={games.length} page={page} tab="games" sort={sort} keyword={keyword} inputName="done_q" />
  </section>;
}

function InProgressAdminSection({ games, keyword, totalGames, page, sort }: { sort: AdminSort; games: AdminInProgressGame[]; keyword?: string; totalGames: number; page?: string }) {
  const { offset, page: currentPage } = getAdminPagination(games.length, page);
  return <section className="admin-panel" id="admin-list">
    <div className="admin-section-heading">
      <AdminDialog title="Thêm game đang Việt hóa" trigger="+ Thêm game"><AdminInProgressGameForm action={adminMutationUrl("create-progress")} /></AdminDialog>
      <div className="admin-list-tools"><AdminSortSelect value={sort} downloads={false} /><AdminSearchForm sort={sort} inputName="progress_q" placeholder="Tìm game đang Việt hóa..." tab="in-progress" value={keyword} /></div>
    </div>
    <h2 className="admin-list-heading">Game đang Việt hóa <span>{games.length} / {totalGames} game</span></h2>
    <div className="admin-table">{games.slice(offset, offset + ADMIN_PAGE_SIZE).map((game) => <AdminInProgressGameRow game={game} context={{ page: currentPage, keyword, sort }} key={game.id} />)}</div>
    {!games.length ? <p className="admin-empty-note">Không tìm thấy game đang Việt hóa phù hợp.</p> : null}
    <AdminPagination total={games.length} page={page} tab="in-progress" sort={sort} keyword={keyword} inputName="progress_q" />
  </section>;
}

function CategoriesAdminSection({ categories, page }: { categories: AdminCategory[]; page?: string }) {
  const { offset, page: currentPage } = getAdminPagination(categories.length, page);
  return <section className="admin-panel" id="admin-list">
    <div className="admin-section-heading"><AdminDialog title="Thêm thể loại" trigger="+ Thêm thể loại" compact><CategoryForm action={adminMutationUrl("create-category")} /></AdminDialog><span className="admin-row-muted">{categories.length} thể loại</span></div>
    <h2 className="admin-list-heading">Thể loại game</h2>
    <div className="admin-table">{categories.slice(offset, offset + ADMIN_PAGE_SIZE).map((category) => <article className="admin-item admin-category-item" key={category.id}>
      <div className="admin-row-main"><h3 className="admin-row-title">{category.name}</h3><span className="admin-row-muted">/{category.slug}</span>{category.description ? <p>{category.description}</p> : null}</div>
      <div className="admin-item-actions">
        <AdminDialog title={`Sửa thể loại: ${category.name}`} trigger="Sửa" compact><CategoryForm action={adminMutationUrl("update-category", category.id, { page: currentPage })} category={category} /></AdminDialog>
        <DeleteConfirmation name={category.name} action={adminMutationUrl("delete-category", category.id, { page: currentPage })} />
      </div>
    </article>)}</div>
    {!categories.length ? <p className="admin-empty-note">Chưa có thể loại.</p> : null}
    <AdminPagination total={categories.length} page={page} tab="categories" />
  </section>;
}

function AdminTab({ active, href, label }: { active: boolean; href: string; label: string }) {
  return <Link className={`admin-tab ${active ? "active" : ""}`} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
}

function AdminSearchForm({ inputName, placeholder, tab, value, sort }: { inputName: string; placeholder: string; tab: string; value?: string; sort: AdminSort }) {
  return <form action={adminHref()} className="admin-search-form"><input name="tab" type="hidden" value={tab} /><input name="sort" type="hidden" value={sort} /><input aria-label={placeholder} name={inputName} defaultValue={value ?? ""} placeholder={placeholder} type="search" /><button className="button button-secondary" type="submit">Tìm</button></form>;
}

function AdminGameRow({ categories, game, context }: { categories: AdminCategory[]; game: AdminGame; context: AdminListContext }) {
  return <article className="admin-item">
    <AdminThumb image={game.image} name={game.name} />
    <div className="admin-row-main"><h3 className="admin-row-title">{game.name}</h3><span className="admin-row-muted">Bản {game.version ?? "chưa rõ"} · Cập nhật {formatDate(game.updated_at ?? game.created_at)}</span><span className="admin-row-category">{categoryLabel(game)} · {game.download_count ?? 0} lượt tải</span></div>
    <div className="admin-item-actions">
      <AdminDialog title={`Sửa game: ${game.name}`} trigger="Sửa"><AdminGameForm action={adminMutationUrl("update-game", game.id, context)} categories={categories} game={game} /></AdminDialog>
      <DeleteConfirmation name={game.name} action={adminMutationUrl("delete-game", game.id, context)} />
    </div>
  </article>;
}

function AdminInProgressGameRow({ game, context }: { game: AdminInProgressGame; context: AdminListContext }) {
  return <article className="admin-item">
    <AdminThumb image={game.image} name={game.name} />
    <div className="admin-row-main"><h3 className="admin-row-title">{game.name}</h3><span className="admin-row-muted">{game.translation_stage ?? "Khảo sát"} · {game.translated_text_lines}/{game.total_text_lines} dòng · {game.translation_progress ?? 0}%</span><span className="admin-row-category">Cập nhật {formatDate(game.last_progress_update)}</span></div>
    <div className="admin-item-actions">
      <AdminDialog title={`Sửa dự án: ${game.name}`} trigger="Sửa">
        {game.translation_stage === "Phát hành" ? <p className="admin-empty-note">Đã phát hành {formatDate(game.released_at)}. Dữ liệu này sẽ tự xóa sau 3 ngày.</p> : <Link className="button button-secondary" href={adminHref("?tab=games&release_id=" + game.id)}>Tạo game phát hành</Link>}
        <AdminInProgressGameForm action={adminMutationUrl("update-progress", game.id, context)} game={game} />
      </AdminDialog>
      <DeleteConfirmation name={game.name} action={adminMutationUrl("delete-progress", game.id, context)} />
    </div>
  </article>;
}

function DeleteConfirmation({ name, action }: { name: string; action: string }) {
  return <AdminDeletePopover name={name} action={action} />;
}


function AdminThumb({ image, name }: { image: string | null; name: string }) {
  return (
    <span className="admin-row-thumb">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={publicMediaUrl(image)} alt={name} />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}

function CategoryForm({
  action,
  category,
}: {
  action: string;
  category?: AdminCategory;
}) {
  return (
    <AdminMutationForm action={action} className="admin-form">
      <label>
        Tên thể loại
        <input name="name" required defaultValue={category?.name ?? ""} />
      </label>

      <label>
        Mô tả
        <textarea name="description" rows={2} defaultValue={category?.description ?? ""} />
      </label>

      <button className="button button-primary" type="submit">
        Lưu
      </button>
    </AdminMutationForm>
  );
}

function gameFromInProgress(game: AdminInProgressGame): Partial<AdminGame> {
  return {
    name: game.name,
    slug: game.slug,
    description: game.description,
    image: game.image,
    background_image: game.background_image,
    gallery_images: [],
    version: "",
    category: null,
    categories: [],
    status: "Hoàn thành",
    file_size: "",
    download_count: 0,
    download_url: "",
    is_downloadable: true,
    translation_progress: 100,
    translation_stage: "Hoàn thành",
    installation_guide: "",
  };
}

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa rõ";
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function filterGames(games: AdminGame[], keyword?: string) {
  const normalizedKeyword = keyword?.trim().toLowerCase();

  if (!normalizedKeyword) {
    return games;
  }

  return games.filter((game) =>
    [game.name, game.slug, categoryLabel(game), game.version]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedKeyword)),
  );
}

function filterInProgressGames(games: AdminInProgressGame[], keyword?: string) {
  const normalizedKeyword = keyword?.trim().toLowerCase();

  if (!normalizedKeyword) {
    return games;
  }

  return games.filter((game) =>
    [game.name, game.slug, game.translation_stage]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedKeyword)),
  );
}

function noticeMessage(notice?: string) {
  const messages: Record<string, string> = {
    "category-created": "Tạo thể loại thành công.",
    "category-deleted": "Xóa thể loại thành công.",
    "category-updated": "Sửa thể loại thành công.",
    "game-created": "Tạo game thành công.",
    "game-deleted": "Xóa game thành công.",
    "game-updated": "Sửa game thành công.",
    "in-progress-created": "Tạo game đang Việt hóa thành công.",
    "in-progress-deleted": "Xóa game đang Việt hóa thành công.",
    "in-progress-updated": "Sửa game đang Việt hóa thành công.",
  };

  return notice ? messages[notice] ?? null : null;
}

function categoryLabel(game: AdminGame) {
  return game.categories && game.categories.length > 0
    ? game.categories.map((category) => category.name).join(", ")
    : "Chưa phân loại";
}

