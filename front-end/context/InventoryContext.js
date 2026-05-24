import React, { createContext, useState, useCallback } from 'react';
import api from '../api';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // fetch all items for the user's household sorted by expiry date
  const fetchItems = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const { search, category } = filters;
      let url = '/items';
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await api.get(url);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory items:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <InventoryContext.Provider value={{ items, isLoading, fetchItems }}>
      {children}
    </InventoryContext.Provider>
  );
};
