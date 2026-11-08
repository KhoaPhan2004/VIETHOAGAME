<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateAdmin();
    }

    public function test_valid_image_larger_than_two_megabytes_is_stored(): void
    {
        Storage::fake('public');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZxkAAAAASUVORK5CYII=');
        $image = UploadedFile::fake()->createWithContent('cover.png', $png.str_repeat("\0", 3 * 1024 * 1024));

        $response = $this->post('/api/uploads/images', ['image' => $image])->assertOk();

        $path = 'games/'.basename($response->json('url'));
        Storage::disk('public')->assertExists($path);
        $this->assertSame(file_get_contents($image->getRealPath()), Storage::disk('public')->get($path));
    }

    public function test_oversized_image_returns_clear_limit_message(): void
    {
        Storage::fake('public');
        $image = UploadedFile::fake()->create('large.jpg', 8193, 'image/jpeg');

        $this->post('/api/uploads/images', ['image' => $image])
            ->assertUnprocessable()->assertJsonValidationErrors('image')
            ->assertJsonPath('errors.image.0', 'Ảnh quá lớn. Dung lượng tối đa là 8 MB mỗi ảnh.');

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_non_image_file_is_rejected(): void
    {
        Storage::fake('public');
        $image = UploadedFile::fake()->createWithContent('cover.txt', 'This is not an image.');

        $this->post('/api/uploads/images', ['image' => $image])
            ->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_upload_without_admin_credentials_is_forbidden(): void
    {
        Storage::fake('public');

        $this->withHeader('Authorization', 'Bearer invalid')
            ->post('/api/uploads/images')->assertUnauthorized();

        $this->assertSame([], Storage::disk('public')->allFiles());
    }
}
