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
    Modal,
    TextInput,
    FlatList
} from 'react-native';
import { getBeds, createBed, updateBedStatus, deleteBed } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const STATUS_COLORS = {
    'Disponible': { bg: '#EBF9F2', border: '#2D9E6A', text: '#065F46' },
    'Ocupada': { bg: '#FFF1F0', border: '#C7291C', text: '#8C1A11' },
    'Limpieza': { bg: '#FFF5EB', border: '#FF8C42', text: '#9a3412' },
    'Mantenimiento': { bg: '#F4F6F8', border: '#736860', text: '#736860' }
};

const STATUS_OPTIONS = ['Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento'];
const FLOOR_NAMES = {
    1: 'Urgencias',
    2: 'UCI',
    3: 'Pediatría',
    4: 'Quirófanos'
};

export default function CamasScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Modal de agregar cama
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newBed, setNewBed] = useState({
        floor: '',
        room_number: '',
        bed_number: '',
        type: 'General'
    });
    const [addingBed, setAddingBed] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getBeds();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar el mapa de camas');
            }
        } catch (error) {
            console.error('Error loading beds:', error);
            Alert.alert('Error', 'No se pudo cargar el mapa de camas');
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

    const handleAddBed = async () => {
        if (!newBed.floor || !newBed.room_number || !newBed.bed_number) {
            Alert.alert('Error', 'Todos los campos son requeridos');
            return;
        }

        setAddingBed(true);
        try {
            const response = await createBed({
                floor: parseInt(newBed.floor),
                room_number: newBed.room_number,
                bed_number: newBed.bed_number,
                type: newBed.type
            });
            
            if (response.success) {
                Alert.alert('Éxito', 'Cama registrada correctamente');
                setAddModalVisible(false);
                setNewBed({ floor: '', room_number: '', bed_number: '', type: 'General' });
                loadData();
            } else {
                Alert.alert('Error', response.error);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar la cama');
        } finally {
            setAddingBed(false);
        }
    };

    const handleUpdateStatus = async (bedId, newStatus) => {
        try {
            const response = await updateBedStatus(bedId, newStatus);
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

    const handleDeleteBed = (bedId, bedNumber) => {
        Alert.alert(
            'Eliminar Cama',
            `¿Estás seguro de eliminar la cama ${bedNumber}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await deleteBed(bedId);
                            if (response.success) {
                                Alert.alert('Éxito', 'Cama eliminada correctamente');
                                loadData();
                            } else {
                                Alert.alert('Error', response.error);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la cama');
                        }
                    }
                }
            ]
        );
    };

    const renderBedCard = ({ item }) => {
        const statusColors = STATUS_COLORS[item.status] || STATUS_COLORS['Disponible'];
        
        return (
            <View style={[styles.bedCard, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
                <Text style={styles.roomNumber}>Hab. {item.room_number}</Text>
                <Text style={styles.bedNumber}>Cama {item.bed_number}</Text>
                <Text style={[styles.bedStatus, { color: statusColors.text }]}>{item.status}</Text>
                <View style={styles.bedActions}>
                    <View style={styles.statusSelector}>
                        {STATUS_OPTIONS.map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusChip,
                                    item.status === status && styles.statusChipActive,
                                    { borderColor: STATUS_COLORS[status].border }
                                ]}
                                onPress={() => handleUpdateStatus(item.id, status)}
                            >
                                <Text style={[
                                    styles.statusChipText,
                                    item.status === status && styles.statusChipTextActive,
                                    { color: item.status === status ? '#fff' : STATUS_COLORS[status].text }
                                ]}>
                                    {status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteBed(item.id, item.bed_number)}
                    >
                        <Ionicons name="trash-outline" size={16} color="#C7291C" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando mapa de camas...</Text>
            </View>
        );
    }

    const floors = data?.floors || [];
    const stats = data?.stats || {};

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            {/* Header con título */}
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.headerTitle}>Mapa de Ocupación Hospitalaria</Text>
                    <Text style={styles.headerSubtitle}>Gestión de camas por piso</Text>
                </View>
            </View>

            {/* Botón Agregar Cama - AHORA ABAJO DEL HEADER */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setAddModalVisible(true)}
            >
                <FontAwesome5 name="plus" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Agregar Cama</Text>
            </TouchableOpacity>

            {/* Leyenda */}
            <View style={styles.legendContainer}>
                {STATUS_OPTIONS.map((status) => {
                    const colors = STATUS_COLORS[status];
                    return (
                        <View key={status} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
                            <Text style={styles.legendText}>{status}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Stats rápidos */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.total || 0}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#2D9E6A' }]}>{stats.disponible || 0}</Text>
                    <Text style={styles.statLabel}>Disponibles</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#C7291C' }]}>{stats.ocupada || 0}</Text>
                    <Text style={styles.statLabel}>Ocupadas</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FF8C42' }]}>{stats.limpieza || 0}</Text>
                    <Text style={styles.statLabel}>Limpieza</Text>
                </View>
            </View>

            {/* Pisos */}
            {floors.map((floor) => {
                const floorBeds = data?.beds?.filter(b => b.floor === floor) || [];
                const floorName = FLOOR_NAMES[floor] || `Piso ${floor}`;
                
                return (
                    <View key={floor} style={styles.floorSection}>
                        <Text style={styles.floorTitle}>Piso {floor} - {floorName}</Text>
                        <View style={styles.bedGrid}>
                            {floorBeds.map((bed) => (
                                <View key={bed.id} style={styles.bedGridItem}>
                                    <View style={[styles.bedCard, { 
                                        backgroundColor: STATUS_COLORS[bed.status].bg, 
                                        borderColor: STATUS_COLORS[bed.status].border 
                                    }]}>
                                        <Text style={styles.roomNumber}>Hab. {bed.room_number}</Text>
                                        <Text style={styles.bedNumber}>Cama {bed.bed_number}</Text>
                                        <Text style={[styles.bedStatus, { color: STATUS_COLORS[bed.status].text }]}>
                                            {bed.status}
                                        </Text>
                                        <View style={styles.bedActions}>
                                            <View style={styles.statusSelector}>
                                                {STATUS_OPTIONS.map((status) => (
                                                    <TouchableOpacity
                                                        key={status}
                                                        style={[
                                                            styles.statusChip,
                                                            bed.status === status && styles.statusChipActive,
                                                            { borderColor: STATUS_COLORS[status].border }
                                                        ]}
                                                        onPress={() => handleUpdateStatus(bed.id, status)}
                                                    >
                                                        <Text style={[
                                                            styles.statusChipText,
                                                            bed.status === status && styles.statusChipTextActive,
                                                            { color: bed.status === status ? '#fff' : STATUS_COLORS[status].text }
                                                        ]}>
                                                            {status}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            <TouchableOpacity 
                                                style={styles.deleteButton}
                                                onPress={() => handleDeleteBed(bed.id, bed.bed_number)}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#C7291C" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}

            {/* Modal Agregar Cama */}
            <Modal
                visible={addModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Registrar Nueva Cama</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {/* Piso */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Piso *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: 1, 2, 3, 4"
                                    keyboardType="numeric"
                                    value={newBed.floor}
                                    onChangeText={(text) => setNewBed({...newBed, floor: text})}
                                />
                            </View>

                            {/* Número de Habitación */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Número de Habitación *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: 101, 201, 301"
                                    value={newBed.room_number}
                                    onChangeText={(text) => setNewBed({...newBed, room_number: text})}
                                />
                            </View>

                            {/* Letra de Cama */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Letra de Cama *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: A, B, C"
                                    value={newBed.bed_number}
                                    onChangeText={(text) => setNewBed({...newBed, bed_number: text})}
                                />
                            </View>

                            {/* Tipo */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tipo</Text>
                                <View style={styles.typeOptions}>
                                    {['General', 'UCI', 'Pediatría', 'Quirófano'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeChip,
                                                newBed.type === type && styles.typeChipActive
                                            ]}
                                            onPress={() => setNewBed({...newBed, type: type})}
                                        >
                                            <Text style={[
                                                styles.typeChipText,
                                                newBed.type === type && styles.typeChipTextActive
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setAddModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleAddBed}
                                    disabled={addingBed}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {addingBed ? 'Guardando...' : 'Guardar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary,
        marginHorizontal: spacing[4],
        marginTop: spacing[4],
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        gap: spacing[2],
        ...shadows.md,
    },
    addButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.base,
        fontWeight: '700',
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing[4],
        backgroundColor: colors.white,
        marginTop: spacing[4],
        marginBottom: spacing[2],
        gap: spacing[2],
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        marginRight: spacing[2],
    },
    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 3,
    },
    legendText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
        color: colors.primary,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    floorSection: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        marginBottom: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    floorTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing[3],
        paddingBottom: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    bedGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    bedGridItem: {
        width: '30%',
        minWidth: 100,
    },
    bedCard: {
        padding: spacing[2],
        borderRadius: borderRadius.base,
        borderWidth: 2,
        alignItems: 'center',
    },
    roomNumber: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        fontWeight: '600',
    },
    bedNumber: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
        marginVertical: 2,
    },
    bedStatus: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    bedActions: {
        marginTop: spacing[2],
        width: '100%',
    },
    statusSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        marginBottom: spacing[1],
    },
    statusChip: {
        paddingHorizontal: spacing[1],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        flex: 1,
        minWidth: 40,
        alignItems: 'center',
    },
    statusChipActive: {
        backgroundColor: colors.primary,
    },
    statusChipText: {
        fontSize: 8,
        fontWeight: '600',
    },
    statusChipTextActive: {
        color: colors.white,
    },
    deleteButton: {
        alignItems: 'center',
        paddingVertical: spacing[1],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '90%',
        maxHeight: '80%',
        padding: spacing[5],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        paddingBottom: spacing[3],
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.primary,
    },
    modalBody: {
        paddingBottom: spacing[3],
    },
    inputGroup: {
        marginBottom: spacing[4],
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray700,
        marginBottom: spacing[2],
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: borderRadius.base,
        padding: spacing[3],
        fontSize: typography.fontSize.base,
        backgroundColor: colors.gray50,
    },
    typeOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    typeChip: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.gray300,
        backgroundColor: colors.white,
    },
    typeChipActive: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },
    typeChipText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray700,
    },
    typeChipTextActive: {
        color: colors.white,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing[3],
        marginTop: spacing[4],
    },
    modalButton: {
        flex: 1,
        paddingVertical: spacing[3],
        borderRadius: borderRadius.base,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.gray100,
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    cancelButtonText: {
        color: colors.gray700,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: colors.secondary,
    },
    confirmButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});