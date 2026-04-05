<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // users
            'user-list', 'user-create', 'user-edit', 'user-delete',

            // roles
            'role-list', 'role-create', 'role-edit', 'role-delete',

            // customers
            'customer-list', 'customer-create', 'customer-edit', 'customer-delete',
            'customer-credit-manage',

            // products
            'product-list', 'product-create', 'product-edit', 'product-delete',

            // orders
            'order-list', 'order-create', 'order-edit', 'order-void',
            'order-discount-apply',

            // payments
            'payment-list', 'payment-create', 'payment-method-manage',

            // delivery
            'delivery-list', 'delivery-create', 'delivery-assign',
            'delivery-status-update', 'delivery-zone-manage',

            // inventory
            'inventory-list', 'inventory-adjust', 'inventory-restock',
            'supplier-manage', 'stock-alert-manage',

            // expenses
            'expense-list', 'expense-create', 'expense-edit', 'expense-delete',
            'expense-category-manage',

            // reports
            'report-view', 'report-export',

            // settings
            'setting-manage',

            // audit
            'audit-log-view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin — everything
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        // Manager — ops but no user/role management
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $manager->syncPermissions([
            'customer-list', 'customer-create', 'customer-edit',
            'customer-credit-manage',
            'product-list', 'product-create', 'product-edit',
            'order-list', 'order-create', 'order-edit', 'order-void',
            'order-discount-apply',
            'payment-list', 'payment-create',
            'delivery-list', 'delivery-create', 'delivery-assign',
            'delivery-status-update',
            'inventory-list', 'inventory-adjust', 'inventory-restock',
            'supplier-manage', 'stock-alert-manage',
            'expense-list', 'expense-create', 'expense-edit',
            'expense-category-manage',
            'report-view', 'report-export',
        ]);

        // Cashier — counter and POS only
        $cashier = Role::firstOrCreate(['name' => 'cashier']);
        $cashier->syncPermissions([
            'customer-list', 'customer-create', 'customer-edit',
            'customer-credit-manage',
            'product-list',
            'order-list', 'order-create',
            'payment-list', 'payment-create',
            'delivery-list', 'delivery-status-update',
            'inventory-list',
        ]);

        // Customer — read only their own data (handled via policy)
        Role::firstOrCreate(['name' => 'customer']);

        $this->command->info('Roles and permissions seeded successfully.');
    }
}