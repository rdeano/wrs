<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['name' => 'Cash',          'code' => 'cash',   'sort_order' => 1],
            ['name' => 'GCash',         'code' => 'gcash',  'sort_order' => 2],
            ['name' => 'Maya',          'code' => 'maya',   'sort_order' => 3],
            ['name' => 'Bank Transfer', 'code' => 'bank',   'sort_order' => 4],
            ['name' => 'Credit',        'code' => 'credit', 'sort_order' => 5],
        ];

        foreach ($methods as $method) {
            DB::table('payment_methods')->insertOrIgnore([
                ...$method,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Payment methods seeded.');
    }
}