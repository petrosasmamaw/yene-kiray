import axios from 'axios';

// Create Axios client with sensible timeout
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 25000, // 25-second timeout to handle slow/cellular internet connections seamlessly
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper: Normalize error into user-friendly message based strictly on active language
export const normalizeApiError = (error) => {
  const currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('yene_kiray_lang')) || 'am';
  const isAm = currentLang === 'am';

  // 1. Client offline / no connection
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      type: 'OFFLINE',
      message: isAm 
        ? 'ከኢንተርኔት ውጪ ኖት፣ እባክዎ የኔትወርክ ግንኙነትዎን ያረጋግጡ' 
        : 'You are offline. Please check your internet connection.'
    };
  }

  // 2. Timeout / Low Internet / Network Abort
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      type: 'TIMEOUT',
      message: isAm 
        ? 'የኢንተርኔት ግንኙነትዎ ዝቅተኛ በመሆኑ ምላሽ አልሰጠም፣ እባክዎ እንደገና ይሞክሩ' 
        : 'Request timed out due to slow network. Please try again.'
    };
  }

  // 3. Network unreachable / Server refused connection / DNS failure
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return {
      type: 'NETWORK_ERROR',
      message: isAm 
        ? 'የሰርቨር ግንኙነት ተቋርጧል ወይም ኢንተርኔት የለም' 
        : 'Server is temporarily unreachable. Please check your connection.'
    };
  }

  const status = error.response.status;
  const serverMsg = error.response.data?.message;

  // 4. Server Error / Database down (500, 502, 503, 504)
  if (status >= 500) {
    return {
      type: 'SERVER_ERROR',
      message: serverMsg || (isAm 
        ? 'የሰርቨር ችግር አጋጥሟል፣ እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ' 
        : 'Server or database is temporarily unavailable. Please try again shortly.')
    };
  }

  // 5. Auth / Permissions
  if (status === 401) {
    return {
      type: 'AUTH_EXPIRED',
      message: serverMsg || (isAm 
        ? 'የመግቢያ ክፍለ ጊዜዎ አልቋል፣ እባክዎ እንደገና ይግቡ' 
        : 'Your session has expired. Please sign in again.')
    };
  }
  if (status === 403) {
    return {
      type: 'FORBIDDEN',
      message: serverMsg || (isAm 
        ? 'ይህን ለማድረግ በቂ ፈቃድ የለዎትም' 
        : 'You do not have permission to perform this action.')
    };
  }

  // 6. Not Found
  if (status === 404) {
    return {
      type: 'NOT_FOUND',
      message: serverMsg || (isAm 
        ? 'የተፈለገው መረጃ አልተገኘም' 
        : 'The requested resource was not found.')
    };
  }

  // 7. Payload too large
  if (status === 413) {
    return {
      type: 'PAYLOAD_TOO_LARGE',
      message: serverMsg || (isAm 
        ? 'የተመረጠው ምስል/ፋይል መጠን በጣም ትልቅ ነው' 
        : 'Uploaded file is too large. Please select a smaller file.')
    };
  }

  // 8. Validation / Conflict (400, 409, 422)
  return {
    type: 'CLIENT_ERROR',
    message: serverMsg || (isAm 
      ? 'የተሳሳተ መረጃ ተልኳል፣ እባክዎ ያረጋግጡ' 
      : 'Invalid request data. Please verify your input.')
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
