<?php

use App\Http\Controllers\Admin\PortalController;
use App\Http\Controllers\GameDownloadController;
use App\Http\Controllers\HostingController;
use App\Http\Controllers\SiteStatisticsController;
use App\Models\Category;
use App\Models\Game;
use App\Support\HostingMedia;
use Illuminate\Support\Facades\Route;

Route::get('/site-statistics', [SiteStatisticsController::class, 'show'])->middleware('throttle:120,1');
Route::post('/site-statistics', [SiteStatisticsController::class, 'store'])->middleware('throttle:120,1');

Route::get('/game-media/{file}', [HostingMedia::class, 'serve'])->where('file', '.+');
Route::get('/storage/games/{file}', [HostingMedia::class, 'serve'])->where('file', '.+');
Route::get('/robots.txt', fn () => response("User-agent: *\nDisallow: /admin\nDisallow: /quan-tri-\nSitemap: ".url('/sitemap.xml')."\n", 200, ['Content-Type' => 'text/plain']));
Route::get('/sitemap.xml', function () {
    $paths = ['/', '/games', '/categories', '/in-progress', '/about'];
    foreach (Game::pluck('slug') as $slug) {
        $paths[] = '/games/'.rawurlencode($slug);
    }
    foreach (Category::pluck('slug') as $slug) {
        $paths[] = '/categories/'.rawurlencode($slug);
    }
    $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach ($paths as $path) {
        $xml .= '<url><loc>'.htmlspecialchars(url($path), ENT_XML1).'</loc></url>';
    }

    return response($xml.'</urlset>', 200, ['Content-Type' => 'application/xml']);
});

$portal = config('admin.path');
if (is_string($portal) && preg_match('#^/quan-tri-[a-z0-9]{12,40}$#', $portal)) {
    Route::get($portal, [PortalController::class, 'page']);
    Route::get($portal.'/login', [PortalController::class, 'page']);
    Route::post($portal.'/authenticate', [PortalController::class, 'login'])->middleware('throttle:admin-login');
    Route::post($portal.'/mutate', [PortalController::class, 'mutate'])->middleware('throttle:admin-writes');
}

Route::get('/', [HostingController::class, 'page']);
Route::get('/{page}', [HostingController::class, 'page'])->whereIn('page', ['games', 'categories', 'in-progress', 'about', 'contact']);
Route::post('/games/{slug}/download', [GameDownloadController::class, 'store'])->middleware('throttle:30,1')->name('games.download');
Route::get('/games/{slug}', [HostingController::class, 'page']);
Route::get('/categories/{slug}', [HostingController::class, 'page']);
