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
            'supervisor_id' => ['nullable', 'integer', 'exists:users,id'],
            'coordinator_id' => ['nullable', 'integer', 'exists:users,id'],
            'required_hours' => ['required', 'numeric', 'min:0'],
            'completed_hours' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', Rule::in(['active', 'completed', 'dropped', 'suspended'])],
        ];
    }
}
