import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@homi_offline_queue';

// return the current queue
export const getSyncQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error reading sync queue:', error);
    return [];
  }
};
// add new action to queue
export const enqueueAction = async (action) => {
    try {
        let queue = await getSyncQueue();

        // queue Folding for edits
        if (action.type === 'EDIT') {
            const existingEditIndex = queue.findIndex(
                (a) => a.type === 'EDIT' && a.payload.id === action.payload.id
            );

            // intead of adding new action, merge into pending edit
            if (existingEditIndex !== -1) {
                queue[existingEditIndex].payload.data = {
                ...queue[existingEditIndex].payload.data,
                ...action.payload.data,
                };
                
                await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
                return queue[existingEditIndex]; 
            }
        }

        // 2. Queue Cleaning for DELETES
        if (action.type === 'DELETE') {
        // If we are deleting an item, any pending edits for that item are completely useless.
        // Filter them out of the queue to save bandwidth.
        queue = queue.filter(
            (a) => !(a.type === 'EDIT' && a.payload.id === action.payload.id)
        );
        }

        // Assign a unique local ID to the new action based on timestamp
        const actionWithId = { ...action, localId: Date.now().toString() };
        queue.push(actionWithId);
        
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        return actionWithId;
    } catch (error) {
        console.error('Error enqueueing action:', error);
    }
    };
// remove action once it's synced
export const dequeueAction = async (localId) => {
  try {
    const queue = await getSyncQueue();
    const filteredQueue = queue.filter(item => item.localId !== localId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filteredQueue));
  } catch (error) {
    console.error('Error dequeueing action:', error);
  }
};

// clear queue
export const clearSyncQueue = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};