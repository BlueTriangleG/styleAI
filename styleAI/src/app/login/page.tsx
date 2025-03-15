'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import GitHubIcon from '@/components/icons/GitHubIcon';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subscribe: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // This would be replaced with your actual registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-[#1c1c1c] rounded-xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-normal text-white">Welcome to Style AI!</h1>
          <p className="text-sm text-gray-400 mt-1">Sign up now and enjoy a 7-day free trial.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-normal text-white mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              placeholder="Username"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-normal text-white mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1c1c1c] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
              placeholder="Input your Email address"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-normal text-white mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#1c1c1c] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500"
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                onClick={() => {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="subscribe"
              name="subscribe"
              checked={formData.subscribe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-700 rounded-md bg-[#1c1c1c] focus:ring-0"
            />
            <label htmlFor="subscribe" className="ml-2 block text-xs text-gray-400">
              Subscribe to our newsletter for updates and offers. Unsubscribe anytime.
            </label>
          </div>
          
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-2 px-4 rounded-lg mt-4 hover:bg-gray-200 transition-colors"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            All fields are required. By creating an account you agree to our{' '}
            <a href="#" className="text-white hover:underline">Terms & Conditions</a> and our{' '}
            <a href="#" className="text-white hover:underline">Privacy Policy</a>.
          </p>
        </div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => router.push('/login-with-email')}
            className="text-white text-sm hover:underline"
          >
            Log in with Email
          </button>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1c1c1c] text-gray-400">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={handleGitHubLogin}
              variant="outline"
              className="w-full border border-gray-700 bg-[#1c1c1c] text-white hover:bg-gray-800 flex items-center justify-center gap-3 py-2.5"
              size="lg"
            >
              <GitHubIcon />
              <span>Login With GitHub</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
