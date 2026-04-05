<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->cascadeOnDelete();
            $table->foreignId('rider_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->foreignId('zone_id')
                  ->nullable()
                  ->constrained('delivery_zones')
                  ->nullOnDelete();
            $table->foreignId('slot_id')
                  ->nullable()
                  ->constrained('delivery_slots')
                  ->nullOnDelete();
            $table->string('status')->default('pending'); // pending, assigned, in_transit, delivered, failed
            $table->decimal('fee', 10, 2)->default(0);
            $table->text('address')->nullable();          // snapshot of address at time of delivery
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};