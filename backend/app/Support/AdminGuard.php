<?php

namespace App\Support;

use App\Models\AdminSession;
use Illuminate\Http\Request;

class AdminGuard
{
    public static function session(Request $request): ?AdminSession
    {
        $token = $request->bearerToken();
        if (! is_string($token) || ! preg_match('/^[a-f0-9]{64}$/', $token)) {
            return null;
        }

        return AdminSession::query()
            ->where('token_hash', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->whereExists(function ($query) {
                $query->selectRaw('1')->from('admin_accounts')
                    ->whereColumn('admin_accounts.id', 'admin_sessions.admin_account_id')
                    ->where('active', true);
            })->first();
    }

    public static function authorize(Request $request): void
    {
        abort_unless(self::session($request), 401, 'Phiên quản trị không hợp lệ hoặc đã hết hạn.');
    }
}
