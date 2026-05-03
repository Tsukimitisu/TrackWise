<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;

class OrganizationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Organization::query()->latest()->paginate(15));
    }

    public function store(OrganizationRequest $request): JsonResponse
    {
        $organization = Organization::create($request->validated());

        return response()->json($organization, 201);
    }

    public function show(Organization $organization): JsonResponse
    {
        return response()->json($organization);
    }

    public function update(OrganizationRequest $request, Organization $organization): JsonResponse
    {
        $organization->update($request->validated());

        return response()->json($organization->refresh());
    }

    public function destroy(Organization $organization): JsonResponse
    {
        $organization->delete();

        return response()->json(['message' => 'Organization deleted.']);
    }

    public function toggleStatus(Organization $organization): JsonResponse
    {
        $organization->status = $organization->status === 'active' ? 'inactive' : 'active';
        $organization->save();

        return response()->json($organization->refresh());
    }
}
