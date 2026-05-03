<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_program_id',
        'report_date',
        'tasks_done',
        'tools_used',
        'problems_encountered',
        'learnings',
        'status',
        'submitted_at',
        'reviewed_by',
        'review_comment',
    ];

    protected $casts = [
        'report_date' => 'date',
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
