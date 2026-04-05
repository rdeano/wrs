<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminUserSeeder::class,
            PaymentMethodSeeder::class,
            ExpenseCategorySeeder::class,
            SettingsSeeder::class,
            ProductSeeder::class,
        ]);
    }
}