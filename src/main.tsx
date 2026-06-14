import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global styles (Tailwind, fonts, etc.)
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);