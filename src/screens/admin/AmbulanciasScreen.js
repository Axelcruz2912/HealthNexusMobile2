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
import { getAmbulances, updateAmbulanceStatus, deleteAmbulance } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const STATUS_OPTIONS = ['Disponible', 'En Ruta', 'En Mantenimiento'];

export default function AmbulanciasScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getAmbulances();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar el control de ambulancias');
            }
        } catch (error) {
            console.error('Error loading ambulances:', error);
            Alert.alert('Error', 'No se pudo cargar el control de ambulancias');
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

    const handleUpdateStatus = async (ambulanceId, newStatus) => {
        try {
            const response = await updateAmbulanceStatus(ambulanceId, newStatus);
            if (response.success) {
                Alert.alert('Éxito', 'Estado actualizado correctamente');
                loadData();
            } else {
                Alert.alert('Error', response.error);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el estado');
        }
    };

    const handleDeleteAmbulance = (ambulanceId, code) => {
        Alert.alert(
            'Eliminar Ambulancia',
            `¿Estás seguro de eliminar la ambulancia ${code}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await deleteAmbulance(ambulanceId);
                            if (response.success) {
                                Alert.alert('Éxito', 'Ambulancia eliminada correctamente');
                                loadData();
                            } else {
                                Alert.alert('Error', response.error);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la ambulancia');
                        }
                    }
                }
            ]
        );
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Disponible':
                return { bg: '#F0FDF4', color: '#16A34A' };
            case 'En Ruta':
                return { bg: '#FFF7ED', color: '#EA580C' };
            case 'En Mantenimiento':
                return { bg: '#FEF2F2', color: '#DC2626' };
            default:
                return { bg: '#F3F4F6', color: '#6B7280' };
        }
    };

    const renderAmbulanceItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const isCritical = item.priority === 'Critica';
        
        return (
            <View style={styles.ambulanceRow}>
                <View style={styles.ambulanceInfo}>
                    <Text style={styles.ambulanceCode}>
                        <FontAwesome5 name="ambulance" size={14} color={statusStyle.color} /> {item.code}
                    </Text>
                    <Text style={styles.ambulanceLocation}>{item.current_location}</Text>
                </View>
                <View style={styles.ambulanceDetails}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status}</Text>
                    </View>
                    <Text style={[styles.priorityText, { color: isCritical ? '#DC2626' : '#6B7280' }]}>
                        {item.priority}
                    </Text>
                    <Text style={styles.costText}>${item.cost?.toLocaleString() || 0}</Text>
                    <TouchableOpacity 
                        style={styles.deleteButtonSmall}
                        onPress={() => handleDeleteAmbulance(item.id, item.code)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#C7291C" />
                    </TouchableOpacity>
                </View>
                <View style={styles.statusSelector}>
                    {STATUS_OPTIONS.map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.statusChipSmall,
                                item.status === status && styles.statusChipActiveSmall
                            ]}
                            onPress={() => handleUpdateStatus(item.id, status)}
                        >
                            <Text style={[
                                styles.statusChipTextSmall,
                                item.status === status && styles.statusChipTextActiveSmall
                            ]}>
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando ambulancias...</Text>
            </View>
        );
    }

    const stats = data?.stats || {};
    const ambulances = data?.ambulances || [];

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Control de Ambulancias</Text>
                <Text style={styles.headerSubtitle}>Gestión de flota y operaciones</Text>
            </View>

            {/* Stats rápidos */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { borderTopColor: '#16A34A' }]}>
                    <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.disponibles || 0}</Text>
                    <Text style={styles.statLabel}>Disponibles</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#EA580C' }]}>
                    <Text style={[styles.statValue, { color: '#EA580C' }]}>{stats.activas || 0}</Text>
                    <Text style={styles.statLabel}>En Ruta</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#DC2626' }]}>
                    <Text style={[styles.statValue, { color: '#DC2626' }]}>{stats.criticas || 0}</Text>
                    <Text style={styles.statLabel}>Críticas</Text>
                </View>
                <View style={[styles.statCard, { borderTopColor: '#7C3AED' }]}>
                    <Text style={[styles.statValue, { color: '#7C3AED' }]}>{stats.total || 0}</Text>
                    <Text style={styles.statLabel}>Total Flota</Text>
                </View>
            </View>

            {/* Resumen Financiero */}
            <View style={styles.financialContainer}>
                <Text style={styles.financialTitle}>Resumen Financiero</Text>
                <View style={styles.financialGrid}>
                    <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Costo Operativo Diario</Text>
                        <Text style={styles.financialValue}>${stats.costo_operativo?.toLocaleString() || 0}</Text>
                    </View>
                    <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Unidades Activas</Text>
                        <Text style={styles.financialValue}>{stats.activas || 0}</Text>
                    </View>
                    <View style={styles.financialItem}>
                        <Text style={styles.financialLabel}>Tasa de Uso</Text>
                        <Text style={styles.financialValue}>{stats.tasa_uso || 0}%</Text>
                    </View>
                </View>
            </View>

            {/* Lista de Ambulancias */}
            <View style={styles.listContainer}>
                <Text style={styles.listTitle}>Flota Completa</Text>
                <View style={styles.listHeader}>
                    <Text style={[styles.headerText, styles.headerUnit]}>Unidad</Text>
                    <Text style={[styles.headerText, styles.headerStatus]}>Estado</Text>
                    <Text style={[styles.headerText, styles.headerPriority]}>Prioridad</Text>
                    <Text style={[styles.headerText, styles.headerCost]}>Costo</Text>
                </View>
                <FlatList
                    data={ambulances}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAmbulanceItem}
                    scrollEnabled={false}
                />
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
    headerContainer: {
        padding: spacing[4],
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.primary,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        marginTop: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing[4],
        gap: spacing[3],
    },
    statCard: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        borderTopWidth: 3,
        width: '48%',
        ...shadows.sm,
    },
    statValue: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '900',
        color: colors.primary,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray500,
        marginTop: 2,
    },
    financialContainer: {
        backgroundColor: colors.primary,
        marginHorizontal: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
    },
    financialTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.white,
        marginBottom: spacing[3],
    },
    financialGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    financialItem: {
        flex: 1,
    },
    financialLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray400,
        opacity: 0.7,
    },
    financialValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: '900',
        color: colors.white,
        marginTop: 2,
    },
    listContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    listTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[3],
    },
    listHeader: {
        flexDirection: 'row',
        paddingBottom: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        marginBottom: spacing[2],
    },
    headerText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray600,
    },
    headerUnit: { flex: 1.5 },
    headerStatus: { flex: 1 },
    headerPriority: { flex: 0.8 },
    headerCost: { flex: 0.8 },
    ambulanceRow: {
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    ambulanceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    ambulanceCode: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    ambulanceLocation: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    ambulanceDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    priorityText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
    },
    costText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    deleteButtonSmall: {
        padding: 2,
    },
    statusSelector: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    statusChipSmall: {
        paddingHorizontal: spacing[1],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.gray300,
        flex: 1,
        minWidth: 50,
        alignItems: 'center',
    },
    statusChipActiveSmall: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    statusChipTextSmall: {
        fontSize: 8,
        fontWeight: '600',
        color: colors.gray600,
    },
    statusChipTextActiveSmall: {
        color: colors.white,
    },
});