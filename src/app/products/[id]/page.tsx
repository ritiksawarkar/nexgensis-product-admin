"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { getProductById } from "@/services/product.service";
import { Product } from "@/types/product";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  // Unwrap Next.js 15/16 async params with React.use
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isNotFound, setIsNotFound] = useState(false);

  const handleRetry = () => {
    setIsLoading(true);
    setError("");
    setIsNotFound(false);
    getProductById(Number(productId))
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.images?.[0] || data.thumbnail || "");
      })
      .catch((err) => {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setError("Failed to load product details. Please try again.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      const numId = Number(productId);
      if (!productId || isNaN(numId) || numId <= 0) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProductById(numId);
        if (!ignore) {
          setProduct(data);
          setSelectedImage(
            data.images && data.images.length > 0
              ? data.images[0]
              : data.thumbnail || ""
          );
        }
      } catch (err: unknown) {
        if (!ignore) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr.response?.status === 404) {
            setIsNotFound(true);
          } else {
            setError("Failed to load product details. Please try again.");
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [productId]);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Navigation Bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("authToken");
                router.replace("/login");
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs animate-pulse sm:p-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="h-96 rounded-xl bg-gray-200" />
                <div className="space-y-4">
                  <div className="h-8 w-3/4 rounded bg-gray-200" />
                  <div className="h-5 w-1/4 rounded bg-gray-200" />
                  <div className="h-6 w-1/3 rounded bg-gray-200" />
                  <div className="h-24 w-full rounded bg-gray-100" />
                  <div className="h-10 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          )}

          {/* 404 / Not Found State */}
          {!isLoading && isNotFound && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl font-bold">
                !
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Product Not Found
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                The product with ID &ldquo;{productId}&rdquo; does not exist or has been removed.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

          {/* Error State */}
          {!isLoading && !isNotFound && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-xs">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Product Details Content */}
          {!isLoading && !isNotFound && product && (
            <div className="space-y-8">
              {/* Main Product Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
                <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 sm:p-8">
                  {/* Images Section */}
                  <div className="flex flex-col gap-4">
                    <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img
                        src={selectedImage || product.thumbnail}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x400?text=Product";
                        }}
                      />
                    </div>

                    {/* Image Thumbnails Gallery */}
                    {product.images && product.images.length > 1 && (
                      <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {product.images.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImage(imgUrl)}
                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-gray-50 transition ${
                              selectedImage === imgUrl
                                ? "border-blue-600 ring-2 ring-blue-500/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${product.title} view ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Information Section */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                          {product.category}
                        </span>
                        {product.brand && (
                          <span className="text-xs font-medium text-gray-500">
                            Brand: {product.brand}
                          </span>
                        )}
                        {product.sku && (
                          <span className="text-xs text-gray-400">
                            SKU: {product.sku}
                          </span>
                        )}
                      </div>

                      <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
                        {product.title}
                      </h1>

                      {/* Rating & Stock */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
                          <span>★</span>
                          <span>{product.rating}</span>
                          <span className="text-amber-500">
                            ({product.reviews?.length || 0} reviews)
                          </span>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.stock > 10
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : product.stock > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of Stock"}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mt-6 flex items-baseline gap-3 border-t border-gray-100 pt-5">
                        <span className="text-3xl font-bold text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mt-6">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Overview
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">
                          {product.description}
                        </p>
                      </div>

                      {/* Additional Metadata */}
                      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 text-xs text-gray-600 sm:grid-cols-3">
                        {product.warrantyInformation && (
                          <div>
                            <span className="block text-gray-400">Warranty</span>
                            <span className="font-medium text-gray-800">
                              {product.warrantyInformation}
                            </span>
                          </div>
                        )}
                        {product.shippingInformation && (
                          <div>
                            <span className="block text-gray-400">Shipping</span>
                            <span className="font-medium text-gray-800">
                              {product.shippingInformation}
                            </span>
                          </div>
                        )}
                        {product.returnPolicy && (
                          <div>
                            <span className="block text-gray-400">Returns</span>
                            <span className="font-medium text-gray-800">
                              {product.returnPolicy}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:p-8">
                  <h2 className="text-lg font-bold text-gray-900">
                    Customer Reviews ({product.reviews.length})
                  </h2>

                  <div className="mt-6 divide-y divide-gray-100">
                    {product.reviews.map((rev, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {rev.reviewerName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {rev.reviewerName}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {rev.date ? new Date(rev.date).toLocaleDateString() : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            ★ {rev.rating}
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-gray-700">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
