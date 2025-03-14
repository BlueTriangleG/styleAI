import { getAuthToken } from './auth';

interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string>;
}

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, params, ...restOptions } = options;
  
  // 构建完整的 URL，包括查询参数
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // 设置默认请求头
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  // 如果提供了 token 或者可以从 auth 模块获取 token，则添加到请求头
  const authToken = token || getAuthToken();
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url.toString(), {
    ...restOptions,
    headers
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.statusText}`);
  }

  return response.json();
}

// 用户相关 API
export const userApi = {
  getUsers: () => request<{ users: any[] }>('/users'),
  createUser: (data: any) => request('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};

// 文章相关 API
export const postApi = {
  getPosts: () => request<{ posts: any[] }>('/posts'),
  createPost: (data: any) => request('/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePost: (id: number, data: any) => request(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePost: (id: number) => request(`/posts/${id}`, {
    method: 'DELETE'
  })
};

interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: string;
  };
  token: string;
}

// 认证相关 API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    request<LoginResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
};