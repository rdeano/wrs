<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPricing extends Model
{
    use HasFactory;

    protected $table = 'product_pricing';

    protected $fillable = [
        'product_id',
        'label',
        'customer_type',
        'min_qty',
        'price',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'min_qty'   => 'integer',
        'price'     => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'is_active' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
