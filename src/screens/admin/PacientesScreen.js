import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView
} from 'react-native';
import { getPatients, updatePatientStatus } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';

const STATUS_OPTIONS = ['En Espera', 'En Atención', 'Hospitalizado', 'Derivado', 'Alta'];
const STATUS_COLORS = {
    'En Espera': '#F59E0B',
    'En Atención': '#3B82F6',
    'Hospitalizado': '#2D9E6A',
    'Derivado': '#C7291C',
    'Alta': '#736860'
};

const TRIAGE_LEVELS = {
    'Rojo': { label: 'Rojo', color: '#C7291C' },
    'Naranja': { label: 'Naranja', color: '#EA580C' },
    'Amarillo': { label: 'Amarillo', color: '#F59E0B' },
    'Verde': { label: 'Verde', color: '#2D9E6A' },
    'Azul': { label: 'Azul', color: '#3B82F6' }
};

export default function PacientesScreen() {
    const [patients, setPatients] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [newStatus, setNewStatus] = useState('');

    const loadPatients = async () => {
        try {
            setLoading(true);
            const response = await getPatients();
            
            if (response.success && response.data) {
                setPatients(response.data);
            } else {
                setPatients([]);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            Alert.alert('Error', 'No se pudo cargar la lista de pacientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPatients();
        setRefreshing(false);
    };

    const handleUpdateStatus = async () => {
        if (!selectedPatient || !newStatus) {
            Alert.alert('Error', 'Selecciona un estado válido');
            return;
        }

        try {
            const response = await updatePatientStatus(selectedPatient.id, newStatus);
            
            if (response.success) {
                Alert.alert('Éxito', 'Estado actualizado correctamente');
                setModalVisible(false);
                setSelectedPatient(null);
                setNewStatus('');
                loadPatients();
            } else {
                Alert.alert('Error', 'No se pudo actualizar el estado');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'No se pudo actualizar el estado');
        }
    };

    const getVitalsDisplay = (patient) => {
        const parts = [];
        if (patient.vitals_ta) parts.push(`TA:${patient.vitals_ta}`);
        if (patient.vitals_fc) parts.push(`FC:${patient.vitals_fc}`);
        if (patient.vitals_temp) parts.push(`T:${patient.vitals_temp}°C`);
        if (patient.vitals_spo2) parts.push(`O2:${patient.vitals_spo2}%`);
        return parts.length > 0 ? parts.join('  ') : 'Pendientes';
    };

    const renderPatient = ({ item }) => {
        const triageInfo = TRIAGE_LEVELS[item.triage_level] || TRIAGE_LEVELS['Verde'];
        const statusColor = STATUS_COLORS[item.status] || colors.gray500;
        const isCritical = item.triage_level === 'Rojo' || item.triage_level === 'Naranja';
        
        return (
            <TouchableOpacity 
                style={[styles.card, isCritical && styles.cardCritical]}
                onPress={() => {
                    setSelectedPatient(item);
                    setNewStatus(item.status);
                    setModalVisible(true);
                }}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{item.patient_name}</Text>
                        <Text style={styles.patientAge}>Edad: {item.age || 'N/A'} años</Text>
                    </View>
                    <View style={[styles.triageBadge, { backgroundColor: triageInfo.color + '20' }]}>
                        <View style={[styles.triageDot, { backgroundColor: triageInfo.color }]} />
                        <Text style={[styles.triageText, { color: triageInfo.color }]}>
                            {item.triage_level}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoText}>Área: {item.assigned_area || 'No asignado'}</Text>
                        <Text style={[styles.infoText, { color: statusColor, fontWeight: '600' }]}>
                            {item.status}
                        </Text>
                    </View>
                    <View style={styles.vitalsContainer}>
                        <Text style={styles.vitalsText}>
                            {getVitalsDisplay(item)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                    <Text style={styles.updateText}>Actualizar estado</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando pacientes...</Text>
            </View>
        );
    }

    return (
        <>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Pacientes Activos</Text>
                <Text style={styles.headerSubtitle}>
                    {patients.length} pacientes en el hospital
                </Text>
            </View>

            <FlatList
                data={patients}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPatient}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
                }
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No hay pacientes activos</Text>
                        <Text style={styles.emptySubtext}>Los pacientes aparecerán aquí cuando sean registrados</Text>
                    </View>
                }
            />

            {/* Modal para actualizar estado */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Actualizar Estado</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedPatient && (
                            <View style={styles.modalBody}>
                                <Text style={styles.modalPatientName}>
                                    {selectedPatient.patient_name}
                                </Text>
                                <Text style={styles.modalPatientInfo}>
                                    Triage: {selectedPatient.triage_level}  |  Área: {selectedPatient.assigned_area || 'No asignado'}
                                </Text>

                                <Text style={styles.modalLabel}>Seleccionar nuevo estado:</Text>
                                <ScrollView style={styles.statusOptions}>
                                    {STATUS_OPTIONS.map((status) => {
                                        const isSelected = newStatus === status;
                                        const color = STATUS_COLORS[status];
                                        return (
                                            <TouchableOpacity
                                                key={status}
                                                style={[
                                                    styles.statusOption,
                                                    isSelected && styles.statusOptionSelected,
                                                    { borderColor: isSelected ? color : colors.gray300 }
                                                ]}
                                                onPress={() => setNewStatus(status)}
                                            >
                                                <View style={[styles.statusDot, { backgroundColor: color }]} />
                                                <Text style={[
                                                    styles.statusOptionText,
                                                    isSelected && { color: color, fontWeight: '700' }
                                                ]}>
                                                    {status}
                                                </Text>
                                                {isSelected && (
                                                    <Text style={[styles.statusCheck, { color: color }]}>✓</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.updateButton]}
                                        onPress={handleUpdateStatus}
                                    >
                                        <Text style={styles.updateButtonText}>Actualizar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: colors.white,
        padding: spacing[5],
        paddingTop: spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[1],
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    list: {
        padding: spacing[4],
        paddingBottom: spacing[8],
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        ...shadows.sm,
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary,
    },
    cardCritical: {
        borderLeftColor: '#C7291C',
        backgroundColor: '#FFF5F5',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing[3],
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 2,
    },
    patientAge: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    triageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
        gap: spacing[1],
    },
    triageDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    triageText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    cardBody: {
        marginBottom: spacing[3],
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[2],
    },
    infoText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    vitalsContainer: {
        backgroundColor: colors.gray50,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginTop: spacing[1],
    },
    vitalsText: {
        fontSize: typography.fontSize.sm,
        fontFamily: 'monospace',
        color: colors.gray700,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        paddingTop: spacing[3],
    },
    dateText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray400,
    },
    updateText: {
        fontSize: typography.fontSize.xs,
        color: colors.secondary,
        fontWeight: '600',
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
    emptyText: {
        marginTop: spacing[4],
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.gray600,
    },
    emptySubtext: {
        marginTop: spacing[2],
        fontSize: typography.fontSize.sm,
        color: colors.gray400,
        textAlign: 'center',
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[5],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.primary,
    },
    modalCloseButton: {
        padding: spacing[1],
    },
    modalCloseText: {
        fontSize: typography.fontSize.xl,
        color: colors.gray500,
        fontWeight: '300',
    },
    modalBody: {
        padding: spacing[5],
    },
    modalPatientName: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing[1],
    },
    modalPatientInfo: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        marginBottom: spacing[5],
    },
    modalLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        marginBottom: spacing[3],
    },
    statusOptions: {
        maxHeight: 250,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[3],
        borderRadius: borderRadius.base,
        borderWidth: 2,
        marginBottom: spacing[2],
        gap: spacing[3],
    },
    statusOptionSelected: {
        backgroundColor: colors.primary + '08',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusOptionText: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.gray700,
    },
    statusCheck: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing[3],
        marginTop: spacing[5],
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
    updateButton: {
        backgroundColor: colors.secondary,
    },
    updateButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});