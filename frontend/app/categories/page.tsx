import PageBreadcrumb from "@/components/PageBreadcrumb";
import { getCategories } from "@/lib/categories";
import { getGames } from "@/lib/games";
import { hasCategory } from "@/lib/game-categories";
import Link from "next/link";

export default async function CategoriesPage() {
  const [categories, games] = await Promise.all([
    getCategories(),
    getGames(),
  ]);

  return (
    <main className="page-shell">
      <PageBreadcrumb items={[{ label: "Thể loại" }]} />
      <section className="page-heading">
        <p className="eyebrow">Khám phá theo thể loại</p>
        <h1 className="page-title-compact">Thể loại game</h1>
        <p>
          Chọn thể loại để xem nhanh các bản Việt hóa phù hợp với kiểu game bạn
          muốn chơi.
        </p>
      </section>

      <div className="category-grid">
        {categories.map((category) => {
          const totalGames = games.filter((game) => hasCategory(game, category.name)).length;
          const completedGames = games.filter(
            (game) => hasCategory(game, category.name) && game.status === "Hoàn thành",
          ).length;

          return (
            <Link
              className="category-card"
              href={`/categories/${category.slug}`}
              key={category.id}
            >
              <span>{totalGames} game · {completedGames} hoàn thành</span>
              <h3>{category.name}</h3>
              <p>{category.description ?? "Các bản Việt hóa thuộc thể loại này."}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
