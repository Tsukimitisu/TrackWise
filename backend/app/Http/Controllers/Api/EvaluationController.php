<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationRequest;
use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;

class EvaluationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Evaluation::query()->with(['userProgram', 'supervisor'])->latest()->paginate(15));
    }

    public function store(EvaluationRequest $request): JsonResponse
    {
        return response()->json(Evaluation::create($request->validated()), 201);
    }

    public function show(Evaluation $evaluation): JsonResponse
    {
        return response()->json($evaluation->load(['userProgram', 'supervisor']));
    }

    public function update(EvaluationRequest $request, Evaluation $evaluation): JsonResponse
    {
        $evaluation->update($request->validated());

        return response()->json($evaluation->refresh());
    }

    public function destroy(Evaluation $evaluation): JsonResponse
    {
        $evaluation->delete();

        return response()->json(['message' => 'Evaluation deleted.']);
    }
}
