import { CONFIG } from '../constants/config';

function setStorageWithTTL(
  storage: Storage,
  name: string,
  data: unknown,
  ttlMinutes?: number
) {
  const storageObj = {
    data: data,
    ...(ttlMinutes && {
      expiry: Date.now() + ttlMinutes * CONFIG.CHAT.EXPIRY_TIME_BASE,
    }),
  };
  console.log(
    `Setting ${storage === localStorage ? 'localStorage' : 'sessionStorage'}:`,
    name,
    storageObj
  );
  storage.setItem(name, JSON.stringify(storageObj));
}

function getStorage(storage: Storage, name: string) {
  const item = storage.getItem(name);
  console.log(
    `Item from ${
      storage === localStorage ? 'localStorage' : 'sessionStorage'
    }:`,
    item
  );
  if (!item) return null;

  const storageObj = JSON.parse(item);
  if (storageObj.expiry && Date.now() > storageObj.expiry) {
    storage.removeItem(name);
    return null;
  }
  return storageObj.data;
}

function deleteStorage(storage: Storage, name: string) {
  storage.removeItem(name);
}

// local storage
export const setLocalStorageWithTTL = (
  name: string,
  data: unknown,
  ttlMinutes?: number
) => setStorageWithTTL(localStorage, name, data, ttlMinutes);

export const getLocalStorage = (name: string) => getStorage(localStorage, name);

export const deleteLocalStorage = (name: string) =>
  deleteStorage(localStorage, name);

// session storage
export const setSessionStorageWithTTL = (
  name: string,
  data: unknown,
  ttlMinutes?: number
) => setStorageWithTTL(sessionStorage, name, data, ttlMinutes);

export const getSessionStorage = (name: string) =>
  getStorage(sessionStorage, name);

export const deleteSessionStorage = (name: string) =>
  deleteStorage(sessionStorage, name);

export function cleanupExpiredStorage(storage: Storage) {
  const keys = Object.keys(storage);
  let cleanedCount = 0;

  for (const key of keys) {
    try {
      const item = storage.getItem(key);
      if (!item) continue;

      try {
        const storageObj = JSON.parse(item);
        if (
          storageObj &&
          typeof storageObj === 'object' &&
          storageObj.expiry &&
          Date.now() > storageObj.expiry
        ) {
          storage.removeItem(key);
          cleanedCount++;
          console.log(
            `Cleaned up expired ${
              storage === localStorage ? 'localStorage' : 'sessionStorage'
            } item: ${key}`
          );
        }
      } catch {
        // ignore non-JSON format storage item
        console.debug(`Skipping non-JSON storage item ${key}`);
      }
    } catch (e) {
      console.error(`Error accessing storage item ${key}:`, e);
    }
  }

  if (cleanedCount > 0) {
    console.log(
      `Cleaned up ${cleanedCount} expired ${
        storage === localStorage ? 'localStorage' : 'sessionStorage'
      } items`
    );
  }
  return cleanedCount;
}

export function cleanupExpiredSessionStorage() {
  return cleanupExpiredStorage(sessionStorage);
}

export function cleanupExpiredLocalStorage() {
  return cleanupExpiredStorage(localStorage);
}

export function cleanupAllExpiredStorage() {
  const sessionCount = cleanupExpiredSessionStorage();
  const localCount = cleanupExpiredLocalStorage();
  return { sessionCount, localCount };
}

// export unified storage tool object
export const storage = {
  setLocalStorageWithTTL,
  getLocalStorage,
  deleteLocalStorage,
  setSessionStorageWithTTL,
  getSessionStorage,
  deleteSessionStorage,
  cleanupExpiredSessionStorage,
  cleanupExpiredLocalStorage,
  cleanupAllExpiredStorage,
};
