<?php

namespace Tests\Feature;

use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameDownloadTest extends TestCase
{
    use RefreshDatabase;

    private function downloadableGame(): Game
    {
        return Game::create(['name' => 'Download test', 'slug' => 'download-test', 'download_count' => 17, 'is_downloadable' => true, 'translation_progress' => 100, 'download_url' => 'https://example.com/translation.zip']);
    }

    public function test_click_counts_and_redirects_without_changing_game_update_date(): void
    {
        $game = $this->downloadableGame();
        $updated = $game->updated_at->toDateTimeString();
        $this->travel(5)->minutes();
        $this->post('/games/download-test/download')->assertStatus(303)->assertRedirect('https://example.com/translation.zip')->assertHeader('Cache-Control', 'no-store, private');
        $this->assertSame(18, $game->fresh()->download_count);
        $this->assertSame($updated, $game->fresh()->updated_at->toDateTimeString());
    }

    public function test_repeat_clicks_in_one_session_only_count_once_per_minute(): void
    {
        $game = $this->downloadableGame();
        $this->withCookie(config('session.cookie'), str_repeat('a', 40));
        $this->post('/games/download-test/download')->assertStatus(303);
        $this->post('/games/download-test/download')->assertStatus(303);
        $this->assertSame(18, $game->fresh()->download_count);
        $this->travel(61)->seconds();
        $this->post('/games/download-test/download')->assertStatus(303);
        $this->assertSame(19, $game->fresh()->download_count);
    }

    public function test_other_visitors_count_independently_and_get_never_counts(): void
    {
        $game = $this->downloadableGame();
        $this->get('/games/download-test/download')->assertStatus(405);
        $this->assertSame(17, $game->fresh()->download_count);
        $this->post('/games/download-test/download')->assertStatus(303);
        $this->withCookie(config('session.cookie'), str_repeat('b', 40));
        $this->post('/games/download-test/download')->assertStatus(303);
        $this->assertSame(19, $game->fresh()->download_count);
    }

    public function test_unavailable_missing_or_unsafe_downloads_are_rejected(): void
    {
        $game = $this->downloadableGame();
        foreach ([['is_downloadable' => false], ['is_downloadable' => true, 'translation_progress' => 50], ['translation_progress' => 100, 'download_url' => null], ['download_url' => 'javascript:alert(1)']] as $change) {
            $game->update($change);
            $this->post('/games/download-test/download')->assertNotFound();
        }
        $this->post('/games/missing/download')->assertNotFound();
        $this->assertSame(17, $game->fresh()->download_count);
    }

    public function test_bots_and_cross_site_requests_do_not_increment(): void
    {
        $game = $this->downloadableGame();
        $this->withHeader('User-Agent', 'Googlebot')->post('/games/download-test/download')->assertStatus(303);
        $this->app->detectEnvironment(fn () => 'production');
        $this->withHeaders(['Sec-Fetch-Site' => 'cross-site', 'Origin' => 'https://other.example'])->post('/games/download-test/download')->assertStatus(419);
        $this->assertSame(17, $game->fresh()->download_count);
    }
}
