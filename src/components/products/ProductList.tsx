"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import axios from "axios";
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import {
  Product,
  Category,
  CreateProductInput,
  UpdateProductInput,
  SortValue,
} from "@/types/product";
import { useDebounce } from "@/hooks/useDebounce";

import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductCard from "./ProductCard";
import ProductPagination from "./ProductPagination";
import ProductSkeleton from "./ProductSkeleton";
import ProductFormModal from "./ProductFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const VALID_PAGE_SIZES = [10, 20, 50];
const VALID_SORTS: SortValue[] = [
  "",
  "price-asc",
  "price-desc",
  "rating-asc",
  "rating-desc",
  "title-asc",
  "title-desc",
];

export default function ProductList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Normalize initial query params from URL
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const rawPageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const initialPageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 10;
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const rawSort = (searchParams.get("sort") || "") as SortValue;
  const initialSort = VALID_SORTS.includes(rawSort) ? rawSort : "";

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortValue>(initialSort);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Race condition prevention: AbortController + Sequence Request ID tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // Debounced search query
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (newParams: {
      page?: number;
      pageSize?: number;
      search?: string;
      category?: string;
      sort?: SortValue;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      const nextPage = newParams.page !== undefined ? newParams.page : page;
      const nextPageSize = newParams.pageSize !== undefined ? newParams.pageSize : pageSize;
      const nextSearch = newParams.search !== undefined ? newParams.search : searchInput;
      const nextCategory = newParams.category !== undefined ? newParams.category : category;
      const nextSort = newParams.sort !== undefined ? newParams.sort : sort;

      if (nextPage > 1) {
        params.set("page", String(nextPage));
      } else {
        params.delete("page");
      }

      if (nextPageSize !== 10) {
        params.set("pageSize", String(nextPageSize));
      } else {
        params.delete("pageSize");
      }

      if (nextSearch.trim()) {
        params.set("search", nextSearch.trim());
      } else {
        params.delete("search");
      }

      if (nextCategory) {
        params.set("category", nextCategory);
      } else {
        params.delete("category");
      }

      if (nextSort) {
        params.set("sort", nextSort);
      } else {
        params.delete("sort");
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [searchParams, pathname, router, page, pageSize, searchInput, category, sort]
  );

  // Load categories once on mount
  useEffect(() => {
    let isSubscribed = true;
    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const data = await getCategories();
        if (isSubscribed) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        if (isSubscribed) {
          setIsCategoriesLoading(false);
        }
      }
    };

    loadCategories();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // When debounced search changes, reset page to 1 and update URL
  const prevDebouncedSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevDebouncedSearchRef.current !== debouncedSearch) {
      prevDebouncedSearchRef.current = debouncedSearch;
      setPage(1);
      updateUrlParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, updateUrlParams]);

  // Main data fetching method
  const loadProducts = useCallback(async () => {
    // 1. Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Track request sequence ID to eliminate race conditions
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError("");

    try {
      const skip = (page - 1) * pageSize;
      let sortByField: string | undefined;
      let sortOrder: "asc" | "desc" | undefined;

      if (sort) {
        const [field, order] = sort.split("-") as [string, "asc" | "desc"];
        sortByField = field;
        sortOrder = order;
      }

      let data;

      if (debouncedSearch.trim()) {
        // Search takes priority
        data = await searchProducts({
          query: debouncedSearch.trim(),
          limit: pageSize,
          skip,
          sortBy: sortByField,
          order: sortOrder,
          signal: controller.signal,
        });

        // Client-side category filtering when both search and category are active
        if (category) {
          const filtered = data.products.filter(
            (p) => p.category.toLowerCase() === category.toLowerCase()
          );
          data = {
            ...data,
            products: filtered,
            total: filtered.length,
          };
        }
      } else if (category) {
        // Category filtering without search
        data = await getProductsByCategory({
          category,
          limit: pageSize,
          skip,
          sortBy: sortByField,
          order: sortOrder,
          signal: controller.signal,
        });
      } else {
        // Standard product listing
        data = await getProducts({
          limit: pageSize,
          skip,
          sortBy: sortByField,
          order: sortOrder,
          signal: controller.signal,
        });
      }

      // Check if this response matches the latest issued request
      if (currentRequestId === requestIdRef.current) {
        setProducts(data.products);
        setTotal(data.total);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      // Ignore AbortError / cancelled requests
      if (
        axios.isCancel(err) ||
        (err instanceof Error && err.name === "CanceledError")
      ) {
        return;
      }
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr.code === "ERR_CANCELED") {
        return;
      }

      if (currentRequestId === requestIdRef.current) {
        console.error("Load products error:", err);
        setError("Failed to load products. Please check your connection and retry.");
        setIsLoading(false);
      }
    }
  }, [page, pageSize, debouncedSearch, category, sort]);

  // Fetch products whenever dependencies change
  useEffect(() => {
    loadProducts();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadProducts]);

  // Handlers for Filters
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    updateUrlParams({ category: newCategory, page: 1 });
  };

  const handleSortChange = (newSort: SortValue) => {
    setSort(newSort);
    setPage(1);
    updateUrlParams({ sort: newSort, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setCategory("");
    setSort("");
    setPage(1);
    updateUrlParams({ search: "", category: "", sort: "", page: 1 });
  };

  // Handlers for Pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    updateUrlParams({ pageSize: newSize, page: 1 });
  };

  // CRUD Handler: Add Product
  const handleAddProduct = async (productData: CreateProductInput) => {
    try {
      const created = await addProduct(productData);

      // DummyJSON returns newly created item (id: 195+). We flag it as locally created
      // and prepend to the current list so the user immediately sees it in the dashboard.
      const simulatedProduct: Product = {
        ...created,
        thumbnail:
          created.thumbnail ||
          "https://placehold.co/100x100?text=" + encodeURIComponent(created.title),
        images: [created.thumbnail || "https://placehold.co/400x400?text=Product"],
        rating: 5.0,
        isLocallyCreated: true,
      };

      setProducts((prev) => [simulatedProduct, ...prev]);
      setTotal((prev) => prev + 1);

      setFeedback({
        type: "success",
        message: `Product "${created.title}" added successfully! (Updated in local UI session)`,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add product.";
      setFeedback({
        type: "error",
        message: errorMsg,
      });
      throw err;
    }
  };

  // CRUD Handler: Edit Product
  const handleEditProduct = async (
    id: number,
    updatedFields: UpdateProductInput
  ) => {
    try {
      // If the product was locally created (e.g. id >= 195), DummyJSON PUT returns 404
      // We handle both real server items and local simulated items gracefully!
      let updatedData: Product;

      try {
        const response = await updateProduct(id, updatedFields);
        updatedData = {
          ...response,
          isLocallyUpdated: true,
        };
      } catch (apiErr: unknown) {
        const axiosErr = apiErr as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          // Simulated item update fallback
          const existing = products.find((p) => p.id === id);
          if (!existing) throw apiErr;
          updatedData = {
            ...existing,
            ...updatedFields,
            isLocallyUpdated: true,
          } as Product;
        } else {
          throw apiErr;
        }
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      );

      setFeedback({
        type: "success",
        message: `Product "${updatedData.title}" updated successfully! (Updated in local UI session)`,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update product.";
      setFeedback({
        type: "error",
        message: errorMsg,
      });
      throw err;
    }
  };

  // CRUD Handler: Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    const targetId = deletingProduct.id;
    const targetTitle = deletingProduct.title;

    try {
      try {
        await deleteProduct(targetId);
      } catch (apiErr: unknown) {
        const axiosErr = apiErr as { response?: { status?: number } };
        // If simulated product returns 404 from DummyJSON, still remove locally
        if (axiosErr.response?.status !== 404) {
          throw apiErr;
        }
      }

      // Remove from local products list
      setProducts((prev) => prev.filter((p) => p.id !== targetId));
      setTotal((prev) => Math.max(0, prev - 1));

      setFeedback({
        type: "success",
        message: `Product "${targetTitle}" deleted successfully! (Removed from local UI session)`,
      });

      setDeletingProduct(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete product.";
      setFeedback({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast / Notification Banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium border shadow-xs transition ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✓" : "!"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:opacity-75"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters & Actions Bar */}
      <ProductFilters
        search={searchInput}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        sort={sort}
        onSortChange={handleSortChange}
        categories={categories}
        isCategoriesLoading={isCategoriesLoading}
        onResetFilters={handleResetFilters}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Loading Skeleton */}
      {isLoading && <ProductSkeleton count={pageSize} />}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadProducts}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-lg">
            🔍
          </div>
          <h3 className="mt-3 text-base font-semibold text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No products matched your search or filter criteria. Try adjusting your query.
          </p>
          {(searchInput || category || sort) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Products Table (Desktop) & Cards (Mobile) */}
      {!isLoading && !error && products.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          {/* Desktop Table View */}
          <ProductTable
            products={products}
            onEdit={(p) => setEditingProduct(p)}
            onDelete={(p) => setDeletingProduct(p)}
          />

          {/* Mobile Card View */}
          <div className="space-y-3 p-4 md:hidden">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={(item) => setEditingProduct(item)}
                onDelete={(item) => setDeletingProduct(item)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <ProductPagination
            currentPage={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <ProductFormModal
          key="add-product-modal"
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmitAdd={handleAddProduct}
          categories={categories}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          key={`edit-product-modal-${editingProduct.id}`}
          isOpen={Boolean(editingProduct)}
          productToEdit={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmitEdit={handleEditProduct}
          categories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
        productTitle={deletingProduct?.title || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}