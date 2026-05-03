<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'supervisor_id' => ['required', 'integer', 'exists:users,id'],
            'attendance_score' => ['required', 'integer', 'min:0', 'max:100'],
            'performance_score' => ['required', 'integer', 'min:0', 'max:100'],
            'communication_score' => ['required', 'integer', 'min:0', 'max:100'],
            'technical_score' => ['required', 'integer', 'min:0', 'max:100'],
            'professionalism_score' => ['required', 'integer', 'min:0', 'max:100'],
            'comments' => ['nullable', 'string'],
        ];
    }
}