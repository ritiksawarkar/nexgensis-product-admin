"use client";

import Link from "next/link";
import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3.5">
              Product
            </th>
            <th scope="col" className="px-6 py-3.5">
              Category
            </th>
            <th scope="col" className="px-6 py-3.5">
              Price
            </th>
            <th scope="col" className="px-6 py-3.5">
              Rating
            </th>
            <th scope="col" className="px-6 py-3.5">
              Stock
            </th>
            <th scope="col" className="px-6 py-3.5 text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {products.map((product) => (
            <tr
              key={product.id}
              className="transition-colors hover:bg-gray-50/80"
            >
              {/* Product Info */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={product.thumbnail || (product.images && product.images[0]) || "/placeholder.png"}
                      alt={product.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback image handling
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/100x100?text=Product";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                    >
                      {product.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {product.brand && <span>{product.brand}</span>}
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
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 capitalize">
                  {product.category}
                </span>
              </td>

              {/* Price */}
              <td className="px-6 py-4 font-semibold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </td>

              {/* Rating */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <svg className="h-3.5 w-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{product.rating}</span>
                </div>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    product.stock > 10
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : product.stock > 0
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {product.stock > 10
                    ? `${product.stock} in stock`
                    : product.stock > 0
                    ? `Low stock (${product.stock})`
                    : "Out of stock"}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                  >
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
