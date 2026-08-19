<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'currency')) {
                $table->string('currency')->default('UGX');
            }
            if (!Schema::hasColumn('users', 'currency_symbol')) {
                $table->string('currency_symbol')->default('UGX');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'currency')) $columnsToDrop[] = 'currency';
            if (Schema::hasColumn('users', 'currency_symbol')) $columnsToDrop[] = 'currency_symbol';
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
