import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchMe } from '@/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'student' | 'teacher';
  redirectTo?: string;
}

export default function ProtectedRoute({ children, role, redirectTo = "/" }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const me = await fetchMe();
        if (role && me.role !== role) {
          setIsAuthenticated(false);
        } else {
          setUser(me);
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [role]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
