import Storage from 'expo-sqlite/kv-store';
import { StateStorage } from 'zustand/middleware';

// Create a Zustand-compatible storage adapter wrapping Expo's synchronous SQLite KV engine
export const createZustandStorage = (): StateStorage => ({
  setItem: (name, value) => {
    return Storage.setItemSync(name, value);
  },
  getItem: (name) => {
    const value = Storage.getItemSync(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return Storage.removeItemSync(name);
  },
});

// Export a ready-to-use storage instance for your stores
export const appStorage = createZustandStorage();