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
            'user' => $user->load(['role', 'organization']),
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
            'user' => $user->load(['role', 'organization']),
            'token' => $token,
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(request()->user()->load(['role', 'organization']));
    }

    public function logout(): JsonResponse
    {
        request()->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
