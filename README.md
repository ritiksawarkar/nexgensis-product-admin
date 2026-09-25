# Nexgensis Product Admin Dashboard

An enterprise-grade Product Administration web application built for the **Nexgensis Technologies Pvt. Ltd.** React Developer Assignment.

---

## 1. Project Overview

The **Nexgensis Product Admin Dashboard** is a clean, responsive, and robust inventory and product management interface connected to the live [DummyJSON API](https://dummyjson.com). It provides secure authentication, real server-side pagination, debounced search with strict race-condition mitigation, category filtering, multi-field sorting, interactive product detail views, and full simulated CRUD operations (Add, Edit, Delete) with local UI session synchronization.

---

## 2. Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **API Provider**: [DummyJSON](https://dummyjson.com)

*Note: No heavy state-management or ready-made table/pagination libraries (such as React Query, SWR, TanStack Table, Material UI, Express, or MongoDB) were used, keeping the project lightweight, explainable, and interview-ready.*

---

## 3. Features Completed

- **Authentication**:
  - Secure login flow against `POST /auth/login`.
  - Credentials validation and user feedback.
  - Multi-click submission prevention and loading spinner.
  - Automatic `Authorization: Bearer <token>` attachment via Axios request interceptors.
  - Client-side route protection using `<AuthGuard />` with `useSyncExternalStore`.
  - Safe logout clearing session and redirecting to `/login`.
  - Demo credentials quick-fill helper for reviewer convenience.

- **Product Listing & Responsiveness**:
  - Desktop: Clean, high-density enterprise table layout with thumbnail previews, status badges, price, rating, stock level indicators, and action triggers.
  - Mobile/Tablet: Card layout displaying product image, category, rating, price, and actions.

- **Real Server-Side Pagination**:
  - API pagination using `limit` and `skip`.
  - Configurable page sizes: **10**, **20**, **50** per page.
  - Previous, Next, and smart numbered windowing with ellipsis (`...`).
  - Total item count and range indicator (`Showing X–Y of Total`).
  - Automatic page reset to 1 when changing page size or search/filter parameters.

- **URL State Synchronization**:
  - All critical query parameters (`page`, `pageSize`, `search`, `category`, `sort`) are synced to URL query parameters via Next.js App Router (`useSearchParams`, `useRouter`, `usePathname`).
  - Page refresh or URL sharing reproduces the exact view.
  - Resilient parameter normalization: non-numeric or out-of-range values fall back to safe defaults without crashing.

- **Debounced Search & Fast-Typing Race-Condition Handling**:
  - Debounced input (`useDebounce` hook at 400ms) prevents spamming the API on every keystroke.
  - **Dual Race-Condition Safeguards**:
    1. `AbortController` signal passed to Axios cancels in-flight requests when a new search starts.
    2. Sequence request ID counter (`requestIdRef`) guarantees that if an older request resolves late, it is ignored and never overwrites newer search results.

- **Category Filtering**:
  - Dynamically fetches available categories from `GET /products/categories`.
  - Supports quick filtering and resets page to 1 on category change.

- **Sorting**:
  - Supports `price-asc`, `price-desc`, `rating-asc`, `rating-desc`, `title-asc`, `title-desc`.
  - Preserved in URL parameters.

- **Product Details (`/products/[id]`)**:
  - Protected route displaying full product gallery with interactive thumbnail selector.
  - Detailed product specifications: price, stock, brand, SKU, warranty, shipping, and return policy.
  - Customer review list with star ratings, reviewer names, and timestamps.
  - Graceful handling of invalid IDs and 404 responses with a user-friendly "Product Not Found" screen.

- **Add, Edit & Delete (Simulated CRUD)**:
  - **Add Product Modal**: Multi-field validation (title, category, price, stock, description), loading indicators, and submission lock.
  - **Edit Product Modal**: Pre-fills existing data with clean validation and update feedback.
  - **Delete Modal**: Clear confirmation dialog to prevent accidental deletion.
  - **Local State Synchronization**: Updates the dashboard state locally upon API success, clearly informing the user.

- **Loading, Empty & Error States**:
  - Skeleton loaders for both table and mobile cards.
  - Informative empty states with "Clear All Filters" button.
  - Error alert banners with "Retry Loading" buttons.

---

## 4. Setup Instructions

Ensure you have **Node.js (v18.18+ or v20+)** installed on your machine.

Clone the repository and navigate into the project directory:

```bash
cd nexgensis-product-admin
```

Install dependencies:

```bash
npm install
```

---

## 5. How to Run Locally

### Start Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The root URL automatically routes to `/dashboard` (or `/login` if unauthenticated).

### Build for Production:
```bash
npm run build
```

### Run Production Server:
```bash
npm run start
```

### Run Linter:
```bash
npm run lint
```

---

## 6. DummyJSON API Usage

The application integrates with the following DummyJSON endpoints:

| Action | HTTP Method | Endpoint |
|---|---|---|
| User Login | `POST` | `/auth/login` |
| List Products | `GET` | `/products?limit={l}&skip={s}&sortBy={f}&order={o}` |
| Search Products | `GET` | `/products/search?q={q}&limit={l}&skip={s}&sortBy={f}&order={o}` |
| Categories List | `GET` | `/products/categories` |
| Filter by Category | `GET` | `/products/category/{cat}?limit={l}&skip={s}&sortBy={f}&order={o}` |
| Single Product | `GET` | `/products/{id}` |
| Add Product | `POST` | `/products/add` |
| Update Product | `PUT` | `/products/{id}` |
| Delete Product | `DELETE` | `/products/{id}` |

---

## 7. Authentication Credentials for Evaluation

Use the standard DummyJSON test credentials:

- **Username**: `emilys`
- **Password**: `emilyspass`

*(A "Fill Demo" shortcut button is provided directly on the `/login` screen for fast evaluation.)*

---

## 8. Architecture Overview

The codebase adheres strictly to separation of concerns without unnecessary abstraction:

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard wrapped with AuthGuard & Suspense
│   ├── login/
│   │   └── page.tsx              # Login page with validation and demo helper
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx          # Product details page with image gallery & reviews
│   ├── layout.tsx                # Root layout with suppressHydrationWarning
│   ├── page.tsx                  # Root index page redirecting to /dashboard
│   └── globals.css               # Tailwind CSS imports & global styles
├── components/
│   ├── AuthGuard.tsx             # Client authentication check via useSyncExternalStore
│   └── products/
│       ├── ProductList.tsx       # Core orchestrator for state, URL sync, & data fetching
│       ├── ProductFilters.tsx    # Search, category, sort dropdowns, and reset controls
│       ├── ProductTable.tsx      # Enterprise desktop table with actions
│       ├── ProductCard.tsx       # Mobile/tablet responsive product card
│       ├── ProductPagination.tsx # Custom pagination with dynamic ellipsis windowing
│       ├── ProductFormModal.tsx  # Accessible modal for both Adding and Editing products
│       ├── DeleteConfirmModal.tsx# Confirmation dialog for item deletion
│       └── ProductSkeleton.tsx   # Skeleton loading states for table & cards
├── services/
│   ├── auth.service.ts           # Login request handler
│   └── product.service.ts        # Typed API service wrappers around DummyJSON endpoints
├── lib/
│   └── axios.ts                  # Central Axios client with token request interceptor
├── hooks/
│   └── useDebounce.ts            # Custom debounce hook for search queries
└── types/
    └── product.ts                # TypeScript interfaces for Product, Category, and filters
```

---

## 9. URL State Approach

All view parameters are synchronized with browser query parameters:
- `page`: active page number (normalized to `1` if invalid or `< 1`)
- `pageSize`: items per page (normalized to `10`, `20`, or `50`)
- `search`: string search query
- `category`: slug of chosen category
- `sort`: sort configuration (e.g. `price-asc`, `rating-desc`)

**Why this matters**:
- Refreshing the browser or sharing the link preserves the exact filtered view.
- Handled via Next.js App Router's `useSearchParams`, `useRouter`, and `usePathname`.
- Non-default values are preserved; default values (e.g. page 1, size 10) are cleanly omitted from the URL.

---

## 10. Search Debounce Approach

When a user types into the search input:
1. The local input state (`searchInput`) updates immediately, keeping typing lag-free.
2. The custom `useDebounce` hook holds emission for **400ms**.
3. Once typing pauses for 400ms, the debounced query triggers an effect that resets `page` to 1 and pushes the query to the URL search params.
4. Clearing the search box immediately restores standard paginated product listing.

---

## 11. How Race Conditions are Prevented

In real-world networks or when users type quickly, asynchronous responses may arrive out of order (e.g., query "ph" arrives after query "phone").

To solve this, we employ a **dual-layer guarantee**:
1. **Request Abort via `AbortController`**: An `AbortController` instance is stored in `abortControllerRef`. Each time a new search or filter request is dispatched, any in-flight Axios request is immediately aborted via its `signal`.
2. **Sequential Request ID Tracking**: A monotonic counter (`requestIdRef.current++`) assigns a unique sequence ID to each fetch. When a response resolves, the component verifies that the response ID matches the latest sequence ID before calling `setProducts`.

Even under artificial latency tests (e.g. `?delay=2000`), outdated API responses can never overwrite newer search results.

---

## 12. Search + Category API Limitation & Chosen Behavior

### The DummyJSON Limitation:
DummyJSON does **not** support combining search and category filtering in a single API query (e.g., `/products/search?q=phone&category=smartphones` ignores the category or fails).

### Chosen Behavior:
1. **Search takes priority**: When the user enters a search term, the application queries `/products/search?q=...`.
2. **Client-side Category Refinement**: If a category is also active, the search results are refined client-side matching `product.category === selectedCategory`.
3. **Transparent UX**: An informative note appears beneath the filter bar informing the user: *"Search is active. Results are searched across all products and filtered by the selected category."*
4. When search is cleared, the system automatically falls back to full server-side category pagination (`/products/category/{cat}`).

This architecture is completely explainable, predictable, and doesn't mislead the user.

---

## 13. DummyJSON CRUD Persistence Limitation

DummyJSON is a mock REST API:
- `POST /products/add`: Simulates creation and returns a new product object with an assigned ID (typically 195+).
- `PUT /products/[id]`: Simulates updating and returns the modified fields.
- `DELETE /products/[id]`: Simulates deletion and returns `{ isDeleted: true }`.

**None of these changes are permanently stored on DummyJSON's servers.**

### How the application handles this:
- Upon successful API response, the application updates its **local React state**:
  - Newly added products are prepended to the active list and marked with a clean badge.
  - Edited products update their fields in-place with an "Edited" badge.
  - Deleted products are removed from the active view and total count is adjusted.
- If a user tries to edit or delete a newly simulated product (id >= 195), the API returns a 404 because the product was never persisted on DummyJSON's backend. The app gracefully catches this 404 and applies the change to the local state, preventing application crashes.

---

## 14. One Significant Problem Faced

During initial startup on Next.js 16 (Turbopack) with React 19:
1. The browser console logged `GET /login 404` and hydration mismatches due to `className="native-dark-class-modified"` injected by browser dark-mode extensions.
2. In `src/app/layout.tsx`, an unimported `LayoutProps<"/">` type corrupted `.next/dev/types/validator.ts` and disrupted route registration.
3. React 19 introduced strict linter checks (`react-hooks/set-state-in-effect`), which flagged synchronous `setState` executions inside effects.

---

## 15. How It Was Fixed

1. **Hydration & Root Layout**: Fixed `src/app/layout.tsx` to use `{ children }: { children: React.ReactNode }` and added `suppressHydrationWarning` on `<html>` and `<body>` to ignore browser extension DOM mutations.
2. **Route Redirection**: Updated `src/app/page.tsx` with a server redirect to `/dashboard` so visitors are immediately forwarded to the protected area.
3. **Suspense Boundary**: Wrapped `ProductList` with `<Suspense>` in `dashboard/page.tsx` to ensure `useSearchParams()` hydrates cleanly in Next.js App Router.
4. **State Derivation in Modals**: Refactored `ProductFormModal.tsx` to initialize form state directly on mount with dynamic `key` props instead of using cascading `useEffect` setters.
5. **Hydration-Safe Storage in AuthGuard**: Refactored `AuthGuard.tsx` to use `useSyncExternalStore` for reading `localStorage`, completely eliminating hydration warnings.

---

## 16. Where AI Tools Helped

- Accelerated identification of TypeScript type mismatch errors in Next.js 16 type generator files.
- Assisted in rapidly prototyping the dual race-condition architecture combining `AbortController` cancellation and monotonic request sequence IDs.
- Outlined edge cases for query parameter normalization (`?page=abc`, `?pageSize=999`).

---

## 17. What Was Manually Verified / Tested

- **Authentication**: Logged in with `emilys` / `emilyspass`, verified JWT token stored in `localStorage`, verified request headers in network requests, and confirmed logout clears token and routes to `/login`.
- **Route Protection**: Verified navigating directly to `/dashboard` or `/products/1` while unauthenticated immediately redirects to `/login`.
- **Search & Debounce**: Typed search queries rapidly; verified cancellation of previous requests and confirmed the latest search result always renders.
- **Category Filter & Sorting**: Tested category selection and sorting combinations (Price Low/High, Rating, Title) and verified URL parameters update in sync.
- **Pagination**: Verified navigation between pages, changing page size (10, 20, 50), and boundary behavior on first and last pages.
- **Product Details**: Tested `/products/1` (valid product, verified gallery, specs, reviews) and `/products/99999` (verified clean Not Found UI without crashes).
- **CRUD Operations**: Created new products, edited existing products, and deleted products, observing local state synchronization and feedback alerts.
- **Production Verification**: Successfully executed `npm run lint` (0 errors, 0 warnings) and `npm run build` (0 build errors, clean static and dynamic route generation).
