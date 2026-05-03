<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_program_id',
        'date',
        'time_in',
        'time_out',
        'break_minutes',
        'total_hours',
        'status',
        'time_in_photo',
        'time_out_photo',
        'latitude',
        'longitude',
        'remarks',
        'approval_status',
        'approved_by',
    ];

    protected $casts = [
        'date' => 'date',
        'time_in' => 'datetime:H:i:s',
        'time_out' => 'datetime:H:i:s',
        'break_minutes' => 'integer',
        'total_hours' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function userProgram(): BelongsTo
    {
        return $this->belongsTo(UserProgram::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
