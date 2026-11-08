<?php

namespace Tests\Feature;

use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_write_endpoints_reject_anonymous_requests(): void
    {
        foreach (['games', 'categories', 'in-progress-games', 'uploads/images'] as $endpoint) {
            $this->postJson('/api/'.$endpoint, [])->assertUnauthorized();
        }
        $this->assertDatabaseCount('games', 0);
        $this->assertDatabaseCount('categories', 0);
    }

    public function test_authenticated_admin_can_write(): void
    {
        $this->withHeader('Authorization', 'Bearer invalid')->postJson('/api/games', [])->assertUnauthorized();
        $this->authenticateAdmin();
        $this->postJson('/api/games', ['name' => 'Allowed', 'status' => 'Hoàn thành'])->assertCreated();
    }

    public function test_missing_account_fails_closed(): void
    {
        $this->postJson('/api/admin/auth/login', ['password' => 'anything'])->assertUnauthorized();
    }

    public function test_missing_game_and_category_return_not_found(): void
    {
        $this->getJson('/api/games/does-not-exist')->assertNotFound();
        $this->getJson('/api/categories/does-not-exist')->assertNotFound();
    }

    public function test_download_sort_returns_most_downloaded_first(): void
    {
        Game::create(['name' => 'Small', 'slug' => 'small', 'status' => 'Hoàn thành', 'download_count' => 2]);
        Game::create(['name' => 'Popular', 'slug' => 'popular', 'status' => 'Hoàn thành', 'download_count' => 100]);
        $this->getJson('/api/games?sort=downloads')->assertOk()->assertJsonPath('0.slug', 'popular');
    }
}
