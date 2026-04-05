<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->cascadeOnDelete();
            $table->string('label')->nullable();       // e.g. "Suki price", "Bulk price"
            $table->string('customer_type')->nullable(); // all, suki, bulk, business
            $table->integer('min_qty')->default(1);    // minimum qty to trigger this price
            $table->decimal('price', 10, 2);           // override price
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_pricing');
    }
};