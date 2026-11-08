<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_statistics', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->unsignedBigInteger('page_views')->default(0);
        });
        Schema::create('site_visitors', function (Blueprint $table) {
            $table->char('visitor_hash', 64)->primary();
            $table->timestamp('last_seen_at')->index();
        });
        Schema::create('site_view_events', function (Blueprint $table) {
            $table->char('event_hash', 64)->primary();
            $table->timestamp('created_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_view_events');
        Schema::dropIfExists('site_visitors');
        Schema::dropIfExists('site_statistics');
    }
};
