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

  const addItem = async (itemData) => {
    try {
      const response = await api.post('/items', itemData);
      // optimistically update to keep UI snappy
      setItems((prevItems) => {
        const updated = [...prevItems, response.data];
        // soonest to expire first
        return updated.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  };

  return (
    <InventoryContext.Provider value={{ items, isLoading, fetchItems, addItem }}>
      {children}
    </InventoryContext.Provider>
  );
};
