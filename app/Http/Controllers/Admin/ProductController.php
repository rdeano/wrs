<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockAlert;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type,   fn ($q, $t) => $q->where('type', $t))
            ->when($request->status === 'active',   fn ($q) => $q->where('is_active', true))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters'  => $request->only('search', 'type', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'availableProducts' => $this->selectableProducts(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateProduct($request);

        $product = Product::create(Arr::except($data, ['bundle_items', 'pricing_rules']));

        $this->syncBundleItems($product, $data['bundle_items'] ?? []);
        $this->syncPricingRules($product, $data['pricing_rules'] ?? []);
        $this->syncStockAlert($product);

        return redirect()->route('admin.products.index')
            ->with('success', "Product \"{$product->name}\" created.");
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Admin/Products/Edit', [
            'product'           => $product->load([
                'bundleItems' => fn ($q) => $q->with('product:id,name,selling_price,unit'),
                'pricing',
            ]),
            'availableProducts' => $this->selectableProducts($product->id),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validateProduct($request);

        $product->update(Arr::except($data, ['bundle_items', 'pricing_rules']));

        $this->syncBundleItems($product, $data['bundle_items'] ?? []);
        $this->syncPricingRules($product, $data['pricing_rules'] ?? []);
        $this->syncStockAlert($product);

        return redirect()->route('admin.products.index')
            ->with('success', "Product \"{$product->name}\" updated.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        return back()->with('success', "Product \"{$name}\" deleted.");
    }

    // -------------------------------------------------------------------------

    private function validateProduct(Request $request): array
    {
        return $request->validate([
            'name'                 => ['required', 'string', 'max:255'],
            'description'          => ['nullable', 'string'],
            'type'                 => ['required', 'in:refill,container,accessory,bundle'],
            'size'                 => ['nullable', 'string', 'max:50'],
            'unit'                 => ['required', 'string', 'max:50'],
            'capital_cost'         => ['required', 'numeric', 'min:0'],
            'selling_price'        => ['required', 'numeric', 'min:0'],
            'stock_qty'            => ['required', 'integer', 'min:0'],
            'track_stock'          => ['boolean'],
            'includes_free_refill' => ['boolean'],
            'is_bundle'            => ['boolean'],
            'is_active'            => ['boolean'],
            'sort_order'           => ['integer', 'min:0'],
            'notes'                => ['nullable', 'string'],

            'bundle_items'                  => ['nullable', 'array'],
            'bundle_items.*.product_id'     => ['required', 'exists:products,id'],
            'bundle_items.*.quantity'       => ['required', 'integer', 'min:1'],
            'bundle_items.*.override_price' => ['nullable', 'numeric', 'min:0'],

            'pricing_rules'                 => ['nullable', 'array'],
            'pricing_rules.*.label'         => ['nullable', 'string', 'max:100'],
            'pricing_rules.*.customer_type' => ['nullable', 'in:all,regular,suki,bulk,business'],
            'pricing_rules.*.min_qty'       => ['required', 'integer', 'min:1'],
            'pricing_rules.*.price'         => ['required', 'numeric', 'min:0'],
            'pricing_rules.*.starts_at'     => ['nullable', 'date'],
            'pricing_rules.*.ends_at'       => ['nullable', 'date'],
            'pricing_rules.*.is_active'     => ['boolean'],
        ]);
    }

    private function syncBundleItems(Product $product, array $items): void
    {
        $product->bundleItems()->delete();
        foreach ($items as $item) {
            $product->bundleItems()->create($item);
        }
    }

    private function syncPricingRules(Product $product, array $rules): void
    {
        $product->pricing()->delete();
        foreach ($rules as $rule) {
            $product->pricing()->create($rule);
        }
    }

    private function syncStockAlert(Product $product): void
    {
        if (! $product->track_stock) {
            // disable any existing alert when stock tracking is turned off
            StockAlert::where('product_id', $product->id)->update(['is_active' => false]);
            return;
        }

        $threshold = (int) Setting::get('low_stock_threshold', 10);

        StockAlert::updateOrCreate(
            ['product_id' => $product->id],
            ['min_qty' => $threshold, 'notify_roles' => [], 'is_active' => true]
        );
    }

    private function selectableProducts(?int $excludeId = null)
    {
        return Product::where('is_active', true)
            ->where('is_bundle', false)
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->orderBy('name')
            ->get(['id', 'name', 'selling_price', 'unit']);
    }
}
