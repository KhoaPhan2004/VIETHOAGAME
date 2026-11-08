import type { Game } from "@/types/game";

export function categoryNames(game: Game) {
  return game.categories && game.categories.length > 0
    ? game.categories.map((category) => category.name)
    : game.category
      ? game.category.split(",").map((category) => category.trim()).filter(Boolean)
      : [];
}

export function categoryLabel(game: Game) {
  const names = categoryNames(game);

  return names.length > 0 ? names.join(", ") : "Chưa phân loại";
}

export function hasCategory(game: Game, category: string) {
  return categoryNames(game).includes(category);
}
