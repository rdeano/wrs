<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryZoneController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Deliveries/Zones', [
            'zones' => DeliveryZone::withCount('deliveries')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateZone($request);
        DeliveryZone::create($data);

        return back()->with('success', "Zone \"{$data['name']}\" created.");
    }

    public function update(Request $request, DeliveryZone $deliveryZone): RedirectResponse
    {
        $data = $this->validateZone($request);
        $deliveryZone->update($data);

        return back()->with('success', "Zone \"{$data['name']}\" updated.");
    }

    public function destroy(DeliveryZone $deliveryZone): RedirectResponse
    {
        $name = $deliveryZone->name;
        $deliveryZone->delete();

        return back()->with('success', "Zone \"{$name}\" deleted.");
    }

    private function validateZone(Request $request): array
    {
        return $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'fee'       => ['required', 'numeric', 'min:0'],
            'min_order' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'notes'     => ['nullable', 'string'],
        ]);
    }
}
