<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\HostingController;
use App\Support\AdminGuard;
use App\Support\PortalMutations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PortalController extends Controller
{
    private function authenticateRequest(Request $request): bool
    {
        $token = $request->session()->get('portal_token');
        if (! is_string($token)) {
            return false;
        }
        $request->headers->set('Authorization', 'Bearer '.$token);

        return AdminGuard::session($request) !== null;
    }

    public function page(Request $request): Response
    {
        $authenticated = $this->authenticateRequest($request);
        $login = $request->path() === ltrim(config('admin.path'), '/').'/login';
        if (! $login && ! $authenticated) {
            return redirect(config('admin.path').'/login');
        }
        if ($login && $authenticated) {
            return redirect(config('admin.path'));
        }
        $request->attributes->set('portal', true);
        $request->attributes->set('portal_authenticated', $authenticated);
        $result = app(HostingController::class)->page($request);
        $response = $result instanceof JsonResponse ? $result : response($result);

        return $response->header('Cache-Control', 'private, no-store')->header('X-Robots-Tag', 'noindex, nofollow');
    }

    public function login(Request $request): RedirectResponse
    {
        try {
            $result = app(AuthController::class)->login($request)->getData(true);
        } catch (ValidationException|HttpException $exception) {
            if ($exception instanceof HttpException && $exception->getStatusCode() !== 401) {
                throw $exception;
            }

            return redirect(config('admin.path').'/login?error=password');
        }
        $request->session()->regenerate();
        $request->session()->put('portal_token', $result['token']);

        return redirect(config('admin.path'))->header('Cache-Control', 'no-store');
    }

    public function mutate(Request $request, PortalMutations $mutations): JsonResponse
    {
        abort_unless($this->authenticateRequest($request), 401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        abort_if((int) $request->server('CONTENT_LENGTH', 0) > 25 * 1024 * 1024, 413, 'Tổng dung lượng ảnh vượt quá 25 MB.');

        return response()->json(['redirectTo' => $mutations->perform($request)])->header('Cache-Control', 'no-store');
    }
}
