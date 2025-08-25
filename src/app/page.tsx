'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '@/store/auth-slice';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

      useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user) {
        // Redirect based on user role
        if (user.role === 'admin') {
          router.push('/dashboard');
        } else if (user.role === 'supervisor') {
          router.push('/supervisor/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
      }
    }, [isAuthenticated, user, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}