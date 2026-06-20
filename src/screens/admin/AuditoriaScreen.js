import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    FlatList,
    SectionList
} from 'react-native';
import { getAuditoriaDashboard } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function AuditoriaScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline');

    const tabs = [
        { key: 'timeline', label: 'Timeline', icon: 'clock' },
        { key: 'dashboard', label: 'Dashboard', icon: 'chart-bar' },
        { key: 'accesos', label: 'Accesos', icon: 'door-open' },
        { key: 'medica', label: 'Aud. Médica', icon: 'stethoscope' },
        { key: 'hospital', label: 'Aud. Hospital', icon: 'hospital' },
        { key: 'finanzas', label: 'Aud. Finanzas', icon: 'coins' },
        { key: 'farmacia', label: 'Aud. Farmacia', icon: 'pills' },
        { key: 'riesgo', label: 'Score Riesgo', icon: 'gauge-high' },
    ];

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getAuditoriaDashboard();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar la auditoría');
            }
        } catch (error) {
            console.error('Error loading auditoria:', error);
            Alert.alert('Error', 'No se pudo cargar la auditoría');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (value) => {
        if (!value) return '$0';
        return '$' + Number(value).toLocaleString('es-MX');
    };

    const getRiskBadge = (level) => {
        const levels = {
            'bajo': { label: 'Bajo', color: '#065F46', bg: '#D1FAE5' },
            'medio': { label: 'Medio', color: '#92400E', bg: '#FEF3C7' },
            'alto': { label: 'Alto', color: '#C2410C', bg: '#FFEDD5' },
            'critico': { label: 'Crítico', color: '#991B1B', bg: '#FEE2E2' },
        };
        return levels[level] || levels['bajo'];
    };

    const renderKPI = ({ item }) => (
        <View style={[styles.kpiCard, { borderLeftColor: item.color }]}>
            <FontAwesome5 name={item.icon} size={16} color={item.color} />
            <Text style={[styles.kpiValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.kpiLabel}>{item.label}</Text>
        </View>
    );

    const renderAlert = ({ item }) => (
        <View style={[styles.alertCard, { borderLeftColor: item.risk_level === 'critico' ? '#DC2626' : '#EA580C' }]}>
            <Text style={styles.alertTime}>{formatDate(item.created_at)}</Text>
            <Text style={styles.alertAction}>{item.action}</Text>
            <Text style={styles.alertUser}>{item.user_name} - {item.module}</Text>
            {item.risk_reason && (
                <Text style={styles.alertReason}>{item.risk_reason}</Text>
            )}
        </View>
    );

    const renderTimelineItem = ({ item }) => {
        const risk = getRiskBadge(item.risk_level);
        const isSuspicious = item.is_suspicious;
        
        return (
            <View style={[styles.timelineItem, isSuspicious && styles.timelineItemSuspicious]}>
                <Text style={styles.timelineTime}>{formatDate(item.created_at)}</Text>
                <Text style={styles.timelineUser}>{item.user_name}</Text>
                <Text style={[styles.timelineAction, 
                    item.action?.toUpperCase().includes('LOGIN') && styles.actionLogin,
                    item.action?.toUpperCase().includes('FALLIDO') && styles.actionFailed
                ]}>{item.action}</Text>
                <View style={[styles.timelineBadge, { backgroundColor: risk.bg }]}>
                    <Text style={[styles.timelineBadgeText, { color: risk.color }]}>{risk.label}</Text>
                </View>
                <Text style={styles.timelineModule}>{item.module}</Text>
                <Text style={styles.timelineDetails} numberOfLines={2}>{item.details}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando auditoría...</Text>
            </View>
        );
    }

    const stats = data?.stats || {};
    const alerts = data?.alerts || [];
    const hourlyData = data?.hourlyData || {};
    const topActions = data?.topActions || [];
    const byModule = data?.byModule || [];
    const topUsers = data?.topUsers || [];
    const accesos = data?.accesos || [];
    const loginExitoso = data?.loginExitoso || 0;
    const loginFallido = data?.loginFallido || 0;
    const bloqueos = data?.bloqueos || 0;
    const medicaLogs = data?.medicaLogs || [];
    const recetas = data?.recetas || 0;
    const cirugias = data?.cirugias || 0;
    const defunciones = data?.defunciones || 0;
    const hospLogs = data?.hospLogs || [];
    const ingresos = data?.ingresos || 0;
    const altas = data?.altas || 0;
    const traslados = data?.traslados || 0;
    const finLogs = data?.finLogs || [];
    const pharmaLogs = data?.pharmaLogs || [];
    const controlados = data?.controlados || [];
    const riskUsers = data?.riskUsers || [];
    const anomalias = data?.anomalias || [];
    const riskDist = data?.riskDist || {};
    const riskAreas = data?.riskAreas || [];
    const negligencia = data?.negligencia || [];

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            {/* KPIs */}
            <View style={styles.kpiGrid}>
                <View style={[styles.kpiCard, { borderLeftColor: '#E85D3A' }]}>
                    <FontAwesome5 name="database" size={16} color="#E85D3A" />
                    <Text style={[styles.kpiValue, { color: '#E85D3A' }]}>{stats.total?.toLocaleString() || 0}</Text>
                    <Text style={styles.kpiLabel}>Total Eventos</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#FB923C' }]}>
                    <FontAwesome5 name="calendar-day" size={16} color="#FB923C" />
                    <Text style={[styles.kpiValue, { color: '#FB923C' }]}>{stats.today?.toLocaleString() || 0}</Text>
                    <Text style={styles.kpiLabel}>Hoy</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#DC2626' }]}>
                    <FontAwesome5 name="exclamation-triangle" size={16} color="#DC2626" />
                    <Text style={[styles.kpiValue, { color: '#DC2626' }]}>{stats.suspicious?.toLocaleString() || 0}</Text>
                    <Text style={styles.kpiLabel}>Sospechosos</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#991B1B' }]}>
                    <FontAwesome5 name="skull" size={16} color="#991B1B" />
                    <Text style={[styles.kpiValue, { color: '#991B1B' }]}>{stats.critical?.toLocaleString() || 0}</Text>
                    <Text style={styles.kpiLabel}>Críticos</Text>
                </View>
            </View>

            {/* Alertas */}
            {alerts.length > 0 && (
                <View style={styles.alertsContainer}>
                    <Text style={styles.sectionTitle}>Alertas Recientes</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {alerts.map((item, index) => (
                            <View key={index} style={[styles.alertCard, { borderLeftColor: item.risk_level === 'critico' ? '#DC2626' : '#EA580C' }]}>
                                <Text style={styles.alertTime}>{formatDate(item.created_at)}</Text>
                                <Text style={styles.alertAction}>{item.action}</Text>
                                <Text style={styles.alertUser}>{item.user_name} - {item.module}</Text>
                                {item.risk_reason && (
                                    <Text style={styles.alertReason}>{item.risk_reason}</Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Tabs */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <FontAwesome5 name={tab.icon} size={12} color={activeTab === tab.key ? colors.secondary : colors.gray500} />
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Timeline */}
            {activeTab === 'timeline' && (
                <View style={styles.tabContent}>
                    {data?.logs?.slice(0, 20).map((item, index) => (
                        <View key={index} style={[styles.timelineItem, item.is_suspicious && styles.timelineItemSuspicious]}>
                            <Text style={styles.timelineTime}>{formatDate(item.created_at)}</Text>
                            <Text style={styles.timelineUser}>{item.user_name}</Text>
                            <Text style={[styles.timelineAction]}>{item.action}</Text>
                            <Text style={styles.timelineModule}>{item.module}</Text>
                            <Text style={styles.timelineDetails} numberOfLines={2}>{item.details}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
                <View style={styles.tabContent}>
                    <View style={styles.dashboardGrid}>
                        <View style={styles.dashboardCard}>
                            <Text style={styles.dashboardTitle}>Actividad 24h</Text>
                            <View style={styles.hourlyChart}>
                                {Object.keys(hourlyData).map((hour) => (
                                    <View key={hour} style={styles.hourBar}>
                                        <View style={[styles.hourBarFill, { height: `${(hourlyData[hour] / Math.max(...Object.values(hourlyData), 1)) * 100}%` }]} />
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.dashboardCard}>
                            <Text style={styles.dashboardTitle}>Top Acciones (7 días)</Text>
                            {topActions.map((item, index) => (
                                <View key={index} style={styles.dashboardRow}>
                                    <Text style={styles.dashboardRowLabel}>{item.action}</Text>
                                    <Text style={styles.dashboardRowValue}>{item.total}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Accesos */}
            {activeTab === 'accesos' && (
                <View style={styles.tabContent}>
                    <View style={styles.accessStats}>
                        <View style={styles.accessStat}>
                            <Text style={[styles.accessStatValue, { color: '#059669' }]}>{loginExitoso}</Text>
                            <Text style={styles.accessStatLabel}>Login OK (7d)</Text>
                        </View>
                        <View style={styles.accessStat}>
                            <Text style={[styles.accessStatValue, { color: '#DC2626' }]}>{loginFallido}</Text>
                            <Text style={styles.accessStatLabel}>Login Fallido (7d)</Text>
                        </View>
                        <View style={styles.accessStat}>
                            <Text style={[styles.accessStatValue, { color: '#991B1B' }]}>{bloqueos}</Text>
                            <Text style={styles.accessStatLabel}>Bloqueos (7d)</Text>
                        </View>
                    </View>
                    {accesos.map((item, index) => (
                        <View key={index} style={styles.accessItem}>
                            <Text style={styles.accessTime}>{formatDate(item.created_at)}</Text>
                            <Text style={styles.accessUser}>{item.user_name}</Text>
                            <View style={[styles.accessBadge, 
                                item.action === 'LOGIN' && styles.accessBadgeSuccess,
                                item.action === 'LOGOUT' && styles.accessBadgeGray,
                                (item.action === 'LOGIN FALLIDO' || item.action === 'Sesion Bloqueada') && styles.accessBadgeDanger
                            ]}>
                                <Text style={styles.accessBadgeText}>{item.action}</Text>
                            </View>
                            <Text style={styles.accessIP}>{item.ip_address}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Auditoría Médica */}
            {activeTab === 'medica' && (
                <View style={styles.tabContent}>
                    <View style={styles.medStats}>
                        <View style={styles.medStat}>
                            <Text style={[styles.medStatValue, { color: '#E85D3A' }]}>{recetas}</Text>
                            <Text style={styles.medStatLabel}>Recetas (7d)</Text>
                        </View>
                        <View style={styles.medStat}>
                            <Text style={[styles.medStatValue, { color: '#DC2626' }]}>{cirugias}</Text>
                            <Text style={styles.medStatLabel}>Cirugías (7d)</Text>
                        </View>
                        <View style={styles.medStat}>
                            <Text style={[styles.medStatValue, { color: '#1E1A17' }]}>{defunciones}</Text>
                            <Text style={styles.medStatLabel}>Defunciones</Text>
                        </View>
                    </View>
                    {medicaLogs.map((item, index) => (
                        <View key={index} style={styles.medItem}>
                            <Text style={styles.medTime}>{formatDate(item.created_at)}</Text>
                            <Text style={styles.medUser}>{item.user_name}</Text>
                            <Text style={styles.medAction}>{item.action}</Text>
                            <Text style={styles.medPatient}>{item.patient_name || '-'}</Text>
                            <Text style={styles.medDetails} numberOfLines={1}>{item.details}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Auditoría Hospitalización */}
            {activeTab === 'hospital' && (
                <View style={styles.tabContent}>
                    <View style={styles.hospStats}>
                        <View style={styles.hospStat}>
                            <Text style={[styles.hospStatValue, { color: '#E85D3A' }]}>{ingresos}</Text>
                            <Text style={styles.hospStatLabel}>Ingresos (7d)</Text>
                        </View>
                        <View style={styles.hospStat}>
                            <Text style={[styles.hospStatValue, { color: '#059669' }]}>{altas}</Text>
                            <Text style={styles.hospStatLabel}>Altas (7d)</Text>
                        </View>
                        <View style={styles.hospStat}>
                            <Text style={[styles.hospStatValue, { color: '#F59E0B' }]}>{traslados}</Text>
                            <Text style={styles.hospStatLabel}>Traslados (7d)</Text>
                        </View>
                    </View>
                    {hospLogs.map((item, index) => (
                        <View key={index} style={styles.hospItem}>
                            <Text style={styles.hospTime}>{formatDate(item.created_at)}</Text>
                            <Text style={styles.hospUser}>{item.user_name}</Text>
                            <Text style={styles.hospAction}>{item.action}</Text>
                            <Text style={styles.hospPatient}>{item.patient_name || '-'}</Text>
                            <Text style={styles.hospDetails} numberOfLines={1}>{item.details}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Auditoría Finanzas */}
            {activeTab === 'finanzas' && (
                <View style={styles.tabContent}>
                    {finLogs.map((item, index) => (
                        <View key={index} style={[styles.finItem, item.is_suspicious && styles.finItemSuspicious]}>
                            <Text style={styles.finTime}>{formatDate(item.created_at)}</Text>
                            <Text style={styles.finUser}>{item.user_name}</Text>
                            <Text style={styles.finAction}>{item.action}</Text>
                            <Text style={styles.finDetails} numberOfLines={1}>{item.details}</Text>
                            <View style={[styles.finBadge, { backgroundColor: getRiskBadge(item.risk_level).bg }]}>
                                <Text style={[styles.finBadgeText, { color: getRiskBadge(item.risk_level).color }]}>
                                    {getRiskBadge(item.risk_level).label}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Auditoría Farmacia */}
            {activeTab === 'farmacia' && (
                <View style={styles.tabContent}>
                    {pharmaLogs.map((item, index) => (
                        <View key={index} style={styles.pharmaItem}>
                            <Text style={styles.pharmaTime}>{formatDate(item.created_at)}</Text>
                            <Text style={styles.pharmaUser}>{item.user_name}</Text>
                            <Text style={styles.pharmaAction}>{item.action}</Text>
                            <Text style={styles.pharmaDetails} numberOfLines={1}>{item.details}</Text>
                        </View>
                    ))}
                    {controlados.length > 0 && (
                        <View style={styles.controladosContainer}>
                            <Text style={styles.controladosTitle}>Medicamentos Controlados</Text>
                            {controlados.map((item, index) => (
                                <View key={index} style={styles.controladoItem}>
                                    <Text style={styles.controladoTime}>{formatDate(item.created_at)}</Text>
                                    <Text style={styles.controladoUser}>{item.user_name}</Text>
                                    <Text style={styles.controladoDetails}>{item.details}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Score Riesgo */}
            {activeTab === 'riesgo' && (
                <View style={styles.tabContent}>
                    <View style={styles.riskDistribution}>
                        <Text style={styles.riskDistTitle}>Distribución de Riesgo</Text>
                        {['bajo', 'medio', 'alto', 'critico'].map((level) => {
                            const count = riskDist[level] || 0;
                            const total = stats.total || 1;
                            const pct = (count / total) * 100;
                            const colors = {
                                bajo: '#059669',
                                medio: '#F59E0B',
                                alto: '#EA580C',
                                critico: '#DC2626'
                            };
                            const labels = {
                                bajo: 'Bajo',
                                medio: 'Medio',
                                alto: 'Alto',
                                critico: 'Crítico'
                            };
                            return (
                                <View key={level} style={styles.riskBar}>
                                    <View style={styles.riskBarLabel}>
                                        <View style={[styles.riskDot, { backgroundColor: colors[level] }]} />
                                        <Text style={styles.riskBarText}>{labels[level]}</Text>
                                        <Text style={styles.riskBarCount}>{count} ({pct.toFixed(1)}%)</Text>
                                    </View>
                                    <View style={styles.riskBarTrack}>
                                        <View style={[styles.riskBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: colors[level] }]} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.riskAreas}>
                        <Text style={styles.riskAreasTitle}>Áreas de Mayor Riesgo</Text>
                        {riskAreas.map((item, index) => (
                            <View key={index} style={styles.riskAreaItem}>
                                <Text style={styles.riskAreaModule}>{item.module}</Text>
                                <Text style={styles.riskAreaTotal}>{item.total}</Text>
                                <Text style={[styles.riskAreaSuspicious, { color: item.suspicious > 0 ? '#DC2626' : '#059669' }]}>
                                    {item.suspicious}
                                </Text>
                                <Text style={[styles.riskAreaCritical, { color: item.critical > 0 ? '#991B1B' : '#059669' }]}>
                                    {item.critical}
                                </Text>
                                <View style={styles.riskAreaBadge}>
                                    <Text style={styles.riskAreaBadgeText}>
                                        {item.critical > 5 ? 'CRÍTICO' : item.suspicious > 10 ? 'ALTO' : item.suspicious > 3 ? 'MEDIO' : 'BAJO'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[5],
        marginTop: spacing[10],
    },
    loadingText: {
        marginTop: spacing[3],
        fontSize: typography.fontSize.base,
        color: colors.gray500,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing[4],
        gap: spacing[2],
    },
    kpiCard: {
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        borderLeftWidth: 3,
        width: '48%',
        marginBottom: spacing[1],
        ...shadows.sm,
        alignItems: 'center',
    },
    kpiValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        marginTop: 2,
    },
    kpiLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        fontWeight: '600',
    },
    alertsContainer: {
        paddingHorizontal: spacing[4],
        marginBottom: spacing[3],
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    alertCard: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.base,
        borderLeftWidth: 3,
        marginRight: spacing[2],
        minWidth: 180,
        ...shadows.sm,
    },
    alertTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    alertAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    alertUser: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    alertReason: {
        fontSize: typography.fontSize.xs,
        color: '#DC2626',
        fontWeight: '700',
    },
    tabBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing[4],
        gap: spacing[1],
        marginBottom: spacing[3],
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.sm,
        gap: spacing[1],
        backgroundColor: colors.gray100,
    },
    tabActive: {
        backgroundColor: colors.secondary + '20',
    },
    tabText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.gray600,
    },
    tabTextActive: {
        color: colors.secondary,
    },
    tabContent: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
    },
    timelineItem: {
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[1],
        ...shadows.sm,
    },
    timelineItemSuspicious: {
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 3,
        borderLeftColor: '#DC2626',
    },
    timelineTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    timelineUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    timelineAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    timelineModule: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    timelineDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        marginTop: 2,
    },
    timelineBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    timelineBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    actionLogin: {
        color: '#059669',
    },
    actionFailed: {
        color: '#DC2626',
    },
    dashboardGrid: {
        gap: spacing[3],
    },
    dashboardCard: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    dashboardTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    hourlyChart: {
        flexDirection: 'row',
        height: 80,
        alignItems: 'flex-end',
        gap: 2,
    },
    hourBar: {
        flex: 1,
        justifyContent: 'flex-end',
        height: '100%',
    },
    hourBarFill: {
        width: '100%',
        backgroundColor: colors.secondary,
        borderRadius: 2,
        minHeight: 2,
    },
    dashboardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    dashboardRowLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
    },
    dashboardRowValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    accessStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    accessStat: {
        alignItems: 'center',
    },
    accessStatValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
    },
    accessStatLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    accessItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[1],
        gap: spacing[2],
        ...shadows.sm,
        flexWrap: 'wrap',
    },
    accessTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        width: 120,
    },
    accessUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
        flex: 1,
    },
    accessBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
    },
    accessBadgeSuccess: {
        backgroundColor: '#D1FAE5',
    },
    accessBadgeDanger: {
        backgroundColor: '#FEE2E2',
    },
    accessBadgeGray: {
        backgroundColor: '#F5F5F4',
    },
    accessBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray700,
    },
    accessIP: {
        fontSize: typography.fontSize.xs,
        fontFamily: 'monospace',
        color: colors.gray500,
    },
    medStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    medStat: {
        alignItems: 'center',
    },
    medStatValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
    },
    medStatLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    medItem: {
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[1],
        ...shadows.sm,
    },
    medTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    medUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    medAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray700,
    },
    medPatient: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    medDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    hospStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    hospStat: {
        alignItems: 'center',
    },
    hospStatValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
    },
    hospStatLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    hospItem: {
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[1],
        ...shadows.sm,
    },
    hospTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    hospUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    hospAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray700,
    },
    hospPatient: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    hospDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    finItem: {
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[1],
        ...shadows.sm,
    },
    finItemSuspicious: {
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 3,
        borderLeftColor: '#DC2626',
    },
    finTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    finUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    finAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray700,
    },
    finDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    finBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    finBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    pharmaItem: {
        backgroundColor: colors.white,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[1],
        ...shadows.sm,
    },
    pharmaTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    pharmaUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    pharmaAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray700,
    },
    pharmaDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    controladosContainer: {
        marginTop: spacing[3],
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    controladosTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    controladoItem: {
        flexDirection: 'row',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        gap: spacing[2],
        flexWrap: 'wrap',
    },
    controladoTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        width: 100,
    },
    controladoUser: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
        flex: 1,
    },
    controladoDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    riskDistribution: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    riskDistTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    riskBar: {
        marginBottom: spacing[2],
    },
    riskBarLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        marginBottom: 2,
    },
    riskDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    riskBarText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    riskBarCount: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    riskBarTrack: {
        height: 8,
        backgroundColor: colors.gray200,
        borderRadius: 4,
        overflow: 'hidden',
    },
    riskBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    riskAreas: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    riskAreasTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    riskAreaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        gap: spacing[2],
        flexWrap: 'wrap',
    },
    riskAreaModule: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    riskAreaTotal: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    riskAreaSuspicious: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
    },
    riskAreaCritical: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
    },
    riskAreaBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.gray200,
    },
    riskAreaBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray700,
    },
});