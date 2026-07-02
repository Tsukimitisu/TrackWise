<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('documentation_files', function (Blueprint $table) {
            $table->string('title')->nullable()->after('file_type');
            $table->text('description')->nullable()->after('caption');
        });
    }

    public function down(): void
    {
        Schema::table('documentation_files', function (Blueprint $table) {
            $table->dropColumn(['title', 'description']);
        });
    }
};
