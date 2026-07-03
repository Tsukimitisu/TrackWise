<?php

namespace App\Policies;

use App\Models\DocumentationFile;
use App\Models\User;
use App\Services\AccessScope;

class DocumentationFilePolicy
{
    public function viewAny(User $user): bool { return ! $user->hasRole('Viewer'); }
    public function view(User $user, DocumentationFile $file): bool { return AccessScope::canViewAssignment($user, $file->userProgram); }
    public function create(User $user): bool { return $user->hasRole('Student'); }
    public function update(User $user, DocumentationFile $file): bool
    {
        return $user->hasRole('Student') && (int) $file->userProgram->user_id === (int) $user->id;
    }
    public function delete(User $user, DocumentationFile $file): bool { return $this->update($user, $file); }
}
