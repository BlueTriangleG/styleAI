'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('获取文章列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">仪表盘</h1>
      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-gray-600">{post.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              发布时间: {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}