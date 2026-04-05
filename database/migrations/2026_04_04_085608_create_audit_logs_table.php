<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->string('action');                  // created, updated, deleted, voided, login
            $table->string('model')->nullable();       // App\Models\Order, App\Models\Customer
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('old_values')->nullable();    // before state
            $table->json('new_values')->nullable();    // after state
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};