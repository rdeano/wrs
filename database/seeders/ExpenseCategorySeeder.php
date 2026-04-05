<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Labor / wages',       'type' => 'fixed',    'sort_order' => 1],
            ['name' => 'Electricity',          'type' => 'variable', 'sort_order' => 2],
            ['name' => 'Water source',         'type' => 'variable', 'sort_order' => 3],
            ['name' => 'Filter replacement',   'type' => 'variable', 'sort_order' => 4],
            ['name' => 'Rent',                 'type' => 'fixed',    'sort_order' => 5],
            ['name' => 'Miscellaneous',        'type' => 'one-time', 'sort_order' => 6],
        ];

        foreach ($categories as $category) {
            DB::table('expense_categories')->insertOrIgnore([
                ...$category,
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Expense categories seeded.');
    }
}