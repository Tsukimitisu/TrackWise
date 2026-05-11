<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_unverified_student_and_sends_email(): void
    {
        Notification::fake();
        $this->seedRoles();

        $response = $this->postJson('/api/auth/register', [
            'first_name' => 'New',
            'last_name' => 'Student',
            'email' => 'new.student@example.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated();
        $user = User::where('email', 'new.student@example.test')->firstOrFail();

        $this->assertSame('Student', $user->role->name);
        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_unverified_users_cannot_login_until_verified(): void
    {
        $this->seedRoles();
        $user = User::factory()->unverified()->create([
            'email' => 'blocked@example.test',
            'password' => bcrypt('Password123!'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ])->assertForbidden();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(10), [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);

        $this->get($url)->assertRedirect();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_resend_verification_and_password_reset_requests_send_email(): void
    {
        Notification::fake();
        $this->seedRoles();
        $user = User::factory()->unverified()->create(['email' => 'notify@example.test']);

        $this->postJson('/api/auth/resend-verification', ['email' => $user->email])->assertOk();
        Notification::assertSentTo($user, VerifyEmail::class);

        $user->markEmailAsVerified();
        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])->assertOk();
        Notification::assertSentTo($user->fresh(), ResetPassword::class);
    }

    public function test_management_roles_can_manage_users(): void
    {
        $roles = $this->seedRoles();
        $admin = User::factory()->create([
            'role_id' => $roles['Super Admin']->id,
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($admin);

        $created = $this->postJson('/api/users', [
            'first_name' => 'Created',
            'last_name' => 'Viewer',
            'email' => 'viewer.created@example.test',
            'password' => 'Password123!',
            'role' => 'Viewer',
            'status' => 'active',
        ])->assertCreated();

        $created->assertJsonPath('role.name', 'Viewer');
        $userId = $created->json('id');

        $this->getJson('/api/users')->assertOk()->assertJsonStructure(['data']);
        $this->putJson("/api/users/{$userId}", [
            'first_name' => 'Updated',
            'last_name' => 'Viewer',
            'email' => 'viewer.updated@example.test',
            'role' => 'Viewer',
            'status' => 'active',
        ])->assertOk()->assertJsonPath('email', 'viewer.updated@example.test');
    }

    public function test_admin_statistics_endpoints_do_not_query_missing_user_columns(): void
    {
        $roles = $this->seedRoles();
        $admin = User::factory()->create([
            'role_id' => $roles['Organization Admin']->id,
            'email_verified_at' => now(),
        ]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/statistics/overview')->assertOk()->assertJsonStructure(['users' => ['total', 'by_role']]);
        $this->getJson('/api/admin/statistics/users')->assertOk()->assertJsonStructure(['recent_users', 'last_active_users']);
    }

    private function seedRoles(): \Illuminate\Support\Collection
    {
        foreach (['Super Admin', 'Organization Admin', 'Coordinator', 'Supervisor', 'Student', 'Viewer'] as $name) {
            Role::query()->firstOrCreate(['name' => $name], ['description' => $name]);
        }

        return Role::query()->get()->keyBy('name');
    }
}
