<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use App\Models\UserProgram;
use App\Services\AccessScope;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportDailyReports(Request $request): Response
    {
        $query = DailyReport::query()
            ->whereIn('user_program_id', AccessScope::assignmentIds($request->user()))
            ->with([
                'userProgram.user',
                'userProgram.program',
                'userProgram.attendanceLogs' => fn ($attendance) => $attendance->where('approval_status', 'approved'),
            ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('report_date', [$request->start_date, $request->end_date]);
        }

        $reports = $query->latest('report_date')->get();

        $csv = "Date,Student Name,Program,Tasks Done,Hours Worked,Status,Submitted\n";
        
        foreach ($reports as $report) {
            $csv .= sprintf(
                '"%s","%s","%s","%s",%f,"%s","%s"' . "\n",
                $report->report_date,
                $report->userProgram?->user?->name ?? 'N/A',
                $report->userProgram?->program?->name ?? 'N/A',
                str_replace('"', '""', $report->tasks_done ?? ''),
                $report->userProgram?->attendanceLogs
                    ?->first(fn ($log) => $log->date?->toDateString() === $report->report_date?->toDateString())
                    ?->total_hours ?? 0,
                $report->status,
                $report->submitted_at ?? 'N/A'
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="daily-reports-' . now()->format('Y-m-d') . '.csv"');
    }

    public function exportWeeklyReports(Request $request): Response
    {
        $query = WeeklyReport::query()
            ->whereIn('user_program_id', AccessScope::assignmentIds($request->user()))
            ->with(['userProgram.user', 'userProgram.program']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
        }

        $reports = $query->latest('start_date')->get();

        $csv = "Week,Student Name,Program,Start Date,End Date,Status,Submitted\n";
        
        foreach ($reports as $report) {
            $csv .= sprintf(
                '%d,"%s","%s","%s","%s","%s","%s"' . "\n",
                $report->week_number,
                $report->userProgram?->user?->name ?? 'N/A',
                $report->userProgram?->program?->name ?? 'N/A',
                $report->start_date,
                $report->end_date,
                $report->status,
                $report->submitted_at ?? 'N/A'
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="weekly-reports-' . now()->format('Y-m-d') . '.csv"');
    }

    public function exportAssignments(Request $request): Response
    {
        $query = AccessScope::assignments(UserProgram::query(), $request->user())
            ->with(['user', 'program', 'supervisor', 'coordinator']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $assignments = $query->latest('created_at')->get();

        $csv = "Student,Program,Required Hours,Status,Start Date,End Date,Supervisor,Coordinator\n";
        
        foreach ($assignments as $assignment) {
            $csv .= sprintf(
                '"%s","%s",%f,"%s","%s","%s","%s","%s"' . "\n",
                $assignment->user?->name ?? 'N/A',
                $assignment->program?->name ?? 'N/A',
                $assignment->required_hours,
                $assignment->status,
                $assignment->start_date ?? 'N/A',
                $assignment->end_date ?? 'N/A',
                $assignment->supervisor?->name ?? 'N/A',
                $assignment->coordinator?->name ?? 'N/A'
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="assignments-' . now()->format('Y-m-d') . '.csv"');
    }

    public function exportStudentData(Request $request): Response
    {
        $validated = $request->validate(['user_program_id' => 'required|integer|exists:user_programs,id']);
        
        $assignment = AccessScope::assignments(UserProgram::query(), $request->user())
            ->with(['user', 'program', 'dailyReports', 'weeklyReports', 'attendanceLogs' => fn ($query) =>
                $query->where('approval_status', 'approved')
            ])
            ->findOrFail($validated['user_program_id']);

        // Generate comprehensive CSV with student info
        $csv = "STUDENT DATA EXPORT\n";
        $csv .= "Date Exported," . now()->format('Y-m-d H:i:s') . "\n\n";
        
        $csv .= "STUDENT INFORMATION\n";
        $csv .= "Name," . ($assignment->user?->name ?? 'N/A') . "\n";
        $csv .= "Email," . ($assignment->user?->email ?? 'N/A') . "\n";
        $csv .= "Program," . ($assignment->program?->name ?? 'N/A') . "\n";
        $csv .= "Status," . $assignment->status . "\n";
        $csv .= "Start Date," . ($assignment->start_date ?? 'N/A') . "\n";
        $csv .= "End Date," . ($assignment->end_date ?? 'N/A') . "\n\n";

        $csv .= "DAILY REPORTS\n";
        $csv .= "Date,Tasks,Hours,Status\n";
        foreach ($assignment->dailyReports as $report) {
            $csv .= sprintf(
                '"%s","%s",%f,"%s"' . "\n",
                $report->report_date,
                str_replace('"', '""', $report->tasks_done ?? ''),
                $assignment->attendanceLogs
                    ->first(fn ($log) => $log->date?->toDateString() === $report->report_date?->toDateString())
                    ?->total_hours ?? 0,
                $report->status
            );
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="student-data-' . now()->format('Y-m-d') . '.csv"');
    }
}
