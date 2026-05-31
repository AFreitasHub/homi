import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setAuthToken } from '../api';
import { saveCache, getCache } from '../utils/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    await AsyncStorage.multiRemove([
      '@homi_user', 
      '@homi_items', 
      '@homi_offline_queue',
      '@homi_household'
    ]);
    setAuthToken(null);
    setUser(null);
  };

const updateProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    const { token, ...updatedUser } = response.data;
    
    if (token) {
      await SecureStore.setItemAsync('userToken', token);
      setAuthToken(token);
    }
    
    setUser(updatedUser);
    await saveCache('@homi_user', updatedUser);
  };

  const deleteAccount = async () => {
    await api.delete('/users/profile');
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};