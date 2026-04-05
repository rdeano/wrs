<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'type',
        'size',
        'unit',
        'capital_cost',
        'selling_price',
        'stock_qty',
        'track_stock',
        'includes_free_refill',
        'is_bundle',
        'is_active',
        'sort_order',
        'notes',
    ];

    protected $casts = [
        'capital_cost'         => 'decimal:2',
        'selling_price'        => 'decimal:2',
        'stock_qty'            => 'integer',
        'sort_order'           => 'integer',
        'track_stock'          => 'boolean',
        'includes_free_refill' => 'boolean',
        'is_bundle'            => 'boolean',
        'is_active'            => 'boolean',
    ];

    public function bundleItems(): HasMany
    {
        return $this->hasMany(BundleItem::class, 'bundle_id');
    }

    public function pricing(): HasMany
    {
        return $this->hasMany(ProductPricing::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockLogs(): HasMany
    {
        return $this->hasMany(StockLog::class);
    }

    public function stockAlerts(): HasMany
    {
        return $this->hasMany(StockAlert::class);
    }

    public function getProfitAttribute(): float
    {
        return (float) $this->selling_price - (float) $this->capital_cost;
    }

    public function getProfitMarginAttribute(): float
    {
        if ((float) $this->selling_price === 0.0) {
            return 0.0;
        }

        return round(
            ((float) $this->selling_price - (float) $this->capital_cost) / (float) $this->selling_price * 100,
            2
        );
    }
}
