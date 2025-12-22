import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api, { setAuthToken } from '../api/axios.ts';
import { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Validates JWT by calling a protected backend endpoint.
   * Backend-compatible approach (since /me does not exist).
   */
const validateSession = useCallback(async () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    setUser(null);
    setIsLoading(false);
    return;
  }

  // Attach token before validation
  setAuthToken(token);

  try {
    const response = await api.get('/me');
    setUser(response.data);
    localStorage.setItem('user_data', JSON.stringify(response.data));
  } catch {
    // Token invalid or expired → clear auth state safely
    setAuthToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
  } finally {
    setIsLoading(false);
  }
}, []);


  useEffect(() => {
    validateSession();
  }, [validateSession]);

  /**
   * Login handler
   */
  const login = async (token: string) => {
    localStorage.setItem('access_token', token);
    setAuthToken(token);
    await validateSession();
  };

  /**
   * Logout handler
   */
  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    setUser(null);
    setIsLoading(false); 
  };

  /**
   * Update balance locally after transfer
   */
  const updateBalance = (newBalance: number) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem('user_data', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    await validateSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateBalance,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
