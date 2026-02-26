import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2C2C2C',
            color: '#FAF7F2',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#C75B39',
              secondary: '#FAF7F2',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#FAF7F2',
            },
          },
        }}
      />
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
