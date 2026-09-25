"use client";

import { useState, FormEvent } from "react";
import {
  Category,
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/types/product";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAdd?: (product: CreateProductInput) => Promise<void>;
  onSubmitEdit?: (id: number, product: UpdateProductInput) => Promise<void>;
  productToEdit?: Product | null;
  categories: Category[];
}

interface FormErrors {
  title?: string;
  category?: string;
  price?: string;
  stock?: string;
  description?: string;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmitAdd,
  onSubmitEdit,
  productToEdit,
  categories,
}: ProductFormModalProps) {
  const isEditMode = Boolean(productToEdit);

  const [title, setTitle] = useState(() => productToEdit?.title || "");
  const [description, setDescription] = useState(
    () => productToEdit?.description || ""
  );
  const [category, setCategory] = useState(
    () => productToEdit?.category || categories[0]?.slug || ""
  );
  const [price, setPrice] = useState(() =>
    productToEdit ? String(productToEdit.price ?? "") : ""
  );
  const [stock, setStock] = useState(() =>
    productToEdit ? String(productToEdit.stock ?? "") : ""
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Product title is required.";
    } else if (title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters.";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required.";
    }

    const numPrice = Number(price);
    if (!price || isNaN(numPrice)) {
      newErrors.price = "Valid price is required.";
    } else if (numPrice <= 0) {
      newErrors.price = "Price must be greater than 0.";
    }

    const numStock = Number(stock);
    if (!stock || isNaN(numStock)) {
      newErrors.stock = "Valid stock count is required.";
    } else if (!Number.isInteger(numStock) || numStock < 0) {
      newErrors.stock = "Stock must be a non-negative whole number.";
    }

    if (!description.trim()) {
      newErrors.description = "Product description is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload: CreateProductInput = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parseFloat(Number(price).toFixed(2)),
        stock: parseInt(stock, 10),
      };

      if (isEditMode && productToEdit && onSubmitEdit) {
        await onSubmitEdit(productToEdit.id, payload);
      } else if (onSubmitAdd) {
        await onSubmitAdd(payload);
      }

      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to save product.";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-gray-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {submitError}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="field-title"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="field-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              disabled={isSubmitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                errors.title
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category & Price Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label
                htmlFor="field-category"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="field-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  errors.category
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="field-price"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                id="field-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                disabled={isSubmitting}
                className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                  errors.price
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="field-stock"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
            >
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="field-stock"
              type="number"
              step="1"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g. 50"
              disabled={isSubmitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                errors.stock
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="field-description"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="field-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product description..."
              disabled={isSubmitting}
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
                errors.description
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Notice */}
          <p className="text-[11px] text-gray-500">
            Note: DummyJSON simulates product mutations. Data updates will be reflected in your current dashboard session.
          </p>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>{isSubmitting ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
