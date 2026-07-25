'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth, getCurrentUser } from '@/store/auth-slice';
import type { AppDispatch } from '@/store';

/**
 * AuthInitializer — runs once on app mount before any page renders.
 *
 * 1. Calls `initializeAuth` (synchronous) to restore auth state from
 *    localStorage, rejecting any expired tokens.
 * 2. If a valid token was found, calls `getCurrentUser` to validate it
 *    against the server and rehydrate the user object.
 * 3. Renders children only after initialization is complete to prevent
 *    flash-of-unauthenticated-content.
 */
export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      if (typeof window === 'undefined') {
        setIsInitialized(true);
        return;
      }

      // Step 1: restore from localStorage (synchronous, checks expiry)
      dispatch(initializeAuth());

      // Step 2: if we have a (non-expired) token, validate it server-side
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        // getCurrentUser will dispatch clearAuth internally on 401
        await dispatch(getCurrentUser());
      }

      setIsInitialized(true);
    };

    void initialize();
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}