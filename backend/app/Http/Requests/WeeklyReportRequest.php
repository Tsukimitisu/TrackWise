<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WeeklyReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'week_number' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'summary' => ['required', 'string'],
            'skills_learned' => ['nullable', 'string'],
            'challenges' => ['nullable', 'string'],
            'reflection' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['draft', 'submitted', 'approved', 'rejected', 'needs_revision'])],
            'submitted_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'integer', 'exists:users,id'],
            'review_comment' => ['nullable', 'string'],
        ];
    }
}
