<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get();

        // Group into ordered sections
        $grouped = $settings->groupBy('group')->map(fn ($group) => $group->values());

        // Ensure consistent tab order
        $ordered = collect(['general', 'order', 'credit', 'delivery', 'inventory'])
            ->filter(fn ($g) => $grouped->has($g))
            ->mapWithKeys(fn ($g) => [$g => $grouped[$g]]);

        // Append any unexpected groups at the end
        $grouped->except($ordered->keys()->all())->each(
            fn ($items, $g) => $ordered->put($g, $items)
        );

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $ordered,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $incoming = $request->input('settings', []);

        if (empty($incoming)) {
            return back()->with('error', 'No settings provided.');
        }

        // Only update keys that already exist — never let arbitrary keys in
        $allowedKeys = Setting::pluck('key')->all();

        foreach ($incoming as $key => $value) {
            if (! in_array($key, $allowedKeys, true)) {
                continue;
            }

            Setting::where('key', $key)->update(['value' => $value ?? '']);
        }

        return back()->with('success', 'Settings saved.');
    }
}
