<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Role;
use App\Models\Program;
use App\Models\UserProgram;
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

        $roles = Role::query()->whereIn('name', [
            'Super Admin',
            'Organization Admin',
            'Coordinator',
            'Supervisor',
            'Student',
            'Viewer',
        ])->get()->keyBy('name');

        $password = Hash::make('Password123!');

        $accounts = [
            ['Super', 'Admin', 'superadmin@trackwise.test', 'Super Admin', null],
            ['Organization', 'Admin', 'orgadmin@trackwise.test', 'Organization Admin', $organization->id],
            ['Demo', 'Coordinator', 'coordinator@trackwise.test', 'Coordinator', $organization->id],
            ['Demo', 'Supervisor', 'supervisor@trackwise.test', 'Supervisor', $organization->id],
            ['Demo', 'Student', 'student@trackwise.test', 'Student', $organization->id],
            ['Demo', 'Viewer', 'viewer@trackwise.test', 'Viewer', $organization->id],
        ];

        foreach ($accounts as [$firstName, $lastName, $email, $roleName, $organizationId]) {
            User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'organization_id' => $organizationId,
                    'role_id' => $roles[$roleName]->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'password' => $password,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );
        }

        $program = Program::query()->firstOrCreate(
            ['name' => 'BSIT OJT 500 Hours', 'organization_id' => $organization->id],
            [
                'description' => 'Demo OJT tracker program',
                'required_hours' => 500,
                'status' => 'active',
                'report_frequency' => 'daily',
            ]
        );

        $student = User::query()->where('email', 'student@trackwise.test')->firstOrFail();
        $coordinator = User::query()->where('email', 'coordinator@trackwise.test')->firstOrFail();
        $supervisor = User::query()->where('email', 'supervisor@trackwise.test')->firstOrFail();

        UserProgram::query()->updateOrCreate(
            ['user_id' => $student->id, 'program_id' => $program->id],
            [
                'supervisor_id' => $supervisor->id,
                'coordinator_id' => $coordinator->id,
                'required_hours' => $program->required_hours,
                'completed_hours' => 0,
                'status' => 'active',
            ]
        );
    }
}
