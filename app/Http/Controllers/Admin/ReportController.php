<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Delivery;
use App\Models\Expense;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from  = $request->input('from', now()->startOfMonth()->toDateString());
        $to    = $request->input('to',   now()->toDateString());
        $group = $request->input('group', 'day'); // day | week | month

        $fromDt = \Carbon\Carbon::parse($from)->startOfDay();
        $toDt   = \Carbon\Carbon::parse($to)->endOfDay();

        // ── Sales summary ─────────────────────────────────────────
        $salesBase = Order::whereBetween('orders.created_at', [$fromDt, $toDt])
            ->whereNotIn('orders.status', ['voided']);

        $totalSales    = (float) (clone $salesBase)->sum('total');
        $totalOrders   = (clone $salesBase)->count();
        $totalDiscount = (float) (clone $salesBase)->sum('discount');

        // Gross profit from order items
        $grossProfit = (float) OrderItem::whereHas('order', function ($q) use ($fromDt, $toDt) {
            $q->whereBetween('created_at', [$fromDt, $toDt])
              ->whereNotIn('status', ['voided']);
        })->selectRaw('SUM(quantity * (unit_price - capital_cost)) as profit')
          ->value('profit') ?? 0;

        // ── Expenses ──────────────────────────────────────────────
        $totalExpenses = (float) Expense::whereBetween('date', [$from, $to])->sum('amount');
        $netProfit     = $grossProfit - $totalExpenses;

        // ── Sales chart (grouped) ─────────────────────────────────
        $groupFormat = match ($group) {
            'month' => '%Y-%m',
            'week'  => '%Y-%u',
            default => '%Y-%m-%d',
        };

        $salesChart = (clone $salesBase)
            ->selectRaw("DATE_FORMAT(orders.created_at, '{$groupFormat}') as period,
                         SUM(total) as total,
                         COUNT(*) as orders,
                         SUM(discount) as discount")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn ($r) => [
                'period'   => $r->period,
                'total'    => (float) $r->total,
                'orders'   => (int)   $r->orders,
                'discount' => (float) $r->discount,
            ]);

        // ── Top products by revenue ───────────────────────────────
        $topProducts = OrderItem::whereHas('order', function ($q) use ($fromDt, $toDt) {
            $q->whereBetween('created_at', [$fromDt, $toDt])
              ->whereNotIn('status', ['voided']);
        })
        ->selectRaw('product_name,
                     SUM(quantity) as qty_sold,
                     SUM(quantity * unit_price) as revenue,
                     SUM(quantity * (unit_price - capital_cost)) as profit')
        ->groupBy('product_name')
        ->orderByDesc('revenue')
        ->limit(10)
        ->get()
        ->map(fn ($r) => [
            'name'    => $r->product_name,
            'qty'     => (int)   $r->qty_sold,
            'revenue' => (float) $r->revenue,
            'profit'  => (float) $r->profit,
        ]);

        // ── Top customers ─────────────────────────────────────────
        $topCustomers = (clone $salesBase)
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->selectRaw('customers.name, COUNT(orders.id) as order_count, SUM(orders.total) as total')
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'name'        => $r->name,
                'order_count' => (int)   $r->order_count,
                'total'       => (float) $r->total,
            ]);

        // ── Payment method breakdown ──────────────────────────────
        $paymentBreakdown = DB::table('order_payments')
            ->join('payment_methods', 'order_payments.payment_method_id', '=', 'payment_methods.id')
            ->join('orders', 'order_payments.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$fromDt, $toDt])
            ->whereNotIn('orders.status', ['voided'])
            ->selectRaw('payment_methods.name, SUM(order_payments.amount) as total, COUNT(DISTINCT orders.id) as order_count')
            ->groupBy('payment_methods.id', 'payment_methods.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => [
                'method' => $r->name,
                'total'  => (float) $r->total,
                'count'  => (int)   $r->order_count,
            ]);

        // ── Expenses by category ──────────────────────────────────
        $expensesByCategory = Expense::with('category')
            ->whereBetween('date', [$from, $to])
            ->selectRaw('category_id, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category_id')
            ->get()
            ->map(fn ($r) => [
                'category' => $r->category?->name ?? 'Uncategorized',
                'total'    => (float) $r->total,
                'count'    => (int)   $r->count,
            ])
            ->sortByDesc('total')
            ->values();

        // ── Delivery analytics ────────────────────────────────────
        $deliveryStats = Delivery::whereBetween('created_at', [$fromDt, $toDt])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $deliveryByZone = Delivery::with('zone')
            ->whereBetween('created_at', [$fromDt, $toDt])
            ->selectRaw('zone_id, COUNT(*) as count, SUM(fee) as total_fee')
            ->groupBy('zone_id')
            ->get()
            ->map(fn ($r) => [
                'zone'      => $r->zone?->name ?? 'No Zone',
                'count'     => (int)   $r->count,
                'total_fee' => (float) $r->total_fee,
            ])
            ->sortByDesc('count')
            ->values();

        $totalDeliveries    = $deliveryStats->sum();
        $deliveredCount     = (int) ($deliveryStats['delivered'] ?? 0);
        $pendingCount       = (int) (($deliveryStats['pending'] ?? 0) + ($deliveryStats['assigned'] ?? 0) + ($deliveryStats['in_transit'] ?? 0));
        $failedCount        = (int) ($deliveryStats['failed'] ?? 0);

        // ── Order type breakdown ──────────────────────────────────
        $ordersByType = (clone $salesBase)
            ->selectRaw('orders.type, COUNT(*) as count, SUM(orders.total) as total')
            ->groupBy('orders.type')
            ->get()
            ->map(fn ($r) => [
                'type'  => $r->type,
                'count' => (int)   $r->count,
                'total' => (float) $r->total,
            ]);

        return Inertia::render('Admin/Reports/Index', [
            'filters' => compact('from', 'to', 'group'),
            'summary' => [
                'total_sales'    => $totalSales,
                'total_orders'   => $totalOrders,
                'total_discount' => $totalDiscount,
                'gross_profit'   => $grossProfit,
                'total_expenses' => $totalExpenses,
                'net_profit'     => $netProfit,
                'avg_order'      => $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0,
            ],
            'salesChart'         => $salesChart,
            'topProducts'        => $topProducts,
            'topCustomers'       => $topCustomers,
            'paymentBreakdown'   => $paymentBreakdown,
            'expensesByCategory' => $expensesByCategory,
            'deliveryStats'      => [
                'total'     => $totalDeliveries,
                'delivered' => $deliveredCount,
                'pending'   => $pendingCount,
                'failed'    => $failedCount,
            ],
            'deliveryByZone' => $deliveryByZone,
            'ordersByType'   => $ordersByType,
        ]);
    }
}
