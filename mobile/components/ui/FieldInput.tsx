import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, radii, spacing } from '../../theme';

interface FieldInputProps extends TextInputProps {
  value: string;
  onChangeText: (t: string) => void;
}

export function FieldInput({ value, onChangeText, ...rest }: FieldInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.outline}
      style={styles.input}
      allowFontScaling
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    backgroundColor: colors.surfaceLow,
    borderRadius: radii.input,
    paddingHorizontal: spacing.base,
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.onSurface,
  },
});
