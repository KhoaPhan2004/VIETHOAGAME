<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAccount extends Model
{
    use HasFactory;

    protected $fillable = ['username', 'password', 'active'];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'active' => 'boolean'];
    }
}
