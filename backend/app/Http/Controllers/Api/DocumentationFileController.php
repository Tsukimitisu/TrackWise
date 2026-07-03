<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentationFile;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use App\Models\AttendanceLog;
use App\Models\UserProgram;
use App\Services\AccessScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentationFileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', DocumentationFile::class);
        $query = DocumentationFile::query()
            ->whereIn('user_program_id', AccessScope::assignmentIds($request->user()));

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
        $this->authorize('create', DocumentationFile::class);
        $validated = $request->validate([
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'file' => ['required', 'file', 'image', 'max:5120'], // 5MB max
            'title' => ['required', 'string', 'max:150'],
            'caption' => ['nullable', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:2000'],
            'taken_at' => ['nullable', 'date'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'daily_report_id' => ['nullable', 'integer', 'exists:daily_reports,id', 'required_without_all:weekly_report_id,attendance_log_id'],
            'weekly_report_id' => ['nullable', 'integer', 'exists:weekly_reports,id', 'required_without_all:daily_report_id,attendance_log_id'],
            'attendance_log_id' => ['nullable', 'integer', 'exists:attendance_logs,id', 'required_without_all:daily_report_id,weekly_report_id'],
        ]);
        $assignment = UserProgram::query()->findOrFail($validated['user_program_id']);
        abort_unless((int) $assignment->user_id === (int) $request->user()->id, 403);
        $this->validateAttachmentOwnership($validated);

        $file = $request->file('file');
        $path = $file->store("documentation/{$assignment->id}", 'local');

        $documentation = DocumentationFile::create([
            'user_program_id' => $validated['user_program_id'],
            'file_url' => $path,
            'file_type' => $file->getMimeType(),
            'title' => $validated['title'],
            'caption' => $validated['caption'] ?? null,
            'description' => $validated['description'],
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
        $this->authorize('view', $documentationFile);
        return response()->json($documentationFile->load('userProgram'));
    }

    public function update(Request $request, DocumentationFile $documentationFile): JsonResponse
    {
        $this->authorize('update', $documentationFile);
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:150'],
            'caption' => ['nullable', 'string', 'max:500'],
            'description' => ['sometimes', 'required', 'string', 'max:2000'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $documentationFile->update($validated);

        return response()->json($documentationFile->refresh());
    }

    public function destroy(DocumentationFile $documentationFile): JsonResponse
    {
        $this->authorize('delete', $documentationFile);
        if ($documentationFile->file_url) {
            Storage::disk('local')->delete($documentationFile->file_url);
            if (str_starts_with($documentationFile->file_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $documentationFile->file_url));
            }
        }

        $documentationFile->delete();

        return response()->json(['message' => 'Documentation file deleted.']);
    }

    public function download(DocumentationFile $documentationFile): StreamedResponse
    {
        $this->authorize('view', $documentationFile);
        abort_unless(Storage::disk('local')->exists($documentationFile->file_url), 404);

        $extension = pathinfo($documentationFile->file_url, PATHINFO_EXTENSION);
        $name = preg_replace('/[^A-Za-z0-9_-]/', '-', $documentationFile->title ?: 'documentation');

        return Storage::disk('local')->download(
            $documentationFile->file_url,
            "{$name}.{$extension}",
            ['Content-Type' => $documentationFile->file_type, 'Cache-Control' => 'private, no-store']
        );
    }

    private function validateAttachmentOwnership(array $validated): void
    {
        $assignmentId = (int) $validated['user_program_id'];
        $checks = [
            'daily_report_id' => DailyReport::class,
            'weekly_report_id' => WeeklyReport::class,
            'attendance_log_id' => AttendanceLog::class,
        ];

        foreach ($checks as $field => $model) {
            if (! empty($validated[$field])) {
                abort_unless(
                    $model::query()
                        ->whereKey($validated[$field])
                        ->where('user_program_id', $assignmentId)
                        ->exists(),
                    422,
                    'The documentation attachment must belong to the selected assignment.'
                );
            }
        }
    }
}
