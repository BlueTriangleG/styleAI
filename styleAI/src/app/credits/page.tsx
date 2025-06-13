"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModernPricingPage from "@/components/ui/modern-pricing";
import { Header } from "@/components/home/header";
import LiquidChrome from "@/components/background/LiquidChrome";

/**
 * CreditsContent - Internal component that uses useSearchParams
 * Separated to be wrapped in Suspense boundary
 */
function CreditsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success or cancel parameters
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const sessionId = searchParams.get("session_id");
      setSuccessMessage(
        `🎉 Payment successful! Your credits have been added to your account.${
          sessionId ? ` (Session: ${sessionId.slice(-8)})` : ""
        }`
      );
      // Clear URL parameters after 3 seconds
      setTimeout(() => {
        router.replace("/credits");
      }, 3000);
    } else if (searchParams.get("canceled") === "true") {
      setError("❌ Payment was canceled. No charges were made.");
      // Clear URL parameters after 3 seconds
      setTimeout(() => {
        router.replace("/credits");
      }, 3000);
    }
  }, [searchParams, router]);

  /**
   * Handle credit purchase
   * Creates a checkout session for the selected tier
   */
  const handlePurchase = async (tierId: string) => {
    try {
      setLoading(tierId);
      setError(null);

      // Call our API to create checkout session
      const response = await fetch(
        "/styleai/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tierId }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create checkout session"
      );
      console.error("Error creating checkout session:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ModernPricingPage
      onPurchase={handlePurchase}
      loading={loading}
      error={error}
      successMessage={successMessage}
    />
  );
}

/**
 * Loading fallback component for Suspense boundary
 */
function CreditsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

/**
 * CreditsPage - Shows available credit purchase options using modern UI
 * Allows users to choose a credit package and proceed to checkout
 */
export default function CreditsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Flowing Background - Same as Hero Page */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-auto">
        <LiquidChrome
          baseColor={[0.9, 0.9, 0.9]}
          speed={0.2}
          amplitude={0.5}
          frequencyX={3}
          frequencyY={2}
          interactive={true}
        />
        <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
      </div>

      {/* Header - Same as Main Page */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 pt-20">
        <Suspense fallback={<CreditsLoading />}>
          <CreditsContent />
        </Suspense>
      </div>
    </div>
  );
}
