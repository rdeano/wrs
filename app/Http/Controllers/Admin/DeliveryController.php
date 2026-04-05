<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\DeliverySlot;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryController extends Controller
{
    public function index(Request $request): Response
    {
        $deliveries = Delivery::query()
            ->with([
                'order.customer:id,name',
                'rider:id,name',
                'zone:id,name',
                'slot:id,label',
            ])
            ->when($request->status,   fn ($q, $v) => $q->where('status', $v))
            ->when($request->rider_id, fn ($q, $v) => $q->where('rider_id', $v))
            ->when($request->zone_id,  fn ($q, $v) => $q->where('zone_id', $v))
            ->when($request->date,     fn ($q, $v) => $q->whereDate('scheduled_at', $v))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Deliveries/Index', [
            'deliveries' => $deliveries,
            'riders'     => User::orderBy('name')->get(['id', 'name']),
            'zones'      => DeliveryZone::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters'    => $request->only('status', 'rider_id', 'zone_id', 'date'),
        ]);
    }

    public function create(): Response
    {
        $orders = Order::whereDoesntHave('delivery')
            ->where('status', '!=', 'voided')
            ->with('customer:id,name')
            ->orderByDesc('created_at')
            ->get(['id', 'customer_id', 'total', 'created_at']);

        return Inertia::render('Admin/Deliveries/Create', [
            'orders'   => $orders,
            'riders'   => User::orderBy('name')->get(['id', 'name']),
            'zones'    => DeliveryZone::where('is_active', true)->orderBy('name')->get(),
            'slots'    => DeliverySlot::where('is_active', true)->orderBy('sort_order')->get(),
            'settings' => [
                'slot_enabled' => Setting::get('delivery_slot_enabled', false),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'order_id'     => ['required', 'exists:orders,id', 'unique:deliveries,order_id'],
            'rider_id'     => ['nullable', 'exists:users,id'],
            'zone_id'      => ['nullable', 'exists:delivery_zones,id'],
            'slot_id'      => ['nullable', 'exists:delivery_slots,id'],
            'fee'          => ['required', 'numeric', 'min:0'],
            'address'      => ['nullable', 'string', 'max:500'],
            'scheduled_at' => ['nullable', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        $delivery = DB::transaction(function () use ($data) {
            $data['status'] = $data['rider_id'] ? 'assigned' : 'pending';

            $delivery = Delivery::create($data);

            // Sync fee + type onto the order
            $order = Order::find($data['order_id']);
            $order->update([
                'type'         => 'delivery',
                'delivery_fee' => $data['fee'],
                'total'        => round(
                    (float) $order->subtotal - (float) $order->discount + (float) $data['fee'],
                    2
                ),
            ]);

            return $delivery;
        });

        return redirect()->route('admin.deliveries.show', $delivery)
            ->with('success', "Delivery #{$delivery->id} created.");
    }

    public function show(Delivery $delivery): Response
    {
        $delivery->load([
            'order.customer:id,name,phone,address',
            'order.items',
            'rider:id,name',
            'zone',
            'slot',
        ]);

        return Inertia::render('Admin/Deliveries/Show', [
            'delivery' => $delivery,
            'riders'   => User::orderBy('name')->get(['id', 'name']),
            'zones'    => DeliveryZone::where('is_active', true)->orderBy('name')->get(['id', 'name', 'fee']),
            'slots'    => DeliverySlot::where('is_active', true)->orderBy('sort_order')->get(['id', 'label']),
            'settings' => ['slot_enabled' => Setting::get('delivery_slot_enabled', false)],
        ]);
    }

    public function assign(Request $request, Delivery $delivery): RedirectResponse
    {
        $data = $request->validate([
            'rider_id'     => ['nullable', 'exists:users,id'],
            'zone_id'      => ['nullable', 'exists:delivery_zones,id'],
            'slot_id'      => ['nullable', 'exists:delivery_slots,id'],
            'fee'          => ['nullable', 'numeric', 'min:0'],
            'address'      => ['nullable', 'string', 'max:500'],
            'scheduled_at' => ['nullable', 'date'],
            'notes'        => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data, $delivery) {
            // Only update status if still assignable
            if (in_array($delivery->status, ['pending', 'assigned'])) {
                $data['status'] = $data['rider_id'] ? 'assigned' : 'pending';
            }

            $delivery->update($data);

            // Keep order delivery_fee in sync
            if (isset($data['fee'])) {
                $order = $delivery->order;
                $order->update([
                    'delivery_fee' => $data['fee'],
                    'total'        => round(
                        (float) $order->subtotal - (float) $order->discount + (float) $data['fee'],
                        2
                    ),
                ]);
            }
        });

        return back()->with('success', 'Delivery details updated.');
    }

    public function updateStatus(Request $request, Delivery $delivery): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,assigned,in_transit,delivered,failed'],
        ]);

        $updates = ['status' => $data['status']];

        if ($data['status'] === 'delivered') {
            $updates['delivered_at'] = now();
        }

        $delivery->update($updates);

        return back()->with('success', "Status updated to \"{$data['status']}\".");
    }
}
