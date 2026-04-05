<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // general
            ['key' => 'shop_name',                    'value' => 'WRS Water Refilling Station', 'type' => 'string',  'group' => 'general'],
            ['key' => 'shop_address',                 'value' => '',                            'type' => 'string',  'group' => 'general'],
            ['key' => 'shop_phone',                   'value' => '',                            'type' => 'string',  'group' => 'general'],
            ['key' => 'shop_logo',                    'value' => '',                            'type' => 'string',  'group' => 'general'],

            // orders
            ['key' => 'allow_walkin_no_customer',     'value' => 'true',                        'type' => 'boolean', 'group' => 'order'],
            ['key' => 'allow_discount',               'value' => 'true',                        'type' => 'boolean', 'group' => 'order'],
            ['key' => 'allow_void_order',             'value' => 'true',                        'type' => 'boolean', 'group' => 'order'],

            // credit
            ['key' => 'default_credit_limit',         'value' => '500',                         'type' => 'integer', 'group' => 'credit'],
            ['key' => 'allow_partial_payment',        'value' => 'true',                        'type' => 'boolean', 'group' => 'credit'],
            ['key' => 'over_limit_behavior',          'value' => 'warn',                        'type' => 'string',  'group' => 'credit'], // warn, block

            // delivery
            ['key' => 'delivery_enabled',             'value' => 'true',                        'type' => 'boolean', 'group' => 'delivery'],
            ['key' => 'default_delivery_fee',         'value' => '0',                           'type' => 'integer', 'group' => 'delivery'],
            ['key' => 'delivery_slot_enabled',        'value' => 'false',                       'type' => 'boolean', 'group' => 'delivery'],

            // inventory
            ['key' => 'low_stock_threshold',          'value' => '10',                          'type' => 'integer', 'group' => 'inventory'],
            ['key' => 'notify_low_stock',             'value' => 'true',                        'type' => 'boolean', 'group' => 'inventory'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->insertOrIgnore([
                ...$setting,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Settings seeded.');
    }
}