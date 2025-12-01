// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://habilitadev-backend.onrender.com/api/v1',
};

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}

