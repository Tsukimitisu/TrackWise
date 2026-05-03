<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalLog;
use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\WeeklyReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;

class ApprovalController extends Controller
{
    public function review(Request $request, string $type, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,needs_revision,pending'],
            'comment' => ['nullable', 'string'],
        ]);

        $approvable = $this->resolveApprovable($type, $id);

        if (! $approvable) {
            return response()->json(['message' => 'Approvaable record not found.'], 404);
        }

        $this->applyStatus($approvable, $validated['status']);

        ApprovalLog::create([
            'approvable_type' => $approvable::class,
            'approvable_id' => $approvable->getKey(),
            'reviewed_by' => (int) $request->user()->id,
            'status' => $validated['status'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($approvable->refresh());
    }

    private function resolveApprovable(string $type, int $id): ?Model
    {
        return match ($type) {
            'attendance' => AttendanceLog::query()->find($id),
            'daily-report' => DailyReport::query()->find($id),
            'weekly-report' => WeeklyReport::query()->find($id),
            'document' => Document::query()->find($id),
            'evaluation' => Evaluation::query()->find($id),
            default => null,
        };
    }

    private function applyStatus(Model $approvable, string $status): void
    {
        if ($approvable instanceof AttendanceLog) {
            $approvable->approval_status = $status;
            $approvable->approved_by = request()->user()->id;
            $approvable->save();

            return;
        }

        if (property_exists($approvable, 'status')) {
            $approvable->status = $status;
            if ($approvable instanceof DailyReport || $approvable instanceof WeeklyReport || $approvable instanceof Document) {
                $approvable->reviewed_by = request()->user()->id;
                $approvable->review_comment = request()->input('comment');
            }

            $approvable->save();
        }
    }
}
