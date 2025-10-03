import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as authService from '../services/authService';

const SESSION_KEY = 'synthetica-session';

// Define the User type, now with an optional profile picture.
export interface User {
  email: string;
  name: string;
  phoneNumber?: string;
  profilePicture?: string; // Base64 string of the image
  subscription?: {
      plan: string;
      expiresAt: string;
  };
  credits?: number;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, pass: string, name: string, phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; user?: User; message: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface Session {
    user: User;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        const session: Session = JSON.parse(storedSession);
        setCurrentUser(session.user);
      }
    } catch (error) {
        console.error("Could not parse session from local storage:", error);
        localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, pass: string, name: string, phone: string): Promise<{ success: boolean; message: string }> => {
    return authService.signup(email, pass, name, phone);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const response = await authService.login(email, pass);
    if (response.success && response.user) {
      const session: Session = { user: response.user };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setCurrentUser(response.user);
    }
    return { success: response.success, message: response.message };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; user?: User; message: string }> => {
      if (!currentUser) {
          return { success: false, message: "No user logged in." };
      }
      const response = await authService.updateUserProfile(currentUser.email, updates);
      if (response.success && response.user) {
          setCurrentUser(response.user);
          // Session is updated within authService to ensure consistency
      }
      return response;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateUserProfile,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
