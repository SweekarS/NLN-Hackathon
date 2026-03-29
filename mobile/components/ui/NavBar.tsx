import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, botanicalGradient, spacing } from '../../theme';

type TabDef = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const tabs: TabDef[] = [
  { name: 'index', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  {
    name: 'tasks',
    label: 'Tasks',
    icon: 'checkmark-circle',
    iconOutline: 'checkmark-circle-outline',
  },
  {
    name: 'insights',
    label: 'Insights',
    icon: 'bar-chart',
    iconOutline: 'bar-chart-outline',
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person',
    iconOutline: 'person-outline',
  },
];

interface NavBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function NavBar({ state, descriptors, navigation }: NavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs[index];
        if (!tab) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
          >
            {isFocused ? (
              <LinearGradient
                colors={[...botanicalGradient.colors]}
                start={botanicalGradient.start}
                end={botanicalGradient.end}
                style={styles.activePill}
              >
                <Ionicons name={tab.icon} size={20} color={colors.white} />
                <Text style={styles.activeLabel}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <Ionicons
                name={tab.iconOutline}
                size={22}
                color={colors.outlineVariant}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: 'rgba(246,251,247,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    gap: 6,
  },
  activeLabel: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
  },
});
