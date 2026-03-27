import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';
import './styles/themes.css';

// Initialize auth store on startup
import { useAuthStore } from './store/authStore';

const initApp = async () => {
  // Fetch initial profile
  await useAuthStore.getState().fetchProfile();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
};

initApp();
