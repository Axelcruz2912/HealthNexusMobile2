import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from './theme';

export const globalStyles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  
  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    ...shadows.lg,
  },
  
  // Tipografía
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.gray500,
    textTransform: 'uppercase',
    marginBottom: spacing[2],
  },
  
  // Inputs
  input: {
    width: '100%',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    backgroundColor: colors.gray50,
    color: colors.gray800,
  },
  
  inputFocused: {
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 1,
  },
  
  inputError: {
    borderColor: colors.error,
  },
  
  // Botones
  button: {
    width: '100%',
    paddingVertical: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '700',
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  
  buttonOutlineText: {
    color: colors.primary,
  },
  
  // Links
  link: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
  
  // Alertas y errores
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: spacing[4],
    borderRadius: borderRadius.base,
    marginBottom: spacing[6],
    borderLeftWidth: 4,
    borderLeftColor: colors.secondaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  
  errorText: {
    color: colors.errorDark,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  
  successContainer: {
    backgroundColor: '#ECFDF5',
    padding: spacing[4],
    borderRadius: borderRadius.base,
    marginBottom: spacing[6],
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  successText: {
    color: '#065F46',
    fontSize: typography.fontSize.sm,
  },
  
  // Layout
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Padding y márgenes
  p4: { padding: spacing[4] },
  p6: { padding: spacing[6] },
  mt2: { marginTop: spacing[2] },
  mt4: { marginTop: spacing[4] },
  mb4: { marginBottom: spacing[4] },
  mb6: { marginBottom: spacing[6] },
  gap2: { gap: spacing[2] },
  gap4: { gap: spacing[4] },
});