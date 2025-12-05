import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle 
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.primary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  button_disabled: {
    opacity: 0.5,
  },

  // Sizes
  button_small: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
  },
  button_medium: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
  },
  button_large: {
    paddingVertical: SIZES.padding * 1.5,
    paddingHorizontal: SIZES.padding * 3,
  },

  // Text styles
  text: {
    ...FONTS.h3,
    fontWeight: '600',
  },
  text_primary: {
    color: COLORS.white,
  },
  text_secondary: {
    color: COLORS.primary,
  },
  text_outline: {
    color: COLORS.gray,
  },
  text_small: {
    fontSize: SIZES.body4,
  },
  text_medium: {
    fontSize: SIZES.body3,
  },
  text_large: {
    fontSize: SIZES.h3,
  },
});
