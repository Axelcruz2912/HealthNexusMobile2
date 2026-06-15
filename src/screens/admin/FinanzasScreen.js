import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../styles/theme';

export default function FinanzasScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Finanzas</Text>
        <Text style={styles.subtitle}>Módulo en desarrollo...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing[5], alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: '800', color: colors.primary, marginBottom: spacing[2] },
  subtitle: { fontSize: typography.fontSize.base, color: colors.gray500 },
});