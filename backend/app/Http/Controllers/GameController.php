<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Support\AdminGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class GameController extends Controller
{
    public function index(Request $request)
    {
        $games = Game::with('categories')
            ->when($request->query('q'), function ($query, string $keyword) {
                $query->where(function ($query) use ($keyword) {
                    $query
                        ->where('name', 'like', "%{$keyword}%")
                        ->orWhere('description', 'like', "%{$keyword}%")
                        ->orWhereHas('categories', function ($query) use ($keyword) {
                            $query->where('name', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->query('category'), function ($query, string $category) {
                $query->whereHas('categories', function ($query) use ($category) {
                    $query
                        ->where('name', $category)
                        ->orWhere('slug', $category);
                });
            })
            ->when($request->query('status'), function ($query, string $status) {
                $query->where('status', $status);
            })
            ->when($request->query('downloadable'), function ($query, string $downloadable) {
                $query->where('is_downloadable', filter_var($downloadable, FILTER_VALIDATE_BOOL));
            })
            ->when($request->query('sort') === 'downloads', fn ($query) => $query->orderByDesc('download_count'))
            ->when($request->query('sort') === 'name', function ($query) {
                $query->orderBy('name');
            }, function ($query) {
                $query->latest('updated_at')->latest('created_at');
            })
            ->get();

        return response()->json($games);
    }

    public function show(string $slug)
    {
        $game = Game::with('categories')->where('slug', $slug)->firstOrFail();

        return response()->json($game);
    }

    public function store(Request $request)
    {
        AdminGuard::authorize($request);

        [$data, $categoryIds] = $this->validateGame($request);

        $game = Game::create($data);
        $game->categories()->sync($categoryIds);

        return response()->json($game->load('categories'), 201);
    }

    public function update(Request $request, Game $game)
    {
        AdminGuard::authorize($request);

        [$data, $categoryIds] = $this->validateGame($request, $game);

        $game->update($data);
        $game->categories()->sync($categoryIds);

        return response()->json($game->load('categories'));
    }

    public function destroy(Request $request, Game $game)
    {
        AdminGuard::authorize($request);
        $game->delete();

        return response()->noContent();
    }

    private function validateGame(Request $request, ?Game $game = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'background_image' => ['nullable', 'string', 'max:255'],
            'gallery_images' => ['nullable', 'array'],
            'gallery_images.*' => ['string', 'max:255'],
            'version' => ['nullable', 'string', 'max:255'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'status' => ['required', 'string', Rule::in(['Hoàn thành', 'Đang cập nhật'])],
            'file_size' => ['nullable', 'string', 'max:255'],
            'download_count' => ['nullable', 'integer', 'min:0'],
            'download_url' => ['nullable', 'url', 'max:255'],
            'is_downloadable' => ['boolean'],
            'translation_progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'translation_stage' => ['nullable', 'string', 'max:255'],
            'expected_release_at' => ['nullable', 'date'],
            'last_progress_update' => ['nullable', 'date'],
            'video_url' => ['nullable', 'url:http,https', 'max:2048'],
            'preview_video_url' => ['nullable', 'url:http,https', 'max:2048'],
            'installation_guide' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
        ]);

        $data['is_downloadable'] = $data['is_downloadable'] ?? true;
        $data['download_count'] = $data['download_count'] ?? ($game?->download_count ?? 0);
        $data['translation_progress'] = $data['translation_progress'] ?? ($data['is_downloadable'] ? 100 : 0);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $game);

        if ($data['translation_progress'] < 100) {
            $data['is_downloadable'] = false;
        } else {
            $data['translation_stage'] = 'Hoàn thành';
        }

        $data['published_at'] = $data['published_at'] ?? now()->toDateString();

        $categoryIds = $data['category_ids'] ?? [];
        unset($data['category_ids']);

        return [$data, $categoryIds];
    }

    private function uniqueSlug(string $value, ?Game $game = null): string
    {
        $baseSlug = Str::slug($value) ?: 'game';
        $slug = $baseSlug;
        $counter = 2;

        while (
            Game::where('slug', $slug)
                ->when($game, fn ($query) => $query->where('id', '!=', $game->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
