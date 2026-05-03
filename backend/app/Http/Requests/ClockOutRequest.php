<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClockOutRequest extends FormRequest
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
            'time_out' => ['required', 'date_format:H:i'],
            'break_minutes' => ['nullable', 'integer', 'min:0'],
            'time_out_photo' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}