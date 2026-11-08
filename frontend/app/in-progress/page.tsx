import PageBreadcrumb from "@/components/PageBreadcrumb";
import "./progress.css";
import ProgressSidebar from "@/components/ProgressSidebar";
import { getGames } from "@/lib/games";
import { isGameInProgress } from "@/lib/game-status";
import InProgressGameCard from "@/components/InProgressGameCard";
import { getInProgressGames } from "@/lib/in-progress-games";

export default async function InProgressPage() {
  const [games, publishedGames] = await Promise.all([getInProgressGames(), getGames()]);
  const completedCount = publishedGames.filter((game) => !isGameInProgress(game)).length;

  return (
    <main className="page-shell">
      <PageBreadcrumb items={[{ label: "Tiến độ" }]} />
      <section className="page-heading">
        <p className="eyebrow">Theo dõi tiến độ</p>
        <h1 className="page-title-compact">Game đang được Việt hóa</h1>
        <p>
          Những game chưa thể tải ngay nhưng đang được dịch, chỉnh sửa hoặc kiểm
          tra chất lượng. Bạn có thể xem tiến độ, giai đoạn hiện tại và dự kiến
          cập nhật.
        </p>
      </section>

      <div className="progress-page-layout">
        {games.length > 0 ? (
          <div className="progress-game-list">
            {games.map((game) => (
              <div className="progress-project" id={`project-${game.id}`} key={game.id}>
                <InProgressGameCard game={game} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Chưa có game đang Việt hóa</h2>
            <p>Khi admin thêm game vào bảng đang Việt hóa, game sẽ hiện ở đây.</p>
          </div>
        )}
        <ProgressSidebar games={games} completedCount={completedCount} />
      </div>
    </main>
  );
}
