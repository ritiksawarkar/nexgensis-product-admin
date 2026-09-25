import apiClient from "@/lib/axios";

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
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export const getProducts = async (
  limit: number,
  skip: number
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);

  return response.data;
};