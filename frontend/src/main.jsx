import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { LanguageProvider } from './context/LanguageContext';
import { NetworkStatusProvider } from './context/NetworkStatusContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <NetworkStatusProvider>
          <ToastProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </ToastProvider>
        </NetworkStatusProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
