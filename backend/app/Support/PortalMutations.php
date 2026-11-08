<?php

namespace App\Support;

use App\Http\Controllers\Admin\UploadController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\InProgressGameController;
use App\Models\Category;
use App\Models\Game;
use App\Models\InProgressGame;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PortalMutations
{
    public function perform(Request $request): string
    {
        $operation = $request->query('operation', '');
        $id = filter_var($request->query('id'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        abort_if((str_starts_with($operation, 'update-') || str_starts_with($operation, 'delete-')) && ! $id, 400);
        $base = config('admin.path');
        if ($operation === 'logout') {
            AdminGuard::session($request)?->delete();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return $base.'/login';
        }
        $types = ['game' => ['games', GameController::class, Game::class], 'progress' => ['in-progress', InProgressGameController::class, InProgressGame::class], 'category' => ['categories', CategoryController::class, Category::class]];
        $parts = explode('-', $operation, 2);
        abort_unless(count($parts) === 2 && isset($types[$parts[1]]) && in_array($parts[0], ['create', 'update', 'delete'], true), 400, 'Thao tác không hợp lệ.');
        [$verb, $type] = $parts;
        [$tab, $controllerClass, $modelClass] = $types[$type];
        $controller = app($controllerClass);
        $model = $verb === 'create' ? null : $modelClass::findOrFail($id);
        $data = $verb === 'delete' ? [] : match ($type) {
            'game' => $this->game($request), 'progress' => $this->progress($request),
            'category' => ['name' => $request->input('name'), 'slug' => Str::slug($request->input('name', '')), 'description' => $request->input('description')],
        };
        $inner = Request::create('/', 'POST', $data);
        $inner->headers->set('Authorization', $request->header('Authorization'));
        DB::transaction(function () use ($verb, $controller, $inner, $model, $type, $request): void {
            match ($verb) {
                'create' => $controller->store($inner), 'update' => $controller->update($inner, $model), 'delete' => $controller->destroy($inner, $model),
            };
            if ($type === 'game' && $verb === 'create' && $request->filled('release_source_id')) {
                app(InProgressGameController::class)->markReleased($inner, InProgressGame::findOrFail($request->input('release_source_id')));
            }
        });
        $noticeType = $type === 'progress' ? 'in-progress' : $type;
        $notice = $noticeType.'-'.match ($verb) {
            'create' => 'created', 'update' => 'updated', 'delete' => 'deleted'
        };
        $params = ['tab' => $tab, 'notice' => $notice];
        if ($verb === 'update') {
            $params['page'] = max(1, (int) $request->query('page', 1));
            $sort = $request->query('sort', 'name');
            $params['sort'] = in_array($sort, ['name', 'updated', 'downloads'], true) ? $sort : 'name';
            if ($request->query('keyword') && $type !== 'category') {
                $params[$type === 'game' ? 'done_q' : 'progress_q'] = $request->query('keyword');
            }
        }

        return $base.'?'.http_build_query($params).($verb === 'update' ? '#admin-list' : '');
    }

    private function upload(Request $request, string $field): ?string
    {
        $file = $request->file($field);
        if (! $file) {
            return null;
        }
        $inner = Request::create('/', 'POST', [], [], ['image' => $file]);
        $inner->headers->set('Authorization', $request->header('Authorization'));

        return app(UploadController::class)->image($inner)->getData(true)['url'];
    }

    private function game(Request $request): array
    {
        $request->validate(['category_ids' => ['nullable', 'array'], 'gallery_images' => ['nullable', 'json'], 'gallery_image_files' => ['nullable', 'array'], 'gallery_image_files.*' => ['image', 'max:8192']]);
        $gallery = json_decode($request->input('gallery_images', '[]'), true);
        $gallery = is_array($gallery) ? array_values(array_filter($gallery, fn ($url) => is_string($url) && $url !== '')) : [];
        foreach ($request->file('gallery_image_files', []) as $file) {
            $inner = Request::create('/', 'POST', [], [], ['image' => $file]);
            $inner->headers->set('Authorization', $request->header('Authorization'));
            $gallery[] = app(UploadController::class)->image($inner)->getData(true)['url'];
        }

        return array_merge($request->only(['name', 'slug', 'description', 'version', 'file_size', 'download_url', 'video_url', 'preview_video_url', 'installation_guide']), [
            'image' => $this->upload($request, 'image_file') ?? $request->input('image'),
            'background_image' => $this->upload($request, 'background_image_file') ?? $request->input('background_image'),
            'gallery_images' => $gallery, 'category_ids' => $request->input('category_ids', []),
            'status' => 'Hoàn thành', 'download_count' => $request->input('download_count', 0),
            'is_downloadable' => $request->input('is_downloadable') === '1', 'translation_progress' => 100, 'translation_stage' => 'Hoàn thành',
        ]);
    }

    private function progress(Request $request): array
    {
        return array_merge($request->only(['name', 'slug', 'total_text_lines', 'translated_text_lines', 'translation_stage', 'last_progress_update']), [
            'image' => $this->upload($request, 'image_file') ?? $request->input('image'), 'description' => null, 'background_image' => null, 'current_task' => null,
        ]);
    }
}
