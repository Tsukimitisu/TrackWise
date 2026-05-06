<?php

namespace App\Http\Controllers\Api;

use App\Models\DocumentationFile;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use App\Models\AttendanceLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentationFileController
{
    public function index(Request $request): JsonResponse
    {
        $query = DocumentationFile::query();

        if ($request->has('user_program_id')) {
            $query->where('user_program_id', $request->user_program_id);
        }

        if ($request->has('file_type')) {
            $query->where('file_type', $request->file_type);
        }

        if ($request->has('daily_report_id')) {
            $query->where('daily_report_id', $request->daily_report_id);
        }

        if ($request->has('weekly_report_id')) {
            $query->where('weekly_report_id', $request->weekly_report_id);
        }

        if ($request->has('attendance_log_id')) {
            $query->where('attendance_log_id', $request->attendance_log_id);
        }

        return response()->json($query->latest('taken_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'file' => ['required', 'file', 'image', 'max:5120'], // 5MB max
            'caption' => ['nullable', 'string', 'max:500'],
            'taken_at' => ['nullable', 'date'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'daily_report_id' => ['nullable', 'integer', 'exists:daily_reports,id'],
            'weekly_report_id' => ['nullable', 'integer', 'exists:weekly_reports,id'],
            'attendance_log_id' => ['nullable', 'integer', 'exists:attendance_logs,id'],
        ]);

        // Store the file
        $file = $request->file('file');
        $path = $file->store('documentation', 'public');

        $documentation = DocumentationFile::create([
            'user_program_id' => $validated['user_program_id'],
            'file_url' => Storage::url($path),
            'file_type' => $file->getMimeType(),
            'caption' => $validated['caption'] ?? null,
            'taken_at' => $validated['taken_at'] ?? now(),
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'daily_report_id' => $validated['daily_report_id'] ?? null,
            'weekly_report_id' => $validated['weekly_report_id'] ?? null,
            'attendance_log_id' => $validated['attendance_log_id'] ?? null,
        ]);

        return response()->json($documentation, 201);
    }

    public function show(DocumentationFile $documentationFile): JsonResponse
    {
        return response()->json($documentationFile->load('userProgram'));
    }

    public function update(Request $request, DocumentationFile $documentationFile): JsonResponse
    {
        $validated = $request->validate([
            'caption' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $documentationFile->update($validated);

        return response()->json($documentationFile->refresh());
    }

    public function destroy(DocumentationFile $documentationFile): JsonResponse
    {
        // Delete file from storage if it exists
        if ($documentationFile->file_url) {
            $path = str_replace('/storage/', '', $documentationFile->file_url);
            Storage::disk('public')->delete($path);
        }

        $documentationFile->delete();

        return response()->json(['message' => 'Documentation file deleted.']);
    }
}
