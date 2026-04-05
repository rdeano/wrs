<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@wrs.com'],
            [
                'name'      => 'WRS Admin',
                'password'  => bcrypt('password'),
                'is_active' => true,
            ]
        );

        $admin->assignRole('admin');

        $this->command->info('Admin user created: admin@wrs.com / password');
    }
}