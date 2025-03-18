
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user roles
export type UserRole = 'admin' | 'employee';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

// Context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => {},
  logout: () => {},
  loading: true
});

// Sample users for demo
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: '管理者',
    email: 'admin@example.com',
    role: 'admin',
    department: '経営',
    avatar: '/placeholder.svg'
  },
  {
    id: '2',
    name: '山田太郎',
    email: 'employee@example.com',
    role: 'employee',
    department: '営業',
    avatar: '/placeholder.svg'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Simulate loading delay for demo purposes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Login function - simulates authentication
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = DEMO_USERS.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('erp_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
    
    setLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
  };

  // Compute additional states
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);
