import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export const Badge = ({ 
  label, 
  variant = 'default',
  size = 'medium',
  style 
}) => {
  return (
    <View style={[
      styles.badge,
      styles[`badge_${variant}`],
      styles[`badge_${size}`],
      style
    ]}>
      <Text style={[
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`]
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: SIZES.radius / 2,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    alignSelf: 'flex-start',
  },

  // Variants
  badge_default: {
    backgroundColor: COLORS.gray + '30',
  },
  badge_pending: {
    backgroundColor: COLORS.warning + '30',
  },
  badge_in_progress: {
    backgroundColor: COLORS.primary + '30',
  },
  badge_resolved: {
    backgroundColor: COLORS.success + '30',
  },
  badge_closed: {
    backgroundColor: COLORS.gray + '30',
  },
  badge_active: {
    backgroundColor: COLORS.success + '30',
  },
  badge_inactive: {
    backgroundColor: COLORS.error + '30',
  },

  // Sizes
  badge_small: {
    paddingHorizontal: SIZES.base / 2,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  badge_large: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
  },

  // Text styles
  text: {
    ...FONTS.body4,
    fontWeight: '600',
  },
  text_default: {
    color: COLORS.gray,
  },
  text_pending: {
    color: COLORS.warning,
  },
  text_in_progress: {
    color: COLORS.primary,
  },
  text_resolved: {
    color: COLORS.success,
  },
  text_closed: {
    color: COLORS.gray,
  },
  text_active: {
    color: COLORS.success,
  },
  text_inactive: {
    color: COLORS.error,
  },
  text_small: {
    fontSize: 10,
  },
  text_medium: {
    fontSize: SIZES.body4,
  },
  text_large: {
    fontSize: SIZES.body3,
  },
});
