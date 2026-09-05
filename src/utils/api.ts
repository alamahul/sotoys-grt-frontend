const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('sotoys_refresh_token') : null;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data?.token) {
      localStorage.setItem('sotoys_token', data.token);
      return data.token;
    }
    return null;
  } catch (err) {
    console.warn('Silent token refresh failed:', err);
    return null;
  }
}

function handleSessionExpired() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sotoys_token');
    localStorage.removeItem('sotoys_refresh_token');
    localStorage.removeItem('sotoys_user');
    window.dispatchEvent(
      new CustomEvent('sotoys:session-expired', {
        detail: { message: 'Sesi Anda telah berakhir.' },
      })
    );
  }
}

async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('sotoys_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    const isAuthRoute =
      cleanEndpoint.includes('/auth/login') ||
      cleanEndpoint.includes('/auth/register') ||
      cleanEndpoint.includes('/auth/refresh-token');

    if (!isAuthRoute && !options._retry && typeof window !== 'undefined') {
      const storedRefreshToken = localStorage.getItem('sotoys_refresh_token');
      if (storedRefreshToken) {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        if (newToken) {
          // Retry the original request with the new access token
          return request<T>(endpoint, {
            ...options,
            _retry: true,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        }
      }

      // If refresh token is missing or refresh failed, notify and clear session
      handleSessionExpired();
      throw new Error('Sesi Anda telah berakhir. Silakan masuk kembali.');
    }
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: async <T = any>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('sotoys_token') : null;

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Gagal mengunggah file');
    }

    return res.json();
  },
};

import type { Product } from '../types';
import { resolveProductImageUrl, handleImageError, checkImageAvailability } from './image';

export function normalizeProduct(p: any): Product {
  return {
    id: String(p.id),
    sku: p.sku || `SKU-${String(p.id).slice(0, 6)}`,
    slug: p.slug || p.id,
    name: p.name || 'Produk',
    description: p.description || '',
    price: typeof p.price === 'string' ? parseFloat(p.price) : (Number(p.price) || 0),
    stock: Number(p.stock) || 0,
    weight: Number(p.weight) || 200,
    condition: p.condition || 'Baru',
    categoryId: p.categoryId || (p.category ? p.category.id : ''),
    category: p.category ? { id: String(p.category.id), name: p.category.name } : undefined,
    rating: Number(p.rating) || 5,
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['/assets/uploads/products/placeholder.svg'],
    variations: p.variations || [],
    status: (p.status as any) || 'published',
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  };
}

export const getImageUrl = resolveProductImageUrl;
export { handleImageError, checkImageAvailability, API_BASE_URL };
export default api;


