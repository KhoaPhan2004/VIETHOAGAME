<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->boolean('is_downloadable')->default(true)->after('download_url');
            $table->unsignedTinyInteger('translation_progress')->default(100)->after('is_downloadable');
            $table->string('translation_stage')->nullable()->after('translation_progress');
            $table->text('translator_note')->nullable()->after('translation_stage');
            $table->date('expected_release_at')->nullable()->after('translator_note');
            $table->date('last_progress_update')->nullable()->after('expected_release_at');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn([
                'is_downloadable',
                'translation_progress',
                'translation_stage',
                'translator_note',
                'expected_release_at',
                'last_progress_update',
            ]);
        });
    }
};
