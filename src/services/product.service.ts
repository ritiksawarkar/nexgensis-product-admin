import apiClient from "@/lib/axios";
import {
  Product,
  Category,
  ProductListResponse,
  CreateProductInput,
  UpdateProductInput,
  SortValue,
} from "@/types/product";

export type {
  Product,
  Category,
  ProductListResponse,
  CreateProductInput,
  UpdateProductInput,
  SortValue,
};

export interface FetchProductsParams {
  limit: number;
  skip: number;
  sortBy?: string;
  order?: "asc" | "desc";
  signal?: AbortSignal;
}

export interface SearchProductsParams extends FetchProductsParams {
  query: string;
}

export interface CategoryProductsParams extends FetchProductsParams {
  category: string;
}

function buildParams(
  params: FetchProductsParams,
  extra?: Record<string, string | number>
) {
  const queryParams: Record<string, string | number> = {
    limit: params.limit,
    skip: params.skip,
    ...extra,
  };

  if (params.sortBy) {
    queryParams.sortBy = params.sortBy;
    queryParams.order = params.order || "asc";
  }

  return queryParams;
}

export const getProducts = async (
  params: FetchProductsParams
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>("/products", {
    params: buildParams(params),
    signal: params.signal,
  });
  return response.data;
};

export const searchProducts = async (
  params: SearchProductsParams
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>("/products/search", {
    params: buildParams(params, { q: params.query }),
    signal: params.signal,
  });
  return response.data;
};

export const getProductsByCategory = async (
  params: CategoryProductsParams
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>(
    `/products/category/${encodeURIComponent(params.category)}`,
    {
      params: buildParams(params),
      signal: params.signal,
    }
  );
  return response.data;
};

export const getCategories = async (
  signal?: AbortSignal
): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>("/products/categories", {
    signal,
  });
  return response.data;
};

export const getProductById = async (
  id: number | string,
  signal?: AbortSignal
): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`, {
    signal,
  });
  return response.data;
};

export const addProduct = async (
  product: CreateProductInput
): Promise<Product> => {
  const response = await apiClient.post<Product>("/products/add", product);
  return response.data;
};

export const updateProduct = async (
  id: number,
  product: UpdateProductInput
): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (
  id: number
): Promise<{ id: number; isDeleted: boolean; deletedOn?: string }> => {
  const response = await apiClient.delete<{
    id: number;
    isDeleted: boolean;
    deletedOn?: string;
  }>(`/products/${id}`);
  return response.data;
};