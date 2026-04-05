<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Inventory/Suppliers', [
            'suppliers' => Supplier::withCount('stockLogs')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateSupplier($request);
        Supplier::create($data);

        return back()->with('success', "Supplier \"{$data['name']}\" added.");
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $data = $this->validateSupplier($request);
        $supplier->update($data);

        return back()->with('success', "Supplier \"{$data['name']}\" updated.");
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $name = $supplier->name;
        $supplier->delete();

        return back()->with('success', "Supplier \"{$name}\" deleted.");
    }

    private function validateSupplier(Request $request): array
    {
        return $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone'          => ['nullable', 'string', 'max:50'],
            'email'          => ['nullable', 'email', 'max:255'],
            'address'        => ['nullable', 'string', 'max:500'],
            'is_active'      => ['boolean'],
            'notes'          => ['nullable', 'string'],
        ]);
    }
}
