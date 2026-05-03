<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'date' => ['required', 'date'],
            'time_in' => ['nullable', 'date_format:H:i'],
            'time_out' => ['nullable', 'date_format:H:i'],
            'break_minutes' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'string', Rule::in(['present', 'late', 'absent', 'undertime', 'pending', 'approved', 'rejected'])],
            'time_in_photo' => ['nullable', 'string'],
            'time_out_photo' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'remarks' => ['nullable', 'string'],
            'approval_status' => ['required', 'string', Rule::in(['draft', 'submitted', 'pending', 'approved', 'rejected', 'needs_revision'])],
        ];
    }
}
