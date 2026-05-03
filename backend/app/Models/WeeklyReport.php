<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeeklyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_program_id',
        'week_number',
        'start_date',
        'end_date',
        'summary',
        'skills_learned',
        'challenges',
        'reflection',
        'status',
        'submitted_at',
        'reviewed_by',
        'review_comment',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'submitted_at' => 'datetime',
    ];

    public function userProgram(): BelongsTo
    {
        return $this->belongsTo(UserProgram::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(DocumentationFile::class);
    }
}
