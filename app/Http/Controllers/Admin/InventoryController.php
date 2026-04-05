<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockLog;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $threshold = (int) Setting::get('low_stock_threshold', 10);

        $products = Product::where('track_stock', true)
            ->with(['stockAlerts' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'unit', 'size', 'stock_qty', 'capital_cost']);

        return Inertia::render('Admin/Inventory/Index', [
            'products'  => $products,
            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'threshold' => $threshold,
        ]);
    }

    public function logs(Request $request): Response
    {
        $logs = StockLog::query()
            ->with([
                'product:id,name',
                'supplier:id,name',
                'loggedBy:id,name',
            ])
            ->when($request->product_id, fn ($q, $v) => $q->where('product_id', $v))
            ->when($request->type,       fn ($q, $v) => $q->where('type', $v))
            ->when($request->date_from,  fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_to,    fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Inventory/Logs', [
            'logs'     => $logs,
            'products' => Product::where('track_stock', true)->orderBy('name')->get(['id', 'name']),
            'filters'  => $request->only('product_id', 'type', 'date_from', 'date_to'),
        ]);
    }

    public function restock(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id'   => ['required', 'exists:products,id'],
            'quantity'     => ['required', 'integer', 'min:1'],
            'supplier_id'  => ['nullable', 'exists:suppliers,id'],
            'capital_cost' => ['nullable', 'numeric', 'min:0'],
            'notes'        => ['nullable', 'string'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $before  = $product->stock_qty;
        $after   = $before + $data['quantity'];

        $product->update(['stock_qty' => $after]);

        StockLog::create([
            'product_id'   => $product->id,
            'supplier_id'  => $data['supplier_id'] ?? null,
            'logged_by'    => Auth::id(),
            'type'         => 'in',
            'quantity'     => $data['quantity'],
            'stock_before' => $before,
            'stock_after'  => $after,
            'capital_cost' => $data['capital_cost'] ?? $product->capital_cost,
            'notes'        => $data['notes'] ?? null,
        ]);

        return back()->with('success', "Restocked {$data['quantity']} units of \"{$product->name}\".");
    }

    public function adjust(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'new_qty'    => ['required', 'integer', 'min:0'],
            'notes'      => ['nullable', 'string'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $before  = $product->stock_qty;
        $after   = $data['new_qty'];

        $product->update(['stock_qty' => $after]);

        StockLog::create([
            'product_id'   => $product->id,
            'logged_by'    => Auth::id(),
            'type'         => 'adjustment',
            'quantity'     => $after - $before,
            'stock_before' => $before,
            'stock_after'  => $after,
            'capital_cost' => $product->capital_cost,
            'notes'        => $data['notes'] ?? null,
        ]);

        return back()->with('success', "Stock for \"{$product->name}\" adjusted to {$after}.");
    }
}
