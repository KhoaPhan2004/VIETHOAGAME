<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameDetailContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authenticateAdmin();
    }

    public function test_video_and_installation_guide_are_saved_and_returned_in_detail(): void
    {
        $guide = "Sao lưu game trước khi cài.\nChép bản dịch vào thư mục game.";
        $this->postJson('/api/games', [
            'name' => 'Game content test',
            'status' => 'Hoàn thành',
            'video_url' => 'https://youtu.be/awCwt9xQTGc',
            'installation_guide' => $guide,
        ])->assertCreated()->assertJsonPath('video_url', 'https://youtu.be/awCwt9xQTGc');

        $this->getJson('/api/games/game-content-test')
            ->assertOk()
            ->assertJsonPath('video_url', 'https://youtu.be/awCwt9xQTGc')
            ->assertJsonPath('installation_guide', $guide);

        $this->assertDatabaseHas('games', [
            'slug' => 'game-content-test',
            'video_url' => 'https://youtu.be/awCwt9xQTGc',
            'installation_guide' => $guide,
        ]);
    }

    public function test_admin_can_update_and_clear_video_without_losing_guide(): void
    {
        $game = $this->postJson('/api/games', [
            'name' => 'Editable content',
            'status' => 'Hoàn thành',
            'installation_guide' => 'Hướng dẫn riêng của game.',
        ])->assertCreated()->json();

        $this->putJson('/api/games/'.$game['id'], [
            'name' => $game['name'],
            'status' => 'Hoàn thành',
            'video_url' => 'https://example.com/trailer.mp4',
        ])->assertOk()->assertJsonPath('video_url', 'https://example.com/trailer.mp4')
            ->assertJsonPath('installation_guide', 'Hướng dẫn riêng của game.');

        $this->putJson('/api/games/'.$game['id'], [
            'name' => $game['name'],
            'status' => 'Hoàn thành',
            'video_url' => null,
        ])->assertOk()->assertJsonPath('video_url', null)
            ->assertJsonPath('installation_guide', 'Hướng dẫn riêng của game.');
    }

    public function test_long_vietnamese_description_is_saved_when_creating_a_game(): void
    {
        $description = trim(str_repeat('Thế giới nhập vai rộng lớn với nhiều nhiệm vụ và nhân vật. ', 2000));

        $response = $this->postJson('/api/games', [
            'name' => 'Long description',
            'status' => 'Hoàn thành',
            'description' => $description,
        ])->assertCreated()->assertJsonPath('description', $description);

        $this->assertDatabaseHas('games', [
            'id' => $response->json('id'),
            'description' => $description,
        ]);
    }

    public function test_long_vietnamese_description_is_saved_when_updating_a_game(): void
    {
        $game = $this->postJson('/api/games', [
            'name' => 'Editable description',
            'status' => 'Hoàn thành',
            'description' => 'Mô tả ban đầu.',
        ])->assertCreated()->json();
        $description = trim(str_repeat('Khám phá thế giới giả tưởng, chiến đấu và tự quyết định hành trình của bạn. ', 20));

        $this->putJson('/api/games/'.$game['id'], [
            'name' => $game['name'],
            'status' => 'Hoàn thành',
            'description' => $description,
        ])->assertOk()->assertJsonPath('description', $description);

        $this->getJson('/api/games/'.$game['slug'])->assertOk()
            ->assertJsonPath('description', $description);
        $this->assertDatabaseHas('games', [
            'id' => $game['id'],
            'description' => $description,
        ]);
    }

    public function test_detail_and_preview_videos_are_stored_separately(): void
    {
        $game = $this->postJson('/api/games', [
            'name' => 'Separate videos',
            'status' => 'Hoàn thành',
            'video_url' => 'https://youtu.be/awCwt9xQTGc',
            'preview_video_url' => 'https://streamable.com/f46j2w',
        ])->assertCreated()->json();

        $this->getJson('/api/games/'.$game['slug'])->assertOk()
            ->assertJsonPath('video_url', 'https://youtu.be/awCwt9xQTGc')
            ->assertJsonPath('preview_video_url', 'https://streamable.com/f46j2w');
        $this->getJson('/api/games')->assertOk()
            ->assertJsonPath('0.preview_video_url', 'https://streamable.com/f46j2w');
        $this->assertDatabaseHas('games', [
            'id' => $game['id'],
            'video_url' => 'https://youtu.be/awCwt9xQTGc',
            'preview_video_url' => 'https://streamable.com/f46j2w',
        ]);
    }

    public function test_preview_video_can_change_and_clear_without_changing_detail_video(): void
    {
        $game = $this->postJson('/api/games', [
            'name' => 'Editable preview',
            'status' => 'Hoàn thành',
            'video_url' => 'https://youtu.be/awCwt9xQTGc',
        ])->assertCreated()->assertJsonPath('preview_video_url', null)->json();

        $this->putJson('/api/games/'.$game['id'], [
            'name' => $game['name'], 'status' => 'Hoàn thành',
            'preview_video_url' => 'https://example.com/preview.mp4',
        ])->assertOk()->assertJsonPath('preview_video_url', 'https://example.com/preview.mp4')
            ->assertJsonPath('video_url', 'https://youtu.be/awCwt9xQTGc');
        $this->assertDatabaseHas('games', ['id' => $game['id'], 'preview_video_url' => 'https://example.com/preview.mp4']);

        $this->putJson('/api/games/'.$game['id'], [
            'name' => $game['name'], 'status' => 'Hoàn thành', 'preview_video_url' => null,
        ])->assertOk()->assertJsonPath('preview_video_url', null)
            ->assertJsonPath('video_url', 'https://youtu.be/awCwt9xQTGc');
        $this->assertDatabaseHas('games', ['id' => $game['id'], 'preview_video_url' => null, 'video_url' => 'https://youtu.be/awCwt9xQTGc']);
    }

    public function test_detail_video_can_change_without_changing_preview_video(): void
    {
        $game = $this->postJson('/api/games', [
            'name' => 'Editable detail video', 'status' => 'Hoàn thành',
            'preview_video_url' => 'https://streamable.com/f46j2w',
        ])->assertCreated()->json();

        $this->putJson('/api/games/'.$game['id'], [
            'name' => $game['name'], 'status' => 'Hoàn thành',
            'video_url' => 'https://youtu.be/awCwt9xQTGc',
        ])->assertOk()->assertJsonPath('video_url', 'https://youtu.be/awCwt9xQTGc')
            ->assertJsonPath('preview_video_url', 'https://streamable.com/f46j2w');
        $this->assertDatabaseHas('games', ['id' => $game['id'], 'preview_video_url' => 'https://streamable.com/f46j2w', 'video_url' => 'https://youtu.be/awCwt9xQTGc']);
    }

    public function test_invalid_preview_video_urls_are_rejected_without_creating_game(): void
    {
        foreach (['invalid-url', 'javascript:alert(1)', 'ftp://example.com/clip.mp4', 'https://example.com/'.str_repeat('a', 2048)] as $url) {
            $this->postJson('/api/games', [
                'name' => 'Invalid preview', 'status' => 'Hoàn thành', 'preview_video_url' => $url,
            ])->assertUnprocessable()->assertJsonValidationErrors('preview_video_url');
        }
        $this->assertDatabaseCount('games', 0);
    }

    public function test_invalid_video_urls_are_rejected(): void
    {
        foreach (['not-a-url', 'javascript:alert(1)', 'ftp://example.com/video.mp4'] as $url) {
            $this->postJson('/api/games', [
                'name' => 'Invalid video',
                'status' => 'Hoàn thành',
                'video_url' => $url,
            ])->assertUnprocessable()->assertJsonValidationErrors('video_url');
        }
        $this->assertDatabaseCount('games', 0);
    }

    public function test_game_without_video_keeps_existing_detail_fields(): void
    {
        $this->postJson('/api/games', [
            'name' => 'No video',
            'status' => 'Hoàn thành',
            'gallery_images' => ['https://example.com/game.jpg'],
        ])->assertCreated();

        $this->getJson('/api/games/no-video')->assertOk()
            ->assertJsonPath('video_url', null)
            ->assertJsonPath('gallery_images.0', 'https://example.com/game.jpg');
    }
}
