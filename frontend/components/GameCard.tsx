import type { GameCardData } from "@/types/game";
import GameCardCoverImage from "@/components/GameCardCoverImage";
import Link from "next/link";

export default function GameCard({ game }: { game: GameCardData }) {
  const updatedDate = formatDate(game.updated_at ?? game.created_at);
  const labels = cardLabels(game);

  return (
    <Link className="game-card-link" href={`/games/${game.slug}`}>
      <article className="game-card">
      <div className="game-card-cover">
        <GameCardCoverImage image={game.image} name={game.name} optimize />

        {labels.length > 0 ? (
          <div className="game-card-badges">
            {labels.map((label) => (
              <span className={`game-badge ${label === "Hot" ? "hot-badge" : ""}`} key={label}>
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="game-card-content">
        <h3>{game.name}</h3>

        <div className="game-card-footer">
          <span>
            Bản {game.version ?? "đang cập nhật"} · {updatedDate ?? "chưa rõ ngày"}
          </span>
        </div>
      </div>
    </article>
    </Link>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function cardLabels(game: GameCardData) {
  const labels: string[] = [];
  const downloadCount = game.download_count ?? 0;
  const dateValue = game.updated_at ?? game.created_at;
  const updatedTime = dateValue ? new Date(dateValue).getTime() : 0;
  const isNew = updatedTime > 0 && Date.now() - updatedTime <= 1000 * 60 * 60 * 24 * 14;

  if (downloadCount >= 21) {
    labels.push("Hot");
  }

  if (isNew) {
    labels.push("Mới");
  }

  return labels;
}
