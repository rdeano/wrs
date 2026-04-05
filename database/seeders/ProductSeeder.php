<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ── Refills ────────────────────────────────────────────
            [
                'name'          => 'Slim Gallon Refill',
                'description'   => 'Standard slim gallon water refill',
                'type'          => 'refill',
                'size'          => '5gal',
                'unit'          => 'gallon',
                'capital_cost'  => 8.00,
                'selling_price' => 25.00,
                'stock_qty'     => 0,
                'track_stock'   => false,
                'is_active'     => true,
                'sort_order'    => 1,
            ],
            [
                'name'          => 'Round Gallon Refill',
                'description'   => 'Standard round gallon water refill',
                'type'          => 'refill',
                'size'          => '5gal',
                'unit'          => 'gallon',
                'capital_cost'  => 8.00,
                'selling_price' => 25.00,
                'stock_qty'     => 0,
                'track_stock'   => false,
                'is_active'     => true,
                'sort_order'    => 2,
            ],
            [
                'name'          => '1-Liter Bottle Refill',
                'description'   => 'Refill for 1-liter bottle',
                'type'          => 'refill',
                'size'          => '1L',
                'unit'          => 'bottle',
                'capital_cost'  => 2.00,
                'selling_price' => 5.00,
                'stock_qty'     => 0,
                'track_stock'   => false,
                'is_active'     => true,
                'sort_order'    => 3,
            ],

            // ── Containers ─────────────────────────────────────────
            [
                'name'                => 'Slim Gallon Container',
                'description'         => 'New slim-type 5-gallon container',
                'type'                => 'container',
                'size'                => '5gal',
                'unit'                => 'piece',
                'capital_cost'        => 120.00,
                'selling_price'       => 180.00,
                'stock_qty'           => 20,
                'track_stock'         => true,
                'includes_free_refill'=> true,
                'is_active'           => true,
                'sort_order'          => 4,
            ],
            [
                'name'                => 'Round Gallon Container',
                'description'         => 'New round-type 5-gallon container',
                'type'                => 'container',
                'size'                => '5gal',
                'unit'                => 'piece',
                'capital_cost'        => 130.00,
                'selling_price'       => 200.00,
                'stock_qty'           => 15,
                'track_stock'         => true,
                'includes_free_refill'=> true,
                'is_active'           => true,
                'sort_order'          => 5,
            ],
            [
                'name'          => '1-Liter Bottle',
                'description'   => 'New 1-liter PET bottle',
                'type'          => 'container',
                'size'          => '1L',
                'unit'          => 'piece',
                'capital_cost'  => 15.00,
                'selling_price' => 25.00,
                'stock_qty'     => 50,
                'track_stock'   => true,
                'is_active'     => true,
                'sort_order'    => 6,
            ],

            // ── Accessories ────────────────────────────────────────
            [
                'name'          => 'Gallon Cover / Cap',
                'description'   => 'Replacement cover or cap for gallon containers',
                'type'          => 'accessory',
                'size'          => null,
                'unit'          => 'piece',
                'capital_cost'  => 3.00,
                'selling_price' => 8.00,
                'stock_qty'     => 100,
                'track_stock'   => true,
                'is_active'     => true,
                'sort_order'    => 7,
            ],
            [
                'name'          => 'Water Pump / Dispenser',
                'description'   => 'Manual pump dispenser for gallon containers',
                'type'          => 'accessory',
                'size'          => null,
                'unit'          => 'piece',
                'capital_cost'  => 35.00,
                'selling_price' => 75.00,
                'stock_qty'     => 30,
                'track_stock'   => true,
                'is_active'     => true,
                'sort_order'    => 8,
            ],
            [
                'name'          => 'Mineral Sachet',
                'description'   => 'Mineral additive sachet for 1 gallon',
                'type'          => 'accessory',
                'size'          => 'sachet',
                'unit'          => 'sachet',
                'capital_cost'  => 1.50,
                'selling_price' => 5.00,
                'stock_qty'     => 200,
                'track_stock'   => true,
                'is_active'     => true,
                'sort_order'    => 9,
            ],

            // ── Bundle ─────────────────────────────────────────────
            [
                'name'          => 'Starter Kit (Slim)',
                'description'   => 'Slim gallon container + 1 refill + 1 cap — best value for new customers',
                'type'          => 'bundle',
                'size'          => '5gal',
                'unit'          => 'set',
                'capital_cost'  => 131.00,
                'selling_price' => 200.00,
                'stock_qty'     => 0,
                'track_stock'   => false,
                'is_bundle'     => true,
                'is_active'     => true,
                'sort_order'    => 10,
            ],
        ];

        foreach ($products as $data) {
            Product::firstOrCreate(
                ['name' => $data['name']],
                array_merge([
                    'includes_free_refill' => false,
                    'is_bundle'            => false,
                    'notes'                => null,
                ], $data)
            );
        }
    }
}
