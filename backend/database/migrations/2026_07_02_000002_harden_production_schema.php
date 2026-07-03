<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            if (! Schema::hasColumn('organizations', 'owner_organization_id')) {
                $table->foreignId('owner_organization_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('organizations')
                    ->nullOnDelete();
            }
        });

        Schema::table('notifications', function (Blueprint $table) {
            if (! Schema::hasColumn('notifications', 'data')) {
                $table->json('data')->nullable()->after('message');
            }
            if (! Schema::hasColumn('notifications', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('is_read');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'student_number')) {
                $table->string('student_number')->nullable()->after('last_name');
            }
            if (! Schema::hasColumn('users', 'course')) {
                $table->string('course')->nullable()->after('student_number');
            }
            if (! Schema::hasColumn('users', 'year_level')) {
                $table->string('year_level')->nullable()->after('course');
            }
        });

        Schema::table('daily_reports', function (Blueprint $table) {
            if (! Schema::hasColumn('daily_reports', 'reflection')) {
                $table->text('reflection')->nullable()->after('learnings');
            }
        });

        Schema::table('user_programs', function (Blueprint $table) {
            if (! Schema::hasColumn('user_programs', 'department')) {
                $table->string('department')->nullable()->after('coordinator_id');
            }
            if (! Schema::hasColumn('user_programs', 'start_date')) {
                $table->date('start_date')->nullable()->after('completed_hours');
            }
            if (! Schema::hasColumn('user_programs', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            if (Schema::hasColumn('organizations', 'owner_organization_id')) {
                $table->dropConstrainedForeignId('owner_organization_id');
            }
        });
        Schema::table('notifications', fn (Blueprint $table) => $table->dropColumn(['data', 'read_at']));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['student_number', 'course', 'year_level']));
        Schema::table('daily_reports', fn (Blueprint $table) => $table->dropColumn('reflection'));
        Schema::table('user_programs', fn (Blueprint $table) => $table->dropColumn(['department', 'start_date', 'end_date']));
    }
};
