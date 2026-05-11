<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role?->name, $this->expandRoles($roles), true)) {
            abort(403, 'You do not have access to this resource.');
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
