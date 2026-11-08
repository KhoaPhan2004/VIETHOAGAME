<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GameDownloadController extends Controller
{
    public function store(Request $request, string $slug): RedirectResponse
    {
        $game = Game::where('slug', $slug)->firstOrFail();
        $url = $game->download_url;
        abort_unless($game->is_downloadable !== false && ($game->translation_progress ?? 100) >= 100, 404);
        abort_unless(is_string($url) && filter_var($url, FILTER_VALIDATE_URL) && in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true), 404);

        $key = 'game-download:'.hash_hmac('sha256', $request->session()->getId().':'.$game->id, config('app.key'));
        if (! preg_match('/bot|crawler|spider|headless|preview/i', $request->userAgent() ?? '') && Cache::add($key, true, 60)) {
            try {
                DB::table('games')->where('id', $game->id)->increment('download_count');
            } catch (\Throwable $exception) {
                Cache::forget($key);
                throw $exception;
            }
        }

        return redirect()->away($url, 303)->header('Cache-Control', 'private, no-store');
    }
}
