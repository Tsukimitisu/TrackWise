<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationRequest;
use App\Models\Organization;
use App\Services\AccessScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(AccessScope::organizations(Organization::query(), $request->user())
            ->latest()
            ->paginate(15));
    }

    public function store(OrganizationRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['owner_organization_id'] = $request->user()->isSuperAdmin()
            ? null
            : $request->user()->organization_id;
        abort_if(! $request->user()->isSuperAdmin() && ! $payload['owner_organization_id'], 403);
        $organization = Organization::create($payload);

        return response()->json($organization, 201);
    }

    public function show(Request $request, Organization $organization): JsonResponse
    {
        $this->assertVisible($request, $organization);
        return response()->json($organization);
    }

    public function update(OrganizationRequest $request, Organization $organization): JsonResponse
    {
        $this->assertManageable($request, $organization);
        $organization->update($request->validated());

        return response()->json($organization->refresh());
    }

    public function destroy(Request $request, Organization $organization): JsonResponse
    {
        $this->assertManageable($request, $organization);
        $organization->delete();

        return response()->json(['message' => 'Organization deleted.']);
    }

    public function toggleStatus(Request $request, Organization $organization): JsonResponse
    {
        $this->assertManageable($request, $organization);
        $organization->status = $organization->status === 'active' ? 'inactive' : 'active';
        $organization->save();

        return response()->json($organization->refresh());
    }

    private function assertVisible(Request $request, Organization $organization): void
    {
        abort_unless(
            AccessScope::organizations(Organization::query(), $request->user())
                ->whereKey($organization->id)
                ->exists(),
            403
        );
    }

    private function assertManageable(Request $request, Organization $organization): void
    {
        $this->assertVisible($request, $organization);
        if (! $request->user()->isSuperAdmin()) {
            abort_unless((int) $organization->owner_organization_id === (int) $request->user()->organization_id, 403);
        }
    }
}
