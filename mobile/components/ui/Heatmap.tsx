import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';

interface HeatmapProps {
  data?: number[];
  cols?: number;
}

const defaultData = Array.from({ length: 30 }, () => Math.random());

export function Heatmap({ data = defaultData, cols = 10 }: HeatmapProps) {
  const rows = Math.ceil(data.length / cols);

  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {data.slice(rowIdx * cols, (rowIdx + 1) * cols).map((val, colIdx) => {
            const idx = rowIdx * cols + colIdx;
            const opacity = 0.15 + val * 0.85;
            return (
              <Animated.View
                key={idx}
                entering={FadeIn.delay(idx * 20).duration(300)}
                style={[styles.cell, { backgroundColor: colors.primary, opacity }]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
});
