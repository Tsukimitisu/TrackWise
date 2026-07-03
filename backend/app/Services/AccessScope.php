<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProgram;
use Illuminate\Database\Eloquent\Builder;

class AccessScope
{
    public static function assignments(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if ($actor->isOrganizationAdmin()) {
            return $query->whereHas('program', fn (Builder $program) =>
                $program->whereHas('organization', fn (Builder $organization) =>
                    $organization->whereKey($actor->organization_id)
                        ->orWhere('owner_organization_id', $actor->organization_id)
                )
            );
        }

        if ($actor->hasRole('Coordinator')) {
            return $query->where(function (Builder $scoped) use ($actor) {
                $scoped->where('coordinator_id', $actor->id);
                if ($actor->organization_id) {
                    $scoped->orWhereHas('program', fn (Builder $program) =>
                        $program->where('organization_id', $actor->organization_id)
                    );
                }
            });
        }

        if ($actor->hasRole('Supervisor')) {
            return $query->where('supervisor_id', $actor->id);
        }

        if ($actor->hasRole('Student')) {
            return $query->where('user_id', $actor->id);
        }

        return $query->whereRaw('1 = 0');
    }

    public static function assignmentIds(User $actor): Builder
    {
        return self::assignments(UserProgram::query()->select('id'), $actor);
    }

    public static function canViewAssignment(User $actor, UserProgram $assignment): bool
    {
        return self::assignments(UserProgram::query(), $actor)
            ->whereKey($assignment->getKey())
            ->exists();
    }

    public static function canManageAssignment(User $actor, UserProgram $assignment): bool
    {
        return $actor->isSuperAdmin()
            || ($actor->isOrganizationAdmin()
                && $actor->organization_id
                && self::programs(\App\Models\Program::query(), $actor)
                    ->whereKey($assignment->program_id)
                    ->exists());
    }

    public static function canReviewAssignment(User $actor, UserProgram $assignment): bool
    {
        if ($actor->isSuperAdmin()) {
            return true;
        }

        if ($actor->isOrganizationAdmin()) {
            return self::canManageAssignment($actor, $assignment);
        }

        if ($actor->hasRole('Supervisor')) {
            return (int) $assignment->supervisor_id === (int) $actor->id;
        }

        if ($actor->hasRole('Coordinator')) {
            return (int) $assignment->coordinator_id === (int) $actor->id;
        }

        return false;
    }

    public static function users(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if ($actor->isOrganizationAdmin()) {
            return $query->where('organization_id', $actor->organization_id)
                ->whereHas('role', fn (Builder $role) => $role->where('name', '!=', 'Super Admin'));
        }

        $assignmentIds = self::assignmentIds($actor);

        return $query->where(function (Builder $scoped) use ($actor, $assignmentIds) {
            $scoped->whereKey($actor->id)
                ->orWhereIn('id', UserProgram::query()
                    ->whereIn('id', $assignmentIds)
                    ->select('user_id'));
        });
    }

    public static function programs(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        if (($actor->isOrganizationAdmin() || $actor->hasRole('Coordinator')) && $actor->organization_id) {
            return $query->whereHas('organization', fn (Builder $organization) =>
                $organization->whereKey($actor->organization_id)
                    ->orWhere('owner_organization_id', $actor->organization_id)
            );
        }

        return $query->whereIn('id', self::assignments(UserProgram::query(), $actor)->select('program_id'));
    }

    public static function organizations(Builder $query, User $actor): Builder
    {
        if ($actor->isSuperAdmin()) {
            return $query;
        }

        return $query->where(function (Builder $scoped) use ($actor) {
            $scoped->whereKey($actor->organization_id)
                ->orWhere('owner_organization_id', $actor->organization_id);
        });
    }
}
