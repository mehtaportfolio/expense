const getBaseUrl = () => {
  const url = import.meta.env.VITE_PUSH_SERVER_URL;
  if (!url) return '';
  // Remove trailing slash if present
  return url.replace(/\/$/, '');
};

export const API_BASE_URL = getBaseUrl();

export const getApiUrl = (path: string) => {
  const base = API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If base is empty, we return the path as is (relative to current host)
  if (!base) return cleanPath;
  
  // If base is set, we ensure we don't have double /api if both base and path have it
  // But usually VITE_PUSH_SERVER_URL would be something like https://api.example.com
  return `${base}${cleanPath}`;
};
