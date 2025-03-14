'use client';

import { useEffect, useState } from 'react';

interface TestData {
  id: number;
  name: string;
  description: string;
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
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error occurred while fetching data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Data List</h1>
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
