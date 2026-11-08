<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->string('category')->nullable()->after('version');
            $table->string('status')->default('Đang cập nhật')->after('category');
            $table->string('file_size')->nullable()->after('status');
            $table->string('download_url')->nullable()->after('file_size');
            $table->text('installation_guide')->nullable()->after('download_url');
            $table->date('published_at')->nullable()->after('installation_guide');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'status',
                'file_size',
                'download_url',
                'installation_guide',
                'published_at',
            ]);
        });
    }
};
