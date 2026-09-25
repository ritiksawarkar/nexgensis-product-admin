export default function ProductSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop Skeleton Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rating</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: count }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded bg-gray-200" />
                      <div className="h-3 w-20 rounded bg-gray-100" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-12 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-14 rounded bg-gray-200" />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex gap-2">
                    <div className="h-8 w-16 rounded bg-gray-200" />
                    <div className="h-8 w-14 rounded bg-gray-200" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Skeleton Cards */}
      <div className="space-y-4 p-4 md:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-lg border border-gray-200 p-4">
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              <div className="h-8 rounded bg-gray-100" />
              <div className="h-8 rounded bg-gray-100" />
              <div className="h-8 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
