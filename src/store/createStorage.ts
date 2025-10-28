import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

export function createStorage(): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const res = await AsyncStorage.getItem(name);
        console.log('getItem', name, res);
        return JSON.parse(res || '{}');
      } catch (e) {
        console.error("Failed to load from secure store", e);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(name, stringValue);
      } catch (e) {
        console.error("Failed to save to secure store", e);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(name);
      } catch (e) {
        console.error("Failed to remove from secure store", e);
      }
    },
  };
}