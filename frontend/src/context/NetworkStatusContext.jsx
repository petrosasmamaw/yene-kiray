import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';

const NetworkStatusContext = createContext({
  isOnline: true,
  isServerReachable: true,
  checkConnection: () => {}
});

export function NetworkStatusProvider({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);
  const [checking, setChecking] = useState(false);

  // Ping backend health check to verify real internet & server availability
  const checkConnection = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setIsServerReachable(false);
      return false;
    }

    setChecking(true);
    try {
      await api.get('/health', { timeout: 4000 });
      setIsOnline(true);
      setIsServerReachable(true);
      return true;
    } catch (err) {
      // If error is network error or timeout
      if (!err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        setIsServerReachable(false);
        return false;
      }
      setIsServerReachable(true);
      return true;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const serverUp = await checkConnection();
      if (serverUp) {
        setShowReconnectedBanner(true);
        setTimeout(() => setShowReconnectedBanner(false), 3500);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnection();

    // Heartbeat every 45 seconds to catch silent Wi-Fi dropouts
    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkConnection();
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  const isDisconnected = !isOnline || !isServerReachable;

  return (
    <NetworkStatusContext.Provider value={{ isOnline, isServerReachable, checkConnection }}>
      {/* Offline / Server Unreachable Banner */}
      {isDisconnected && (
        <div className="fixed top-0 inset-x-0 z-50 bg-rose-600 text-white px-4 py-2 text-xs font-semibold shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-xl mx-auto sm:mx-0">
            <WifiOff className="w-4 h-4 text-rose-200 shrink-0 animate-pulse" />
            <span>
              {!isOnline 
                ? 'የኢንተርኔት ግንኙነት ተቋርጧል እባክዎ ያረጋግጡ (You are offline - check connection)'
                : 'የሰርቨር ግንኙነት በጊዜያዊነት ተቋርጧል (Server connection unavailable - retrying...)'}
            </span>
          </div>

          <button
            type="button"
            onClick={checkConnection}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'በመሞከር ላይ...' : 'ዳግም ሞክር'}</span>
          </button>
        </div>
      )}

      {/* Back Online Notification Banner */}
      {showReconnectedBanner && !isDisconnected && (
        <div className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white px-4 py-2 text-xs font-semibold shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
          <Wifi className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>ግንኙነት ተመልሷል! ወደ ሲስተሙ በተሳካ ሁኔታ ተገናኝተዋል (Back online and reconnected!)</span>
        </div>
      )}

      {children}
    </NetworkStatusContext.Provider>
  );
}

export const useNetworkStatus = () => useContext(NetworkStatusContext);
