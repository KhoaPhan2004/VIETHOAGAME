<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminSession extends Model
{
    use HasFactory;

    protected $fillable = ['admin_account_id', 'token_hash', 'expires_at'];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return ['expires_at' => 'immutable_datetime'];
    }
}
