<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'min_qty',
        'notify_roles',
        'is_active',
    ];

    protected $casts = [
        'min_qty'      => 'integer',
        'notify_roles' => 'array',
        'is_active'    => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
