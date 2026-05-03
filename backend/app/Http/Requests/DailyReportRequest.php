<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DailyReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'report_date' => ['required', 'date'],
            'tasks_done' => ['required', 'string'],
            'tools_used' => ['nullable', 'string'],
            'problems_encountered' => ['nullable', 'string'],
            'learnings' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['draft', 'submitted', 'approved', 'rejected', 'needs_revision'])],
            'submitted_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'integer', 'exists:users,id'],
            'review_comment' => ['nullable', 'string'],
        ];
    }
}
