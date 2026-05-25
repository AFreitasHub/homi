import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveCache = async (key, data) => {
  if (!key) return; 
  if (data === undefined || data === null) return
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error saving to cache (${key}):`, e);
  }
};

export const getCache = async (key) => {
  if (!key) return null; 
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error reading from cache (${key}):`, e);
    return null;
  }
};