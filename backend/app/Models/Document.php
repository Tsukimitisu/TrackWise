<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_program_id',
        'document_type',
        'file_url',
        'status',
        'remarks',
        'uploaded_at',
        'reviewed_by',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    public function userProgram(): BelongsTo
    {
        return $this->belongsTo(UserProgram::class);
    }
}
