export const colors = {
  primary: '#096444',
  primaryMid: '#2E7D5B',
  primaryLight: '#BFEECC',
  primaryLighter: '#E8F7EF',
  primaryFixed: '#A4F3CA',
  surface: '#F6FBF7',
  surfaceLow: '#F0F5F1',
  surfaceMid: '#E4E9E5',
  surfaceHigh: '#DFE4E0',
  onSurface: '#171D1B',
  onSurfaceVariant: '#3F4943',
  outline: '#6F7A72',
  outlineVariant: '#BEC9C1',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  white: '#FFFFFF',
} as const;

export const fonts = {
  headlineBold: 'PlusJakartaSans-Bold',
  headlineExtraBold: 'PlusJakartaSans-ExtraBold',
  bodyRegular: 'Manrope-Regular',
  bodyMedium: 'Manrope-Medium',
  bodySemiBold: 'Manrope-SemiBold',
  bodyBold: 'Manrope-Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const radii = {
  card: 24,
  button: 9999,
  chip: 9999,
  input: 16,
  sm: 12,
  md: 16,
  lg: 20,
} as const;

export const shadow = {
  card: {
    shadowColor: '#171D1B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;

export const botanicalGradient = {
  colors: ['#096444', '#2E7D5B'] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
