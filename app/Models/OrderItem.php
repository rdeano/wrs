<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'unit_price',
        'capital_cost',
        'quantity',
        'discount',
        'subtotal',
        'is_free_refill',
        'notes',
    ];

    protected $casts = [
        'unit_price'    => 'decimal:2',
        'capital_cost'  => 'decimal:2',
        'discount'      => 'decimal:2',
        'subtotal'      => 'decimal:2',
        'quantity'      => 'integer',
        'is_free_refill' => 'boolean',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getProfitAttribute(): float
    {
        return ((float) $this->unit_price - (float) $this->capital_cost) * $this->quantity;
    }
}
