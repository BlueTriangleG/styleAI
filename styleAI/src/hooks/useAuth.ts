import { useState, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null
  });

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      setAuthState({
        user: data.user,
        token: data.token
      });

      return data;
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      token: null
    });
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    login,
    logout,
    isAuthenticated: !!authState.token
  };
}