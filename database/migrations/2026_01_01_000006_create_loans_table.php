<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type', 50); // borrowed or lent
            $table->string('name');
            $table->decimal('amount', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0.00);
            $table->date('due_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
