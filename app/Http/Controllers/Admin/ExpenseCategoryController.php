<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $categories = ExpenseCategory::withCount('expenses')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Expenses/Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100|unique:expense_categories,name',
            'type'       => 'required|in:fixed,variable,one-time',
            'is_active'  => 'boolean',
            'sort_order' => 'integer|min:0',
            'notes'      => 'nullable|string|max:500',
        ]);

        ExpenseCategory::create($validated);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:100|unique:expense_categories,name,' . $expenseCategory->id,
            'type'       => 'required|in:fixed,variable,one-time',
            'is_active'  => 'boolean',
            'sort_order' => 'integer|min:0',
            'notes'      => 'nullable|string|max:500',
        ]);

        $expenseCategory->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        if ($expenseCategory->expenses()->exists()) {
            return back()->with('error', 'Cannot delete a category that has expenses. Deactivate it instead.');
        }

        $expenseCategory->delete();

        return back()->with('success', 'Category deleted.');
    }
}
