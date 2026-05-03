<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('documentation_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attendance_log_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('daily_report_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('weekly_report_id')->nullable()->constrained()->nullOnDelete();
            $table->string('file_url');
            $table->string('file_type');
            $table->string('caption')->nullable();
            $table->timestamp('taken_at')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentation_files');
    }
};
