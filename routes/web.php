<?php

use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ExpenseCategoryController;
use App\Http\Controllers\Admin\ExpenseController;
use App\Http\Controllers\Admin\DeliveryController;
use App\Http\Controllers\Admin\DeliverySlotController;
use App\Http\Controllers\Admin\DeliveryZoneController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StockAlertController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', DashboardController::class)->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Users (staff accounts)
    Route::middleware('can:user-list')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
    });
    Route::middleware('can:user-create')->group(function () {
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
    });
    Route::middleware('can:user-edit')->group(function () {
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    });
    Route::middleware('can:user-delete')->group(function () {
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    Route::middleware('can:setting-manage')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });

    // Customers — static routes first to avoid {customer} swallowing "create"
    Route::middleware('can:customer-list')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    });
    Route::middleware('can:customer-create')->group(function () {
        Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
        Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    });
    Route::middleware('can:customer-list')->group(function () {
        Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    });
    Route::middleware('can:customer-edit')->group(function () {
        Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
        Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    });
    Route::middleware('can:customer-delete')->group(function () {
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
    });
    Route::middleware('can:customer-credit-manage')->group(function () {
        Route::post('/customers/{customer}/credit-adjust', [CustomerController::class, 'creditAdjust'])->name('customers.credit-adjust');
        Route::post('/customers/{customer}/credit-limit', [CustomerController::class, 'creditLimitUpdate'])->name('customers.credit-limit');
    });

    // Orders — create before {order} to avoid route collision
    Route::middleware('can:order-list')->group(function () {
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    });
    Route::middleware('can:order-create')->group(function () {
        Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    });
    Route::middleware('can:order-list')->group(function () {
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    });
    Route::middleware('can:order-void')->group(function () {
        Route::post('/orders/{order}/void', [OrderController::class, 'void'])->name('orders.void');
    });

    // Deliveries — static routes before {delivery}
    Route::middleware('can:delivery-list')->group(function () {
        Route::get('/deliveries', [DeliveryController::class, 'index'])->name('deliveries.index');
    });
    Route::middleware('can:delivery-create')->group(function () {
        Route::get('/deliveries/create', [DeliveryController::class, 'create'])->name('deliveries.create');
        Route::post('/deliveries', [DeliveryController::class, 'store'])->name('deliveries.store');
    });
    Route::middleware('can:delivery-list')->group(function () {
        Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show'])->name('deliveries.show');
    });
    Route::middleware('can:delivery-assign')->group(function () {
        Route::post('/deliveries/{delivery}/assign', [DeliveryController::class, 'assign'])->name('deliveries.assign');
    });
    Route::middleware('can:delivery-status-update')->group(function () {
        Route::post('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus'])->name('deliveries.status');
    });

    // Delivery Zones & Slots (zone-manage permission)
    Route::middleware('can:delivery-zone-manage')->group(function () {
        Route::get('/delivery-zones', [DeliveryZoneController::class, 'index'])->name('delivery-zones.index');
        Route::post('/delivery-zones', [DeliveryZoneController::class, 'store'])->name('delivery-zones.store');
        Route::put('/delivery-zones/{deliveryZone}', [DeliveryZoneController::class, 'update'])->name('delivery-zones.update');
        Route::delete('/delivery-zones/{deliveryZone}', [DeliveryZoneController::class, 'destroy'])->name('delivery-zones.destroy');

        Route::get('/delivery-slots', [DeliverySlotController::class, 'index'])->name('delivery-slots.index');
        Route::post('/delivery-slots', [DeliverySlotController::class, 'store'])->name('delivery-slots.store');
        Route::put('/delivery-slots/{deliverySlot}', [DeliverySlotController::class, 'update'])->name('delivery-slots.update');
        Route::delete('/delivery-slots/{deliverySlot}', [DeliverySlotController::class, 'destroy'])->name('delivery-slots.destroy');
    });

    // Inventory
    Route::middleware('can:inventory-list')->group(function () {
        Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/logs', [InventoryController::class, 'logs'])->name('inventory.logs');
    });
    Route::middleware('can:inventory-restock')->group(function () {
        Route::post('/inventory/restock', [InventoryController::class, 'restock'])->name('inventory.restock');
    });
    Route::middleware('can:inventory-adjust')->group(function () {
        Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
    });

    // Suppliers
    Route::middleware('can:supplier-manage')->group(function () {
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
    });

    // Stock alerts
    Route::middleware('can:stock-alert-manage')->group(function () {
        Route::get('/stock-alerts', [StockAlertController::class, 'index'])->name('stock-alerts.index');
        Route::post('/stock-alerts', [StockAlertController::class, 'store'])->name('stock-alerts.store');
        Route::put('/stock-alerts/{stockAlert}', [StockAlertController::class, 'update'])->name('stock-alerts.update');
        Route::delete('/stock-alerts/{stockAlert}', [StockAlertController::class, 'destroy'])->name('stock-alerts.destroy');
    });

    // Expenses
    Route::middleware('can:expense-list')->group(function () {
        Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    });
    Route::middleware('can:expense-create')->group(function () {
        Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    });
    Route::middleware('can:expense-edit')->group(function () {
        Route::post('/expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    });
    Route::middleware('can:expense-delete')->group(function () {
        Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    });

    // Expense Categories
    Route::middleware('can:expense-category-manage')->group(function () {
        Route::get('/expense-categories', [ExpenseCategoryController::class, 'index'])->name('expense-categories.index');
        Route::post('/expense-categories', [ExpenseCategoryController::class, 'store'])->name('expense-categories.store');
        Route::put('/expense-categories/{expenseCategory}', [ExpenseCategoryController::class, 'update'])->name('expense-categories.update');
        Route::delete('/expense-categories/{expenseCategory}', [ExpenseCategoryController::class, 'destroy'])->name('expense-categories.destroy');
    });

    // Reports
    Route::middleware('can:report-view')->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    });

    // Products
    Route::middleware('can:product-list')->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    });
    Route::middleware('can:product-create')->group(function () {
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    });
    Route::middleware('can:product-edit')->group(function () {
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    });
    Route::middleware('can:product-delete')->group(function () {
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });
});

require __DIR__.'/auth.php';
