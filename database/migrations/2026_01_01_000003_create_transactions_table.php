<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('accountId', 50);
            $table->enum('type', ['deposit', 'withdrawal']);
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('reason')->nullable();
            $table->string('category', 50)->default('Other');
            $table->timestamps();

            $table->foreign('accountId')->references('id')->on('accounts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
