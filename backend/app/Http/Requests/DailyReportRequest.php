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
            'report_date' => ['required', 'date', 'date_format:Y-m-d', 'before_or_equal:today'],
            'tasks_done' => ['required', 'string', 'min:10', 'max:1000'],
            'tools_used' => ['nullable', 'string', 'max:500'],
            'problems_encountered' => ['nullable', 'string', 'max:500'],
            'learnings' => ['nullable', 'string', 'max:500'],
            'reflection' => ['nullable', 'string', 'max:2000'],
            'hours_worked' => ['nullable', 'numeric', 'min:0', 'max:24'],
        ];
    }

    public function messages(): array
    {
        return [
            'tasks_done.required' => 'Tasks done field is required and must be at least 10 characters',
            'tasks_done.min' => 'Please provide more detail about your tasks (minimum 10 characters)',
            'report_date.before_or_equal' => 'Report date cannot be in the future',
            'hours_worked.max' => 'Hours worked cannot exceed 24',
            'hours_worked.min' => 'Hours worked must be 0 or greater',
        ];
    }
}

