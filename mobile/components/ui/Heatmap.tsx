import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';

interface HeatmapProps {
  data?: number[];
  cols?: number;
}

const defaultData = Array.from({ length: 31 }, () => 0);

export function Heatmap({ data = defaultData, cols = 7 }: HeatmapProps) {
  const rows = Math.ceil(data.length / cols);

  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: cols }).map((_, colIdx) => {
            const idx = rowIdx * cols + colIdx;
            
            if (idx >= data.length) {
              return <View key={`empty-${idx}`} style={[styles.cell, { opacity: 0 }]} />;
            }
            
            const val = data[idx];
            const hasActivity = val > 0;
            const opacity = hasActivity ? 0.3 + val * 0.7 : 1;
            const backgroundColor = hasActivity ? colors.primary : colors.surfaceHigh;
            
            return (
              <Animated.View
                key={idx}
                entering={FadeIn.delay(idx * 20).duration(300)}
                style={[styles.cell, { backgroundColor, opacity }]}
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
