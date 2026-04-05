<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'loggedBy'])
            ->whereNull('deleted_at');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('type')) {
            $query->whereHas('category', fn ($q) => $q->where('type', $request->type));
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $expenses = $query->orderByDesc('date')->orderByDesc('id')->paginate(20)->withQueryString();

        $summary = Expense::whereNull('deleted_at')
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('date', '>=', $request->date_from))
            ->when($request->filled('date_to'),   fn ($q) => $q->whereDate('date', '<=', $request->date_to))
            ->selectRaw('COALESCE(SUM(amount), 0) as total')
            ->value('total');

        return Inertia::render('Admin/Expenses/Index', [
            'expenses'   => $expenses,
            'categories' => ExpenseCategory::orderBy('sort_order')->orderBy('name')->get(),
            'filters'    => $request->only(['category_id', 'type', 'date_from', 'date_to']),
            'total'      => (float) $summary,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'   => 'required|exists:expense_categories,id',
            'amount'        => 'required|numeric|min:0.01',
            'description'   => 'nullable|string|max:255',
            'date'          => 'required|date',
            'notes'         => 'nullable|string|max:1000',
            'receipt_photo' => 'nullable|image|max:4096',
        ]);

        $path = null;
        if ($request->hasFile('receipt_photo')) {
            $path = $request->file('receipt_photo')->store('receipts', 'public');
        }

        Expense::create([
            'category_id'   => $validated['category_id'],
            'logged_by'     => Auth::id(),
            'amount'        => $validated['amount'],
            'description'   => $validated['description'] ?? null,
            'receipt_photo' => $path,
            'date'          => $validated['date'],
            'notes'         => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Expense recorded.');
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'category_id'        => 'required|exists:expense_categories,id',
            'amount'             => 'required|numeric|min:0.01',
            'description'        => 'nullable|string|max:255',
            'date'               => 'required|date',
            'notes'              => 'nullable|string|max:1000',
            'receipt_photo'      => 'nullable|image|max:4096',
            'remove_receipt'     => 'boolean',
        ]);

        $path = $expense->receipt_photo;

        if ($request->boolean('remove_receipt') && $path) {
            Storage::disk('public')->delete($path);
            $path = null;
        }

        if ($request->hasFile('receipt_photo')) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
            $path = $request->file('receipt_photo')->store('receipts', 'public');
        }

        $expense->update([
            'category_id'   => $validated['category_id'],
            'amount'        => $validated['amount'],
            'description'   => $validated['description'] ?? null,
            'receipt_photo' => $path,
            'date'          => $validated['date'],
            'notes'         => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Expense updated.');
    }

    public function destroy(Expense $expense)
    {
        if ($expense->receipt_photo) {
            Storage::disk('public')->delete($expense->receipt_photo);
        }
        $expense->delete();

        return back()->with('success', 'Expense deleted.');
    }
}
