/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Get API URL from environment variable or use default
const getApiUrl = (): string => {
  // For Next.js, environment variables must start with NEXT_PUBLIC_ to be accessible in the browser
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envApiUrl) {
    return envApiUrl;
  }

  // Default fallback (development)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/api';
  }

  // Production fallback - your Cloud Run backend
  return 'https://provider-476791140012.asia-south1.run.app/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000, // 30 seconds
} as const;

// Export individual URLs for convenience
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_TIMEOUT = API_CONFIG.TIMEOUT;
