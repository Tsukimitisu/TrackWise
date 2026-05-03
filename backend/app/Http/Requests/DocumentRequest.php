<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'document_type' => ['required', 'string', 'max:255'],
            'file_url' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected', 'needs_revision'])],
            'remarks' => ['nullable', 'string'],
            'uploaded_at' => ['nullable', 'date'],
            'reviewed_by' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
