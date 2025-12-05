import apiService from './api.service';

class SchoolService {
  // Get all schools
  async getAllSchools(status) {
    try {
      const url = status ? `/schools?status=${status}` : '/schools';
      const response = await apiService.get(url);
      
      return {
        success: true,
        schools: response.schools,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get school by ID
  async getSchoolById(schoolId) {
    try {
      const response = await apiService.get(`/schools/${schoolId}`);
      
      return {
        success: true,
        school: response.school,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get school statistics
  async getSchoolStats(schoolId) {
    try {
      const response = await apiService.get(`/stats/schools/${schoolId}`);
      
      return {
        success: true,
        stats: response.stats,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Search schools
  async searchSchools(query) {
    try {
      const response = await apiService.get(`/schools?search=${encodeURIComponent(query)}`);
      
      return {
        success: true,
        schools: response.schools,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Save favorite schools locally
  async saveFavorites(schoolIds) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('favorite_schools', JSON.stringify(schoolIds));
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde des favoris',
      };
    }
  }

  // Get favorite schools
  async getFavorites() {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const favoritesJson = await AsyncStorage.getItem('favorite_schools');
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      
      return {
        success: true,
        favorites,
      };
    } catch (error) {
      return {
        success: false,
        favorites: [],
      };
    }
  }

  // Toggle favorite
  async toggleFavorite(schoolId) {
    try {
      const result = await this.getFavorites();
      let favorites = result.favorites || [];
      
      if (favorites.includes(schoolId)) {
        favorites = favorites.filter(id => id !== schoolId);
      } else {
        favorites.push(schoolId);
      }
      
      await this.saveFavorites(favorites);
      
      return {
        success: true,
        isFavorite: favorites.includes(schoolId),
        favorites,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la modification du favori',
      };
    }
  }
}

export default new SchoolService();
