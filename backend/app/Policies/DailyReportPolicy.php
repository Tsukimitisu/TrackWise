<?php

namespace App\Policies;

use App\Models\DailyReport;
use App\Models\User;
use App\Services\AccessScope;

class DailyReportPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, DailyReport $report): bool { return AccessScope::canViewAssignment($user, $report->userProgram); }
    public function create(User $user): bool { return $user->hasRole('Student'); }
    public function update(User $user, DailyReport $report): bool
    {
        return $user->hasRole('Student') && (int) $report->userProgram->user_id === (int) $user->id;
    }
    public function delete(User $user, DailyReport $report): bool { return $this->update($user, $report); }
    public function submit(User $user, DailyReport $report): bool { return $this->update($user, $report); }
    public function review(User $user, DailyReport $report): bool { return AccessScope::canReviewAssignment($user, $report->userProgram); }
}
