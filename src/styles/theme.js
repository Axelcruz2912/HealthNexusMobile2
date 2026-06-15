export const colors = {
  // Colores principales
  primary: '#1E1A17',
  primaryLight: '#333333',
  primaryDark: '#0F0E0C',
  
  // Color secundario (acento)
  secondary: '#F05A4E',
  secondaryLight: '#FF6B5F',
  secondaryDark: '#C7291C',
  
  // Neutros
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAF8',
  gray100: '#F5F5F4',
  gray200: '#E2E8F0',
  gray300: '#CBD5E0',
  gray400: '#A0AEC0',
  gray500: '#736860',
  gray600: '#4A4540',
  gray700: '#2D2A27',
  gray800: '#1E1A17',
  gray900: '#0F0E0C',
  
  // Estados
  success: '#10B981',
  error: '#DC2626',
  errorLight: '#FFF1F0',
  errorDark: '#8C1A11',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Fondos
  background: '#F5F5F4',
  card: 'rgba(255, 255, 255, 0.97)',
  overlay: 'rgba(30, 26, 23, 0.85)',
};

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 25,
    '4xl': 32,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // ... más sombras si las necesitas
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

