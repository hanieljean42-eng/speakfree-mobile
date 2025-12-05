class AppConfig {
  // API Configuration
  static const String apiBaseUrl = 'http://localhost:3000/api';
  static const String wsUrl = 'ws://localhost:3000';
  
  // Environment
  static const bool isProduction = false;
  static const bool enableLogging = true;
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // Upload
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  
  // Storage Keys
  static const String storageKeyToken = 'auth_token';
  static const String storageKeyRefreshToken = 'refresh_token';
  static const String storageKeyUser = 'user_data';
  static const String storageKeyReportCodes = 'report_codes';
  
  // Support
  static const String supportEmail = 'support@speakfree.app';
  static const String privacyPolicyUrl = 'https://speakfree.app/privacy';
  static const String termsUrl = 'https://speakfree.app/terms';
}
