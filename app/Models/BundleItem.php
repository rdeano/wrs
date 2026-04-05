<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BundleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bundle_id',
        'product_id',
        'quantity',
        'override_price',
    ];

    protected $casts = [
        'quantity'       => 'integer',
        'override_price' => 'decimal:2',
    ];

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'bundle_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
