'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '@/store/auth-slice';
import { RouteHelpers } from '@/features/shared/constants/frontend-routes';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermissions?: string[];
  fallbackRoute?: string;
  showLoading?: boolean;
}

export default function RouteGuard({
  children,
  requiredRole,
  requiredPermissions = [],
  fallbackRoute,
  showLoading = true,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // Allow public routes
      if (RouteHelpers.isPublicRoute(pathname)) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Redirect to login if not authenticated
      if (!isAuthenticated || !user) {
        router.push('/login');
        setIsChecking(false);
        return;
      }

      // Check role-based access
      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user.role)) {
          // Redirect to appropriate dashboard or fallback route
          const defaultRoute = RouteHelpers.getDefaultRouteForRole(user.role);
          router.push(fallbackRoute || defaultRoute);
          setIsChecking(false);
          return;
        }
      }

      // Check route-based access using helper
      if (!RouteHelpers.hasAccessToRoute(pathname, user.role)) {
        const defaultRoute = RouteHelpers.getDefaultRouteForRole(user.role);
        router.push(fallbackRoute || defaultRoute);
        setIsChecking(false);
        return;
      }

      // Check permission-based access
      if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission =>
          userPermissions.includes(permission) || userPermissions.includes('all')
        );

        if (!hasRequiredPermissions) {
          router.push('/unauthorized');
          setIsChecking(false);
          return;
        }
      }

      // All checks passed
      setHasAccess(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [pathname, isAuthenticated, user, requiredRole, requiredPermissions, fallbackRoute, router]);

  // Show loading spinner while checking access
  if (isChecking && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Render children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Return null if access is denied (redirect will happen)
  return null;
}

// Higher-order component for easier usage
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardOptions: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...guardOptions}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// Specific route guards for common use cases
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole={['admin', 'superadmin', 'hr', 'manager']}>
      {children}
    </RouteGuard>
  );
}

export function EmployeeRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="employee">
      {children}
    </RouteGuard>
  );
}

export function AuthenticatedRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  );
}
