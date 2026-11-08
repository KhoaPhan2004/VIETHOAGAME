<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        Cache::put('tkpkpin-youtube-feed', [], 3600);
        $this->get('/')->assertOk()->assertSee('site-data');
    }
}
