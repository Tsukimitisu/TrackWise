<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            ['Super Admin', 'Full access across all organizations.'],
            ['Organization Admin', 'Manages one organization and its programs.'],
            ['Coordinator', 'Monitors assigned trainees and reports.'],
            ['Supervisor', 'Approves attendance and reports.'],
            ['Student', 'Logs attendance and submits reports.'],
            ['Viewer', 'Read-only access.'],
        ] as [$name, $description]) {
            Role::query()->updateOrCreate(['name' => $name], ['description' => $description]);
        }
    }
}
