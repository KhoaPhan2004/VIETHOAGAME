<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Game extends Model
{
    protected $appends = [
        'category',
    ];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'background_image',
        'gallery_images',
        'version',
        'status',
        'file_size',
        'download_count',
        'download_url',
        'is_downloadable',
        'translation_progress',
        'translation_stage',
        'expected_release_at',
        'last_progress_update',
        'video_url',
        'preview_video_url',
        'installation_guide',
        'published_at',
    ];

    protected $casts = [
        'is_downloadable' => 'boolean',
        'gallery_images' => 'array',
        'download_count' => 'integer',
        'translation_progress' => 'integer',
        'expected_release_at' => 'date:Y-m-d',
        'last_progress_update' => 'date:Y-m-d',
        'published_at' => 'date:Y-m-d',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->withTimestamps();
    }

    public function getCategoryAttribute(): ?string
    {
        $categories = $this->relationLoaded('categories')
            ? $this->categories
            : $this->categories()->get();

        return $categories->pluck('name')->join(', ') ?: null;
    }
}
