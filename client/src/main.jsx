import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
   <StrictMode>
    {/* Global configurations for toast appearance */}
    <Toaster 
      position="top-right" 
      reverseOrder={false} 
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      }}
    />
    <App />
  </StrictMode>,
)
