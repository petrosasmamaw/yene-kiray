import axios from 'axios';

// Create Axios client with sensible timeout
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15-second timeout for mobile & slow cellular networks
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper: Normalize error into user-friendly message
export const normalizeApiError = (error) => {
  // 1. Client offline / no connection
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      type: 'OFFLINE',
      message: 'ከኢንተርኔት ውጪ ኖት፣ እባክዎ የኔትወርክ ግንኙነትዎን ያረጋግጡ (You are offline. Please check your connection.)'
    };
  }

  // 2. Timeout / Low Internet / Network Abort
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'TIMEOUT',
      message: 'የኢንተርኔት ግንኙነትዎ ዝቅተኛ በመሆኑ ምላሽ አልሰጠም፣ እባክዎ እንደገና ይሞክሩ (Request timed out due to slow network. Please retry.)'
    };
  }

  // 3. Network unreachable / Server refused connection / DNS failure
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return {
      type: 'NETWORK_ERROR',
      message: 'የሰርቨር ግንኙነት ተቋርጧል ወይም ኢንተርኔት የለም (Server is temporarily unreachable. Please check your connection.)'
    };
  }

  const status = error.response.status;
  const serverMsg = error.response.data?.message;

  // 4. Server Error / Database down (500, 502, 503, 504)
  if (status >= 500) {
    return {
      type: 'SERVER_ERROR',
      message: serverMsg || 'የሰርቨር ወይም የዳታቤዝ ችግር አጋጥሟል፣ እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ (Server or database temporarily unavailable.)'
    };
  }

  // 5. Auth / Permissions
  if (status === 401) {
    return {
      type: 'AUTH_EXPIRED',
      message: serverMsg || 'የመግቢያ ክፍለ ጊዜዎ አልቋል፣ እባክዎ እንደገና ይግቡ (Session expired. Please sign in again.)'
    };
  }
  if (status === 403) {
    return {
      type: 'FORBIDDEN',
      message: serverMsg || 'ይህን ለማድረግ በቂ ፈቃድ የለዎትም (Access forbidden.)'
    };
  }

  // 6. Not Found
  if (status === 404) {
    return {
      type: 'NOT_FOUND',
      message: serverMsg || 'የተፈለገው መረጃ አልተገኘም (Requested resource not found.)'
    };
  }

  // 7. Payload too large
  if (status === 413) {
    return {
      type: 'PAYLOAD_TOO_LARGE',
      message: serverMsg || 'የተመረጠው ሰነድ/ምስል መጠን በጣም ትልቅ ነው (File is too large.)'
    };
  }

  // 8. Validation / Conflict (400, 409, 422)
  return {
    type: 'CLIENT_ERROR',
    message: serverMsg || 'የተሳሳተ መረጃ ተልኳል፣ እባክዎ ያረጋግጡ (Invalid request data.)'
  };
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yene_kiray_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with retry mechanism for transient network dropouts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry safe GET requests once if network dropped or timed out
    if (config && config.method === 'get' && !config._retry) {
      if (
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        (error.response && [502, 503, 504].includes(error.response.status))
      ) {
        config._retry = true;
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return api(config);
      }
    }

    // Attach normalized error detail
    const normalized = normalizeApiError(error);
    error.userMessage = normalized.message;
    error.errorType = normalized.type;

    if (error.response && error.response.status === 401) {
      // If unauthorized and we had a token, optionally notify
      console.warn('⚠️ [API 401] Unauthorized access - session token invalid or expired');
    }

    return Promise.reject(error);
  }
);

export default api;
