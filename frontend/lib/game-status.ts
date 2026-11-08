import type { Game } from "@/types/game";

export function gameProgress(game: Game) {
  return game.translation_progress ?? (game.is_downloadable ? 100 : 0);
}

export function isGameInProgress(game: Game) {
  return game.status === "Đang Việt hóa" || game.is_downloadable === false || gameProgress(game) < 100;
}
