<?php

namespace App\Policies;

use App\Models\User;
use App\Services\AccessScope;

class UserPolicy
{
    public function viewAny(User $user): bool { return $user->hasRole('Super Admin', 'Organization Admin', 'Coordinator'); }
    public function view(User $user, User $subject): bool { return AccessScope::users(User::query(), $user)->whereKey($subject->id)->exists(); }
    public function create(User $user): bool { return $user->hasRole('Super Admin', 'Organization Admin'); }
    public function update(User $user, User $subject): bool { return $this->create($user) && $this->view($user, $subject); }
    public function delete(User $user, User $subject): bool { return ! $user->is($subject) && $this->update($user, $subject); }
}
