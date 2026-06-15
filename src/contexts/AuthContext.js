import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser, getUser, verifyToken } from '../api/auth';
import { ActivityIndicator, View } from 'react-native';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isValid = await verifyToken();
      if (isValid) {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await logoutUser();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      
      if (response && response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, redirectTo: response.redirect_route };
      }
      
      return { success: false, error: 'Credenciales incorrectas' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};