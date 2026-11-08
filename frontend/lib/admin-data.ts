import { API_BASE_URL, normalizeMedia } from './api-config';
import type { Game, InProgressGame } from '@/types/game';
import type { Category } from '@/types/category';
async function read<T>(path: string): Promise<T> {
 const response = await fetch(API_BASE_URL + path, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
 if (!response.ok) throw new Error('Không tải được dữ liệu quản trị.');
 return normalizeMedia(await response.json() as T);
}
export function getAdminGames() { return read<Game[]>('/games').then(games => games.map(game => ({ ...game, download_count: game.download_count ?? 0 }))); }
export function getAdminInProgressGames() { return read<InProgressGame[]>('/in-progress-games'); }
export function getCategories() { return read<Category[]>('/categories'); }
