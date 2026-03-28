import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';

interface FieldLabelProps {
  label: string;
}

export function FieldLabel({ label }: FieldLabelProps) {
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
});
