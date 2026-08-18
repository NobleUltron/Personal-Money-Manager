<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0.00);
            $table->date('target_date')->nullable();
            $table->string('category')->default('General');
            $table->string('color')->default('#6366f1');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
