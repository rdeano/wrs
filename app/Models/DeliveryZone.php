<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'fee',
        'min_order',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'fee'       => 'decimal:2',
        'min_order' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'zone_id');
    }
}
