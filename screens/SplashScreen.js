import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { authService } from '../services';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Simulate splash screen delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user is authenticated
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const userData = await authService.getCurrentUser();
        
        if (userData?.userType === 'school') {
          navigation.replace('SchoolDashboard');
        } else {
          navigation.replace('Home');
        }
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>SpeakFree</Text>
          <Text style={styles.subtitle}>Votre voix compte</Text>
        </View>

        <ActivityIndicator 
          size="large" 
          color={COLORS.primary} 
          style={styles.loader}
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 4,
  },
  logo: {
    fontSize: 80,
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.white,
    opacity: 0.8,
  },
  loader: {
    marginTop: SIZES.padding * 3,
  },
  version: {
    ...FONTS.body4,
    color: COLORS.white,
    opacity: 0.6,
    position: 'absolute',
    bottom: SIZES.padding * 2,
  },
});
