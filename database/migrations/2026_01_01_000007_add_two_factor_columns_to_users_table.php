<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'two_factor_enabled')) {
                $table->boolean('two_factor_enabled')->default(false);
            }
            if (!Schema::hasColumn('users', 'two_factor_code')) {
                $table->string('two_factor_code', 10)->nullable();
            }
            if (!Schema::hasColumn('users', 'two_factor_expires_at')) {
                $table->timestamp('two_factor_expires_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'two_factor_enabled')) $columnsToDrop[] = 'two_factor_enabled';
            if (Schema::hasColumn('users', 'two_factor_code')) $columnsToDrop[] = 'two_factor_code';
            if (Schema::hasColumn('users', 'two_factor_expires_at')) $columnsToDrop[] = 'two_factor_expires_at';
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
