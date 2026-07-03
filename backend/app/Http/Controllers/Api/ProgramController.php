<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProgramRequest;
use App\Models\Program;
use App\Models\Organization;
use App\Services\AccessScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(AccessScope::programs(Program::query(), $request->user())
            ->with('organization')
            ->latest()
            ->paginate(15));
    }

    public function store(ProgramRequest $request): JsonResponse
    {
        $this->assertOrganizationVisible($request, (int) $request->validated('organization_id'));
        return response()->json(Program::create($request->validated()), 201);
    }

    public function show(Request $request, Program $program): JsonResponse
    {
        $this->assertVisible($request, $program);
        return response()->json($program->load('organization'));
    }

    public function update(ProgramRequest $request, Program $program): JsonResponse
    {
        $this->assertVisible($request, $program);
        $this->assertOrganizationVisible($request, (int) $request->validated('organization_id'));
        $program->update($request->validated());

        return response()->json($program->refresh());
    }

    public function destroy(Request $request, Program $program): JsonResponse
    {
        $this->assertVisible($request, $program);
        $program->delete();

        return response()->json(['message' => 'Program deleted.']);
    }

    private function assertVisible(Request $request, Program $program): void
    {
        abort_unless(
            AccessScope::programs(Program::query(), $request->user())->whereKey($program->id)->exists(),
            403
        );
    }

    private function assertOrganizationVisible(Request $request, int $organizationId): void
    {
        abort_unless(
            AccessScope::organizations(Organization::query(), $request->user())->whereKey($organizationId)->exists(),
            403
        );
    }
}
