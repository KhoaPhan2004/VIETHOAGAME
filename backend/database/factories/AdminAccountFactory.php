<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AdminAccountFactory extends Factory
{
    public function definition(): array
    {
        return ['username' => 'admin', 'password' => 'test-admin-password', 'active' => true];
    }
}
