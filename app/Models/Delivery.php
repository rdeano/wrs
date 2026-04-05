<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Delivery extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'rider_id',
        'zone_id',
        'slot_id',
        'status',
        'fee',
        'address',
        'scheduled_at',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'fee'          => 'decimal:2',
        'scheduled_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(DeliveryZone::class, 'zone_id');
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(DeliverySlot::class, 'slot_id');
    }
}
