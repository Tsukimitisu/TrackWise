<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignmentRequest;
use App\Models\UserProgram;
use Illuminate\Http\JsonResponse;

class AssignmentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(UserProgram::query()->with(['user', 'program', 'supervisor', 'coordinator'])->latest()->paginate(15));
    }

    public function store(AssignmentRequest $request): JsonResponse
    {
        return response()->json(UserProgram::create($request->validated()), 201);
    }

    public function show(UserProgram $assignment): JsonResponse
    {
        return response()->json($assignment->load(['user', 'program', 'supervisor', 'coordinator']));
    }

    public function update(AssignmentRequest $request, UserProgram $assignment): JsonResponse
    {
        $assignment->update($request->validated());

        return response()->json($assignment->refresh());
    }

    public function destroy(UserProgram $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }
}
