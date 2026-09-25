# Nexgensis Product Admin Dashboard

A product management dashboard built for the Nexgensis Technologies frontend assessment. The application connects to the [DummyJSON API](https://dummyjson.com) to provide inventory management, search, category filtering, sorting, server-side pagination, and simulated CRUD operations.

Built with **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and **Axios**.

---

## Features

- **Authentication**: JWT-based login using DummyJSON credentials (`emilys` / `emilyspass`). Token stored in `localStorage` and attached via Axios request interceptor.
- **Route Protection**: Client-side `<AuthGuard />` ensures unauthenticated visitors are redirected to `/login`.
- **Product Catalog**: High-density desktop table and responsive mobile cards displaying image, title, category, price, rating, and stock status.
- **Server Pagination**: Real pagination utilizing `limit` and `skip` query parameters calculated from the API's total count.
- **Search & Debounce**: Search input debounced at 400ms to avoid unnecessary network traffic.
- **Race Condition Immunity**: Out-of-order responses from fast keystrokes are prevented using `AbortController` cancellation paired with a sequential request identifier.
- **Category Filter**: Populated dynamically from `/products/categories`.
- **Sorting**: Native API-driven sorting by price, rating, and title in both ascending and descending order.
- **URL Synchronization**: Page, page size, search, category, and sort are stored in query parameters. Refreshing, sharing links, or navigating via browser back/forward buttons seamlessly preserves the active view with automatic fallback for out-of-bounds page numbers.
- **Product Details**: Dedicated route at `/products/[id]` featuring an interactive image gallery, product specifications, and customer reviews.
- **Simulated CRUD**: Add, edit, and delete flows with form validation, keyboard ESC support, confirmation dialogs, and immediate local UI updates.
- **Resilient States**: Skeleton loaders, low-stock inventory cues, informative empty views, and error states with retry actions.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios

*No third-party table, pagination, or state management libraries (such as React Query, SWR, or TanStack Table) were used to keep the architecture transparent and explainable.*

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx      # Dashboard entry point wrapped in AuthGuard & Suspense
│   ├── login/page.tsx          # Login page with demo helper credentials
│   ├── products/[id]/page.tsx  # Product details page with image gallery and reviews
│   ├── layout.tsx              # Root HTML/Body layout with font imports
│   ├── page.tsx                # Root redirect forwarding to /dashboard
│   └── globals.css             # Tailwind base styles
├── components/
│   ├── AuthGuard.tsx           # Authentication wrapper using useSyncExternalStore
│   └── products/
│       ├── ProductList.tsx     # Central orchestrator for state, search, and pagination
│       ├── ProductFilters.tsx  # Search input, category dropdown, sort options, and reset
│       ├── ProductTable.tsx    # Desktop table layout with action buttons
│       ├── ProductCard.tsx     # Mobile card layout with responsive grid
│       ├── ProductPagination.tsx# Custom pagination controls with ellipsis windowing
│       ├── ProductFormModal.tsx# Reusable Add/Edit product modal with validation
│       ├── DeleteConfirmModal.tsx # Confirmation dialog for safe deletion
│       └── ProductSkeleton.tsx # Skeleton loaders for table rows and cards
├── hooks/
│   └── useDebounce.ts          # Custom debounce hook
├── lib/
│   └── axios.ts                # Shared Axios instance with request/response interceptors
├── services/
│   ├── auth.service.ts         # Authentication API calls
│   └── product.service.ts      # Product catalog and CRUD API calls
└── types/
    └── product.ts              # Data contracts and TypeScript interfaces
```

---

## Setup Instructions

Prerequisites: Node.js (v18.18+ or v20+) and npm.

1. Clone or extract the project:
   ```bash
   cd nexgensis-product-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Run production build:
   ```bash
   npm run build
   npm run start
   ```

5. Run linting:
   ```bash
   npm run lint
   ```

---

## Environment / API Configuration

The application targets `https://dummyjson.com` as its backend. Base URL configuration and default JSON headers are centralized in `src/lib/axios.ts`. No additional `.env` variables are required for standard evaluation.

---

## Authentication

- **API Endpoint**: `POST /auth/login`
- **Evaluation Credentials**:
  - **Username**: `emilys`
  - **Password**: `emilyspass`
- A convenient "Fill Demo" shortcut button is provided directly on the login form.
- Upon successful authentication, `accessToken` is saved to `localStorage` under `authToken`.
- All requests dispatched through `apiClient` automatically include `Authorization: Bearer <token>` via an Axios request interceptor.
- Unauthenticated access to `/dashboard` or `/products/[id]` triggers an automatic redirection to `/login` via `<AuthGuard />`.
- Logging out removes `authToken` from storage and returns the user to the login screen.

---

## Product Management

The dashboard supports the complete lifecycle of product records:
- **Add Product**: Opened via the "+ Add Product" button in the filter bar. Validates that title, category, price (>0), stock (>=0 whole number), and description are filled.
- **Edit Product**: Pre-populates existing record details into the form modal.
- **Delete Product**: Prompts the user with a confirmation dialog to prevent accidental removal.
- **Local State Updates**: Because DummyJSON is a mock backend, CRUD mutations are not permanently stored on the server. On successful API response, the local React state updates immediately (e.g. prepending added products, updating edited items in-place, and removing deleted items from the table) so the changes are visible during the user session.

---

## Search, Filter & Sorting

- **Debounced Search**: As the user types into the search field, input state updates immediately. An internal 400ms debounce pauses API calls until typing ceases.
- **Category Filter**: Categories are loaded once on dashboard mount from `/products/categories`. Changing the selected category resets pagination to page 1.
- **Sorting**: Supports sorting by `price`, `rating`, and `title` in either ascending or descending order.
- **Search vs Category Behavior**: DummyJSON's REST API cannot execute text search and category filtering in the same query. To give a predictable experience:
  1. When search text is present, search queries `/products/search?q=...`.
  2. If a category filter is also selected, results are filtered client-side matching the category, and a brief note informs the user that search is active across categories.
  3. When search is cleared, the system returns to native server-side category pagination (`/products/category/{cat}`).

---

## URL State

To allow bookmarking, page refreshes, and link sharing, five parameters are synchronized to the browser's URL query string:
- `page`: active page number
- `pageSize`: items per page (10, 20, 50)
- `search`: search term
- `category`: category slug
- `sort`: sort key (e.g. `price-asc`, `rating-desc`)

Parameter parsing is defensive: non-numeric or out-of-bounds parameters (such as `?page=abc` or `?pageSize=999`) safely fall back to defaults (`page=1`, `pageSize=10`) without throwing runtime errors.

---

## Race Condition Handling

When typing rapidly in search inputs, network latency variations can cause earlier requests to complete after later ones.

To ensure consistency, two mechanisms work together:
1. **Request Cancellation (`AbortController`)**: Each time a new search or filter request is started, any in-flight Axios request is cancelled via its `AbortSignal`.
2. **Request Sequence Tracking (`requestIdRef`)**: A monotonic counter increments with each fetch. When a response returns, the component verifies that the response belongs to the latest request ID before applying it to state.

In `src/lib/axios.ts`, cancelled requests (`axios.isCancel`) are rejected cleanly without logging noise to the console.

---

## DummyJSON Limitations

1. **Non-Persistent CRUD**:
   DummyJSON does not persist updates. A `POST /products/add` returns an artificial product object with ID 195+. If a user subsequently attempts a `PUT /products/195` or `DELETE /products/195`, DummyJSON returns a 404 because the ID never existed on their server. The service layer handles this gracefully by updating the local UI state.
2. **Single-Operation Queries**:
   The API does not support combining `/products/search` with `/category` in a single endpoint. The UI resolves this by prioritizing search and refining matching categories client-side.

---

## Design / Architecture Decisions

- **Separation of Concerns**: UI components never import Axios directly. All API operations go through typed functions in `src/services/product.service.ts` and `src/services/auth.service.ts`.
- **Flicker-Free Auth Guard**: `<AuthGuard />` uses React's `useSyncExternalStore` to read `localStorage`. This eliminates hydration mismatches between server-rendered HTML and client storage.
- **Isolated Details Mounting**: The product details view isolates its data fetching into `<ProductDetailsContent />` nested inside `<AuthGuard />`. This prevents unauthenticated requests from firing before the auth redirect executes.
- **Enterprise Aesthetics**: Avoided gratuitous gradients and saturated backgrounds. Focused on clear typography, tabular alignment, consistent status badges, accessible form labels, and compact layout density.

---

## Testing / Verification

- **Linting**: Verified with `npm run lint` (0 errors, 0 warnings).
- **Production Build**: Verified with `npm run build` (compiled clean routes for `/`, `/login`, `/dashboard`, and `/products/[id]`).
- **Authentication Flow**: Tested invalid credentials error handling, valid login (`emilys` / `emilyspass`), token persistence, and logout.
- **Edge Cases**: Verified invalid route IDs (e.g. `/products/999999` and `/products/abc`) render a clean "Product Not Found" screen without breaking.
- **Responsive Layout**: Verified table layout on desktop (>=1024px) and card view on mobile (<768px).

---

## AI Assistance

An AI assistant was used during development as a pair programmer to:
- Trace Next.js 16 type generator issues and React 19 hydration warnings.
- Assist with boilerplate interface declarations for the DummyJSON product schema.
- Brainstorm the dual race-condition architecture combining `AbortController` with sequential request IDs.

All code, styling, edge case handling, and architecture decisions were reviewed, debugged, and validated to ensure simple, human-written quality.
