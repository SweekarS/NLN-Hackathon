import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../theme';

const COLS = 7;
const TOTAL = 30;

/** Intensity 0–3 from `buildMindfulnessFlow30Day`. */
interface HeatmapProps {
  /** Array of intensity values; index 0 = oldest day, last = today. */
  intensities: number[];
  cols?: number;
  /** Total days to display. Defaults to 30 if not specified. */
  days?: number;
}

const LEVEL_BG: readonly string[] = [
  colors.surfaceHigh,
  colors.primaryLighter,
  colors.primaryMid,
  colors.primary,
];

export function Heatmap({
  intensities,
  cols = COLS,
  days = TOTAL,
}: HeatmapProps) {
  const data = useMemo(() => {
    const src =
      intensities.length === days ? intensities : padOrTrim(intensities, days);
    return src.map(
      (v) => Math.max(0, Math.min(3, Math.round(v))) as 0 | 1 | 2 | 3,
    );
  }, [intensities, days]);

  const rows = Math.ceil(days / cols);

  return (
    <View style={styles.wrap}>
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>LESS</Text>
        {([0, 1, 2, 3] as const).map((level) => (
          <View
            key={level}
            style={[styles.legendSwatch, { backgroundColor: LEVEL_BG[level] }]}
          />
        ))}
        <Text style={styles.legendLabel}>MORE</Text>
      </View>

      <View style={styles.container}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {Array.from({ length: cols }).map((__, colIdx) => {
              const idx = rowIdx * cols + colIdx;
              if (idx >= days) {
                return (
                  <View
                    key={`pad-${rowIdx}-${colIdx}`}
                    style={styles.cellSpacer}
                  />
                );
              }
              const level = data[idx];
              const backgroundColor = LEVEL_BG[level];
              return (
                <View
                  key={idx}
                  style={[styles.cell, { backgroundColor }]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function padOrTrim(arr: number[], len: number): number[] {
  if (arr.length >= len) return arr.slice(arr.length - len);
  const padCount = len - arr.length;
  return [...Array(padCount).fill(0), ...arr];
}
const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    color: colors.onSurfaceVariant,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    minWidth: 0,
  },
  cellSpacer: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 0,
    opacity: 0,
  },
});
