<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Game;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            [
                'name' => 'Grounded 2',
                'slug' => 'grounded-2',
                'description' => 'Bản Việt hóa thử nghiệm cho game sinh tồn co-op, ưu tiên giao diện và nhiệm vụ chính.',
                'image' => '/images/grounded-2.jpg',
                'version' => '1.0',
                'categories' => ['Sinh tồn'],
                'status' => 'Đang cập nhật',
                'file_size' => '820 MB',
                'download_url' => 'https://example.com/download/grounded-2-viet-hoa',
                'is_downloadable' => false,
                'translation_progress' => 68,
                'translation_stage' => 'Dịch nhiệm vụ phụ',
                'expected_release_at' => '2026-11-15',
                'last_progress_update' => '2026-10-05',
                'installation_guide' => "Giải nén file tải về.\nChép thư mục Việt hóa vào thư mục cài game.\nMở game và kiểm tra phần ngôn ngữ.",
                'published_at' => '2026-10-01',
            ],
            [
                'name' => 'The Witcher 3: Wild Hunt',
                'slug' => 'the-witcher-3-wild-hunt',
                'description' => 'Bản Việt hóa cho game nhập vai thế giới mở, tập trung hội thoại, nhiệm vụ và mô tả vật phẩm.',
                'image' => '/images/the-witcher-3.jpg',
                'version' => 'Next Gen 4.04',
                'categories' => ['Nhập vai'],
                'status' => 'Hoàn thành',
                'file_size' => '1.4 GB',
                'download_url' => 'https://example.com/download/the-witcher-3-viet-hoa',
                'is_downloadable' => true,
                'translation_progress' => 100,
                'translation_stage' => 'Hoàn thành',
                'expected_release_at' => null,
                'last_progress_update' => '2026-09-18',
                'installation_guide' => "Tải đúng bản dành cho Next Gen.\nSao lưu thư mục game trước khi cài.\nChạy file cài đặt và chọn thư mục The Witcher 3.",
                'published_at' => '2026-09-18',
            ],
            [
                'name' => 'Stardew Valley',
                'slug' => 'stardew-valley',
                'description' => 'Bản Việt hóa nhẹ, dễ cài đặt, phù hợp cho người chơi thích nông trại và đời sống thư giãn.',
                'image' => '/images/stardew-valley.jpg',
                'version' => '1.6',
                'categories' => ['Mô phỏng'],
                'status' => 'Hoàn thành',
                'file_size' => '180 MB',
                'download_url' => 'https://example.com/download/stardew-valley-viet-hoa',
                'is_downloadable' => true,
                'translation_progress' => 100,
                'translation_stage' => 'Hoàn thành',
                'expected_release_at' => null,
                'last_progress_update' => '2026-08-30',
                'installation_guide' => "Cài SMAPI nếu bản dịch yêu cầu.\nChép thư mục mod Việt hóa vào thư mục Mods.\nKhởi động game thông qua SMAPI.",
                'published_at' => '2026-08-30',
            ],
        ];

        foreach ($games as $game) {
            $categoryNames = $game['categories'];
            unset($game['categories']);

            $savedGame = Game::updateOrCreate(
                ['slug' => $game['slug']],
                $game,
            );

            $categoryIds = Category::whereIn('name', $categoryNames)->pluck('id');
            $savedGame->categories()->sync($categoryIds);
        }
    }
}
