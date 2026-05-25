import React, { createContext, useState, useCallback } from 'react';
import api from '../api';
import { saveCache, getCache } from '../utils/cache';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // fetch all items for the user's household sorted by expiry date
  const fetchItems = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const response = await api.get('/items');
      setItems(response.data);
      // update cache
      await saveCache('@homi_items', response.data);
    } catch (error) {
      console.warn('API fetch failed, loading from cache...');
      const cachedItems = await getCache('@homi_items'); 
      if (cachedItems) {
        setItems(cachedItems);
      }
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

  const editItem = async (id, updatedFields) => {
    try {
      const response = await api.put(`/items/${id}`, updatedFields);
      setItems((prevItems) =>
        prevItems.map((item) => (item._id === id ? response.data : item))
      );
      return response.data;
    } catch (error) {
      console.error('Failed to edit item:', error);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  };

  return (
    <InventoryContext.Provider value={{ items, isLoading, fetchItems, addItem, editItem, deleteItem }}>
      {children}
    </InventoryContext.Provider>
  );
};
