<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Nhập vai',
                'slug' => 'nhap-vai',
                'description' => 'Game nhập vai, cốt truyện, nhiệm vụ và xây dựng nhân vật.',
            ],
            [
                'name' => 'Sinh tồn',
                'slug' => 'sinh-ton',
                'description' => 'Game sinh tồn, chế tạo, khám phá và co-op.',
            ],
            [
                'name' => 'Mô phỏng',
                'slug' => 'mo-phong',
                'description' => 'Game mô phỏng đời sống, nông trại, quản lý hoặc xây dựng.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
