<?php

namespace App\Policies;

use App\Models\Evaluation;
use App\Models\User;
use App\Services\AccessScope;

class EvaluationPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, Evaluation $evaluation): bool { return AccessScope::canViewAssignment($user, $evaluation->userProgram); }
    public function create(User $user): bool { return $user->hasRole('Supervisor', 'Coordinator', 'Super Admin', 'Organization Admin'); }
    public function update(User $user, Evaluation $evaluation): bool { return AccessScope::canReviewAssignment($user, $evaluation->userProgram); }
    public function delete(User $user, Evaluation $evaluation): bool { return $this->update($user, $evaluation); }
}
