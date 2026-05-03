<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DailyReportRequest;
use App\Models\DailyReport;
use Illuminate\Http\JsonResponse;

class DailyReportController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DailyReport::query()->with('userProgram')->latest()->paginate(15));
    }

    public function store(DailyReportRequest $request): JsonResponse
    {
        return response()->json(DailyReport::create($request->validated()), 201);
    }

    public function show(DailyReport $dailyReport): JsonResponse
    {
        return response()->json($dailyReport->load('userProgram'));
    }

    public function update(DailyReportRequest $request, DailyReport $dailyReport): JsonResponse
    {
        $dailyReport->update($request->validated());

        return response()->json($dailyReport->refresh());
    }

    public function destroy(DailyReport $dailyReport): JsonResponse
    {
        $dailyReport->delete();

        return response()->json(['message' => 'Daily report deleted.']);
    }
}
