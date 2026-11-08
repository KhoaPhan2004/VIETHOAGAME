<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAccount;
use App\Models\AdminSession;
use App\Support\AdminGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['password' => ['required', 'string', 'max:4096']]);
        $account = AdminAccount::where('username', 'admin')->where('active', true)->first();
        abort_unless($account && Hash::check($data['password'], $account->password), 401, 'Mật khẩu chưa đúng.');
        if (Hash::needsRehash($account->password)) {
            $account->update(['password' => Hash::make($data['password'])]);
        }

        AdminSession::where('expires_at', '<=', now())->delete();
        $token = bin2hex(random_bytes(32));
        $session = AdminSession::create([
            'admin_account_id' => $account->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHours(8),
        ]);

        return response()->json(['token' => $token, 'expires_at' => $session->expires_at->toIso8601String()])
            ->header('Cache-Control', 'no-store');
    }

    public function session(Request $request): JsonResponse
    {
        $session = AdminGuard::session($request);
        abort_unless($session, 401);

        return response()->json(['authenticated' => true, 'expires_at' => $session->expires_at->toIso8601String()])
            ->header('Cache-Control', 'no-store');
    }

    public function logout(Request $request): Response
    {
        AdminGuard::session($request)?->delete();

        return response()->noContent()->header('Cache-Control', 'no-store');
    }
}
