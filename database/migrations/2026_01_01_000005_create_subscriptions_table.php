<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('accountId', 50);
            $table->string('name', 100);
            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['monthly', 'yearly', 'weekly'])->default('monthly');
            $table->date('next_due_date');
            $table->string('category', 50)->default('Other');
            $table->timestamps();

            $table->foreign('accountId')->references('id')->on('accounts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
