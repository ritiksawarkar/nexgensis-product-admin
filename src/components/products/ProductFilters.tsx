"use client";

import { Category, SortValue } from "@/types/product";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  categories: Category[];
  isCategoriesLoading?: boolean;
  onResetFilters: () => void;
  onOpenAddModal: () => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
  isCategoriesLoading = false,
  onResetFilters,
  onOpenAddModal,
}: ProductFiltersProps) {
  const isFiltered = Boolean(search || category || sort);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search, Category, Sort controls */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">
              Search products
            </label>
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products by title..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="category-select" className="sr-only">
              Filter by Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              disabled={isCategoriesLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label htmlFor="sort-select" className="sr-only">
              Sort products
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortValue)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Default Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Add Product & Reset */}
        <div className="flex items-center gap-2 sm:self-end lg:self-center">
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <span className="text-base font-bold leading-none">+</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Helper text explaining DummyJSON search/category behavior */}
      {search && category && (
        <p className="mt-2.5 text-xs text-amber-700">
          Note: Search is active. Results are searched across all products and filtered by the selected category.
        </p>
      )}
    </div>
  );
}
