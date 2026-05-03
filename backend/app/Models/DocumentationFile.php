<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentationFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_program_id',
        'attendance_log_id',
        'daily_report_id',
        'weekly_report_id',
        'file_url',
        'file_type',
        'caption',
        'taken_at',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'taken_at' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function userProgram(): BelongsTo
    {
        return $this->belongsTo(UserProgram::class);
    }
}
