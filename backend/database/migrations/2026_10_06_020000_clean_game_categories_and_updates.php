<?php

use App\Models\Category;
use App\Models\Game;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_game', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['game_id', 'category_id']);
        });

        if (Schema::hasColumn('games', 'category')) {
            Game::query()
                ->whereNotNull('category')
                ->get(['id', 'category'])
                ->each(function (Game $game) {
                    $categoryName = $game->getRawOriginal('category');
                    $category = Category::where('name', $categoryName)->first();

                    if ($category) {
                        $game->categories()->syncWithoutDetaching([$category->id]);
                    }
                });
        }

        Schema::dropIfExists('game_updates');

        Schema::table('games', function (Blueprint $table) {
            if (Schema::hasColumn('games', 'category')) {
                $table->dropColumn('category');
            }

            if (Schema::hasColumn('games', 'translator_note')) {
                $table->dropColumn('translator_note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (! Schema::hasColumn('games', 'category')) {
                $table->string('category')->nullable()->after('version');
            }

            if (! Schema::hasColumn('games', 'translator_note')) {
                $table->text('translator_note')->nullable()->after('translation_stage');
            }
        });

        Schema::create('game_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->string('version')->nullable();
            $table->string('title');
            $table->text('content')->nullable();
            $table->date('published_at')->nullable();
            $table->timestamps();
        });

        Schema::dropIfExists('category_game');
    }
};
