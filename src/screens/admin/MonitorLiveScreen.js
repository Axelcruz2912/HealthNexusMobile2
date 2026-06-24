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
    Dimensions
} from 'react-native';
import { getMonitorLive } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MonitorLiveScreen() {
    const [data, setData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getMonitorLive();
            
            if (response.success && response.data) {
                setData(response.data);
                setSessions(response.data.sessions || []);
                setLastUpdated(response.data.updated_at);
            } else {
                Alert.alert('Error', 'No se pudo cargar el Monitor Live');
            }
        } catch (error) {
            console.error('Error loading monitor live:', error);
            Alert.alert('Error', 'No se pudo cargar el Monitor Live');
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

    const formatLastActivity = (timestamp) => {
        if (!timestamp) return 'N/A';
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        
        if (diff < 60) return 'Hace unos segundos';
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
        return 'Hace más de un día';
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Disponible': return '#16A34A';
            case 'En Ruta': return '#EA580C';
            case 'En Mantenimiento': return '#DC2626';
            default: return '#6B7280';
        }
    };

    const renderSessionItem = ({ item }) => (
        <View style={styles.sessionItem}>
            <View style={styles.sessionUser}>
                <View style={styles.userAvatar}>
                    <FontAwesome5 name="user" size={14} color={colors.white} />
                </View>
                <View>
                    <Text style={styles.userName}>{item.user_name}</Text>
                    <Text style={styles.userRole}>{item.user_role}</Text>
                </View>
            </View>
            <View style={styles.sessionInfo}>
                <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: '#2D9E6A' }]} />
                    <Text style={styles.statusText}>Activo</Text>
                </View>
                <Text style={styles.lastActivity}>
                    {formatLastActivity(item.last_activity)}
                </Text>
            </View>
        </View>
    );

    const renderStats = () => {
        const stats = [
            {
                value: data?.sessions_count || 0,
                label: 'Sesiones Activas Ahora',
                color: '#2D9E6A',
                icon: 'users'
            },
            {
                value: data?.urgencies || 0,
                label: 'Pacientes en Urgencias',
                color: '#F05A4E',
                icon: 'ambulance'
            },
            {
                value: data?.low_stock || 0,
                label: 'Medicamentos Baja Exist.',
                color: '#FF8C42',
                icon: 'prescription-bottle'
            }
        ];

        return (
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={[styles.statCard, { borderTopColor: stat.color }]}>
                        <FontAwesome5 name={stat.icon} size={20} color={stat.color} />
                        <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando Monitor Live...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerIcon}>
                    <FontAwesome5 name="broadcast-tower" size={24} color={colors.white} />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Transmisión en Vivo</Text>
                    <Text style={styles.headerSubtitle}>
                        Monitoreo de actividad en este preciso instante
                    </Text>
                </View>
            </View>

            {/* Stats */}
            {renderStats()}

            {/* Última actualización */}
            <View style={styles.updateContainer}>
                <FontAwesome5 name="sync-alt" size={12} color={colors.gray400} />
                <Text style={styles.updateText}>
                    Última actualización: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                </Text>
            </View>

            {/* Lista de usuarios conectados */}
            <View style={styles.sessionsHeader}>
                <FontAwesome5 name="users" size={16} color={colors.primary} />
                <Text style={styles.sessionsTitle}>Usuarios Conectados</Text>
                <View style={styles.sessionsCount}>
                    <Text style={styles.sessionsCountText}>{sessions.length}</Text>
                </View>
            </View>

            <FlatList
                data={sessions}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderSessionItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome5 name="users-slash" size={40} color={colors.gray300} />
                        <Text style={styles.emptyText}>No hay usuarios conectados</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
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
    statsGrid: {
        flexDirection: 'row',
        padding: spacing[4],
        gap: spacing[3],
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        borderTopWidth: 4,
        alignItems: 'center',
        ...shadows.sm,
    },
    statValue: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        marginTop: 4,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 2,
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
    sessionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        gap: spacing[2],
    },
    sessionsTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
        flex: 1,
    },
    sessionsCount: {
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
        minWidth: 28,
        alignItems: 'center',
    },
    sessionsCountText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.white,
    },
    list: {
        padding: spacing[4],
        paddingBottom: spacing[8],
    },
    sessionItem: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.sm,
    },
    sessionUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        flex: 1,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    userRole: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    sessionInfo: {
        alignItems: 'flex-end',
        gap: spacing[1],
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: '#2D9E6A',
    },
    lastActivity: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[10],
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.gray500,
        marginTop: spacing[3],
    },
});