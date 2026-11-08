<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('in_progress_games', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('background_image')->nullable();
            $table->unsignedInteger('total_text_lines')->default(0);
            $table->unsignedInteger('translated_text_lines')->default(0);
            $table->enum('translation_stage', ['Khảo sát', 'Dịch thuật', 'Thử game', 'Phát hành'])->default('Khảo sát');
            $table->string('current_task')->nullable();
            $table->date('last_progress_update')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });

        $existingGames = DB::table('games')
            ->where(function ($query) {
                $query
                    ->where('is_downloadable', false)
                    ->orWhere('translation_progress', '<', 100);
            })
            ->get();

        foreach ($existingGames as $game) {
            $progress = max(0, min(99, (int) ($game->translation_progress ?? 0)));
            $totalLines = 1000;
            $translatedLines = (int) floor($totalLines * ($progress / 100));

            DB::table('in_progress_games')->insert([
                'name' => $game->name,
                'slug' => $game->slug,
                'description' => $game->description,
                'image' => $game->image,
                'background_image' => $game->background_image ?? $game->image,
                'total_text_lines' => $totalLines,
                'translated_text_lines' => $translatedLines,
                'translation_stage' => $this->stageFromOldProgress($progress),
                'current_task' => $game->translation_stage,
                'last_progress_update' => $game->last_progress_update ?? substr((string) $game->updated_at, 0, 10),
                'created_at' => $game->created_at,
                'updated_at' => $game->updated_at,
            ]);
        }

        DB::table('games')
            ->where(function ($query) {
                $query
                    ->where('is_downloadable', false)
                    ->orWhere('translation_progress', '<', 100);
            })
            ->delete();
    }

    public function down(): void
    {
        Schema::dropIfExists('in_progress_games');
    }

    private function stageFromOldProgress(int $progress): string
    {
        return match (true) {
            $progress >= 80 => 'Thử game',
            $progress >= 20 => 'Dịch thuật',
            default => 'Khảo sát',
        };
    }
};
