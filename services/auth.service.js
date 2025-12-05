import apiService from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // School login
  async loginSchool(email, password) {
    try {
      const response = await apiService.post('/auth/school/login', {
        email,
        password,
      });

      // Save tokens and user data
      await AsyncStorage.setItem('access_token', response.accessToken);
      await AsyncStorage.setItem('refresh_token', response.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.school));
      await AsyncStorage.setItem('user_type', 'school');

      return {
        success: true,
        user: response.school,
        userType: 'school',
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // School registration
  async registerSchool(data) {
    try {
      const response = await apiService.post('/auth/school/register', data);

      return {
        success: true,
        message: 'Inscription réussie. Votre compte est en attente de validation.',
        school: response.school,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'user',
        'user_type',
      ]);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la déconnexion',
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      const userType = await AsyncStorage.getItem('user_type');
      
      if (userString) {
        return {
          user: JSON.parse(userString),
          userType,
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post('/auth/refresh', {
        refreshToken,
      });

      await AsyncStorage.setItem('access_token', response.accessToken);
      await AsyncStorage.setItem('refresh_token', response.refreshToken);

      return {
        success: true,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', {
        email,
      });

      return {
        success: true,
        message: 'Un email de réinitialisation a été envoyé à votre adresse.',
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        newPassword,
      });

      return {
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès.',
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }
}

export default new AuthService();
