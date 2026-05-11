<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userRole = $user->role?->name ?? $user->role;
        $allowedRoles = $this->expandRoles($roles);

        if (!in_array($userRole, $allowedRoles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }

    private function expandRoles(array $roles): array
    {
        $aliases = [
            'admin' => ['Super Admin', 'Organization Admin'],
            'coordinator' => ['Coordinator'],
            'supervisor' => ['Supervisor'],
            'student' => ['Student'],
            'viewer' => ['Viewer'],
        ];

        return collect($roles)
            ->flatMap(fn ($role) => $aliases[strtolower($role)] ?? [$role])
            ->unique()
            ->values()
            ->all();
    }
}
