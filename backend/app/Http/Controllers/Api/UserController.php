<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with(['role', 'organization']);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($builder) use ($search) {
                $builder->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('role', fn ($roleQuery) => $roleQuery->where('name', 'like', "%{$search}%"));
            });
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);

        $user = User::create([
            'organization_id' => $validated['organization_id'] ?? null,
            'role_id' => $this->resolveRole($validated['role_id'] ?? $validated['role'] ?? 'Student')->id,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'] ?? 'active',
            'email_verified_at' => now(),
        ]);

        return response()->json($user->load(['role', 'organization']), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['role', 'organization', 'userPrograms.program']));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $this->validatedPayload($request, $user);

        $user->fill([
            'organization_id' => $validated['organization_id'] ?? $user->organization_id,
            'role_id' => isset($validated['role_id']) || isset($validated['role'])
                ? $this->resolveRole($validated['role_id'] ?? $validated['role'])->id
                : $user->role_id,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'] ?? $user->status,
        ]);

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json($user->load(['role', 'organization']));
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->is(request()->user())) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    private function validatedPayload(Request $request, ?User $user = null): array
    {
        $payload = $request->all();

        if ((! isset($payload['first_name']) || ! isset($payload['last_name'])) && isset($payload['name'])) {
            [$firstName, $lastName] = array_pad(preg_split('/\s+/', trim((string) $payload['name']), 2), 2, '');
            $payload['first_name'] = $payload['first_name'] ?? $firstName;
            $payload['last_name'] = $payload['last_name'] ?? ($lastName ?: 'User');
            $request->replace($payload);
        }

        return $request->validate([
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'role' => ['nullable', 'string', 'max:100'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive', 'suspended'])],
        ]);
    }

    private function resolveRole(int|string $role): Role
    {
        if (is_numeric($role)) {
            return Role::query()->findOrFail((int) $role);
        }

        $normalized = strtolower(str_replace([' ', '_', '-'], '', (string) $role));
        $map = [
            'admin' => 'Super Admin',
            'superadmin' => 'Super Admin',
            'organizationadmin' => 'Organization Admin',
            'orgadmin' => 'Organization Admin',
            'coordinator' => 'Coordinator',
            'supervisor' => 'Supervisor',
            'student' => 'Student',
            'viewer' => 'Viewer',
        ];

        return Role::query()->where('name', $map[$normalized] ?? (string) $role)->firstOrFail();
    }
}
