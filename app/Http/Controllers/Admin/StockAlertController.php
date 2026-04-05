<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockAlert;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockAlertController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Inventory/Alerts', [
            'alerts'   => StockAlert::with('product:id,name,type,unit,stock_qty')->orderBy('id')->get(),
            'products' => Product::where('track_stock', true)
                ->whereDoesntHave('stockAlerts')
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'unit']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateAlert($request);
        StockAlert::create($data);

        return back()->with('success', 'Stock alert created.');
    }

    public function update(Request $request, StockAlert $stockAlert): RedirectResponse
    {
        $data = $this->validateAlert($request, $stockAlert);
        $stockAlert->update($data);

        return back()->with('success', 'Stock alert updated.');
    }

    public function destroy(StockAlert $stockAlert): RedirectResponse
    {
        $stockAlert->delete();

        return back()->with('success', 'Stock alert deleted.');
    }

    private function validateAlert(Request $request, ?StockAlert $alert = null): array
    {
        return $request->validate([
            'product_id'   => ['required', 'exists:products,id'],
            'min_qty'      => ['required', 'integer', 'min:0'],
            'notify_roles' => ['required', 'array', 'min:1'],
            'notify_roles.*' => ['string', 'in:admin,manager,cashier'],
            'is_active'    => ['boolean'],
        ]);
    }
}
