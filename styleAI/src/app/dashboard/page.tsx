'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Show loading state
  if (!isLoaded || loading) {
    return <div className="p-4">Loading...</div>;
  }

  // Show dashboard content if authenticated
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/login" />
      </div>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.firstName || user?.username || 'User'}!</h2>
        <p className="text-gray-600">Email: {user?.emailAddresses[0]?.emailAddress || 'Not provided'}</p>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
      <div className="grid gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg shadow bg-white">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="mt-2 text-gray-600">{post.content}</p>
              <div className="mt-2 text-sm text-gray-500">
                Published: {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 border rounded-lg shadow bg-white text-center">
            <p className="text-gray-600">No posts yet. Create your first post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
