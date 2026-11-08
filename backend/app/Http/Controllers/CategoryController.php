<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Game;
use App\Support\AdminGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::query()
                ->orderBy('name')
                ->get()
        );
    }

    public function store(Request $request)
    {
        AdminGuard::authorize($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    public function show(string $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        $games = Game::with('categories')
            ->whereHas('categories', function ($query) use ($category) {
                $query->where('categories.id', $category->id);
            })
            ->latest('updated_at')
            ->latest('created_at')
            ->get();

        return response()->json([
            'category' => $category,
            'games' => $games,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        AdminGuard::authorize($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')->ignore($category->id)],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $category);

        $category->update($data);

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        AdminGuard::authorize($request);
        $category->delete();

        return response()->noContent();
    }

    private function uniqueSlug(string $value, ?Category $category = null): string
    {
        $baseSlug = Str::slug($value) ?: 'the-loai';
        $slug = $baseSlug;
        $counter = 2;

        while (
            Category::where('slug', $slug)
                ->when($category, fn ($query) => $query->where('id', '!=', $category->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
