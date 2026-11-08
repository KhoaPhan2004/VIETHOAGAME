<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Game;
use App\Support\SiteStatistics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteStatisticsController extends Controller
{
    public function show(SiteStatistics $statistics): JsonResponse
    {
        return response()->json($statistics->current())->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request, SiteStatistics $statistics): JsonResponse
    {
        $data = $request->validate([
            'visitor' => ['required', 'uuid'],
            'event' => ['nullable', 'uuid'],
            'path' => ['required', 'string', 'max:300'],
        ]);
        $path = $data['path'];
        $allowed = in_array($path, ['/', '/games', '/categories', '/in-progress', '/about', '/contact'], true);
        if (preg_match('#^/(games|categories)/([^/]+)$#', $path, $matches)) {
            $allowed = $matches[1] === 'games'
                ? Game::where('slug', rawurldecode($matches[2]))->exists()
                : Category::where('slug', rawurldecode($matches[2]))->exists();
        }
        abort_unless($allowed, 422);
        if (! preg_match('/bot|crawler|spider|headless|preview/i', $request->userAgent() ?? '')) {
            $statistics->record($data['visitor'], $data['event'] ?? null);
        }

        return $this->show($statistics);
    }
}
