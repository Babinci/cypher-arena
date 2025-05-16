// utils/errors.js
// Custom error classes and utilities for the application

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.code = options.code || 'APP_ERROR';
    this.recoverable = options.recoverable !== false; // Default to recoverable
    this.context = options.context || {};
    this.originalError = options.originalError;
    this.userMessage = options.userMessage || message;
    
    // Captures the stack trace in all modern environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Gets a user-friendly message that can be displayed in the UI
   */
  getUserMessage() {
    return this.userMessage;
  }

  /**
   * Gets technical details for logging
   */
  getTechnicalDetails() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

/**
 * API request error
 */
export class ApiError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'API_ERROR',
      userMessage: options.userMessage || 'Failed to communicate with the server',
      ...options
    });
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.method = options.method;
    this.params = options.params;
  }
}

/**
 * Network connection error
 */
export class NetworkError extends ApiError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'NETWORK_ERROR',
      userMessage: options.userMessage || 'Network connection error. Please check your internet connection.',
      ...options
    });
  }
}

/**
 * Validation error for user input
 */
export class ValidationError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'VALIDATION_ERROR',
      userMessage: options.userMessage || 'Invalid input data',
      ...options
    });
    this.field = options.field;
    this.value = options.value;
  }
}

/**
 * Storage error for IndexedDB and localStorage
 */
export class StorageError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'STORAGE_ERROR',
      userMessage: options.userMessage || 'Storage error. Some data may not be saved.',
      ...options
    });
    this.storageType = options.storageType || 'unknown';
  }
}

/**
 * Resource error for media loading (images, audio, etc.)
 */
export class ResourceError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'RESOURCE_ERROR',
      userMessage: options.userMessage || 'Failed to load resource',
      ...options
    });
    this.resourceType = options.resourceType;
    this.resourceUrl = options.resourceUrl;
  }
}

/**
 * Quota exceeded error for storage limits
 */
export class QuotaExceededError extends StorageError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'QUOTA_EXCEEDED',
      userMessage: options.userMessage || 'Storage limit exceeded. Try clearing some data.',
      ...options
    });
  }
}

/**
 * Browser support error
 */
export class BrowserSupportError extends AppError {
  constructor(message, options = {}) {
    super(message, {
      code: options.code || 'BROWSER_SUPPORT_ERROR',
      userMessage: options.userMessage || 'Your browser does not support some features required by this application.',
      ...options
    });
    this.feature = options.feature;
  }
}

/**
 * Helper to wrap fetch API with error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Resolves with parsed JSON or rejects with a custom error
 */
export const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new ApiError(`API Error: ${response.status} ${response.statusText}`, {
        status: response.status,
        endpoint: url,
        method: options.method || 'GET',
        params: options.body,
        userMessage: getMessageForStatusCode(response.status)
      });
    }
    
    // Check content type to handle different response types
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('image/')) {
      return await response.blob();
    } else {
      return await response.text();
    }
  } catch (error) {
    // Already our custom error
    if (error instanceof AppError) {
      throw error;
    }
    
    // Network error (e.g., offline, DNS failure)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new NetworkError('Network request failed', {
        endpoint: url,
        method: options.method || 'GET',
        originalError: error
      });
    }
    
    // Generic API error
    throw new ApiError('API request failed', {
      endpoint: url,
      method: options.method || 'GET',
      params: options.body,
      originalError: error
    });
  }
};

/**
 * Get a user-friendly message for a HTTP status code
 */
function getMessageForStatusCode(status) {
  switch (status) {
    case 400:
      return 'The server could not process the request due to invalid data.';
    case 401:
      return 'Authentication is required to access this resource.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource could not be found.';
    case 408:
      return 'The request timed out. Please try again.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'The server encountered an error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return `Server error (${status}). Please try again or contact support.`;
  }
}

/**
 * Check if IndexedDB is supported and available
 */
export const isIndexedDBSupported = () => {
  return 'indexedDB' in window && window.indexedDB !== null;
};

/**
 * Check if localStorage is supported and available
 */
export const isLocalStorageSupported = () => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};