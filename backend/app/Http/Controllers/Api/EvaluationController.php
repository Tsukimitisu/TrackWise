<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationRequest;
use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Evaluation::query()->with(['userProgram', 'supervisor']);

        // Filter by user_program_id
        if ($request->has('user_program_id')) {
            $query->where('user_program_id', $request->user_program_id);
        }

        // Filter by supervisor_id
        if ($request->has('supervisor_id')) {
            $query->where('supervisor_id', $request->supervisor_id);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(EvaluationRequest $request): JsonResponse
    {
        $request->merge(['supervisor_id' => auth()->id()]);
        $evaluation = Evaluation::create($request->validated());

        return response()->json($evaluation->load(['userProgram', 'supervisor']), 201);
    }

    public function show(Evaluation $evaluation): JsonResponse
    {
        return response()->json($evaluation->load(['userProgram', 'supervisor']));
    }

    public function update(Request $request, Evaluation $evaluation): JsonResponse
    {
        $validated = $request->validate([
            'attendance_score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'performance_score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'communication_score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'technical_score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'professionalism_score' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comments' => ['nullable', 'string', 'max:2000'],
        ]);

        $evaluation->update($validated);

        return response()->json($evaluation->refresh());
    }

    public function destroy(Evaluation $evaluation): JsonResponse
    {
        $evaluation->delete();

        return response()->json(['message' => 'Evaluation deleted.']);
    }

    public function getAverageScore(Evaluation $evaluation): JsonResponse
    {
        $scores = [
            $evaluation->attendance_score,
            $evaluation->performance_score,
            $evaluation->communication_score,
            $evaluation->technical_score,
            $evaluation->professionalism_score,
        ];

        $validScores = array_filter($scores, fn($s) => $s !== null);
        $average = count($validScores) > 0 ? array_sum($validScores) / count($validScores) : 0;

        return response()->json(['average_score' => round($average, 2)]);
    }
}
