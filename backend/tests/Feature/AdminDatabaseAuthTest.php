<?php

namespace Tests\Feature;

use App\Models\AdminAccount;
use App\Models\AdminSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminDatabaseAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_is_hashed_and_login_returns_random_token(): void
    {
        $account = AdminAccount::factory()->create();
        $this->assertNotSame('test-admin-password', $account->password);
        $this->assertTrue(Hash::check('test-admin-password', $account->password));
        $this->assertArrayNotHasKey('password', $account->toArray());
        $token = $this->postJson('/api/admin/auth/login', ['password' => 'test-admin-password'])->assertOk()->json('token');
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $token);
        $this->assertDatabaseHas('admin_sessions', ['token_hash' => hash('sha256', $token)]);
        $this->assertDatabaseMissing('admin_sessions', ['token_hash' => $token]);
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/admin/auth/session')->assertOk();
    }

    public function test_wrong_password_and_old_password_header_are_rejected(): void
    {
        AdminAccount::factory()->create();
        $this->postJson('/api/admin/auth/login', ['password' => 'wrong'])->assertUnauthorized();
        $this->withHeader('X-Admin-Password', 'test-admin-password')->postJson('/api/games', [])->assertUnauthorized();
        $this->assertDatabaseCount('admin_sessions', 0);
    }

    public function test_expired_or_disabled_sessions_cannot_write(): void
    {
        $token = $this->authenticateAdmin();
        AdminSession::query()->update(['expires_at' => now()->subMinute()]);
        $this->postJson('/api/games', [])->assertUnauthorized();
        AdminSession::query()->update(['expires_at' => now()->addHour()]);
        AdminAccount::query()->update(['active' => false]);
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/admin/auth/session')->assertUnauthorized();
    }

    public function test_logout_revokes_session_in_database(): void
    {
        $this->authenticateAdmin();
        $this->postJson('/api/admin/auth/logout')->assertNoContent();
        $this->getJson('/api/admin/auth/session')->assertUnauthorized();
        $this->assertDatabaseCount('admin_sessions', 0);
    }

    public function test_repeated_incorrect_logins_are_throttled(): void
    {
        AdminAccount::factory()->create();
        for ($attempt = 0; $attempt < 10; $attempt++) {
            $this->postJson('/api/admin/auth/login', ['password' => 'wrong'])->assertUnauthorized();
        }
        $this->postJson('/api/admin/auth/login', ['password' => 'wrong'])->assertStatus(429);
    }
}
