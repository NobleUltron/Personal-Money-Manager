<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budgets', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('category', 50);
            $table->decimal('amount', 15, 2);
            $table->timestamps();

            $table->unique(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
