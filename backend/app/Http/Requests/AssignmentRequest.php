<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'supervisor_id' => ['nullable', 'integer', 'exists:users,id', 'different:user_id'],
            'coordinator_id' => ['nullable', 'integer', 'exists:users,id', 'different:user_id', 'different:supervisor_id'],
            'required_hours' => ['required', 'numeric', 'min:1', 'max:10000'],
            'completed_hours' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'start_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'status' => ['required', 'string', Rule::in(['active', 'completed', 'dropped', 'suspended'])],
        ];
    }

    public function messages(): array
    {
        return [
            'supervisor_id.different' => 'Supervisor cannot be the same as the assigned student',
            'coordinator_id.different' => 'Coordinator cannot be the same as the supervisor or student',
            'required_hours.min' => 'Required hours must be at least 1',
            'end_date.after_or_equal' => 'End date must be on or after the start date',
        ];
    }
}
