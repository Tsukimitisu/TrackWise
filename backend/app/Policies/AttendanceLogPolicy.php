<?php

namespace App\Policies;

use App\Models\AttendanceLog;
use App\Models\User;
use App\Services\AccessScope;

class AttendanceLogPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, AttendanceLog $log): bool { return AccessScope::canViewAssignment($user, $log->userProgram); }
    public function create(User $user): bool { return $user->hasRole('Student', 'Super Admin', 'Organization Admin'); }
    public function update(User $user, AttendanceLog $log): bool
    {
        return ($user->hasRole('Student') && (int) $log->userProgram->user_id === (int) $user->id)
            || AccessScope::canReviewAssignment($user, $log->userProgram);
    }
    public function delete(User $user, AttendanceLog $log): bool
    {
        return AccessScope::canManageAssignment($user, $log->userProgram);
    }
    public function review(User $user, AttendanceLog $log): bool { return AccessScope::canReviewAssignment($user, $log->userProgram); }
}
