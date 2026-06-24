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
    Dimensions
} from 'react-native';
import { getHeatmap } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MapaCalorScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getHeatmap();
            
            if (response.success && response.data) {
                setData(response.data);
                setLastUpdated(response.data.updated_at);
            } else {
                Alert.alert('Error', 'No se pudo cargar el Mapa de Calor');
            }
        } catch (error) {
            console.error('Error loading heatmap:', error);
            Alert.alert('Error', 'No se pudo cargar el Mapa de Calor');
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

    const getStatusText = (percent) => {
        if (percent > 80) return '⚠️ Crítico';
        if (percent > 50) return '⚡ Atención';
        return '✅ Normal';
    };

    const renderCard = (item) => {
        const isUCI = item.type === 'uci';
        const isUrg = item.type === 'urg';
        const isFarma = item.type === 'farmacia';
        const isPersonal = item.type === 'personal';
        
        const bgColor = item.color || '#2D9E6A';
        const textColor = isPersonal ? colors.white : colors.white;
        
        let icon = 'hospital';
        if (isUCI) icon = 'heartbeat';
        else if (isUrg) icon = 'ambulance';
        else if (isFarma) icon = 'prescription-bottle';
        else if (isPersonal) icon = 'users';
        
        return (
            <View style={[styles.card, { backgroundColor: bgColor }]}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name={icon} size={20} color={textColor} style={styles.cardIcon} />
                    {isUCI && (
                        <Text style={[styles.cardStatus, { color: textColor, opacity: 0.8 }]}>
                            {item.status}
                        </Text>
                    )}
                </View>
                <Text style={[styles.cardValue, { color: textColor }]}>
                    {isUCI || isUrg ? `${item.value}%` : item.value}
                </Text>
                <Text style={[styles.cardLabel, { color: textColor }]}>
                    {item.label}
                </Text>
                {!isPersonal && isUCI && (
                    <Text style={[styles.cardSubtext, { color: textColor, opacity: 0.9 }]}>
                        {item.percent === 100 ? '⚠️ SIN CAMAS DISPONIBLES' : 'Operación Normal'}
                    </Text>
                )}
                {!isPersonal && isUrg && (
                    <Text style={[styles.cardSubtext, { color: textColor, opacity: 0.9 }]}>
                        {item.subtext}
                    </Text>
                )}
                {!isPersonal && isFarma && (
                    <Text style={[styles.cardSubtext, { color: textColor, opacity: 0.9 }]}>
                        {item.value > 0 ? '⚠️ Medicamentos por debajo del mínimo' : '✅ Stock normal'}
                    </Text>
                )}
                {isPersonal && (
                    <Text style={[styles.cardSubtext, { color: textColor, opacity: 0.9 }]}>
                        En turno actualmente
                    </Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando Mapa de Calor...</Text>
            </View>
        );
    }

    const items = [
        {
            type: 'uci',
            value: data?.uci_percent || 0,
            label: 'UCI - Saturación',
            color: data?.uci_color || '#2D9E6A',
            status: data?.uci_status || 'Operación Normal',
            percent: data?.uci_percent || 0,
        },
        {
            type: 'urg',
            value: data?.urg_percent || 0,
            label: 'Urgencias - Triage',
            color: data?.urg_color || '#2D9E6A',
            subtext: data?.urg_status || '0 pacientes críticos',
            percent: data?.urg_percent || 0,
        },
        {
            type: 'farmacia',
            value: data?.farmacia_alerts || 0,
            label: 'Farmacia - Desabasto',
            color: data?.farmacia_color || '#2D9E6A',
        },
        {
            type: 'personal',
            value: data?.total_personal || 0,
            label: 'Personal Activo',
            color: data?.total_personal_color || '#1E1A17',
        },
    ];

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerIcon}>
                    <FontAwesome5 name="fire" size={24} color={colors.white} />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Mapa de Calor</Text>
                    <Text style={styles.headerSubtitle}>
                        Visualización de zonas críticas basada en ocupación de camas y urgencias
                    </Text>
                </View>
            </View>

            {/* Última actualización */}
            <View style={styles.updateContainer}>
                <FontAwesome5 name="sync-alt" size={12} color={colors.gray400} />
                <Text style={styles.updateText}>
                    Última actualización: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                </Text>
            </View>

            {/* Grid de cards */}
            <View style={styles.grid}>
                {items.map((item, index) => (
                    <View key={index} style={styles.gridItem}>
                        {renderCard(item)}
                    </View>
                ))}
            </View>

            {/* Leyenda */}
            <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>Leyenda de Colores</Text>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#2D9E6A' }]} />
                    <Text style={styles.legendText}>Normal</Text>
                    <View style={[styles.legendDot, { backgroundColor: '#FF8C42' }]} />
                    <Text style={styles.legendText}>Atención</Text>
                    <View style={[styles.legendDot, { backgroundColor: '#C7291C' }]} />
                    <Text style={styles.legendText}>Crítico</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    headerContainer: {
        backgroundColor: '#2D9E6A',
        padding: spacing[5],
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing[3],
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
    },
    headerTextContainer: {
        flex: 1,
        flexShrink: 1,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.white,
        opacity: 0.9,
        flexShrink: 1,
    },
    updateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing[2],
        gap: spacing[2],
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    updateText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray400,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing[4],
        gap: spacing[4],
    },
    gridItem: {
        width: (width - spacing[4] * 2 - spacing[4]) / 2,
    },
    card: {
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        minHeight: 140,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: spacing[2],
    },
    cardIcon: {
        opacity: 0.8,
    },
    cardStatus: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        textAlign: 'right',
    },
    cardValue: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        textAlign: 'center',
    },
    cardLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    cardSubtext: {
        fontSize: typography.fontSize.xs,
        textAlign: 'center',
        marginTop: 6,
        opacity: 0.9,
    },
    legendContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        marginBottom: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    legendTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing[2],
        textAlign: 'center',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        flexWrap: 'wrap',
    },
    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 4,
    },
    legendText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        marginRight: spacing[3],
    },
});