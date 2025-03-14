// Token 存储的 key
const AUTH_TOKEN_KEY = 'auth_token';

// 保存认证 token
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

// 获取认证 token
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// 移除认证 token
export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// 检查是否已认证
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// 解析 JWT token（简单实现）
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('解析 JWT token 失败:', error);
    return null;
  }
}
