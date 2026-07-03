<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalLog;
use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use App\Services\ApprovalService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(private ApprovalService $approvals)
    {
    }

    public function review(Request $request, string $type, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,needs_revision'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);
        $record = $this->resolve($type, $id);
        $this->authorize('review', $record);

        return response()->json($this->approvals->review(
            $request->user(),
            $record,
            $validated['status'],
            $validated['comment'] ?? null
        ));
    }

    public function history(Request $request, string $type, int $id): JsonResponse
    {
        $record = $this->resolve($type, $id);
        $this->authorize('view', $record);

        return response()->json(ApprovalLog::query()
            ->where('approvable_type', $record::class)
            ->where('approvable_id', $record->getKey())
            ->with('reviewer:id,first_name,last_name')
            ->latest()
            ->get());
    }

    private function resolve(string $type, int $id): Model
    {
        return match ($type) {
            'attendance' => AttendanceLog::query()->findOrFail($id),
            'daily-report' => DailyReport::query()->findOrFail($id),
            'weekly-report' => WeeklyReport::query()->findOrFail($id),
            default => abort(404, 'Approvable record not found.'),
        };
    }
}
