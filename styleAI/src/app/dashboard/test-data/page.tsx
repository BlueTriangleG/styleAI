'use client';

import { useEffect, useState } from 'react';

interface TestData {
  id: number;
  name: string;
  description:string;
}

export default function TestDataPage() {
  const [data, setData] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test-db/get');
        if (!response.ok) {
          throw new Error('获取数据失败');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">错误: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">测试数据列表</h1>
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg shadow">
            <p>ID: {item.id}</p>
            <p>Name: {item.name}</p>
            <p>Description: {item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}