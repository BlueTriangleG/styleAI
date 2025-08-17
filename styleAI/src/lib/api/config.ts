/**
 * API Configuration
 */

// API Server URL
export const API_SERVER_URL =
  process.env.NEXT_PUBLIC_API_SERVER_URL || "http://127.0.0.1:5001";

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: "/health",
  IMAGE_PROCESS: "/api/image/process",
  IMAGE_DOWNLOAD: "/api/image/download",
  PERSONALIZED_ANALYSIS: "/api/personalized/analysis",
  WEAR_SUIT_PICTURES: "/api/personalized/wear-suit-pictures",
  GENERATE_BEST_FIT: "/api/personalized/generate-best-fit",
};

// API Timeout (ms)
export const API_TIMEOUT = 30000; // 30 seconds

// API Request Options
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// Export default config
export default {
  API_SERVER_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
  DEFAULT_HEADERS,
};
