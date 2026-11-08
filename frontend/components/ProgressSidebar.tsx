import GameCardCoverImage from "@/components/GameCardCoverImage";
import { gameProgress } from "@/lib/game-status";
import type { InProgressGame } from "@/types/game";

const stages = [
  { name: "Khảo sát", description: "Kiểm tra cấu trúc game và khả năng Việt hóa." },
  { name: "Dịch thuật", description: "Dịch hội thoại, giao diện và nội dung game." },
  { name: "Thử game", description: "Chơi thử, rà soát câu chữ và sửa lỗi hiển thị." },
  { name: "Phát hành", description: "Đóng gói bản dịch và hướng dẫn cài đặt." },
];

function progressOf(game: InProgressGame) {
  return Math.min(100, Math.max(0, gameProgress(game)));
}

function stageOf(game: InProgressGame) {
  return game.translation_stage ?? stages[Math.min(3, Math.floor(progressOf(game) / 25))].name;
}

export default function ProgressSidebar({ games, completedCount }: {
  games: InProgressGame[];
  completedCount: number;
}) {
  const leaders = [...games].sort((a, b) => progressOf(b) - progressOf(a) || a.id - b.id).slice(0, 3);
  const statistics = [
    { label: "Đang theo dõi", value: games.length },
    { label: "Đang dịch", value: games.filter((game) => stageOf(game) === "Dịch thuật").length },
    { label: "Đang thử game", value: games.filter((game) => stageOf(game) === "Thử game").length },
    { label: "Đã Việt hóa", value: completedCount },
  ];

  return (
    <aside className="progress-sidebar" aria-label="Tổng quan tiến độ Việt hóa">
      <section className="progress-side-panel progress-overview">
        <p className="progress-side-eyebrow">TKPkpin · Việt hóa game</p>
        <h2>Tổng quan dự án</h2>
        <dl className="progress-stat-grid">
          {statistics.map(({ label, value }) => (
            <div key={label}><dt>{label}</dt><dd>{value.toLocaleString("vi-VN")}</dd></div>
          ))}
        </dl>
      </section>

      <section className="progress-side-panel progress-highlights">
        <h2>Tiến độ dẫn đầu</h2>
        <p className="progress-side-intro">Các dự án có tiến độ cao nhất.</p>
        {leaders.length > 0 ? (
          <ol className="progress-leaders">
            {leaders.map((game) => (
              <li key={game.id}>
                <a href={`#project-${game.id}`} aria-label={`Xem tiến độ ${game.name}`}>
                  <div className="progress-leader-cover"><GameCardCoverImage image={game.image} name={game.name} /></div>
                  <div className="progress-leader-content">
                    <h3>{game.name}</h3>
                    <div className="progress-leader-meta"><span>{stageOf(game)}</span><strong>{progressOf(game)}%</strong></div>
                    <div className="progress-leader-bar" aria-hidden="true"><span style={{ width: `${progressOf(game)}%` }} /></div>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        ) : <p className="progress-side-intro">Chưa có dự án đang thực hiện.</p>}
      </section>

      <section className="progress-side-panel progress-stage-guide">
        <h2>Hành trình Việt hóa</h2>
        <ol className="progress-guide-list">
          {stages.map((stage, index) => (
            <li key={stage.name}><span className="progress-guide-number">{index + 1}</span><div><h3>{stage.name}</h3><p>{stage.description}</p></div></li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
