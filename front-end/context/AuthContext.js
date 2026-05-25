import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setAuthToken } from '../api';
import { saveCache, getCache } from '../utils/cache';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setAuthToken(token);
          try {
            const response = await api.get('/users/profile');
            setUser(response.data);
            await saveCache('@homi_user', response.data);
          } catch (error) {
            const cachedUser = await getCache('@homi_user');
            if (cachedUser) setUser(cachedUser);
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/users/login', { email, password });
    const { token, ...userData } = response.data;
    
    await SecureStore.setItemAsync('userToken', token);
    setAuthToken(token);
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const response = await api.post('/users', { name, email, password });
    const { token, ...userData } = response.data;

    await SecureStore.setItemAsync('userToken', token);
    setAuthToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};