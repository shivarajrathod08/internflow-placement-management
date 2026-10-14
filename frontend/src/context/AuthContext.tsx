import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, Role, AuthResponse, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('internflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('internflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.get<ApiResponse<AuthResponse>>('/auth/me')
        .then((res) => {
          if (res.data.success && res.data.data) {
            const u: User = {
              id: res.data.data.userId,
              email: res.data.data.email,
              role: res.data.data.role,
              name: res.data.data.name,
              profileId: res.data.data.profileId,
            };
            setUser(u);
            localStorage.setItem('internflow_user', JSON.stringify(u));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password: pass,
    });
    const authData = res.data.data;
    setToken(authData.token);
    localStorage.setItem('internflow_token', authData.token);

    const u: User = {
      id: authData.userId,
      email: authData.email,
      role: authData.role,
      name: authData.name,
      profileId: authData.profileId,
    };
    setUser(u);
    localStorage.setItem('internflow_user', JSON.stringify(u));
    return authData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('internflow_token');
    localStorage.removeItem('internflow_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<ApiResponse<AuthResponse>>('/auth/me');
      if (res.data.success && res.data.data) {
        const u: User = {
          id: res.data.data.userId,
          email: res.data.data.email,
          role: res.data.data.role,
          name: res.data.data.name,
          profileId: res.data.data.profileId,
        };
        setUser(u);
        localStorage.setItem('internflow_user', JSON.stringify(u));
      }
    } catch (e) {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
