<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                  ->constrained('expense_categories')
                  ->cascadeOnDelete();
            $table->foreignId('logged_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('description')->nullable();
            $table->string('receipt_photo')->nullable(); // file path
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};