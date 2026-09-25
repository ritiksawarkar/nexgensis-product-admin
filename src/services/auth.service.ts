import apiClient from "@/lib/axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};