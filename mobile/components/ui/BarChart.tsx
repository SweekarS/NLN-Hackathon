import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, fonts, spacing } from '../../theme';

interface BarChartProps {
  data?: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
}

const defaultData = [
  { label: 'M', value: 100 },
  { label: 'T', value: 80 },
  { label: 'W', value: 100 },
  { label: 'T', value: 60 },
  { label: 'F', value: 100 },
  { label: 'S', value: 40 },
  { label: 'S', value: 90 },
];

export function BarChart({
  data = defaultData,
  maxValue = 100,
  height = 120,
}: BarChartProps) {
  return (
    <View style={[styles.container, { height }]}>
      {data.map((item, i) => {
        const barH = (item.value / maxValue) * (height - 20);
        return (
          <View key={i} style={styles.col}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Animated.View
                entering={FadeIn.delay(i * 60).duration(400)}
                style={[
                  styles.bar,
                  {
                    height: barH,
                    backgroundColor:
                      item.value >= 100 ? colors.primary : colors.primaryLight,
                  },
                ]}
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodyMedium,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
});
