import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const App: React.FC = () => {
  return (
    // Any global context providers (e.g., Auth, Theme) would wrap the RouterProvider
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-blue-600">Loading...</div>}>
      <RouterProvider router={router} />
    </React.Suspense>
  );
};

export default App;