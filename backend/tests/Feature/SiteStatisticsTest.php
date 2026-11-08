<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class SiteStatisticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_views_are_idempotent_and_heartbeat_only_updates_presence(): void
    {
        $visitor = (string) Str::uuid();
        $event = (string) Str::uuid();
        $data = compact('visitor', 'event') + ['path' => '/'];
        $this->postJson('/site-statistics', $data)->assertOk()->assertExactJson(['page_views' => 1, 'online' => 1]);
        $this->postJson('/site-statistics', $data)->assertOk()->assertJsonPath('page_views', 1);
        $this->postJson('/site-statistics', ['visitor' => $visitor, 'path' => '/games'])->assertOk()->assertJsonPath('page_views', 1)->assertJsonPath('online', 1);
        $this->postJson('/site-statistics', ['visitor' => $visitor, 'event' => (string) Str::uuid(), 'path' => '/games'])->assertOk()->assertJsonPath('page_views', 2)->assertJsonPath('online', 1);
        $this->assertDatabaseCount('site_visitors', 1);
        $this->assertDatabaseMissing('site_visitors', ['visitor_hash' => $visitor]);
    }

    public function test_online_expires_but_total_remains_and_other_visitors_are_separate(): void
    {
        foreach (range(1, 2) as $number) {
            $this->postJson('/site-statistics', ['visitor' => (string) Str::uuid(), 'event' => (string) Str::uuid(), 'path' => '/'])->assertOk()->assertJsonPath('online', $number);
        }
        $this->travel(121)->seconds();
        $this->getJson('/site-statistics')->assertOk()->assertExactJson(['online' => 0, 'page_views' => 2]);
    }

    public function test_unknown_and_admin_paths_and_bots_are_not_counted(): void
    {
        $data = ['visitor' => (string) Str::uuid(), 'event' => (string) Str::uuid()];
        foreach (['/admin', '/quan-tri-secret/login', '/games/missing', '/unknown', '/categories/missing'] as $path) {
            $this->postJson('/site-statistics', $data + ['path' => $path])->assertUnprocessable();
        }
        $this->withHeader('User-Agent', 'Googlebot')->postJson('/site-statistics', $data + ['path' => '/'])->assertOk()->assertJsonPath('page_views', 0);
        $this->assertDatabaseCount('site_visitors', 0);
    }

    public function test_invalid_identifiers_and_cross_site_requests_are_rejected(): void
    {
        $this->postJson('/site-statistics', ['visitor' => 'invalid', 'path' => '/'])->assertUnprocessable();
        $this->app->detectEnvironment(fn () => 'production');
        $this->withHeaders(['Sec-Fetch-Site' => 'cross-site', 'Origin' => 'https://other.example'])->postJson('/site-statistics', ['visitor' => (string) Str::uuid(), 'path' => '/'])->assertStatus(419);
        $this->assertSame(0, DB::table('site_visitors')->count());
    }
}
