import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { colors, shadow } from '../../theme';

export function Logo({ size = 100 }: { size?: number }) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={require('../../assets/images/phool-logo.png')}
        style={{ width: size, height: size, resizeMode: 'cover' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...shadow.card,
    elevation: 4,
    overflow: 'hidden',
  },
});

