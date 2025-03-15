// Token storage key
const TOKEN_KEY = 'auth_token';

// Save authentication token
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Get authentication token
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// Remove authentication token
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Check if authenticated
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// Parse JWT token (simple implementation)
export function parseToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

// Verify JWT token
export async function verifyJwtToken(token: string): Promise<any> {
  try {
    // 在服务器端，我们应该使用jose或jsonwebtoken库来验证令牌
    // 但为了简单起见，这里我们只解析令牌并检查是否过期
    const payload = parseToken(token);

    if (!payload) {
      return null;
    }

    // 检查令牌是否过期
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.error('Token has expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
