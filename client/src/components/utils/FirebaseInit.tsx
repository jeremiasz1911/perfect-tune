import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initializeFirestore, markUserAsAdmin } from '@/utils/initFirestore';
import { useLocation } from 'wouter';

interface FirebaseInitProps {
  children: React.ReactNode;
}

export const FirebaseInit: React.FC<FirebaseInitProps> = ({ children }) => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initializeFirstUserAsAdmin = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Check if user exists in the database
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        let isAdmin = false;
        if (!userDoc.exists()) {
          // This is a new user, create their document
          const userData = {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: Timestamp.now(),
            lastLogin: Timestamp.now(),
            role: 'parent', // Default role
          };

          await setDoc(userRef, userData);

          // Check if this is the first user in the system
          const usersCollection = collection(db, 'users');
          const usersSnapshot = await getDocs(usersCollection);
          
          if (usersSnapshot.size === 1) {
            // This is the first user, make them an admin
            await markUserAsAdmin(user.uid);
            isAdmin = true;
            toast({
              title: 'Admin Access Granted',
              description: 'You have been promoted to admin as the first user.',
            });
          }
        } else {
          // Existing user, update their last login
          await setDoc(userRef, {
            lastLogin: Timestamp.now(),
          }, { merge: true });
          
          // Check if the user is an admin
          const userData = userDoc.data();
          isAdmin = userData?.role === 'admin';
        }

        // Initialize Firestore with sample data if needed
        await initializeFirestore();

        setInitialized(true);
        setLoading(false);
        
        // Redirect user based on role
        if (isAdmin) {
          setLocation('/admin');
        } else {
          setLocation('/parent');
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize the database.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    if (user && !initialized) {
      initializeFirstUserAsAdmin();
    }
  }, [user, initialized, toast, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-neutral-700">Initializing application...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default FirebaseInit;