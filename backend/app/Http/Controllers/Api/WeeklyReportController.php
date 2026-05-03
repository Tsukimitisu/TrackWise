<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WeeklyReportRequest;
use App\Models\WeeklyReport;
use Illuminate\Http\JsonResponse;

class WeeklyReportController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(WeeklyReport::query()->with('userProgram')->latest()->paginate(15));
    }

    public function store(WeeklyReportRequest $request): JsonResponse
    {
        return response()->json(WeeklyReport::create($request->validated()), 201);
    }

    public function show(WeeklyReport $weeklyReport): JsonResponse
    {
        return response()->json($weeklyReport->load('userProgram'));
    }

    public function update(WeeklyReportRequest $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $weeklyReport->update($request->validated());

        return response()->json($weeklyReport->refresh());
    }

    public function destroy(WeeklyReport $weeklyReport): JsonResponse
    {
        $weeklyReport->delete();

        return response()->json(['message' => 'Weekly report deleted.']);
    }
}
