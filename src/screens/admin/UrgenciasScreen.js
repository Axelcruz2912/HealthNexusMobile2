import React, { useEffect, useState } from 'react';
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
import { getEmergencyDashboard, storeTriagePatient, updateVitals, derivePatient, dischargePatient } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const TRIAGE_COLORS = {
    'Rojo': { bg: '#FFE0DC', border: '#C7291C', text: '#8C1A11', icon: 'alert-circle' },
    'Naranja': { bg: '#FFF5EB', border: '#FF8C42', text: '#9a3412', icon: 'alert' },
    'Amarillo': { bg: '#FFFCE8', border: '#F59E0B', text: '#92400E', icon: 'warning' },
    'Verde': { bg: '#EBF9F2', border: '#2D9E6A', text: '#065F46', icon: 'checkmark-circle' },
    'Azul': { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A8A', icon: 'information-circle' }
};

const STATUS_OPTIONS = ['En Espera', 'En Atención', 'Hospitalizado', 'Derivado', 'Dado de Alta'];
const HOSPITAL_OPTIONS = [
    'Hospital General de México (2.3 km)',
    'Instituto Nacional de Nutrición (3.8 km)',
    'Hospital Angeles del Pedregal (5.1 km)'
];

export default function UrgenciasScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Modal de ingreso
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newPatient, setNewPatient] = useState({
        patient_name: '',
        triage_level: 'Amarillo',
        age: '',
        chief_complaint: ''
    });
    const [addingPatient, setAddingPatient] = useState(false);
    
    // Modal de signos vitales
    const [vitalsModalVisible, setVitalsModalVisible] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [vitals, setVitals] = useState({
        vitals_ta: '',
        vitals_fc: '',
        vitals_temp: '',
        vitals_spo2: '',
        assigned_area: 'Urgencias'
    });
    
    // Modal de derivación
    const [deriveModalVisible, setDeriveModalVisible] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState(HOSPITAL_OPTIONS[0]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getEmergencyDashboard();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar la sala de urgencias');
            }
        } catch (error) {
            console.error('Error loading emergency:', error);
            Alert.alert('Error', 'No se pudo cargar la sala de urgencias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleAddPatient = async () => {
        if (!newPatient.patient_name.trim()) {
            Alert.alert('Error', 'El nombre del paciente es requerido');
            return;
        }
        if (!newPatient.age || parseInt(newPatient.age) < 0) {
            Alert.alert('Error', 'Edad válida requerida');
            return;
        }

        setAddingPatient(true);
        try {
            const response = await storeTriagePatient({
                patient_name: newPatient.patient_name.trim(),
                triage_level: newPatient.triage_level,
                age: parseInt(newPatient.age),
                chief_complaint: newPatient.chief_complaint
            });
            
            if (response.success) {
                Alert.alert('Éxito', 'Paciente registrado correctamente');
                setAddModalVisible(false);
                setNewPatient({ patient_name: '', triage_level: 'Amarillo', age: '', chief_complaint: '' });
                loadData();
            } else {
                Alert.alert('Error', response.error);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo registrar al paciente');
        } finally {
            setAddingPatient(false);
        }
    };

    const handleUpdateVitals = async () => {
        if (!selectedPatient) return;
        
        try {
            const response = await updateVitals(selectedPatient.id, vitals);
            
            if (response.success) {
                Alert.alert('Éxito', 'Signos vitales registrados correctamente');
                setVitalsModalVisible(false);
                setSelectedPatient(null);
                setVitals({ vitals_ta: '', vitals_fc: '', vitals_temp: '', vitals_spo2: '', assigned_area: 'Urgencias' });
                loadData();
            } else {
                Alert.alert('Error', response.error);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudieron registrar los signos vitales');
        }
    };

    const handleDerivePatient = async () => {
        if (!selectedPatient) return;
        
        try {
            const response = await derivePatient(selectedPatient.id, selectedHospital);
            
            if (response.success) {
                Alert.alert('Éxito', 'Paciente derivado correctamente');
                setDeriveModalVisible(false);
                setSelectedPatient(null);
                setSelectedHospital(HOSPITAL_OPTIONS[0]);
                loadData();
            } else {
                Alert.alert('Error', response.error);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo derivar al paciente');
        }
    };

    const handleDischargePatient = async (patientId) => {
        Alert.alert(
            'Dar de Alta',
            '¿Estás seguro de dar de alta a este paciente?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Dar de Alta',
                    onPress: async () => {
                        try {
                            const response = await dischargePatient(patientId);
                            if (response.success) {
                                Alert.alert('Éxito', 'Paciente dado de alta');
                                loadData();
                            } else {
                                Alert.alert('Error', response.error);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo dar de alta al paciente');
                        }
                    }
                }
            ]
        );
    };

    const renderPatientCard = ({ item, triageLevel }) => {
        const colors = TRIAGE_COLORS[triageLevel] || TRIAGE_COLORS['Verde'];
        const hasVitals = item.vitals_ta && item.vitals_fc;
        
        return (
            <View style={[styles.patientCard, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
                <View style={styles.patientHeader}>
                    <Text style={styles.patientName}>{item.patient_name}</Text>
                    <Text style={styles.patientAge}>{item.age} años</Text>
                </View>
                <Text style={styles.patientSymptoms}>{item.symptoms || 'Pendiente'}</Text>
                
                {hasVitals ? (
                    <View style={styles.vitalsBox}>
                        <Text style={styles.vitalsText}>
                            TA: {item.vitals_ta} | FC: {item.vitals_fc} | Temp: {item.vitals_temp}°C | SpO2: {item.vitals_spo2}%
                        </Text>
                    </View>
                ) : null}
                
                <View style={styles.patientActions}>
                    {!hasVitals && (
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.vitalsButton]}
                            onPress={() => {
                                setSelectedPatient(item);
                                setVitals({
                                    vitals_ta: '',
                                    vitals_fc: '',
                                    vitals_temp: '',
                                    vitals_spo2: '',
                                    assigned_area: 'Urgencias'
                                });
                                setVitalsModalVisible(true);
                            }}
                        >
                            <FontAwesome5 name="heartbeat" size={14} color="#fff" />
                            <Text style={styles.actionButtonText}>Signos</Text>
                        </TouchableOpacity>
                    )}
                    
                    {!item.is_derived && item.status !== 'Dado de Alta' && (
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.deriveButton]}
                            onPress={() => {
                                setSelectedPatient(item);
                                setDeriveModalVisible(true);
                            }}
                        >
                            <FontAwesome5 name="route" size={14} color="#fff" />
                            <Text style={styles.actionButtonText}>Derivar</Text>
                        </TouchableOpacity>
                    )}
                    
                    {item.status !== 'Dado de Alta' && (
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.dischargeButton]}
                            onPress={() => handleDischargePatient(item.id)}
                        >
                            <FontAwesome5 name="check" size={14} color="#fff" />
                            <Text style={styles.actionButtonText}>Alta</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando urgencias...</Text>
            </View>
        );
    }

    const patients = data?.patients || {};
    const triageColors = data?.colors || TRIAGE_COLORS;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Sala de Urgencias</Text>
                <Text style={styles.headerSubtitle}>Clasificación Manchester - Triage en tiempo real</Text>
            </View>

            {/* Botón Ingreso */}
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setAddModalVisible(true)}
            >
                <FontAwesome5 name="ambulance" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Ingreso de Urgencia</Text>
            </TouchableOpacity>

            {/* Columnas de Triage con FlatList para mejor rendimiento */}
            <View style={styles.triageGrid}>
                {['Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul'].map((level) => {
                    const color = triageColors[level] || TRIAGE_COLORS[level];
                    const patientsList = patients[level] || [];
                    
                    return (
                        <View key={level} style={[styles.triageColumn, { backgroundColor: color.bg, borderColor: color.border }]}>
                            <Text style={[styles.triageTitle, { color: color.text }]}>{level}</Text>
                            <Text style={styles.triageCount}>{patientsList.length} pacientes</Text>
                            <FlatList
                                data={patientsList}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => renderPatientCard({ item, triageLevel: level })}
                                scrollEnabled={true}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                                style={styles.patientList}
                                initialNumToRender={3}
                                maxToRenderPerBatch={5}
                                windowSize={5}
                                ListEmptyComponent={
                                    <Text style={styles.emptyPatientsText}>Sin pacientes</Text>
                                }
                            />
                        </View>
                    );
                })}
            </View>

            {/* MODALES... (mantener igual) */}
            {/* MODAL - Ingreso de Paciente */}
            <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ingreso de Urgencia</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre del Paciente"
                                value={newPatient.patient_name}
                                onChangeText={(text) => setNewPatient({...newPatient, patient_name: text})}
                            />
                            <View style={styles.rowInputs}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.inputLabel}>Triage</Text>
                                    <View style={styles.pickerContainer}>
                                        {['Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul'].map((level) => (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.levelChip,
                                                    newPatient.triage_level === level && styles.levelChipActive,
                                                    { borderColor: TRIAGE_COLORS[level].border }
                                                ]}
                                                onPress={() => setNewPatient({...newPatient, triage_level: level})}
                                            >
                                                <Text style={[
                                                    styles.levelChipText,
                                                    newPatient.triage_level === level && styles.levelChipTextActive,
                                                    { color: newPatient.triage_level === level ? '#fff' : TRIAGE_COLORS[level].text }
                                                ]}>
                                                    {level}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.inputLabel}>Edad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Edad"
                                        keyboardType="numeric"
                                        value={newPatient.age}
                                        onChangeText={(text) => setNewPatient({...newPatient, age: text})}
                                    />
                                </View>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Motivo de Consulta"
                                multiline
                                numberOfLines={3}
                                value={newPatient.chief_complaint}
                                onChangeText={(text) => setNewPatient({...newPatient, chief_complaint: text})}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setAddModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleAddPatient} disabled={addingPatient}>
                                    <Text style={styles.confirmButtonText}>{addingPatient ? 'Registrando...' : 'Registrar'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL - Signos Vitales */}
            <Modal visible={vitalsModalVisible} transparent animationType="slide" onRequestClose={() => setVitalsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Signos Vitales</Text>
                            <TouchableOpacity onPress={() => setVitalsModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {selectedPatient && (
                                <Text style={styles.modalPatientName}>{selectedPatient.patient_name}</Text>
                            )}
                            <View style={styles.rowInputs}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.inputLabel}>TA (ej. 120/80)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="120/80"
                                        value={vitals.vitals_ta}
                                        onChangeText={(text) => setVitals({...vitals, vitals_ta: text})}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.inputLabel}>FC (lpm)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="80"
                                        keyboardType="numeric"
                                        value={vitals.vitals_fc}
                                        onChangeText={(text) => setVitals({...vitals, vitals_fc: text})}
                                    />
                                </View>
                            </View>
                            <View style={styles.rowInputs}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.inputLabel}>Temp (°C)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="36.5"
                                        keyboardType="numeric"
                                        value={vitals.vitals_temp}
                                        onChangeText={(text) => setVitals({...vitals, vitals_temp: text})}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.inputLabel}>SpO2 (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="98"
                                        keyboardType="numeric"
                                        value={vitals.vitals_spo2}
                                        onChangeText={(text) => setVitals({...vitals, vitals_spo2: text})}
                                    />
                                </View>
                            </View>
                            <View style={styles.fullInput}>
                                <Text style={styles.inputLabel}>Asignar a Área</Text>
                                <View style={styles.areaPicker}>
                                    {['Urgencias', 'Médico General', 'UCI', 'Quirófano'].map((area) => (
                                        <TouchableOpacity
                                            key={area}
                                            style={[
                                                styles.areaChip,
                                                vitals.assigned_area === area && styles.areaChipActive
                                            ]}
                                            onPress={() => setVitals({...vitals, assigned_area: area})}
                                        >
                                            <Text style={[
                                                styles.areaChipText,
                                                vitals.assigned_area === area && styles.areaChipTextActive
                                            ]}>
                                                {area}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setVitalsModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleUpdateVitals}>
                                    <Text style={styles.confirmButtonText}>Guardar Signos</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL - Derivación */}
            <Modal visible={deriveModalVisible} transparent animationType="slide" onRequestClose={() => setDeriveModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.error }]}>Derivación de Paciente</Text>
                            <TouchableOpacity onPress={() => setDeriveModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {selectedPatient && (
                                <>
                                    <Text style={styles.modalPatientName}>{selectedPatient.patient_name}</Text>
                                    <Text style={styles.modalPatientInfo}>Sin camas/recursos disponibles</Text>
                                </>
                            )}
                            <Text style={styles.inputLabel}>Hospital de Destino</Text>
                            {HOSPITAL_OPTIONS.map((hospital) => (
                                <TouchableOpacity
                                    key={hospital}
                                    style={[
                                        styles.hospitalOption,
                                        selectedHospital === hospital && styles.hospitalOptionActive
                                    ]}
                                    onPress={() => setSelectedHospital(hospital)}
                                >
                                    <Text style={[
                                        styles.hospitalOptionText,
                                        selectedHospital === hospital && styles.hospitalOptionTextActive
                                    ]}>
                                        {hospital}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setDeriveModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.deriveConfirmButton]} onPress={handleDerivePatient}>
                                    <Text style={styles.confirmButtonText}>Derivar</Text>
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
    addButton: {
        backgroundColor: colors.secondary,
        marginHorizontal: spacing[4],
        marginVertical: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        ...shadows.md,
    },
    addButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.base,
        fontWeight: '700',
    },
    triageGrid: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
        gap: spacing[4],
    },
    triageColumn: {
        borderRadius: borderRadius.lg,
        padding: spacing[3],
        borderWidth: 2,
        marginBottom: spacing[4],
        maxHeight: 480,
    },
    triageTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: spacing[1],
        textTransform: 'uppercase',
    },
    triageCount: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    patientList: {
        maxHeight: 350,
    },
    patientCard: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.base,
        marginBottom: spacing[2],
        borderLeftWidth: 4,
        ...shadows.sm,
    },
    patientHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    patientName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    patientAge: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    patientSymptoms: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        marginTop: 2,
    },
    vitalsBox: {
        backgroundColor: colors.gray50,
        padding: spacing[2],
        borderRadius: borderRadius.sm,
        marginTop: spacing[2],
    },
    vitalsText: {
        fontSize: typography.fontSize.xs,
        fontFamily: 'monospace',
        color: colors.gray700,
    },
    patientActions: {
        flexDirection: 'row',
        gap: spacing[2],
        marginTop: spacing[3],
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[2],
        borderRadius: borderRadius.sm,
        gap: spacing[1],
    },
    vitalsButton: {
        backgroundColor: '#2D9E6A',
    },
    deriveButton: {
        backgroundColor: '#FF8C42',
    },
    dischargeButton: {
        backgroundColor: '#3B82F6',
    },
    actionButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
    },
    emptyPatientsText: {
        textAlign: 'center',
        color: colors.gray400,
        fontSize: typography.fontSize.sm,
        padding: spacing[3],
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '92%',
        maxHeight: '85%',
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
    modalBody: {
        padding: spacing[5],
    },
    modalPatientName: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    modalPatientInfo: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        marginBottom: spacing[4],
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: borderRadius.base,
        padding: spacing[3],
        fontSize: typography.fontSize.base,
        marginBottom: spacing[3],
        backgroundColor: colors.gray50,
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        marginBottom: spacing[1],
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    rowInputs: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    halfInput: {
        flex: 1,
    },
    fullInput: {
        marginBottom: spacing[3],
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[1],
    },
    levelChip: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
        borderWidth: 2,
        backgroundColor: colors.white,
    },
    levelChipActive: {
        backgroundColor: colors.primary,
    },
    levelChipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
    },
    levelChipTextActive: {
        color: colors.white,
    },
    areaPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    areaChip: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.base,
        borderWidth: 1,
        borderColor: colors.gray300,
        backgroundColor: colors.white,
    },
    areaChipActive: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },
    areaChipText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray700,
    },
    areaChipTextActive: {
        color: colors.white,
    },
    hospitalOption: {
        padding: spacing[3],
        borderRadius: borderRadius.base,
        borderWidth: 1,
        borderColor: colors.gray300,
        marginBottom: spacing[2],
    },
    hospitalOptionActive: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '10',
    },
    hospitalOptionText: {
        fontSize: typography.fontSize.base,
        color: colors.gray700,
    },
    hospitalOptionTextActive: {
        color: colors.secondary,
        fontWeight: '600',
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
    deriveConfirmButton: {
        backgroundColor: colors.error,
    },
});