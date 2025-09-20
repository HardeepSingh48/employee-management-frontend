'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '@/store/auth-slice';
import { AppDispatch } from '@/store';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from localStorage on app startup
    if (typeof window !== 'undefined') {
      dispatch(initializeAuth());
      setIsInitialized(true);
    }
  }, [dispatch]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}