'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendationHeader } from '@/components/recommendation/Header';

export default function PersonalizedRecommendation() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to uploadImages
    router.push('/hair-style/uploadImages');
  }, [router]);

  return (
    <>
      <RecommendationHeader />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Redirecting to first step...</p>
      </div>
    </>
  );
}
