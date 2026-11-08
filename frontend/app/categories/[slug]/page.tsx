import PageBreadcrumb from "@/components/PageBreadcrumb";
import GameCard from "@/components/GameCard";
import { getCategoryWithGames } from "@/lib/categories";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryDetailPage({
  params,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const result = await getCategoryWithGames(slug);
  if (!result) notFound();
  const { category, games } = result;

  return (
    <main className="page-shell">
      <PageBreadcrumb items={[{ label: "Thể loại", href: "/categories" }, { label: category.name }]} />
      <section className="page-heading">
        <p className="eyebrow">Thể loại</p>
        <h1 className="page-title-compact">{category.name}</h1>
        <p>{category.description ?? "Các bản Việt hóa thuộc thể loại này."}</p>
      </section>

      <div className="category-stats">
        <div>
          <span>Tổng game</span>
          <strong>{games.length}</strong>
        </div>
        <div>
          <span>Hoàn thành</span>
          <strong>{games.length}</strong>
        </div>
        <Link href={`/games?category=${encodeURIComponent(category.name)}`}>
          Lọc trong thư viện
        </Link>
      </div>

      {games.length > 0 ? (
        <section className="content-section">
          <h2>Game đã Việt hóa</h2>
          <div className="game-grid">
            {games.map((game) => (
              <GameCard game={game} key={game.id} />
            ))}
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <h2>Chưa có game trong thể loại này</h2>
          <p>Vào admin để gán game vào thể loại này, rồi trang sẽ tự cập nhật.</p>
        </div>
      )}
    </main>
  );
}
