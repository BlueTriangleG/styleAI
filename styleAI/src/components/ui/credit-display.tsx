"use client";

import { useState, useEffect } from "react";
import { Coins, RefreshCw } from "lucide-react";
import styles from "./credit-display.module.css";

interface CreditDisplayProps {
  className?: string;
}

/**
 * Credit Display Component
 * Shows user's current credit balance with refresh functionality
 */
export default function CreditDisplay({ className = "" }: CreditDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch user credits from API
   */
  const fetchCredits = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      const response = await fetch("/styleai/api/user/credits", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      } else if (response.status === 401 || response.status === 307) {
        // User not authenticated or redirected, set credits to null to hide component
        setCredits(null);
      } else if (response.status === 404) {
        // API route not found, likely a development issue
        console.warn(
          "Credits API route not found (404). This might be a development issue."
        );
        setCredits(null);
      } else {
        console.error("Failed to fetch credits, status:", response.status);
        setCredits(0);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits(0);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchCredits(true);
  };

  // Fetch credits on component mount
  useEffect(() => {
    fetchCredits();
  }, []);

  // Auto-refresh credits every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCredits();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/50 rounded-lg px-3 py-2">
          <div className="w-4 h-4 bg-pink-200 rounded-full"></div>
          <div className="w-12 h-4 bg-pink-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (credits === null) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Credit display container */}
      <div
        className={`${styles.creditDisplay} relative flex items-center space-x-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/50 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200`}>
        {/* Coin icon */}
        <Coins className="w-4 h-4 text-pink-500" />

        {/* Credit label and amount */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Credits</span>
          <span
            className="text-sm font-medium text-gray-700 min-w-[2rem] text-center"
            title={`Current credits: ${credits.toLocaleString()}`}>
            {credits.toLocaleString()}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 hover:bg-pink-100 rounded-full transition-colors duration-200 disabled:opacity-50"
          title="Refresh credits">
          <RefreshCw
            className={`w-3 h-3 text-pink-400 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
