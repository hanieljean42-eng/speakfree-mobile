import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';
const TIMEOUT = 30000;

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // Try to refresh token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Save new tokens
            await AsyncStorage.setItem('access_token', accessToken);
            await AsyncStorage.setItem('refresh_token', newRefreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
            // You can emit an event here to redirect to login
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic methods
  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url, data, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch(url, data, config = {}) {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // File upload
  async uploadFile(file, reportId, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `photo_${Date.now()}.jpg`,
    });

    const response = await this.client.post(`/files/upload/${reportId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Error handling helper
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'Une erreur est survenue';
      return {
        success: false,
        message,
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'Une erreur inattendue est survenue',
      };
    }
  }
}

export default new ApiService();
