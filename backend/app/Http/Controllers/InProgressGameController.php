<?php

namespace App\Http\Controllers;

use App\Models\InProgressGame;
use App\Support\AdminGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InProgressGameController extends Controller
{
    public function index(Request $request)
    {
        $this->pruneReleasedGames();

        $games = InProgressGame::query()
            ->when($request->query('q'), function ($query, string $keyword) {
                $query->where(function ($query) use ($keyword) {
                    $query
                        ->where('name', 'like', "%{$keyword}%")
                        ->orWhere('description', 'like', "%{$keyword}%")
                        ->orWhere('current_task', 'like', "%{$keyword}%");
                });
            })
            ->latest('updated_at')
            ->latest('created_at')
            ->get();

        return response()->json($games);
    }

    public function show(string $slug)
    {
        $this->pruneReleasedGames();

        return response()->json(InProgressGame::where('slug', $slug)->firstOrFail());
    }

    public function store(Request $request)
    {
        AdminGuard::authorize($request);

        $data = $this->validateGame($request);
        $game = InProgressGame::create($data);

        return response()->json($game, 201);
    }

    public function update(Request $request, InProgressGame $inProgressGame)
    {
        AdminGuard::authorize($request);

        $data = $this->validateGame($request, $inProgressGame);
        $inProgressGame->update($data);

        return response()->json($inProgressGame);
    }

    public function markReleased(Request $request, InProgressGame $inProgressGame)
    {
        AdminGuard::authorize($request);

        $inProgressGame->update([
            'translation_stage' => 'Phát hành',
            'translated_text_lines' => max($inProgressGame->translated_text_lines, $inProgressGame->total_text_lines),
            'last_progress_update' => now()->toDateString(),
            'released_at' => now(),
        ]);

        return response()->json($inProgressGame);
    }

    public function destroy(Request $request, InProgressGame $inProgressGame)
    {
        AdminGuard::authorize($request);
        $inProgressGame->delete();

        return response()->noContent();
    }

    private function validateGame(Request $request, ?InProgressGame $game = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'background_image' => ['nullable', 'string', 'max:255'],
            'total_text_lines' => ['required', 'integer', 'min:0'],
            'translated_text_lines' => ['required', 'integer', 'min:0'],
            'translation_stage' => ['required', 'string', Rule::in(InProgressGame::STAGES)],
            'current_task' => ['nullable', 'string', 'max:255'],
            'last_progress_update' => ['nullable', 'date'],
        ]);

        $data['translated_text_lines'] = min($data['translated_text_lines'], $data['total_text_lines']);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $game);
        $data['last_progress_update'] = $data['last_progress_update'] ?? now()->toDateString();

        if ($data['translation_stage'] !== 'Phát hành') {
            $data['released_at'] = null;
        } elseif (!$game?->released_at) {
            $data['released_at'] = now();
        }

        return $data;
    }

    private function uniqueSlug(string $value, ?InProgressGame $game = null): string
    {
        $baseSlug = Str::slug($value) ?: 'game-dang-viet-hoa';
        $slug = $baseSlug;
        $counter = 2;

        while (
            InProgressGame::where('slug', $slug)
                ->when($game, fn ($query) => $query->where('id', '!=', $game->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function pruneReleasedGames(): void
    {
        InProgressGame::where('translation_stage', 'Phát hành')
            ->whereNotNull('released_at')
            ->where('released_at', '<=', now()->subDays(3))
            ->delete();
    }
}
