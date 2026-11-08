<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class SiteStatistics
{
    /** @return array{page_views: int, online: int} */
    public function current(): array
    {
        return [
            'page_views' => (int) (DB::table('site_statistics')->where('id', 1)->value('page_views') ?? 0),
            'online' => DB::table('site_visitors')->where('last_seen_at', '>', now()->subMinutes(2))->count(),
        ];
    }

    public function record(string $visitor, ?string $event): void
    {
        $visitorHash = hash_hmac('sha256', $visitor, config('app.key'));
        DB::transaction(function () use ($visitorHash, $event): void {
            DB::table('site_statistics')->insertOrIgnore(['id' => 1, 'page_views' => 0]);
            DB::table('site_visitors')->upsert(
                [['visitor_hash' => $visitorHash, 'last_seen_at' => now()]],
                ['visitor_hash'], ['last_seen_at'],
            );
            if ($event !== null) {
                $inserted = DB::table('site_view_events')->insertOrIgnore([
                    'event_hash' => hash('sha256', $visitorHash.$event), 'created_at' => now(),
                ]);
                if ($inserted > 0) {
                    DB::table('site_statistics')->where('id', 1)->increment('page_views');
                }
            }
        }, 3);
        if (random_int(1, 100) === 1) {
            DB::table('site_visitors')->where('last_seen_at', '<', now()->subDay())->delete();
            DB::table('site_view_events')->where('created_at', '<', now()->subDay())->delete();
        }
    }
}
