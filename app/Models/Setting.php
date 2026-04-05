<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $setting->value,
            'json'    => json_decode($setting->value, true),
            default   => $setting->value,
        };
    }

    public static function set(string $key, mixed $value): void
    {
        $setting = static::firstOrNew(['key' => $key]);

        if (is_array($value) || is_object($value)) {
            $setting->value = json_encode($value);
            $setting->type  = 'json';
        } elseif (is_bool($value)) {
            $setting->value = $value ? '1' : '0';
            $setting->type  = 'boolean';
        } elseif (is_int($value)) {
            $setting->value = (string) $value;
            $setting->type  = 'integer';
        } else {
            $setting->value = $value;
            $setting->type  = 'string';
        }

        $setting->save();
    }
}
