import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export const Card = ({ 
  children, 
  onPress, 
  style,
  variant = 'default',
  elevated = true 
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[
        styles.card,
        elevated && styles.card_elevated,
        styles[`card_${variant}`],
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  card_elevated: {
    ...SHADOWS.medium,
  },
  card_default: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  card_primary: {
    backgroundColor: COLORS.primary,
  },
  card_success: {
    backgroundColor: COLORS.success + '20',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  card_warning: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  card_error: {
    backgroundColor: COLORS.error + '20',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});
