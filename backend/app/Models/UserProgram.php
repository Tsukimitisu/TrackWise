<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'supervisor_id',
        'coordinator_id',
        'required_hours',
        'completed_hours',
        'status',
    ];

    protected $casts = [
        'required_hours' => 'decimal:2',
        'completed_hours' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function remainingHours(): float
    {
        return max(0, (float) $this->required_hours - (float) $this->completed_hours);
    }

    public function progressPercentage(): float
    {
        if ((float) $this->required_hours <= 0) {
            return 0;
        }

        return min(100, round(((float) $this->completed_hours / (float) $this->required_hours) * 100, 2));
    }
}
