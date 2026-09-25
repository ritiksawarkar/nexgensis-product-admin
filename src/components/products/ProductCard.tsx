"use client";

import Link from "next/link";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          <img
            src={product.thumbnail || (product.images && product.images[0]) || "/placeholder.png"}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/100x100?text=Product";
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${product.id}`}
              className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
            >
              {product.title}
            </Link>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
              {product.category}
            </span>

            {product.isLocallyCreated && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                New
              </span>
            )}
            {product.isLocallyUpdated && (
              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-200">
                Edited
              </span>
            )}
          </div>

          <p className="mt-2 text-base font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Rating:</span>
          <span className="font-medium text-gray-700">{product.rating}</span>
          <svg className="h-3 w-3 text-amber-500 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div className="text-right">
          <span className="text-gray-400">Stock: </span>
          <span
            className={`font-medium ${
              product.stock > 10
                ? "text-emerald-600"
                : product.stock > 0
                ? "text-amber-600"
                : "text-red-600"
            }`}
          >
            {product.stock > 10
              ? `${product.stock} units`
              : product.stock > 0
              ? `Low stock (${product.stock})`
              : "Out of stock"}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <Link
          href={`/products/${product.id}`}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        >
          View
        </Link>
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
