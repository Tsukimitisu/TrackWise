<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClockInRequest extends FormRequest
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
            'time_in' => ['required', 'date_format:H:i'],
            'time_in_photo' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
