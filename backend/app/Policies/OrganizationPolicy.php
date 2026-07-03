<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;
use App\Services\AccessScope;

class OrganizationPolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, Organization $organization): bool
    {
        return AccessScope::organizations(Organization::query(), $user)->whereKey($organization->id)->exists();
    }
    public function create(User $user): bool { return $user->hasRole('Super Admin', 'Organization Admin'); }
    public function update(User $user, Organization $organization): bool
    {
        return $user->isSuperAdmin()
            || ($user->isOrganizationAdmin() && (int) $organization->owner_organization_id === (int) $user->organization_id);
    }
    public function delete(User $user, Organization $organization): bool { return $this->update($user, $organization); }
}
