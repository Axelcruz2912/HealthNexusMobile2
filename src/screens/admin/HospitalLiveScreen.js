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
    FlatList
} from 'react-native';
import { getHospitalLive } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function HospitalLiveScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getHospitalLive();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar el Hospital Live');
            }
        } catch (error) {
            console.error('Error loading hospital live:', error);
            Alert.alert('Error', 'No se pudo cargar el Hospital Live');
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

    const renderMetrica = ({ item }) => (
        <View style={[styles.metricCard, { borderTopColor: item.color }]}>
            <Text style={[styles.metricValue, { color: item.color }]}>{item.valor}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
        </View>
    );

    const renderArea = ({ item }) => (
        <View style={[styles.areaCard, { backgroundColor: item.bg, borderColor: item.border }]}>
            <View style={styles.areaHeader}>
                <Text style={[styles.areaName, { color: item.color }]}>{item.name}</Text>
                <View style={[styles.areaStatusBadge, { backgroundColor: item.status_color }]}>
                    <Text style={styles.areaStatusText}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View 
                        style={[
                            styles.progressFill, 
                            { 
                                width: `${Math.min(item.pct, 100)}%`,
                                backgroundColor: item.status_color 
                            }
                        ]} 
                    />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>{item.pacientes} / {item.capacidad}</Text>
                    <Text style={styles.progressText}>{item.pct}%</Text>
                </View>
            </View>
        </View>
    );

    const renderEvento = ({ item }) => {
        const isRecent = false;
        return (
            <View style={[styles.eventoItem, isRecent && styles.eventoRecent]}>
                <View style={styles.eventoDot} />
                <Text style={styles.eventoTime}>{item.time || 'N/A'}</Text>
                <Text style={styles.eventoAction}>{item.action}</Text>
                <Text style={styles.eventoDetails} numberOfLines={1}>{item.details}</Text>
                <Text style={styles.eventoUser}>{item.user_name}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando Hospital Live...</Text>
            </View>
        );
    }

    const metricas = data?.metricas || [];
    const areas = data?.areas || [];
    const eventos = data?.eventos || [];
    const modoCrisis = data?.modo_crisis || false;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            {/* Modo Crisis */}
            {modoCrisis && (
                <View style={styles.crisisAlert}>
                    <FontAwesome5 name="exclamation-triangle" size={24} color="#fff" />
                    <View style={styles.crisisContent}>
                        <Text style={styles.crisisTitle}>MODO CRISIS HOSPITALARIA</Text>
                        <Text style={styles.crisisSubtitle}>Protocolo activo - Control total requerido</Text>
                    </View>
                </View>
            )}

            {/* Métricas */}
            <View style={styles.metricsGrid}>
                <FlatList
                    data={metricas}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderMetrica}
                    numColumns={3}
                    scrollEnabled={false}
                />
            </View>

            {/* Mapa de Saturación */}
            <View style={styles.saturationContainer}>
                <View style={styles.sectionHeader}>
                    <FontAwesome5 name="chart-bar" size={18} color={colors.secondary} />
                    <Text style={styles.sectionTitle}>Mapa de Saturación</Text>
                </View>
                <View style={styles.areasGrid}>
                    {areas.map((area, index) => (
                        <View key={index} style={[styles.areaCard, { backgroundColor: area.bg, borderColor: area.border }]}>
                            <View style={styles.areaHeader}>
                                <Text style={[styles.areaName, { color: area.color }]}>{area.name}</Text>
                                <View style={[styles.areaStatusBadge, { backgroundColor: area.status_color }]}>
                                    <Text style={styles.areaStatusText}>{area.status}</Text>
                                </View>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View 
                                        style={[
                                            styles.progressFill, 
                                            { 
                                                width: `${Math.min(area.pct, 100)}%`,
                                                backgroundColor: area.status_color 
                                            }
                                        ]} 
                                    />
                                </View>
                                <View style={styles.progressLabels}>
                                    <Text style={styles.progressText}>{area.pacientes} / {area.capacidad}</Text>
                                    <Text style={styles.progressText}>{area.pct}%</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Eventos del Hospital - ICONO CORREGIDO */}
            <View style={styles.eventsContainer}>
                <View style={styles.sectionHeader}>
                    <FontAwesome5 name="history" size={18} color={colors.secondary} />
                    <Text style={styles.sectionTitle}>Eventos del Hospital</Text>
                </View>
                {eventos.length > 0 ? (
                    <View style={styles.eventsList}>
                        {eventos.map((item, index) => (
                            <View key={item.id || index} style={[
                                styles.eventoItem,
                                index < 3 && styles.eventoRecent
                            ]}>
                                <View style={styles.eventoDot} />
                                <Text style={styles.eventoTime}>{item.time || 'N/A'}</Text>
                                <Text style={styles.eventoAction}>{item.action}</Text>
                                <Text style={styles.eventoDetails} numberOfLines={1}>{item.details}</Text>
                                <Text style={styles.eventoUser}>{item.user_name}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>Sin eventos recientes</Text>
                )}
            </View>
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
    crisisAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DC2626',
        margin: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        gap: spacing[3],
        ...shadows.md,
    },
    crisisContent: {
        flex: 1,
    },
    crisisTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.white,
    },
    crisisSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.white,
        opacity: 0.9,
    },
    metricsGrid: {
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
    },
    metricCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        borderTopWidth: 3,
        margin: spacing[1],
        alignItems: 'center',
        ...shadows.sm,
        minWidth: '30%',
    },
    metricValue: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.primary,
    },
    metricLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray500,
        marginTop: 2,
        textAlign: 'center',
    },
    saturationContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
    },
    areasGrid: {
        gap: spacing[2],
    },
    areaCard: {
        padding: spacing[3],
        borderRadius: borderRadius.base,
        borderWidth: 2,
        marginBottom: spacing[2],
    },
    areaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    areaName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
    },
    areaStatusBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    areaStatusText: {
        color: colors.white,
        fontSize: typography.fontSize.xs,
        fontWeight: '800',
    },
    progressContainer: {
        gap: spacing[1],
    },
    progressBar: {
        backgroundColor: '#E7E5E4',
        borderRadius: 3,
        height: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    eventsContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    eventsList: {
        gap: spacing[1],
    },
    eventoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[2],
        borderRadius: borderRadius.sm,
        gap: spacing[2],
    },
    eventoRecent: {
        backgroundColor: '#FFF1EE',
    },
    eventoDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.secondary,
        flexShrink: 0,
    },
    eventoTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        width: 55,
        flexShrink: 0,
    },
    eventoAction: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
        flex: 1,
    },
    eventoDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        flex: 1.5,
    },
    eventoUser: {
        fontSize: typography.fontSize.xs,
        color: colors.secondaryDark,
        fontWeight: '600',
        marginLeft: 'auto',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.gray400,
        padding: spacing[4],
        fontWeight: '600',
    },
});