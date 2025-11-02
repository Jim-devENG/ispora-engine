/**
 * 🛡️ DevOps Guardian: Utility function for placeholder image URLs
 * Ensures correct backend URL construction regardless of VITE_API_URL format
 */

// Get base backend URL (without /api suffix)
const getBackendBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';
  // Remove trailing /api if present
  if (apiUrl.endsWith('/api')) {
    return apiUrl.replace(/\/api$/, '');
  }
  // If it doesn't end with /api, assume it's the full base URL
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Get placeholder image URL
 * @param width - Image width (default: 40)
 * @param height - Image height (default: 40)
 * @returns Full placeholder image URL
 */
export const getPlaceholderUrl = (width: number = 40, height: number = 40): string => {
  const baseUrl = getBackendBaseUrl();
  return `${baseUrl}/api/placeholder/${width}/${height}`;
};

