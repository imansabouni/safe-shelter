import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface User {
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Auto-login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && parsedUser.role) {
        parsedUser.role = parsedUser.role.toLowerCase();
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  // ✅ LOGIN
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/login', { email, password });

      if (response.data.access_token) {
        const token = response.data.access_token;
        const userData: User = {
          username: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role?.toLowerCase() || 'staff' // Default to staff if not provided
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(userData);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // ✅ REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    token: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post('/register', {
        name,
        email,
        password,
        token
      });

      if (response.data.access_token) {
        const tokenRes = response.data.access_token;
        const userData: User = {
          username: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role?.toLowerCase() || 'staff'
        };

        localStorage.setItem('token', tokenRes);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenRes}`;

        setUser(userData);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}