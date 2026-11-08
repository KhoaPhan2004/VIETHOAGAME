<?php

namespace Tests;

use App\Models\AdminSession;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function authenticateAdmin(): string
    {
        $token = bin2hex(random_bytes(32));
        AdminSession::factory()->create(['token_hash' => hash('sha256', $token)]);
        $this->withHeaders(['Authorization' => 'Bearer '.$token, 'Accept' => 'application/json']);

        return $token;
    }
}
