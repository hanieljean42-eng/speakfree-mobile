import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export const Input = ({ 
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  containerStyle
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainer_focused,
        error && styles.inputContainer_error,
        !editable && styles.inputContainer_disabled,
        style
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.gray} 
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.input_multiline,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.black,
    marginBottom: SIZES.base,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SIZES.padding,
  },
  inputContainer_focused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputContainer_error: {
    borderColor: COLORS.error,
  },
  inputContainer_disabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...FONTS.body3,
    color: COLORS.black,
    paddingVertical: SIZES.padding,
  },
  input_multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SIZES.padding,
  },
  leftIcon: {
    marginRight: SIZES.base,
  },
  rightIcon: {
    marginLeft: SIZES.base,
    padding: SIZES.base / 2,
  },
  error: {
    ...FONTS.body4,
    color: COLORS.error,
    marginTop: SIZES.base / 2,
    marginLeft: SIZES.base,
  },
});
