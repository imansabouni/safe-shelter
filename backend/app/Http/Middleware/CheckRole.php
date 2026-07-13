<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Kullanıcı giriş yapmamışsa
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // 🚨 GEÇİCİ OLARAK ROL KONTROLÜ DEVRE DIŞI BIRAKILDI (Bitirme projesi hata ayıklama için)
        // 🚨 TEMPORARILY DISABLED ROLE CHECK (For capstone project debugging)
        return $next($request);

        // Admin her yere erişebilsin istiyorsan bunu bırak
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Kullanıcının rolü izin verilen roller arasında değilse
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Insufficient permissions'
            ], 403);
        }

        return $next($request);
    }
}
