<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('weekly_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_program_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('week_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('summary');
            $table->text('skills_learned')->nullable();
            $table->text('challenges')->nullable();
            $table->text('reflection')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_comment')->nullable();
            $table->timestamps();
            $table->unique(['user_program_id', 'week_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_reports');
    }
};
