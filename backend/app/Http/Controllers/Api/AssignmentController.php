<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignmentRequest;
use App\Models\UserProgram;
use App\Services\AccessScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', UserProgram::class);
        return response()->json(AccessScope::assignments(UserProgram::query(), $request->user())
            ->with(['user', 'program.organization', 'supervisor', 'coordinator'])
            ->latest()
            ->paginate(15));
    }

    public function store(AssignmentRequest $request): JsonResponse
    {
        $this->authorize('create', UserProgram::class);
        $assignment = new UserProgram($request->validated());
        abort_unless(AccessScope::canManageAssignment($request->user(), $assignment), 403);
        $assignment->save();

        return response()->json($assignment, 201);
    }

    public function show(UserProgram $assignment): JsonResponse
    {
        $this->authorize('view', $assignment);
        return response()->json($assignment->load(['user', 'program', 'supervisor', 'coordinator']));
    }

    public function update(AssignmentRequest $request, UserProgram $assignment): JsonResponse
    {
        $this->authorize('update', $assignment);
        $assignment->update($request->validated());

        return response()->json($assignment->refresh());
    }

    public function destroy(UserProgram $assignment): JsonResponse
    {
        $this->authorize('delete', $assignment);
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }
}
