<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'required_hours' => ['required', 'numeric', 'min:1', 'max:10000'],
            'start_date' => ['nullable', 'date', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'status' => ['required', 'string', Rule::in(['draft', 'active', 'completed', 'archived'])],
            'report_frequency' => ['nullable', 'string', Rule::in(['daily', 'weekly', 'monthly'])],
        ];
    }

    public function messages(): array
    {
        return [
            'name.min' => 'Program name must be at least 3 characters',
            'required_hours.min' => 'Required hours must be greater than 0',
            'required_hours.max' => 'Required hours cannot exceed 10000',
            'end_date.after_or_equal' => 'End date must be on or after the start date',
        ];
    }
}
