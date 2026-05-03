<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProgramRequest;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class ProgramController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Program::query()->with('organization')->latest()->paginate(15));
    }

    public function store(ProgramRequest $request): JsonResponse
    {
        return response()->json(Program::create($request->validated()), 201);
    }

    public function show(Program $program): JsonResponse
    {
        return response()->json($program->load('organization'));
    }

    public function update(ProgramRequest $request, Program $program): JsonResponse
    {
        $program->update($request->validated());

        return response()->json($program->refresh());
    }

    public function destroy(Program $program): JsonResponse
    {
        $program->delete();

        return response()->json(['message' => 'Program deleted.']);
    }
}
