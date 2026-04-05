<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliverySlot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliverySlotController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Deliveries/Slots', [
            'slots' => DeliverySlot::withCount('deliveries')->orderBy('sort_order')->orderBy('label')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateSlot($request);
        DeliverySlot::create($data);

        return back()->with('success', "Slot \"{$data['label']}\" created.");
    }

    public function update(Request $request, DeliverySlot $deliverySlot): RedirectResponse
    {
        $data = $this->validateSlot($request);
        $deliverySlot->update($data);

        return back()->with('success', "Slot \"{$data['label']}\" updated.");
    }

    public function destroy(DeliverySlot $deliverySlot): RedirectResponse
    {
        $label = $deliverySlot->label;
        $deliverySlot->delete();

        return back()->with('success', "Slot \"{$label}\" deleted.");
    }

    private function validateSlot(Request $request): array
    {
        return $request->validate([
            'label'      => ['required', 'string', 'max:100'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time'   => ['required', 'date_format:H:i', 'after:start_time'],
            'is_active'  => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);
    }
}
