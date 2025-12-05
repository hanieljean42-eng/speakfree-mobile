import apiService from './api.service';

class ReportService {
  // Create anonymous report
  async createReport(data, files = []) {
    try {
      // Create report
      const response = await apiService.post('/reports', data);
      
      const report = response.report;

      // Upload files if any
      if (files.length > 0) {
        const uploadPromises = files.map(file => 
          apiService.uploadFile(file, report.id)
        );
        
        await Promise.all(uploadPromises);
      }

      return {
        success: true,
        report,
        reportCode: report.reportCode,
        discussionCode: report.discussionCode,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Track report by code
  async trackReport(reportCode) {
    try {
      const response = await apiService.get(`/reports/track/${reportCode}`);
      
      return {
        success: true,
        report: response.report,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get reports for a school
  async getSchoolReports(schoolId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/reports/school/${schoolId}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiService.get(url);
      
      return {
        success: true,
        reports: response.reports,
        total: response.total,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get report by ID
  async getReportById(reportId) {
    try {
      const response = await apiService.get(`/reports/${reportId}`);
      
      return {
        success: true,
        report: response.report,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Update report status (school only)
  async updateReportStatus(reportId, status, message) {
    try {
      const response = await apiService.patch(`/reports/${reportId}/status`, {
        status,
        message,
      });
      
      return {
        success: true,
        report: response.report,
        message: 'Statut mis à jour avec succès',
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get report files
  async getReportFiles(reportId) {
    try {
      const response = await apiService.get(`/files/report/${reportId}`);
      
      return {
        success: true,
        files: response.files,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Get file URL
  async getFileUrl(fileId) {
    try {
      const response = await apiService.get(`/files/${fileId}/url`);
      
      return {
        success: true,
        url: response.url,
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      await apiService.delete(`/files/${fileId}`);
      
      return {
        success: true,
        message: 'Fichier supprimé avec succès',
      };
    } catch (error) {
      return apiService.handleError(error);
    }
  }

  // Save report codes locally
  async saveReportLocally(reportCode, discussionCode) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      // Get existing reports
      const existingReportsJson = await AsyncStorage.getItem('my_reports');
      const existingReports = existingReportsJson ? JSON.parse(existingReportsJson) : [];

      // Add new report
      existingReports.push({
        reportCode,
        discussionCode,
        createdAt: new Date().toISOString(),
      });

      // Save back
      await AsyncStorage.setItem('my_reports', JSON.stringify(existingReports));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la sauvegarde locale',
      };
    }
  }

  // Get locally saved reports
  async getLocalReports() {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      
      const reportsJson = await AsyncStorage.getItem('my_reports');
      const reports = reportsJson ? JSON.parse(reportsJson) : [];

      return {
        success: true,
        reports,
      };
    } catch (error) {
      return {
        success: false,
        reports: [],
      };
    }
  }
}

export default new ReportService();
