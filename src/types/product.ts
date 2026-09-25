export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  brand?: string;
  sku?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: ProductReview[];
  // Flags for simulated local state tracking
  isLocallyCreated?: boolean;
  isLocallyUpdated?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  url?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateProductInput {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  thumbnail?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export type SortValue =
  | ""
  | "price-asc"
  | "price-desc"
  | "rating-asc"
  | "rating-desc"
  | "title-asc"
  | "title-desc";
