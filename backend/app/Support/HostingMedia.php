<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class HostingMedia
{
    public static function normalize(mixed $data): mixed
    {
        if (! is_array($data)) {
            return $data;
        }
        foreach ($data as $key => $value) {
            if (in_array($key, ['image', 'background_image'], true) && is_string($value)) {
                $data[$key] = self::url($value);
            } elseif ($key === 'gallery_images' && is_array($value)) {
                $data[$key] = array_map(self::url(...), $value);
            } elseif (is_array($value)) {
                $data[$key] = self::normalize($value);
            }
        }

        return $data;
    }

    public static function url(string $value): string
    {
        $parts = parse_url($value);
        $host = $parts['host'] ?? null;
        $local = ! $host || in_array($host, ['localhost', '127.0.0.1', parse_url(config('app.url'), PHP_URL_HOST)], true);
        $path = $parts['path'] ?? '';
        if ($local && str_starts_with($path, '/storage/games/')) {
            return '/game-media/'.substr($path, strlen('/storage/games/'));
        }

        return $value;
    }

    public function serve(Request $request, string $file): BinaryFileResponse
    {
        abort_unless(preg_match('/^[a-zA-Z0-9_\/.-]+$/', $file) && ! str_contains($file, '..'), 404);
        $root = realpath(Storage::disk('public')->path('games'));
        $path = realpath(Storage::disk('public')->path('games/'.$file));
        abort_unless($root && $path && is_file($path) && str_starts_with($path, $root.DIRECTORY_SEPARATOR), 404);
        $mime = mime_content_type($path);
        abort_unless(in_array($mime, ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif'], true), 404);
        $width = (int) $request->query('w', 0);
        if (in_array($width, [480, 640, 960, 1280], true)) {
            $variant = Storage::disk('public')->path('games/.variants/'.hash('sha256', $file).'-'.$width.'.webp');
            if (is_file($variant)) {
                $path = $variant;
                $mime = 'image/webp';
            }
        }

        return response()->file($path, ['Content-Type' => $mime, 'Cache-Control' => 'public, max-age=31536000, immutable', 'X-Content-Type-Options' => 'nosniff']);
    }

    public static function variants(string $relativePath): void
    {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagewebp')) {
            return;
        }
        $path = Storage::disk('public')->path($relativePath);
        $size = @getimagesize($path);
        if (! $size || $size[0] * $size[1] > 12000000 || $size[2] === IMAGETYPE_GIF) {
            return;
        }
        $source = @imagecreatefromstring(file_get_contents($path));
        if (! $source) {
            return;
        }
        Storage::disk('public')->makeDirectory('games/.variants');
        $file = substr($relativePath, strlen('games/'));
        foreach ([480, 640, 960, 1280] as $width) {
            $height = max(1, (int) round($size[1] * $width / $size[0]));
            $target = imagecreatetruecolor($width, $height);
            imagealphablending($target, false);
            imagesavealpha($target, true);
            imagecopyresampled($target, $source, 0, 0, 0, 0, $width, $height, $size[0], $size[1]);
            imagewebp($target, Storage::disk('public')->path('games/.variants/'.hash('sha256', $file).'-'.$width.'.webp'), 78);
            imagedestroy($target);
        }
        imagedestroy($source);
    }
}
