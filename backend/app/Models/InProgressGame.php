<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InProgressGame extends Model
{
    public const STAGES = ['Khảo sát', 'Dịch thuật', 'Thử game', 'Phát hành'];

    protected $appends = [
        'translation_progress',
        'status',
        'is_downloadable',
        'category',
        'categories',
    ];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'background_image',
        'total_text_lines',
        'translated_text_lines',
        'translation_stage',
        'current_task',
        'last_progress_update',
        'released_at',
    ];

    protected $casts = [
        'total_text_lines' => 'integer',
        'translated_text_lines' => 'integer',
        'last_progress_update' => 'date:Y-m-d',
        'released_at' => 'datetime',
    ];

    public function getTranslationProgressAttribute(): int
    {
        if ($this->translation_stage === 'Phát hành') {
            return 100;
        }

        $totalLines = max(1, $this->total_text_lines);
        $lineRatio = min(1, max(0, $this->translated_text_lines / $totalLines));

        return match ($this->translation_stage) {
            'Thử game' => (int) round(76 + ($lineRatio * 19)),
            'Dịch thuật' => (int) round(20 + ($lineRatio * 55)),
            default => (int) round(8 + ($lineRatio * 11)),
        };
    }

    public function getStatusAttribute(): string
    {
        return $this->translation_stage === 'Phát hành' ? 'Phát hành' : 'Đang Việt hóa';
    }

    public function getIsDownloadableAttribute(): bool
    {
        return false;
    }

    public function getCategoryAttribute(): ?string
    {
        return null;
    }

    public function getCategoriesAttribute(): array
    {
        return [];
    }
}
