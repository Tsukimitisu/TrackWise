<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'organization_id' => $request->input('organization_id') ?: null,
            'role_id' => $request->input('role_id'),
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->string('password')),
            'phone' => $request->input('phone'),
            'status' => 'active',
        ]);

        $token = $user->createToken('trackwise')->plainTextToken;

        return response()->json([
            'user' => $user->load(['role', 'organization', 'userPrograms.program']),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->input('email'))->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $token = $user->createToken('trackwise')->plainTextToken;

        return response()->json([
            'user' => $user->load(['role', 'organization', 'userPrograms.program']),
            'token' => $token,
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(request()->user()->load(['role', 'organization', 'userPrograms.program']));
    }

    public function logout(): JsonResponse
    {
        request()->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function updateProfile(): JsonResponse
    {
        $user = request()->user();
        $data = request()->validate([
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update(array_filter($data));

        return response()->json(['message' => 'Profile updated.', 'user' => $user->load(['role', 'organization', 'userPrograms.program'])]);
    }

    public function changePassword(): JsonResponse
    {
        $user = request()->user();
        $validated = request()->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
