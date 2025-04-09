import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "admin" | "parent";
}

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, loading, checkIsAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          setLocation("/login");
        } else if (role === "admin") {
          try {
            const adminStatus = await checkIsAdmin(user.uid);
            setIsAdmin(adminStatus);
            if (!adminStatus) {
              setLocation("/"); // Redirect to home if not an admin
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setLocation("/"); // Redirect to home on error
          }
        }
        setChecking(false);
      }
    };

    checkAuth();
  }, [user, loading, setLocation, role, checkIsAdmin]);

  if (loading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  if (role === "admin" && !isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
};
