import type { Game, InProgressGame } from "@/types/game";
import { gameProgress } from "@/lib/game-status";
import Link from "next/link";
import GameCardCoverImage from "@/components/GameCardCoverImage";

const translationStages = [
  "Khảo sát",
  "Dịch thuật",
  "Thử game",
  "Phát hành",
];

type InProgressGameCardData = Game & Partial<Pick<InProgressGame, "total_text_lines" | "translated_text_lines">>;

type InProgressGameCardProps = {
  game: InProgressGameCardData;
  variant?: "default" | "compact";
};

export default function InProgressGameCard({
  game,
  variant = "default",
}: InProgressGameCardProps) {
  const progress = Math.min(100, Math.max(0, gameProgress(game)));
  const currentStage = game.translation_stage ?? stageFromProgress(progress);
  const matchedStageIndex = translationStages.findIndex((stage) => stage === currentStage);
  const activeStageIndex = matchedStageIndex >= 0
    ? matchedStageIndex
    : translationStages.findIndex((stage) => stage === stageFromProgress(progress));
  const updateDate = game.last_progress_update ?? game.updated_at ?? game.created_at;
  const totalLines = game.total_text_lines ?? 0;
  const translatedLines = game.translated_text_lines ?? 0;

  if (variant === "compact") {
    return (
      <Link className="progress-game-link" href="/in-progress">
        <article className="progress-game-card progress-game-card-compact">
          <div className="progress-game-cover">
            {game.image ? (
              <GameCardCoverImage image={game.image} name={game.name} optimize sizes="(max-width: 560px) 100vw, 160px" />
            ) : (
              <span>{game.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="progress-game-content">
            <div className="progress-compact-heading">
              <h3>{game.name}</h3>
              <strong>{progress}%</strong>
            </div>

            <div className="progress-line" aria-label={`Tiến độ ${progress}%`}>
              <span style={{ width: `${progress}%` }} />
            </div>

            <span className="progress-stage-pill">{currentStage}</span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link className="progress-game-link" href="/in-progress">
      <article className="progress-game-card">
        <div className="progress-game-media">
          <div className="progress-game-cover">
            {game.image ? (
              <GameCardCoverImage image={game.image} name={game.name} optimize sizes="(max-width: 900px) 100vw, 400px" />
            ) : (
              <span>{game.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="progress-game-content">
          <div className="progress-game-heading">
            <h3>{game.name}</h3>
          </div>

          <div className="progress-line-row">
            <p className="progress-line-note">
              {formatNumber(translatedLines)}/{formatNumber(totalLines)} dòng
            </p>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-line" aria-label={`Tiến độ ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <ol className="stage-track">
            {translationStages.map((stage, index) => {
              const state =
                index < activeStageIndex
                  ? "done"
                  : index === activeStageIndex
                    ? "active"
                    : "locked";

              return (
                <li className={`stage-item ${state}`} key={stage}>
                  <span>{index + 1}</span>
                  <strong>{stage}</strong>
                </li>
              );
            })}
          </ol>
        </div>

        <span className="progress-game-date">Cập nhật {formatDate(updateDate)}</span>
      </article>
    </Link>
  );
}

function stageFromProgress(progress: number) {
  const index = Math.min(
    translationStages.length - 1,
    Math.floor((progress / 100) * translationStages.length),
  );

  return translationStages[index];
}

function formatDate(value: string | null) {
  if (!value) {
    return "chưa rõ";
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}
