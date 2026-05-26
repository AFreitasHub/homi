import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@homi_offline_queue';

// Retrieve the current queue of offline actions
export const getSyncQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error reading sync queue:', error);
    return [];
  }
};

// Add a new action to the back of the queue
export const enqueueAction = async (action) => {
  try {
    const queue = await getSyncQueue();
    // Assign a unique local ID to the action based on timestamp
    const actionWithId = { ...action, localId: Date.now().toString() };
    queue.push(actionWithId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return actionWithId;
  } catch (error) {
    console.error('Error enqueueing action:', error);
  }
};

// Remove a specific action once it has been successfully synced to the backend
export const dequeueAction = async (localId) => {
  try {
    const queue = await getSyncQueue();
    const filteredQueue = queue.filter(item => item.localId !== localId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Error dequeueing action:', error);
  }
};

// Clear the entire queue (useful for logging out or hard resets)
export const clearSyncQueue = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};