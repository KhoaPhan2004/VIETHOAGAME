<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminGuard;
use App\Support\HostingMedia;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function image(Request $request)
    {
        AdminGuard::authorize($request);

        $data = $request->validate([
            'image' => ['required', 'image', 'max:8192'],
        ], [
            'image.required' => 'Vui lòng chọn ảnh để tải lên.',
            'image.image' => 'Vui lòng chọn ảnh JPG, PNG, WebP, GIF, BMP hoặc AVIF hợp lệ.',
            'image.max' => 'Ảnh quá lớn. Dung lượng tối đa là 8 MB mỗi ảnh.',
            'image.uploaded' => 'Ảnh không tải lên được. Kiểm tra dung lượng ảnh và thử lại (tối đa 8 MB).',
        ]);

        $path = $data['image']->store('games', 'public');
        HostingMedia::variants($path);

        return response()->json([
            'url' => '/game-media/'.substr($path, strlen('games/')),
        ]);
    }
}
