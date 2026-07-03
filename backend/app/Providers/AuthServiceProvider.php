<?php

namespace App\Providers;

use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\DocumentationFile;
use App\Models\Evaluation;
use App\Models\Organization;
use App\Models\Program;
use App\Models\User;
use App\Models\UserProgram;
use App\Models\WeeklyReport;
use App\Policies\AttendanceLogPolicy;
use App\Policies\DailyReportPolicy;
use App\Policies\DocumentationFilePolicy;
use App\Policies\EvaluationPolicy;
use App\Policies\OrganizationPolicy;
use App\Policies\ProgramPolicy;
use App\Policies\UserPolicy;
use App\Policies\UserProgramPolicy;
use App\Policies\WeeklyReportPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        UserProgram::class => UserProgramPolicy::class,
        AttendanceLog::class => AttendanceLogPolicy::class,
        DailyReport::class => DailyReportPolicy::class,
        WeeklyReport::class => WeeklyReportPolicy::class,
        DocumentationFile::class => DocumentationFilePolicy::class,
        Evaluation::class => EvaluationPolicy::class,
        User::class => UserPolicy::class,
        Organization::class => OrganizationPolicy::class,
        Program::class => ProgramPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        //
    }
}
