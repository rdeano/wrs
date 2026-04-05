<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockAlert;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today     = now()->toDateString();
        $thisMonth = now()->startOfMonth()->toDateString();

        // --- Sales ---
        $todaySales = Order::whereDate('created_at', $today)
            ->whereNotIn('status', ['voided'])
            ->sum('total');

        $monthSales = Order::whereDate('created_at', '>=', $thisMonth)
            ->whereNotIn('status', ['voided'])
            ->sum('total');

        $todayOrders = Order::whereDate('created_at', $today)
            ->whereNotIn('status', ['voided'])
            ->count();

        $monthOrders = Order::whereDate('created_at', '>=', $thisMonth)
            ->whereNotIn('status', ['voided'])
            ->count();

        // --- Profit (sales - cost of goods) ---
        $todayProfit = Order::whereDate('orders.created_at', $today)
            ->whereNotIn('orders.status', ['voided'])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->selectRaw('SUM(order_items.quantity * (order_items.unit_price - order_items.capital_cost)) as profit')
            ->value('profit') ?? 0;

        $monthProfit = Order::whereDate('orders.created_at', '>=', $thisMonth)
            ->whereNotIn('orders.status', ['voided'])
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->selectRaw('SUM(order_items.quantity * (order_items.unit_price - order_items.capital_cost)) as profit')
            ->value('profit') ?? 0;

        // --- Expenses ---
        $monthExpenses = Expense::whereDate('date', '>=', $thisMonth)->sum('amount');

        $netProfit = $monthProfit - $monthExpenses;

        // --- Inventory alerts ---
        $globalThreshold = (int) Setting::get('low_stock_threshold', 10);

        // Build a map of product_id => min_qty from active StockAlert rows
        $alertMap = StockAlert::where('is_active', true)
            ->pluck('min_qty', 'product_id');

        // All tracked, active, above-zero products
        $trackedProducts = Product::where('track_stock', true)
            ->where('is_active', true)
            ->where('stock_qty', '>', 0)
            ->get(['id', 'name', 'stock_qty', 'unit']);

        $lowStockAlerts = $trackedProducts
            ->filter(function ($p) use ($alertMap, $globalThreshold) {
                $threshold = $alertMap->has($p->id) ? (int) $alertMap[$p->id] : $globalThreshold;
                return $p->stock_qty <= $threshold;
            })
            ->map(function ($p) use ($alertMap, $globalThreshold) {
                $threshold = $alertMap->has($p->id) ? (int) $alertMap[$p->id] : $globalThreshold;
                return [
                    'product_id'   => $p->id,
                    'product_name' => $p->name,
                    'stock_qty'    => $p->stock_qty,
                    'min_qty'      => $threshold,
                    'unit'         => $p->unit,
                ];
            })
            ->values();

        $outOfStock = Product::where('track_stock', true)
            ->where('stock_qty', '<=', 0)
            ->where('is_active', true)
            ->count();

        // --- Customers ---
        $totalCustomers = Customer::whereNull('deleted_at')->count();

        $customersWithBalance = Customer::whereNull('deleted_at')
            ->where('outstanding_balance', '>', 0)
            ->count();

        $totalOutstanding = Customer::whereNull('deleted_at')->sum('outstanding_balance');

        // --- Deliveries ---
        $pendingDeliveries = Delivery::whereIn('status', ['pending', 'assigned', 'in_transit'])->count();
        $todayDeliveries   = Delivery::whereDate('created_at', $today)->count();

        // --- Yesterday sales for comparison ---
        $yesterday = now()->subDay()->toDateString();
        $yesterdaySales = Order::whereDate('created_at', $yesterday)
            ->whereNotIn('status', ['voided'])
            ->sum('total');

        // --- Recent orders ---
        $recentOrders = Order::with(['customer', 'items'])
            ->whereNotIn('status', ['voided'])
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($o) => [
                'id'           => $o->id,
                'customer'     => $o->customer?->name ?? 'Walk-in',
                'total'        => $o->total,
                'status'       => $o->status,
                'payment_status' => $o->payment_status,
                'type'         => $o->type,
                'created_at'   => $o->created_at->toISOString(),
                'items_count'  => $o->items->count(),
            ]);

        // --- Sales last 7 days (chart data) ---
        $salesChart = Order::whereDate('created_at', '>=', now()->subDays(6)->toDateString())
            ->whereNotIn('status', ['voided'])
            ->selectRaw('DATE(created_at) as date, SUM(total) as total, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartDays = collect(range(6, 0))->map(function ($daysAgo) use ($salesChart) {
            $date = now()->subDays($daysAgo)->toDateString();
            return [
                'date'   => $date,
                'label'  => now()->subDays($daysAgo)->format('M d'),
                'total'  => (float) ($salesChart[$date]->total ?? 0),
                'orders' => (int)   ($salesChart[$date]->orders ?? 0),
            ];
        });

        return Inertia::render('Dashboard', [
            'stats' => [
                'today_sales'        => (float) $todaySales,
                'month_sales'        => (float) $monthSales,
                'today_orders'       => $todayOrders,
                'month_orders'       => $monthOrders,
                'today_profit'       => (float) $todayProfit,
                'month_profit'       => (float) $monthProfit,
                'month_expenses'     => (float) $monthExpenses,
                'net_profit'         => (float) $netProfit,
                'total_customers'    => $totalCustomers,
                'customers_w_balance'=> $customersWithBalance,
                'total_outstanding'  => (float) $totalOutstanding,
                'out_of_stock'         => $outOfStock,
                'pending_deliveries'   => $pendingDeliveries,
                'today_deliveries'     => $todayDeliveries,
                'yesterday_sales'      => (float) $yesterdaySales,
            ],
            'lowStockAlerts' => $lowStockAlerts,
            'recentOrders'   => $recentOrders,
            'salesChart'     => $chartDays,
        ]);
    }
}
