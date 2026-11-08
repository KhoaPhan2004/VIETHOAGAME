import type { Category } from "./category";

export type Game = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  background_image: string | null;
  gallery_images: string[] | null;
  version: string | null;
  category: string | null;
  categories?: Category[];
  status: string | null;
  file_size: string | null;
  download_count?: number | null;
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

export type InProgressGame = Game & {
  total_text_lines: number;
  translated_text_lines: number;
  current_task: string | null;
  released_at: string | null;
};

export type GameCardData = Pick<Game, "id" | "name" | "slug" | "image" | "version" | "download_count" | "updated_at" | "created_at">;
export type RandomGameData = Pick<Game, "id" | "name" | "slug" | "description" | "image" | "background_image" | "version" | "updated_at" | "created_at" | "preview_video_url">;
