<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'served_by',
        'type',
        'status',
        'subtotal',
        'discount',
        'delivery_fee',
        'total',
        'amount_paid',
        'change_given',
        'payment_status',
        'notes',
    ];

    protected $casts = [
        'subtotal'      => 'decimal:2',
        'discount'      => 'decimal:2',
        'delivery_fee'  => 'decimal:2',
        'total'         => 'decimal:2',
        'amount_paid'   => 'decimal:2',
        'change_given'  => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    public function creditTransactions(): HasMany
    {
        return $this->hasMany(CreditTransaction::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    public function getGrossProfitAttribute(): float
    {
        return (float) $this->items->sum(
            fn (OrderItem $item) => ($item->unit_price - $item->capital_cost) * $item->quantity
        );
    }
}
