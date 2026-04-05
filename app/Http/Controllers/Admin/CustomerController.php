<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CreditTransaction;
use App\Models\Customer;
use App\Models\DeliveryZone;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            }))
            ->when($request->type,   fn ($q, $t) => $q->where('type', $t))
            ->when($request->status === 'active',   fn ($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->with('deliveryZone:id,name')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters'   => $request->only('search', 'type', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Customers/Create', [
            'deliveryZones' => DeliveryZone::where('is_active', true)->orderBy('name')->get(['id', 'name', 'fee']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateCustomer($request);

        $data['credit_limit'] ??= (float) Setting::get('default_credit_limit', 500);

        $customer = Customer::create($data);

        return redirect()->route('admin.customers.index')
            ->with('success', "Customer \"{$customer->name}\" created.");
    }

    public function show(Customer $customer): Response
    {
        $customer->load('deliveryZone:id,name');

        $transactions = $customer->creditTransactions()
            ->with('approvedBy:id,name')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Admin/Customers/Show', [
            'customer'     => $customer,
            'transactions' => $transactions,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Admin/Customers/Edit', [
            'customer'      => $customer,
            'deliveryZones' => DeliveryZone::where('is_active', true)->orderBy('name')->get(['id', 'name', 'fee']),
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $data = $this->validateCustomer($request, $customer);

        $customer->update($data);

        return redirect()->route('admin.customers.index')
            ->with('success', "Customer \"{$customer->name}\" updated.");
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $name = $customer->name;
        $customer->delete();

        return back()->with('success', "Customer \"{$name}\" deleted.");
    }

    // ── Credit management ──────────────────────────────────────────────────────

    public function creditAdjust(Request $request, Customer $customer): RedirectResponse
    {
        $data = $request->validate([
            'type'           => ['required', 'in:payment,adjustment,writeoff'],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ]);

        $before  = (float) $customer->outstanding_balance;
        $amount  = (float) $data['amount'];

        // payment and writeoff reduce the balance; adjustment can go either way
        if ($data['type'] === 'adjustment') {
            $newBalance = $amount; // set balance directly
            $delta      = $newBalance - $before;
        } else {
            $delta      = -$amount; // payment / writeoff reduces balance
            $newBalance = max(0, $before + $delta);
        }

        $customer->update(['outstanding_balance' => $newBalance]);

        CreditTransaction::create([
            'customer_id'    => $customer->id,
            'approved_by'    => Auth::id(),
            'type'           => $data['type'],
            'amount'         => abs($delta),
            'balance_after'  => $newBalance,
            'payment_method' => $data['payment_method'] ?? null,
            'notes'          => $data['notes'] ?? null,
        ]);

        return back()->with('success', 'Credit transaction recorded.');
    }

    public function creditLimitUpdate(Request $request, Customer $customer): RedirectResponse
    {
        $data = $request->validate([
            'credit_limit' => ['required', 'numeric', 'min:0'],
        ]);

        $customer->update(['credit_limit' => $data['credit_limit']]);

        return back()->with('success', 'Credit limit updated.');
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function validateCustomer(Request $request, ?Customer $customer = null): array
    {
        return $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'phone'            => ['nullable', 'string', 'max:50'],
            'email'            => ['nullable', 'email', 'max:255'],
            'address'          => ['nullable', 'string', 'max:500'],
            'type'             => ['required', 'in:regular,suki,bulk,business'],
            'delivery_zone_id' => ['nullable', 'exists:delivery_zones,id'],
            'credit_limit'     => ['nullable', 'numeric', 'min:0'],
            'is_active'        => ['boolean'],
            'notes'            => ['nullable', 'string'],
        ]);
    }
}
