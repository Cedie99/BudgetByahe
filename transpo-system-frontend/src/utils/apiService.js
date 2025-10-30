import config from '../config/api.config';

/**
 * API Utility Helper
 * Provides methods for making API requests with proper error handling
 */

class ApiService {
  constructor() {
    this.baseURL = config.apiUrl;
  }

  /**
   * Get full API endpoint URL
   * @param {string} endpoint - The endpoint path
   * @returns {string} - Full URL
   */
  getUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Get default headers
   * @returns {object} - Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('firebase_id_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @returns {Promise} - Response data
   */
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'GET',
        headers: this.getHeaders(),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise} - Response data
   */
  async post(endpoint, data, options = {}) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {object} options - Additional fetch options
   * @returns {Promise} - Response data
   */
  async put(endpoint, data, options = {}) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional fetch options
   * @returns {Promise} - Response data
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(this.getUrl(endpoint), {
        method: 'DELETE',
        headers: this.getHeaders(),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @returns {Promise} - Response data
   */
  async upload(endpoint, formData) {
    try {
      const headers = {};
      const token = localStorage.getItem('firebase_id_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.getUrl(endpoint), {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API response
   * @param {Response} response - Fetch response object
   * @returns {Promise} - Parsed response data
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @throws {Error} - Formatted error
   */
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
