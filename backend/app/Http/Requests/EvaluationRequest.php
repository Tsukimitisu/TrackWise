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
            'attendance_score' => ['required', 'integer', 'min:1', 'max:5'],
            'performance_score' => ['required', 'integer', 'min:1', 'max:5'],
            'communication_score' => ['required', 'integer', 'min:1', 'max:5'],
            'technical_score' => ['required', 'integer', 'min:1', 'max:5'],
            'professionalism_score' => ['required', 'integer', 'min:1', 'max:5'],
            'comments' => ['nullable', 'string'],
        ];
    }
}
