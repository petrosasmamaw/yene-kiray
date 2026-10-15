import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from './LanguageContext';

const NetworkStatusContext = createContext({
  isOnline: true,
  isServerReachable: true,
  checkConnection: () => {}
});

export function NetworkStatusProvider({ children }) {
  let isAmharic = true;
  try {
    const langContext = useLanguage();
    if (langContext && langContext.isAmharic !== undefined) {
      isAmharic = langContext.isAmharic;
    } else {
      isAmharic = (typeof localStorage !== 'undefined' ? localStorage.getItem('yene_kiray_lang') : 'am') !== 'en';
    }
  } catch {
    isAmharic = (typeof localStorage !== 'undefined' ? localStorage.getItem('yene_kiray_lang') : 'am') !== 'en';
  }

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const [checking, setChecking] = useState(false);
  const consecutiveFailuresRef = useRef(0);

  // Ping backend health check to verify real internet & server availability
  // Uses a 20s timeout and 3 consecutive failure threshold to avoid false alarms on slow/small cellular networks
  const checkConnection = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setIsServerReachable(false);
      consecutiveFailuresRef.current = 3;
      return false;
    }

    setChecking(true);
    try {
      await api.get('/health', { timeout: 20000 });
      consecutiveFailuresRef.current = 0;
      setIsOnline(true);
      setIsServerReachable(true);
      return true;
    } catch (err) {
      // If error is network error or timeout
      if (!err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        consecutiveFailuresRef.current += 1;
        // Only declare server unreachable after 3 consecutive failures
        if (consecutiveFailuresRef.current >= 3) {
          setIsServerReachable(false);
        }
        return false;
      }
      // If server responded with any HTTP status (e.g. 200, 304, 404, etc.), server is reachable!
      consecutiveFailuresRef.current = 0;
      setIsServerReachable(true);
      return true;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      consecutiveFailuresRef.current = 0;
      const serverUp = await checkConnection();
      if (serverUp) {
        setShowReconnectedBanner(true);
        setTimeout(() => setShowReconnectedBanner(false), 3500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      consecutiveFailuresRef.current = 3;
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check delayed slightly (6s) so app initial assets load smoothly first without network contention
    const initTimer = setTimeout(() => {
      checkConnection();
    }, 6000);

    // Heartbeat every 90 seconds to catch silent Wi-Fi dropouts without burdening small data connections
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        checkConnection();
      }
    }, 90000);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  const isDisconnected = !isOnline || !isServerReachable;

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isServerReachable, checkConnection }}>
      {/* Offline / Server Unreachable Banner - Strictly single language */}
      {isDisconnected && (
        <div className="fixed top-0 inset-x-0 z-50 bg-rose-600 text-white px-4 py-2 text-xs font-semibold shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-xl mx-auto sm:mx-0">
            <WifiOff className="w-4 h-4 text-rose-200 shrink-0 animate-pulse" />
            <span>
              {!isOnline 
                ? (isAmharic 
                    ? 'የኢንተርኔት ግንኙነት ተቋርጧል፤ እባክዎ ያረጋግጡ' 
                    : 'You are offline. Please check your internet connection.')
                : (isAmharic 
                    ? 'የሰርቨር ግንኙነት በጊዜያዊነት ተቋርጧል፤ ዳግም በመሞከር ላይ...' 
                    : 'Server connection is temporarily unavailable. Retrying...')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              consecutiveFailuresRef.current = 1; // Direct user retry will trigger state on failure
              checkConnection();
            }}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>
              {checking 
                ? (isAmharic ? 'በመሞከር ላይ...' : 'Retrying...') 
                : (isAmharic ? 'ዳግም ሞክር' : 'Retry')}
            </span>
          </button>
        </div>
      )}

      {/* Back Online Notification Banner - Strictly single language */}
      {showReconnectedBanner && !isDisconnected && (
        <div className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Wifi className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>
            {isAmharic 
              ? 'ግንኙነት ተመልሷል! ወደ ሲስተሙ በተሳካ ሁኔታ ተገናኝተዋል' 
              : 'Back online! Successfully reconnected to the server.'}
          </span>
        </div>
      )}

      {children}
    </NetworkStatusContext.Provider>
  );
}

export const useNetworkStatus = () => useContext(NetworkStatusContext);

