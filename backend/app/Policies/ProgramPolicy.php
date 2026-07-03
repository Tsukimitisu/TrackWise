<?php

namespace App\Policies;

use App\Models\Program;
use App\Models\User;
use App\Services\AccessScope;

class ProgramPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, Program $program): bool
    {
        return AccessScope::programs(Program::query(), $user)->whereKey($program->id)->exists();
    }
    public function create(User $user): bool { return $user->hasRole('Super Admin', 'Organization Admin'); }
    public function update(User $user, Program $program): bool { return $this->create($user) && $this->view($user, $program); }
    public function delete(User $user, Program $program): bool { return $this->update($user, $program); }
}
