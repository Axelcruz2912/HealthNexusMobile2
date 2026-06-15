import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminMainDashboard({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const stats = [
    {
      title: 'OCUPACIÓN HOSPITALARIA',
      value: '78%',
      color: colors.secondary,
      subtitle: '5% vs ayer',
      subtitleColor: colors.secondary,
      icon: <Ionicons name="trending-up" size={16} color={colors.success} />,
      iconBg: '#FEF3F2',
    },
    {
      title: 'URGENCIAS CRÍTICAS',
      value: '4',
      color: '#FF8C42',
      subtitle: 'Triage Rojo activo',
      subtitleColor: colors.secondaryDark,
      icon: <MaterialIcons name="emergency" size={16} color={colors.secondaryDark} />,
      iconBg: '#FEF3F2',
    },
    {
      title: 'STOCK FARMACIA',
      value: '92%',
      color: '#2D9E6A',
      subtitle: '3 medicamentos bajo',
      subtitleColor: '#FF8C42',
      icon: <FontAwesome5 name="exclamation-triangle" size={14} color="#FF8C42" />,
      iconBg: '#FFFBEB',
    },
    {
      title: 'ANOMALÍAS IA HOY',
      value: '0',
      color: colors.primary,
      subtitle: 'Sin actividad sospechosa',
      subtitleColor: '#2D9E6A',
      icon: <MaterialCommunityIcons name="shield-check" size={16} color="#2D9E6A" />,
      iconBg: '#ECFDF5',
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
    >
      {/* Topbar con usuario */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.topbarTitle}>Dashboard Ejecutivo Inteligente</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.userBadge}>
            <Text style={styles.userRole}>{user?.role}</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.content}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
              <View style={styles.statFooter}>
                <View style={[styles.iconContainer, { backgroundColor: stat.iconBg }]}>
                  {stat.icon}
                </View>
                <Text style={[styles.statSubtitle, { color: stat.subtitleColor }]}>
                  {stat.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Intelligence & Activity */}
        <View style={styles.bottomContainer}>
          <View style={styles.intelligenceCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="brain" size={24} color={colors.secondary} />
              <Text style={styles.cardTitle}>Centro de Inteligencia Hospitalaria</Text>
            </View>
            <View style={styles.intelligenceContent}>
              <View style={styles.aiIconContainer}>
                <MaterialCommunityIcons name="robot-industrial" size={48} color={colors.secondary} />
              </View>
              <Text style={styles.intelligenceText}>
                Motor de Analítica Avanzada e IA en tiempo real.
              </Text>
              <Text style={styles.intelligenceSubtext}>
                Conectando con FastAPI y PySpark...
              </Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={22} color={colors.secondary} />
              <Text style={styles.cardTitle}>Actividad Reciente</Text>
            </View>
            <View style={styles.timeline}>
              {[
                { title: 'Dr. Pérez', description: 'Inició sesión - Médico A', icon: 'user-md' },
                { title: 'Farmacia Central', description: 'Stock actualizado', icon: 'pharmacy' },
                { title: 'Alerta Urgencias', description: 'Triage Rojo ingresado', icon: 'warning', color: colors.secondaryDark },
              ].map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={[styles.timelineDot, item.color && { backgroundColor: item.color }]} />
                  <View style={styles.timelineContent}>
                    <View style={styles.activityHeader}>
                      <FontAwesome5 name={item.icon} size={14} color={item.color || colors.gray600} />
                      <Text style={[styles.activityTitle, item.color && { color: item.color }]}>
                        {item.title}
                      </Text>
                    </View>
                    <Text style={styles.activityDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topbar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  topbarTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  userName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.gray700,
  },
  userBadge: {
    backgroundColor: `linear-gradient(135deg, ${colors.secondary}, #FF8C42)`,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  userRole: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.white,
  },
  content: {
    padding: spacing[5],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  statCard: {
    backgroundColor: colors.white,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderTopWidth: 4,
    width: '48%',
    ...shadows.sm,
  },
  statTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing[2],
  },
  statValueRow: {
    marginBottom: spacing[2],
  },
  statValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '800',
    color: colors.primary,
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSubtitle: {
    fontSize: typography.fontSize.xs,
    flex: 1,
  },
  bottomContainer: {
    gap: spacing[4],
  },
  intelligenceCard: {
    backgroundColor: colors.white,
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  activityCard: {
    backgroundColor: colors.white,
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  intelligenceContent: {
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.base,
  },
  aiIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  intelligenceText: {
    fontSize: typography.fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing[2],
    fontWeight: '500',
  },
  intelligenceSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    textAlign: 'center',
  },
  timeline: {
    borderLeftWidth: 2,
    borderLeftColor: colors.gray200,
    paddingLeft: spacing[4],
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -spacing[5] - 1,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  timelineContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  activityTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.gray700,
  },
  activityDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    marginLeft: spacing[6],
  },
});