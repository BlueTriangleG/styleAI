'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PersonalizedRecommendation() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step1
    router.push('/personalized-recommendation/step1');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to first step...</p>
    </div>
  );
}
