<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliverySlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'start_time',
        'end_time',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'slot_id');
    }
}
