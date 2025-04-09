import { ReactNode, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { AuthContext, checkIsAdmin, login, signupWithEmail, loginWithGoogle, logout } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contextValue = {
    user,
    loading,
    login,
    signupWithEmail,
    loginWithGoogle,
    logout,
    checkIsAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
