const DB_NAME = 'ImageCache';
const STORE_NAME = 'images';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: 'url' });
    };
  });
};

export const storeImage = async (url, blob) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ url, blob });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getImage = async (url) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(url);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ? request.result.blob : null);
  });
};