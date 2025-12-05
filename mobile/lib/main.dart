import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/routes.dart';
import 'providers/school_provider.dart';
import 'providers/report_provider.dart';
import 'providers/auth_provider.dart';
import 'services/api_service.dart';
import 'services/websocket_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SpeakFreeApp());
}

class SpeakFreeApp extends StatelessWidget {
  const SpeakFreeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>(
          create: (_) => ApiService(),
        ),
        Provider<WebSocketService>(
          create: (_) => WebSocketService(),
        ),
        ChangeNotifierProvider<AuthProvider>(
          create: (context) => AuthProvider(
            apiService: context.read<ApiService>(),
          ),
        ),
        ChangeNotifierProvider<SchoolProvider>(
          create: (context) => SchoolProvider(
            apiService: context.read<ApiService>(),
          ),
        ),
        ChangeNotifierProvider<ReportProvider>(
          create: (context) => ReportProvider(
            apiService: context.read<ApiService>(),
            wsService: context.read<WebSocketService>(),
          ),
        ),
      ],
      child: MaterialApp(
        title: 'SpeakFree',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        initialRoute: AppRoutes.splash,
        onGenerateRoute: AppRoutes.generateRoute,
      ),
    );
  }
}
