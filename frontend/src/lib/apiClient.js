export class ApiClientError extends Error {
  constructor(message, code = 'API_ERROR', status = 500, details = null) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (networkErr) {
    throw new ApiClientError(
      'Unable to connect to server. Please check your internet connection.',
      'NETWORK_ERROR',
      0
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return null;
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // If response was not JSON
    if (!res.ok) {
      throw new ApiClientError(
        `Server returned ${res.status}: ${res.statusText}`,
        'SERVER_ERROR',
        res.status
      );
    }
    return null;
  }

  if (!res.ok || json?.success === false) {
    const errorData = json?.error || {};
    const code = errorData.code || 'REQUEST_FAILED';
    const message = errorData.message || 'Request failed';
    const details = errorData.details || null;

    // Handle 401 Unauthorized in client browser
    if (res.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      }
    }

    throw new ApiClientError(message, code, res.status, details);
  }

  if (json.data !== undefined) {
    if (json.meta !== undefined && json.data !== null && typeof json.data === 'object') {
      try {
        json.data.meta = json.meta;
        json.data.pagination = json.meta;
      } catch {
        // In case data is frozen
      }
    }
    // Also attach json.meta as a non-enumerable or direct property for easy access
    if (json.meta !== undefined && Array.isArray(json.data)) {
      Object.defineProperty(json.data, 'meta', {
        value: json.meta,
        writable: true,
        enumerable: false,
        configurable: true,
      });
      Object.defineProperty(json.data, 'pagination', {
        value: json.meta,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
    return json.data;
  }

  return json;
}
