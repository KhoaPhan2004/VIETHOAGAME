<?php

namespace Database\Factories;

use App\Models\AdminAccount;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AdminSessionFactory extends Factory
{
    public function definition(): array
    {
        return ['admin_account_id' => AdminAccount::factory(), 'token_hash' => hash('sha256', Str::random(64)), 'expires_at' => now()->addHours(8)];
    }
}
