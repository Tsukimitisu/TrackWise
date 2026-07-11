<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_endpoints_require_management_roles(): void
    {
        $roles = $this->seedRoles();
        $endpoints = [
            '/api/analytics/dashboard',
            '/api/analytics/reports',
            '/api/analytics/assignments',
        ];

        foreach (['Student', 'Supervisor', 'Viewer'] as $roleName) {
            Sanctum::actingAs(User::factory()->create([
                'role_id' => $roles[$roleName]->id,
                'email_verified_at' => now(),
            ]));

            foreach ($endpoints as $endpoint) {
                $this->getJson($endpoint)->assertForbidden();
            }
        }

        Sanctum::actingAs(User::factory()->create([
            'role_id' => $roles['Coordinator']->id,
            'email_verified_at' => now(),
        ]));

        $this->getJson('/api/analytics/dashboard')
            ->assertOk()
            ->assertJsonStructure(['assignments', 'reports', 'hours', 'metrics']);
        $this->getJson('/api/analytics/reports')->assertOk();
        $this->getJson('/api/analytics/assignments')->assertOk();
    }

    private function seedRoles(): \Illuminate\Support\Collection
    {
        foreach (['Super Admin', 'Organization Admin', 'Coordinator', 'Supervisor', 'Student', 'Viewer'] as $name) {
            Role::query()->firstOrCreate(['name' => $name], ['description' => $name]);
        }

        return Role::query()->get()->keyBy('name');
    }
}
