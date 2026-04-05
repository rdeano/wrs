<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type');        // refill, container, accessory, bundle
            $table->string('size')->nullable();  // 500ml, 1L, 5gal
            $table->string('unit')->default('piece'); // gallon, bottle, piece, sachet
            $table->decimal('capital_cost', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->integer('stock_qty')->default(0);
            $table->boolean('track_stock')->default(true);
            $table->boolean('includes_free_refill')->default(false);
            $table->boolean('is_bundle')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};