import { useAuth } from "@clerk/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const getApiBaseUrl = () => API_BASE_URL;

export const apiRequest = async ({
  token,
  endpoint,
  method = "GET",
  body,
  headers = {},
}) => {
  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!data.success) {
    const error = new Error(data.message || "Request failed");
    error.data = data;
    throw error;
  }

  return data;
};

export const isUpgradeError = (message = "") =>
  /premium|upgrade|limit reached/i.test(message);

export const useApi = () => {
  const { getToken } = useAuth();

  const request = async (endpoint, options = {}) => {
    const token = await getToken();
    return apiRequest({ token, endpoint, ...options });
  };

  return { request };
};
