<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->firstOrCreate(
            ['name' => 'TrackWise Demo Organization'],
            [
                'type' => 'training center',
                'address' => 'Demo Address',
                'contact_email' => 'admin@trackwise.test',
                'contact_phone' => '0000000000',
                'status' => 'active',
            ]
        );

        $superAdminRole = Role::query()->where('name', 'Super Admin')->firstOrFail();
        $studentRole = Role::query()->where('name', 'Student')->firstOrFail();

        User::query()->updateOrCreate(
            ['email' => 'admin@trackwise.test'],
            [
                'organization_id' => null,
                'role_id' => $superAdminRole->id,
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'student@trackwise.test'],
            [
                'organization_id' => $organization->id,
                'role_id' => $studentRole->id,
                'first_name' => 'Demo',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );
    }
}
