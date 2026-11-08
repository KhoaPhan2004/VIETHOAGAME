<?php

namespace Tests\Feature;

use App\Models\AdminAccount;
use App\Models\AdminSession;
use App\Models\Category;
use App\Models\Game;
use App\Models\InProgressGame;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InfinityFreeHostingTest extends TestCase
{
    use RefreshDatabase;

    private string $portal = '/quan-tri-hostingtest12345';

    protected function defineEnvironment($app): void
    {
        $app['config']->set('admin.path', '/quan-tri-hostingtest12345');
    }

    protected function setUp(): void
    {
        parent::setUp();
        Cache::put('tkpkpin-youtube-feed', [], 3600);
    }

    public function test_public_html_and_json_do_not_expose_the_private_path_or_credentials(): void
    {
        Game::create(['name' => 'Hosting Game', 'slug' => 'hosting-game', 'status' => 'Hoàn thành', 'image' => 'http://127.0.0.1:8000/storage/games/example.png']);
        $html = $this->get('/');
        $html->assertOk()->assertSee('site-data')->assertSee('/assets/site/')->assertDontSee($this->portal)->assertDontSee('localhost:3000');
        $this->getJson('/')->assertOk()->assertJsonPath('games.0.image', '/game-media/example.png')->assertJsonMissingPath('adminBase')->assertJsonMissingPath('authenticated');
        $this->get('/games/hosting-game')->assertOk()->assertSee('Hosting Game | TKPkpin');
        $this->get('/games/missing')->assertNotFound();
        $this->get('/admin')->assertNotFound();
        $this->get('/admin/login')->assertNotFound();
        $this->get('/%61dmin/login')->assertNotFound();
        $this->getJson($this->portal.'/mutate')->assertStatus(405);
    }

    public function test_php_login_uses_database_and_only_stores_token_in_server_session(): void
    {
        AdminAccount::factory()->create();
        $this->get($this->portal)->assertRedirect($this->portal.'/login');
        $this->post($this->portal.'/authenticate', ['password' => 'wrong'])->assertRedirect($this->portal.'/login?error=password');
        $this->post($this->portal.'/authenticate', ['password' => 'test-admin-password'])->assertRedirect($this->portal)->assertSessionHas('portal_token');
        $this->assertDatabaseCount('admin_sessions', 1);
        $response = $this->getJson($this->portal);
        $response->assertOk()->assertJsonPath('authenticated', true)->assertJsonPath('adminBase', $this->portal)->assertJsonMissingPath('token');
        $this->postJson($this->portal.'/mutate?operation=logout')->assertOk()->assertJsonPath('redirectTo', $this->portal.'/login');
        $this->assertDatabaseCount('admin_sessions', 0);
        $this->get($this->portal)->assertRedirect($this->portal.'/login');
    }

    public function test_php_mutations_validate_write_upload_and_preserve_pagination(): void
    {
        Storage::fake('public');
        $token = bin2hex(random_bytes(32));
        AdminSession::factory()->create(['token_hash' => hash('sha256', $token)]);
        $this->withSession(['portal_token' => $token]);
        $this->postJson($this->portal.'/mutate?operation=create-category', ['name' => 'Nhập vai'])->assertOk();
        $category = Category::firstOrFail();
        $this->post($this->portal.'/mutate?operation=create-game', [
            'name' => 'PHP Game', 'gallery_images' => '[]', 'category_ids' => [$category->id], 'is_downloadable' => '1', 'image_file' => UploadedFile::fake()->image('cover.png'),
        ], ['Accept' => 'application/json'])->assertOk();
        $game = Game::firstOrFail();
        $this->assertStringStartsWith('/game-media/', $game->image);
        Storage::disk('public')->assertExists('games/'.basename($game->image));
        $this->postJson($this->portal.'/mutate?operation=update-game&id='.$game->id.'&page=2&sort=updated', ['name' => 'PHP Updated', 'gallery_images' => '[]'])->assertOk()->assertJsonPath('redirectTo', $this->portal.'?tab=games&notice=game-updated&page=2&sort=updated#admin-list');
        $this->assertDatabaseHas('games', ['name' => 'PHP Updated']);
        $this->postJson($this->portal.'/mutate?operation=update-game&id='.$game->id, ['name' => '', 'gallery_images' => '[]'])->assertUnprocessable();
        $this->postJson($this->portal.'/mutate?operation=delete-game&id='.$game->id)->assertOk();
        $this->assertDatabaseCount('games', 0);
        $this->postJson($this->portal.'/mutate?operation=delete-game&id=-1')->assertStatus(400);
    }

    public function test_expired_session_cannot_mutate_and_media_cannot_read_private_files(): void
    {
        $token = bin2hex(random_bytes(32));
        AdminSession::factory()->create(['token_hash' => hash('sha256', $token), 'expires_at' => now()->subMinute()]);
        $this->withSession(['portal_token' => $token])->postJson($this->portal.'/mutate?operation=create-category', ['name' => 'Blocked'])->assertUnauthorized();
        $this->assertDatabaseCount('categories', 0);
        $this->get('/game-media/../.env')->assertNotFound();
        $this->get('/game-media/%2e%2e/.env')->assertNotFound();
    }

    public function test_portal_rejects_requests_without_a_valid_csrf_token(): void
    {
        $this->app->instance('env', 'production');
        $this->post($this->portal.'/authenticate', ['password' => 'test-admin-password'])->assertStatus(419);
        $this->withSession(['_token' => 'expected-token'])->post($this->portal.'/authenticate', ['password' => 'test-admin-password', '_token' => 'wrong-token'])->assertStatus(419);
        $this->withSession(['_token' => 'expected-token'])->postJson($this->portal.'/mutate?operation=create-category', ['name' => 'Blocked'])->assertStatus(419);
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_php_progress_release_and_category_changes_use_existing_validation(): void
    {
        $token = bin2hex(random_bytes(32));
        AdminSession::factory()->create(['token_hash' => hash('sha256', $token)]);
        $this->withSession(['portal_token' => $token]);
        $this->postJson($this->portal.'/mutate?operation=create-progress', ['name' => 'Dự án thử', 'total_text_lines' => 100, 'translated_text_lines' => 30, 'translation_stage' => 'Dịch thuật'])->assertOk();
        $progress = InProgressGame::firstOrFail();
        $this->assertSame(30, $progress->translated_text_lines);
        $this->postJson($this->portal.'/mutate?operation=update-progress&id='.$progress->id, ['name' => 'Dự án thử', 'total_text_lines' => 100, 'translated_text_lines' => 80, 'translation_stage' => 'Thử game'])->assertOk();
        $this->postJson($this->portal.'/mutate?operation=create-game', ['name' => 'Bản đã phát hành', 'gallery_images' => '[]', 'release_source_id' => $progress->id])->assertOk();
        $this->assertNotNull($progress->fresh()->released_at);
        $this->assertSame(100, $progress->fresh()->translated_text_lines);
        $this->postJson($this->portal.'/mutate?operation=create-game', ['name' => 'Không được tạo', 'gallery_images' => '[]', 'release_source_id' => 99999])->assertNotFound();
        $this->assertDatabaseMissing('games', ['name' => 'Không được tạo']);
        $this->postJson($this->portal.'/mutate?operation=delete-progress&id='.$progress->id)->assertOk();
        $this->assertDatabaseCount('in_progress_games', 0);
        $category = Category::create(['name' => 'Cũ', 'slug' => 'cu']);
        $this->postJson($this->portal.'/mutate?operation=update-category&id='.$category->id, ['name' => 'Mới'])->assertOk();
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Mới']);
        $this->postJson($this->portal.'/mutate?operation=delete-category&id='.$category->id)->assertOk();
        $this->assertDatabaseCount('categories', 0);
    }
}
