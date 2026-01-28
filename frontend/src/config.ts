/**
 * Environment-based API configuration
 * Automatically resolves to localhost (dev) or Render backend (production)
 */

const getBaseURL = (): string => {
  // Development: Local Vite dev server (http://localhost:5173)
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // Production: Use Render backend URL
  // This is set in .env.production or via Vercel environment variables
  return import.meta.env.VITE_API_BASE_URL || 'https://auditpay-backend.onrender.com';
};

export const BASE_API_URL = getBaseURL();

export const API_CONFIG = {
  BASE_URL: BASE_API_URL,
  TIMEOUT: 60000, // 60 seconds (for Render cold starts)
};
