<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use App\Models\Customer;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with(['customer:id,name', 'servedBy:id,name'])
            ->withCount('items')
            ->when($request->search, fn ($q, $s) => $q->whereHas('customer', fn ($q) => $q->where('name', 'like', "%{$s}%")))
            ->when($request->status,         fn ($q, $v) => $q->where('status', $v))
            ->when($request->payment_status, fn ($q, $v) => $q->where('payment_status', $v))
            ->when($request->date_from, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_to,   fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only('search', 'status', 'payment_status', 'date_from', 'date_to'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Orders/Create', [
            'products' => Product::where('is_active', true)
                ->with(['pricing' => fn ($q) => $q->where('is_active', true)])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'customers' => Customer::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'phone', 'type', 'outstanding_balance', 'credit_limit']),
            'paymentMethods' => PaymentMethod::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'code']),
            'settings' => [
                'allow_walkin_no_customer' => Setting::get('allow_walkin_no_customer', true),
                'allow_discount'           => Setting::get('allow_discount', true),
                'allow_partial_payment'    => Setting::get('allow_partial_payment', true),
                'over_limit_behavior'      => Setting::get('over_limit_behavior', 'warn'),
                'default_credit_limit'     => (float) Setting::get('default_credit_limit', 500),
                'new_gallon_free_refill'   => Setting::get('new_gallon_free_refill', true),
            ],
            'freeRefillProduct' => Product::where('is_active', true)
                ->where('type', 'refill')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->first(['id', 'name', 'capital_cost', 'track_stock']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id'                  => ['nullable', 'exists:customers,id'],
            'type'                         => ['required', 'in:walkin,delivery'],
            'discount'                     => ['nullable', 'numeric', 'min:0'],
            'notes'                        => ['nullable', 'string'],
            'items'                        => ['required', 'array', 'min:1'],
            'items.*.product_id'           => ['required', 'exists:products,id'],
            'items.*.quantity'             => ['required', 'integer', 'min:1'],
            'items.*.is_free_refill'       => ['boolean'],
            'payments'                     => ['nullable', 'array'],
            'payments.*.payment_method_id' => ['required', 'exists:payment_methods,id'],
            'payments.*.amount'            => ['required', 'numeric', 'min:0.01'],
            'payments.*.reference_no'      => ['nullable', 'string', 'max:100'],
        ]);

        // Validate customer required if setting demands it
        if (! Setting::get('allow_walkin_no_customer', true) && empty($data['customer_id'])) {
            return back()->withErrors(['customer_id' => 'A customer must be selected.'])->withInput();
        }

        try {
            $order = DB::transaction(function () use ($data) {
                $customer     = $data['customer_id'] ? Customer::find($data['customer_id']) : null;
                $customerType = $customer?->type ?? 'regular';

                // ── Resolve line items ──────────────────────────────────────────
                $lineItems = [];
                foreach ($data['items'] as $raw) {
                    $product = Product::with('pricing')->findOrFail($raw['product_id']);
                    $qty     = $raw['quantity'];
                    $isFree  = (bool) ($raw['is_free_refill'] ?? false);

                    $unitPrice   = $isFree ? 0.0 : $this->resolvePrice($product, $customerType, $qty);
                    $capitalCost = (float) $product->capital_cost;

                    $lineItems[] = [
                        'product_id'     => $product->id,
                        'product_name'   => $product->name,
                        'unit_price'     => $unitPrice,
                        'capital_cost'   => $capitalCost,
                        'quantity'       => $qty,
                        'discount'       => 0,
                        'subtotal'       => round($unitPrice * $qty, 2),
                        'is_free_refill' => $isFree,
                        'track_stock'    => $product->track_stock,
                        'product_obj'    => $product,
                    ];
                }

                $subtotal    = collect($lineItems)->sum('subtotal');
                $allowDisc   = Setting::get('allow_discount', true);
                $discountAmt = $allowDisc ? round((float) ($data['discount'] ?? 0), 2) : 0.0;
                $total       = round(max(0, $subtotal - $discountAmt), 2);

                $totalPaid = collect($data['payments'] ?? [])->sum('amount');
                $credited  = round(max(0, $total - $totalPaid), 2);

                // ── Credit-limit check ──────────────────────────────────────────
                if ($credited > 0 && $customer) {
                    $behavior = Setting::get('over_limit_behavior', 'warn');
                    if ($behavior === 'block' && ! $customer->hasAvailableCredit($credited)) {
                        throw new \RuntimeException('Customer has exceeded their credit limit.');
                    }
                }

                // ── Determine payment status ────────────────────────────────────
                $paymentStatus = match (true) {
                    $total <= 0 || $totalPaid >= $total => 'paid',
                    $credited > 0 && $totalPaid <= 0    => 'credit',
                    $totalPaid > 0                      => 'partial',
                    default                             => 'unpaid',
                };

                // ── Create order ────────────────────────────────────────────────
                $order = Order::create([
                    'customer_id'    => $customer?->id,
                    'served_by'      => Auth::id(),
                    'type'           => $data['type'],
                    'status'         => 'completed',
                    'subtotal'       => $subtotal,
                    'discount'       => $discountAmt,
                    'delivery_fee'   => 0,
                    'total'          => $total,
                    'amount_paid'    => min($totalPaid, $total),
                    'change_given'   => max(0, $totalPaid - $total),
                    'payment_status' => $paymentStatus,
                    'notes'          => $data['notes'] ?? null,
                ]);

                // ── Order items + stock ─────────────────────────────────────────
                foreach ($lineItems as $line) {
                    $product = $line['product_obj'];
                    unset($line['track_stock'], $line['product_obj']);
                    $order->items()->create($line);

                    if ($product->track_stock) {
                        $product->decrement('stock_qty', $line['quantity']);
                    }
                }

                // ── Payment records ─────────────────────────────────────────────
                foreach ($data['payments'] ?? [] as $payment) {
                    if ((float) $payment['amount'] > 0) {
                        $order->payments()->create([
                            'payment_method_id' => $payment['payment_method_id'],
                            'amount'            => $payment['amount'],
                            'reference_no'      => $payment['reference_no'] ?? null,
                            'status'            => 'completed',
                            'paid_at'           => now(),
                        ]);
                    }
                }

                // ── Credit charge ───────────────────────────────────────────────
                if ($credited > 0 && $customer) {
                    $newBalance = round((float) $customer->outstanding_balance + $credited, 2);
                    $customer->update(['outstanding_balance' => $newBalance]);

                    CreditTransaction::create([
                        'customer_id'   => $customer->id,
                        'order_id'      => $order->id,
                        'approved_by'   => Auth::id(),
                        'type'          => 'charge',
                        'amount'        => $credited,
                        'balance_after' => $newBalance,
                        'notes'         => "Order #{$order->id}",
                    ]);
                }

                return $order;
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['general' => $e->getMessage()])->withInput();
        }

        return redirect()->route('admin.orders.show', $order)
            ->with('success', "Order #{$order->id} created successfully.");
    }

    public function show(Order $order): Response
    {
        $order->load([
            'customer:id,name,phone,type',
            'servedBy:id,name',
            'items.product:id,name',
            'payments.paymentMethod:id,name',
        ]);

        return Inertia::render('Admin/Orders/Show', [
            'order'          => $order,
            'allowVoid'      => Setting::get('allow_void_order', true),
        ]);
    }

    public function void(Order $order): RedirectResponse
    {
        if ($order->status === 'voided') {
            return back()->with('error', 'This order is already voided.');
        }

        DB::transaction(function () use ($order) {
            // Restore stock
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product && $product->track_stock) {
                        $product->increment('stock_qty', $item->quantity);
                    }
                }
            }

            // Reverse credit charge if balance was owed
            $credited = round((float) $order->total - (float) $order->amount_paid, 2);
            if ($credited > 0 && $order->customer_id) {
                $customer   = Customer::find($order->customer_id);
                $newBalance = round(max(0, (float) $customer->outstanding_balance - $credited), 2);
                $customer->update(['outstanding_balance' => $newBalance]);

                CreditTransaction::create([
                    'customer_id'   => $customer->id,
                    'order_id'      => $order->id,
                    'approved_by'   => Auth::id(),
                    'type'          => 'adjustment',
                    'amount'        => $credited,
                    'balance_after' => $newBalance,
                    'notes'         => "Void Order #{$order->id}",
                ]);
            }

            $order->update(['status' => 'voided']);
        });

        return back()->with('success', "Order #{$order->id} has been voided.");
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function resolvePrice(Product $product, string $customerType, int $qty): float
    {
        $now = now();

        $rule = $product->pricing
            ->filter(fn ($r) => $r->is_active)
            ->filter(fn ($r) => $r->min_qty <= $qty)
            ->filter(fn ($r) => ! $r->starts_at || $r->starts_at->lte($now))
            ->filter(fn ($r) => ! $r->ends_at   || $r->ends_at->gte($now))
            ->filter(fn ($r) => $r->customer_type === 'all' || $r->customer_type === $customerType)
            ->sortByDesc('min_qty')
            ->sortBy('price')
            ->first();

        return $rule ? (float) $rule->price : (float) $product->selling_price;
    }
}
