// components/BattleMode/ImagesMode/improvedIndexedDBUtils.js
import { 
  StorageError, 
  QuotaExceededError, 
  BrowserSupportError,
  isIndexedDBSupported 
} from '../../../utils/errors';

// Constants
const DB_NAME = 'ImageCache';
const STORE_NAME = 'images';
const DB_VERSION = 1;

// Size limits (in bytes)
const MAX_BLOB_SIZE = 50 * 1024 * 1024; // 50MB
const QUOTA_CHECK_THRESHOLD = 0.9; // Check if we're at 90% capacity

/**
 * Opens a connection to the IndexedDB database
 * @returns {Promise<IDBDatabase>} - Promise resolving to the database object
 * @throws {BrowserSupportError} - If IndexedDB is not supported
 * @throws {StorageError} - If there was an error opening the database
 */
export const openDB = () => {
  return new Promise((resolve, reject) => {
    // Check browser support first
    if (!isIndexedDBSupported()) {
      reject(new BrowserSupportError('IndexedDB is not supported in this browser', {
        feature: 'IndexedDB',
        userMessage: 'Your browser does not support offline image storage.'
      }));
      return;
    }
    
    // Open connection to database
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Error handler
    request.onerror = (event) => {
      const error = event.target.error;
      
      // Handle permission denied (e.g., private browsing)
      if (error.name === 'SecurityError' || error.name === 'InvalidStateError') {
        reject(new StorageError('IndexedDB access denied (possibly private browsing mode)', {
          storageType: 'IndexedDB',
          userMessage: 'Cannot access storage in private browsing mode.',
          originalError: error
        }));
      } else {
        reject(new StorageError(`Failed to open IndexedDB: ${error.message}`, {
          storageType: 'IndexedDB',
          originalError: error
        }));
      }
    };
    
    // Success handler
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      // Set global error handler for database
      db.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
      };
      
      resolve(db);
    };
    
    // Database initialization or upgrade
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        
        // Create indexes if needed
        store.createIndex('timestamp', 'timestamp', { unique: false });
        
        console.log(`Created ${STORE_NAME} object store`);
      }
    };
  });
};

/**
 * Get available storage space estimation
 * @returns {Promise<Object>} Object with usage and quota information
 */
export const getStorageEstimate = async () => {
  try {
    // Use navigator.storage API if available
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0,
        available: estimate.quota ? (estimate.quota - estimate.usage) : 0
      };
    }
    
    // Fallback to a basic check of IndexedDB availability
    await openDB();
    return {
      available: true,
      usagePercentage: 0,
      usage: 0,
      quota: Infinity
    };
  } catch (error) {
    if (error instanceof BrowserSupportError) {
      throw error;
    }
    
    throw new StorageError('Could not estimate available storage', {
      storageType: 'IndexedDB',
      originalError: error
    });
  }
};

/**
 * Checks if storing a blob would exceed storage limits
 * @param {Blob} blob - The blob to check
 * @returns {Promise<boolean>} Promise resolving to true if storage is available
 * @throws {QuotaExceededError} If storage would exceed quota
 */
export const checkStorageAvailability = async (blob) => {
  // Skip check for small blobs
  if (!blob || blob.size < 1024 * 1024) return true;
  
  try {
    const estimate = await getStorageEstimate();
    
    // Check if blob size exceeds maximum allowed
    if (blob.size > MAX_BLOB_SIZE) {
      throw new QuotaExceededError('Blob size exceeds maximum allowed', {
        storageType: 'IndexedDB',
        userMessage: 'Image is too large to store offline.'
      });
    }
    
    // Check if we're near quota
    if (estimate.usagePercentage > QUOTA_CHECK_THRESHOLD) {
      // Ensure we have enough space for this blob
      if (estimate.available < blob.size) {
        throw new QuotaExceededError('Storage quota would be exceeded', {
          storageType: 'IndexedDB',
          userMessage: 'Not enough storage space. Try clearing browser data.'
        });
      }
    }
    
    return true;
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      throw error;
    }
    
    // Other errors - we'll assume storage is available but log the error
    console.warn('Storage check failed:', error);
    return true;
  }
};

/**
 * Stores an image blob in IndexedDB
 * @param {string} url - The URL of the image (used as the key)
 * @param {Blob} blob - The image blob to store
 * @returns {Promise<void>} Promise resolving when the image is stored
 * @throws {StorageError} If there's an error storing the image
 * @throws {QuotaExceededError} If storage quota is exceeded
 */
export const storeImage = async (url, blob) => {
  try {
    // Validate inputs
    if (!url) throw new Error('URL is required');
    if (!blob) throw new Error('Blob is required');
    
    // Check storage availability
    await checkStorageAvailability(blob);
    
    // Open the database
    const db = await openDB();
    
    // Store the image
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Add timestamp to track when the image was stored
      const request = store.put({ 
        url, 
        blob, 
        timestamp: new Date().getTime(),
        size: blob.size
      });
      
      // Handle errors
      request.onerror = (event) => {
        const error = event.target.error;
        
        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
          reject(new QuotaExceededError('Storage quota exceeded while storing image', {
            storageType: 'IndexedDB',
            resourceUrl: url,
            originalError: error
          }));
        } else {
          reject(new StorageError(`Failed to store image: ${error.message}`, {
            storageType: 'IndexedDB',
            resourceUrl: url,
            originalError: error
          }));
        }
      };
      
      request.onsuccess = () => {
        resolve();
      };
      
      // Handle transaction errors
      transaction.onerror = (event) => {
        reject(new StorageError(`Transaction failed: ${event.target.error.message}`, {
          storageType: 'IndexedDB',
          resourceUrl: url,
          originalError: event.target.error
        }));
      };
    });
    
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof StorageError) {
      throw error;
    }
    
    // Convert other errors to StorageError
    throw new StorageError(`Failed to store image: ${error.message}`, {
      storageType: 'IndexedDB',
      resourceUrl: url,
      originalError: error
    });
  }
};

/**
 * Retrieves an image blob from IndexedDB
 * @param {string} url - The URL of the image to retrieve
 * @returns {Promise<Blob|null>} Promise resolving to the image blob or null if not found
 * @throws {StorageError} If there's an error retrieving the image
 */
export const getImage = async (url) => {
  try {
    // Validate input
    if (!url) throw new Error('URL is required');
    
    // Open the database
    const db = await openDB();
    
    // Retrieve the image
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      
      // Handle errors
      request.onerror = (event) => {
        reject(new StorageError(`Failed to retrieve image: ${event.target.error.message}`, {
          storageType: 'IndexedDB',
          resourceUrl: url,
          originalError: event.target.error
        }));
      };
      
      // Handle success
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
        
        // Update timestamp to mark as recently accessed
        if (result) {
          const updateTx = db.transaction(STORE_NAME, 'readwrite');
          const updateStore = updateTx.objectStore(STORE_NAME);
          result.lastAccessed = new Date().getTime();
          updateStore.put(result);
        }
      };
    });
    
  } catch (error) {
    // Re-throw custom errors
    if (error instanceof StorageError) {
      throw error;
    }
    
    // Return null for browser support issues (silent fallback)
    if (error instanceof BrowserSupportError) {
      console.warn(error.message);
      return null;
    }
    
    // Convert other errors to StorageError
    throw new StorageError(`Failed to retrieve image: ${error.message}`, {
      storageType: 'IndexedDB',
      resourceUrl: url,
      originalError: error
    });
  }
};

/**
 * Clears old images from the cache to free up space
 * @param {number} olderThanDays - Number of days to keep images (default: 7)
 * @returns {Promise<number>} Promise resolving to the number of images removed
 */
export const clearOldImages = async (olderThanDays = 7) => {
  try {
    const db = await openDB();
    const cutoffTime = new Date().getTime() - (olderThanDays * 24 * 60 * 60 * 1000);
    let removedCount = 0;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      
      // Get all keys for images older than the cutoff
      const keyRange = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(keyRange);
      
      // Process each matching record
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const deleteRequest = cursor.delete();
          deleteRequest.onsuccess = () => {
            removedCount++;
          };
          cursor.continue();
        } else {
          // No more matching records
          resolve(removedCount);
        }
      };
      
      request.onerror = (event) => {
        reject(new StorageError(`Failed to clear old images: ${event.target.error.message}`, {
          storageType: 'IndexedDB',
          originalError: event.target.error
        }));
      };
    });
    
  } catch (error) {
    // Log error but don't throw (this is a maintenance operation)
    console.error('Error clearing old images:', error);
    return 0;
  }
};

/**
 * Retrieves metadata about all stored images
 * @returns {Promise<Array>} Promise resolving to an array of image metadata
 */
export const getImageStats = async () => {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const images = request.result;
        // Return metadata only, not the blobs
        const stats = images.map(img => ({
          url: img.url,
          timestamp: img.timestamp,
          lastAccessed: img.lastAccessed || img.timestamp,
          size: img.size || (img.blob ? img.blob.size : 0)
        }));
        resolve(stats);
      };
      
      request.onerror = (event) => {
        reject(new StorageError(`Failed to get image stats: ${event.target.error.message}`, {
          storageType: 'IndexedDB',
          originalError: event.target.error
        }));
      };
    });
    
  } catch (error) {
    console.error('Error getting image stats:', error);
    return [];
  }
};

/**
 * Fetch and cache an image in one operation
 * @param {string} url - The URL of the image to fetch and cache
 * @returns {Promise<Blob>} Promise resolving to the image blob
 */
export const fetchAndCacheImage = async (url) => {
  try {
    // Try to get from cache first
    const cachedImage = await getImage(url);
    if (cachedImage) {
      return cachedImage;
    }
    
    // Not in cache, fetch it
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Store in cache (but don't block on this)
    storeImage(url, blob).catch(err => {
      console.warn('Failed to cache image:', err);
    });
    
    return blob;
  } catch (error) {
    throw new StorageError(`Failed to fetch and cache image: ${error.message}`, {
      storageType: 'IndexedDB',
      resourceUrl: url,
      originalError: error
    });
  }
};