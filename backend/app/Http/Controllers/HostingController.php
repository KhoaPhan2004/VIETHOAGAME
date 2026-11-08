<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Game;
use App\Support\HostingMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\View\View;

class HostingController extends Controller
{
    public function page(Request $request): View|JsonResponse
    {
        $path = '/'.trim($request->path(), '/');
        $title = match ($path) {
            '/' => 'TKPkpin | Game Việt Hóa', '/games' => 'Game đã Việt hóa | TKPkpin',
            '/categories' => 'Thể loại game | TKPkpin', '/in-progress' => 'Tiến độ Việt hóa | TKPkpin',
            '/about' => 'Giới thiệu | TKPkpin', '/contact' => 'Liên hệ | TKPkpin',
            default => 'Quản trị | TKPkpin',
        };
        $description = 'Kho game Việt hóa miễn phí, hướng dẫn cài đặt và cập nhật tiến độ từ TKPkpin.';
        $currentGame = null;
        if (preg_match('#^/games/([^/]+)$#', $path, $matches)) {
            $currentGame = Game::with('categories')->where('slug', $matches[1])->firstOrFail();
            $title = $currentGame->name.' | TKPkpin';
            $description = mb_substr(strip_tags($currentGame->description ?? 'Bản Việt hóa '.$currentGame->name), 0, 160);
        }
        if (preg_match('#^/categories/([^/]+)$#', $path, $matches)) {
            $category = Category::where('slug', $matches[1])->firstOrFail();
            $title = $category->name.' | TKPkpin';
        }
        $private = $request->attributes->get('portal', false);
        $games = Game::with('categories')->latest('updated_at')->latest('created_at')->get();
        $payload = HostingMedia::normalize([
            'path' => $path, 'title' => $title, 'description' => $description, 'csrf' => csrf_token(),
            'games' => $games->toArray(),
            'progress' => app(InProgressGameController::class)->index($request)->getData(true),
            'categories' => Category::orderBy('name')->get()->toArray(),
            'videos' => in_array($path, ['/', '/about'], true) ? $this->videos() : [],
        ]);
        if ($private) {
            $payload['adminBase'] = config('admin.path');
            $payload['authenticated'] = $request->attributes->get('portal_authenticated', false);
        }
        if ($request->expectsJson()) {
            return response()->json($payload)->header('Cache-Control', 'private, no-store');
        }
        $manifest = json_decode(file_get_contents(public_path('assets/site-manifest.json')), true, flags: JSON_THROW_ON_ERROR);

        return view('hosting', compact('payload', 'manifest', 'games', 'currentGame', 'private'));
    }

    private function videos(): array
    {
        return Cache::remember('tkpkpin-youtube-feed', 3600, function (): array {
            try {
                $response = Http::timeout(3)->get('https://www.youtube.com/feeds/videos.xml', ['channel_id' => 'UCJVSZjAHnHiqS_q9LZ5ZK8Q']);
                if (! $response->successful()) {
                    return [];
                }
                $xml = @simplexml_load_string($response->body(), 'SimpleXMLElement', LIBXML_NONET);
                if (! $xml) {
                    return [];
                }
                $videos = [];
                foreach ($xml->entry as $entry) {
                    $id = (string) $entry->children('http://www.youtube.com/xml/schemas/2015')->videoId;
                    if (! preg_match('/^[a-zA-Z0-9_-]{11}$/', $id)) {
                        continue;
                    }
                    $videos[] = ['id' => $id, 'title' => (string) $entry->title, 'url' => 'https://www.youtube.com/watch?v='.$id, 'thumbnail' => 'https://i.ytimg.com/vi/'.$id.'/hqdefault.jpg'];
                }

                return $videos;
            } catch (\Throwable) {
                return [];
            }
        });
    }
}
