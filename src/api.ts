export const API_BASE_URL = 'http://localhost:8000/backend/api.php';

export const apiFetch = async (action: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}?action=${action}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    throw new Error(data.message || 'API request failed');
  }

  return data;
};
