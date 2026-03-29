import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, radii, spacing, fonts } from '../../theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
}: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_H);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : SCREEN_H, {
      damping: 20,
      stiffness: 150,
    });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    maxHeight: SCREEN_H * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceMid,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.headlineBold,
    color: colors.onSurface,
    marginBottom: spacing.base,
  },
});
