import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export const Loading = ({ 
  message = 'Chargement...', 
  size = 'large',
  fullScreen = false,
  style 
}) => {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.overlay}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  fullScreen: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...StyleSheet.create({
      shadow: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }
    }).shadow,
  },
  message: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: SIZES.padding,
    textAlign: 'center',
  },
});
