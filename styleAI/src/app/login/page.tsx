'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    router.push('/api/auth/github');
    // window.location.href = '/api/auth/github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-center">登录</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            type="text"
            name="username"
            label="用户名"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            type="password"
            name="password"
            label="密码"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>
          <Button
            onClick={handleGitHubLogin}
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<GitHubIcon />}
          >
            使用 GitHub 登录
          </Button>
        </form>
      </div>
    </div>
  );
}