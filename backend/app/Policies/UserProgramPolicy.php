<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserProgram;
use App\Services\AccessScope;

class UserProgramPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, UserProgram $assignment): bool { return AccessScope::canViewAssignment($user, $assignment); }
    public function create(User $user): bool { return $user->hasRole('Super Admin', 'Organization Admin'); }
    public function update(User $user, UserProgram $assignment): bool { return AccessScope::canManageAssignment($user, $assignment); }
    public function delete(User $user, UserProgram $assignment): bool { return AccessScope::canManageAssignment($user, $assignment); }
}
