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
            'week_number' => ['required', 'integer', 'min:1', 'max:53'],
            'start_date' => ['required', 'date', 'date_format:Y-m-d', 'before_or_equal:today'],
            'end_date' => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:start_date', 'before_or_equal:today'],
            'summary' => ['required', 'string', 'min:20', 'max:2000'],
            'skills_learned' => ['nullable', 'string', 'max:1000'],
            'challenges' => ['nullable', 'string', 'max:1000'],
            'reflection' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'string', Rule::in(['draft', 'submitted', 'approved', 'rejected', 'needs_revision'])],
            'submitted_at' => ['nullable', 'date', 'date_format:Y-m-d H:i:s'],
            'reviewed_by' => ['nullable', 'integer', 'exists:users,id'],
            'review_comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'summary.required' => 'Weekly summary is required and must be at least 20 characters',
            'summary.min' => 'Please provide a more detailed weekly summary (minimum 20 characters)',
            'week_number.max' => 'Week number cannot exceed 53',
            'end_date.after_or_equal' => 'End date must be on or after the start date',
            'end_date.before_or_equal' => 'End date cannot be in the future',
        ];
    }
}
