import { getAuthToken } from './auth';

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}

const BASE_URL = '/api';

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, params, ...restOptions } = options;

  // Build complete URL including query parameters
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Set default request headers
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Add token to request headers if provided or available from auth module
  const authToken = token || getAuthToken();
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url.toString(), {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// User-related API
export const userApi = {
  getUsers: () => request<{ users: any[] }>('/users'),
  createUser: (data: any) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Post-related API
export const postApi = {
  getPosts: () => request<{ posts: any[] }>('/posts'),
  createPost: (data: any) =>
    request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePost: (id: number, data: any) =>
    request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePost: (id: number) =>
    request(`/posts/${id}`, {
      method: 'DELETE',
    }),
};

interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: string;
  };
  token: string;
}

// Authentication-related API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    request<LoginResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};
