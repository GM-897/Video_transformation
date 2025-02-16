import React, { createContext, useContext, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { user } = useUser();

  console.log("user",user);
  // useEffect(() => {
  //   const syncUserWithDatabase = async () => {
  //     if (!user) return;

  //     try {
  //       const token = await getToken();
  //       const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/sync-user`, {
  //         method: 'POST',
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         }
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to sync user with database');
  //       }

  //       const data = await response.json();
  //       console.log('User synced with database:', data.user);
  //     } catch (error) {
  //       console.error('Error syncing user with database:', error);
  //     }
  //   };

  //   if (user) {
  //     syncUserWithDatabase();
  //   }
  // }, [user, getToken]);

  const value = {
    isLoaded,
    userId,
    sessionId,
    getToken,
    user,
    isSignedIn: !!userId,
  };
  console.log("value",value);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 