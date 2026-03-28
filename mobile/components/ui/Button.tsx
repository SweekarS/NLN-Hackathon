import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing, botanicalGradient } from '../../theme';

type ButtonVariant = 'primary' | 'ghost' | 'light';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [{ opacity: disabled ? 0.55 : pressed ? 0.85 : 1 }, style]}
      >
        <LinearGradient
          colors={[...botanicalGradient.colors]}
          start={botanicalGradient.start}
          end={botanicalGradient.end}
          style={styles.primary}
        >
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        variant === 'ghost' ? styles.ghost : styles.light,
        { opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Text style={[variant === 'ghost' ? styles.ghostText : styles.lightText, textStyle]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryText: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
  ghost: {
    height: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  ghostText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
  light: {
    height: 52,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primaryLighter,
  },
  lightText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
  },
});
