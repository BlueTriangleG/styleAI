'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/user';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Login token not found');
      return;
    }
    const handleGitHubCallback = async () => {
      try {
        // Parse JWT token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: tokenData.id,
          username: tokenData.username,
          provider: 'github',
          provider_id: tokenData.provider_id,
          created_at: new Date(),
          updated_at: new Date(),
        };
        console.log('User information for login:', user);
        console.log('JWT Token:', token);
        // Save user information and token using authStore
        login(user, token);
        console.log('Login completed');

        // Redirect to dashboard after successful login
        router.push('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'GitHub login failed');
      }
    };

    handleGitHubCallback();
  }, [searchParams, router, login]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-red-500 text-center">{error}</div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">Processing GitHub login...</div>
      </div>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">加载中...</div>
        </div>
      </div>
    }>
      <GitHubCallbackContent />
    </Suspense>
  );
}
