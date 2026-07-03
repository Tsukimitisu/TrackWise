<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WeeklyReport;
use App\Services\AccessScope;

class WeeklyReportPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, WeeklyReport $report): bool { return AccessScope::canViewAssignment($user, $report->userProgram); }
    public function create(User $user): bool { return $user->hasRole('Student'); }
    public function update(User $user, WeeklyReport $report): bool
    {
        return $user->hasRole('Student') && (int) $report->userProgram->user_id === (int) $user->id;
    }
    public function delete(User $user, WeeklyReport $report): bool { return $this->update($user, $report); }
    public function submit(User $user, WeeklyReport $report): bool { return $this->update($user, $report); }
    public function review(User $user, WeeklyReport $report): bool { return AccessScope::canReviewAssignment($user, $report->userProgram); }
}
