import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../api';
import { saveCache, getCache } from '../utils/cache';
import { enqueueAction, getSyncQueue, dequeueAction } from '../utils/syncQueue';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // process offline actions queued
  const syncOfflineActions = async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline actions...`);
    
    for (const action of queue) {
      try {
        if (action.type === 'ADD') {
          await api.post('/items', action.payload);
        } else if (action.type === 'EDIT') {
          await api.put(`/items/${action.payload.id}`, action.payload.data);
        } else if (action.type === 'DELETE') {
          await api.delete(`/items/${action.payload.id}`);
        }
        
        // remove from queue only if the API call succeeds
        await dequeueAction(action.localId);
      } catch (error) {
        console.error('Sync failed, stopping queue processing:', error);
        break;
      }
    }
    
    // refresh after sync
    await fetchItems();
  };

  // fetch all items for the user's household sorted by expiry date
  const fetchItems = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      await syncOfflineActions();
      
      const response = await api.get('/items');
      setItems(response.data);
      // update cache
      await saveCache('@homi_items', response.data);
    } catch (error) {
      console.warn('API fetch failed, loading from cache...');
      const cachedItems = await getCache('@homi_items'); 
      if (cachedItems) setItems(cachedItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = async (itemData) => {
    // optimistically update ui
    const tempItem = { ...itemData, _id: Date.now().toString() }; 
    setItems((prevItems) => {
      const updated = [...prevItems, tempItem].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      saveCache('@homi_items', updated); // sync
      return updated;
    });

    // try to hit the server
    try {
      const response = await api.post('/items', itemData);
      // replace temp item with the real one from db
      setItems((prevItems) => {
        const finalItems = prevItems.map(item => item._id === tempItem._id ? response.data : item);
        saveCache('@homi_items', finalItems); // sync
        return finalItems;
      });
      return response.data;
    } catch (error) {
      // fallback to offline queue
      console.warn('Added offline. Queuing action.');
      await enqueueAction({ type: 'ADD', payload: itemData });
    }
  };

  const editItem = async (id, updatedFields) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => (item._id === id ? { ...item, ...updatedFields } : item));
      saveCache('@homi_items', updatedItems); // sync
      return updatedItems;
    });
    
    try {
      await api.put(`/items/${id}`, updatedFields);
    } catch (error) {
      console.warn('Edited offline. Queuing action.');
      await enqueueAction({ type: 'EDIT', payload: { id, data: updatedFields } });
    }
  };

  const deleteItem = async (id) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item._id !== id);
      saveCache('@homi_items', updatedItems); // sync
      return updatedItems;
    });
    
    try {
      await api.delete(`/items/${id}`);
    } catch (error) {
      console.warn('Deleted offline. Queuing action.');
      await enqueueAction({ type: 'DELETE', payload: { id } });
    }
  };

  return (
    <InventoryContext.Provider value={{ items, isLoading, fetchItems, addItem, editItem, deleteItem }}>
      {children}
    </InventoryContext.Provider>
  );
};
