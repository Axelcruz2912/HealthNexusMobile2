import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { getPharmacyDashboard, prescribeMedication } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PharmacyScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [doctorRole, setDoctorRole] = useState('Médico C');
    const [prescribing, setPrescribing] = useState(false);
    const [page, setPage] = useState(1);
    const [medications, setMedications] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [totalMedications, setTotalMedications] = useState(0);
    const [criticalPatients, setCriticalPatients] = useState([]);
    const [normalPatients, setNormalPatients] = useState([]);
    const [originCounts, setOriginCounts] = useState({});
    const [prescriptions, setPrescriptions] = useState([]);
    const [stats, setStats] = useState({});
    const flatListRef = useRef(null);

    const loadData = useCallback(async (pageNum = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            const response = await getPharmacyDashboard({
                page: pageNum,
                per_page: 20
            });
            
            if (response.success && response.data) {
                const newMedications = response.data.medications || [];
                const meta = response.data.medications_meta || {};
                
                if (isLoadMore) {
                    setMedications(prev => [...prev, ...newMedications]);
                } else {
                    setMedications(newMedications);
                    setTotalMedications(meta.total || 0);
                    setCriticalPatients(response.data.critical_patients || []);
                    setNormalPatients(response.data.normal_patients || []);
                    setOriginCounts(response.data.origin_counts || {});
                    setPrescriptions(response.data.prescriptions || []);
                    setStats(response.data.stats || {});
                }
                
                setHasMore(pageNum < (meta.last_page || 1));
                setPage(pageNum);
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar la farmacia');
            }
        } catch (error) {
            console.error('Error loading pharmacy:', error);
            Alert.alert('Error', 'No se pudo cargar la farmacia');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadData(1, false);
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData(1, false);
        setRefreshing(false);
    }, [loadData]);

    const loadMore = useCallback(() => {
        if (hasMore && !loadingMore && !loading) {
            loadData(page + 1, true);
        }
    }, [hasMore, loadingMore, loading, page, loadData]);

    const handlePrescribe = useCallback(async () => {
        if (!selectedPatient || !selectedMedication) {
            Alert.alert('Error', 'Selecciona un paciente y un medicamento');
            return;
        }

        setPrescribing(true);
        try {
            const response = await prescribeMedication({
                medication_id: selectedMedication.id,
                patient_id: selectedPatient.id,
                doctor_role: doctorRole
            });
            
            if (response.success) {
                Alert.alert(
                    response.data.status === 'Autorizada' ? 'Éxito' : 'Denegado',
                    response.data.message || 'Prescripción procesada'
                );
                setSelectedPatient(null);
                setSelectedMedication(null);
                loadData(1, false);
            } else {
                Alert.alert('Error', response.error || 'Error al prescribir');
            }
        } catch (error) {
            console.error('Error prescribing:', error);
            Alert.alert('Error', 'No se pudo prescribir el medicamento');
        } finally {
            setPrescribing(false);
        }
    }, [selectedPatient, selectedMedication, doctorRole, loadData]);

    const renderMedicationItem = useCallback(({ item }) => {
        const levelColor = item.required_level === 'A' ? '#C7291C' : 
                          item.required_level === 'B' ? '#FF8C42' : '#2D9E6A';
        const isLowStock = item.is_low_stock || item.stock <= (item.min_stock || 10);
        
        return (
            <View style={styles.medicationRow}>
                <Text style={styles.medicationName} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                    <Text style={styles.levelText}>Nivel {item.required_level}</Text>
                </View>
                <Text style={styles.medicationOrigin} numberOfLines={1}>{item.origin}</Text>
                <Text style={[styles.medicationStock, isLowStock && styles.lowStock]}>
                    {item.stock}
                </Text>
            </View>
        );
    }, []);

    const renderFooter = useCallback(() => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={styles.footerText}>Cargando más...</Text>
            </View>
        );
    }, [loadingMore]);

    if (loading && medications.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando farmacia...</Text>
            </View>
        );
    }

    const limitedPrescriptions = prescriptions.slice(0, 5);
    const criticalPatientsLimited = criticalPatients.slice(0, 5);
    const normalPatientsLimited = normalPatients.slice(0, 5);
    const medicationsForSelect = medications.slice(0, 10);

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
            removeClippedSubviews={true}
        >
            {/* Alerta de pacientes críticos */}
            {criticalPatients.length > 0 && (
                <View style={styles.criticalAlert}>
                    <View style={styles.criticalContent}>
                        <FontAwesome5 name="ambulance" size={24} color="#fff" />
                        <View style={styles.criticalTextContainer}>
                            <Text style={styles.criticalTitle}>PRIORIDAD MÁXIMA - URGENCIAS CRÍTICAS</Text>
                            <Text style={styles.criticalSubtitle}>
                                Hay {criticalPatients.length} paciente(s) Triage Rojo.
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Stats rápidos */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.total_medications || 0}</Text>
                    <Text style={styles.statLabel}>Total Medicamentos</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statWarning]}>{stats.low_stock || 0}</Text>
                    <Text style={styles.statLabel}>Stock Bajo</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statDanger]}>{stats.out_of_stock || 0}</Text>
                    <Text style={styles.statLabel}>Agotados</Text>
                </View>
            </View>

            {/* Inventario Segmentado */}
            <View style={styles.originGrid}>
                {['Central', 'Hospitalaria', 'Quirófano', 'Urgencias'].map((origin) => {
                    const count = originCounts[origin] || 0;
                    const color = origin === 'Quirófano' ? '#C7291C' : 
                                 origin === 'Urgencias' ? '#FF8C42' : '#2D9E6A';
                    return (
                        <View key={origin} style={[styles.originCard, { borderTopColor: color }]}>
                            <Text style={styles.originTitle}>{origin}</Text>
                            <Text style={styles.originCount}>{count}</Text>
                            <Text style={styles.originSubtitle}>Medicamentos</Text>
                        </View>
                    );
                })}
            </View>

            {/* Receta Médica */}
            <View style={styles.recetaContainer}>
                <View style={styles.recetaCard}>
                    <Text style={styles.recetaTitle}>Receta Médica</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Actuar como Médico:</Text>
                        <View style={styles.doctorOptions}>
                            {['Médico A', 'Médico B', 'Médico C'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.doctorChip,
                                        doctorRole === role && styles.doctorChipActive
                                    ]}
                                    onPress={() => setDoctorRole(role)}
                                >
                                    <Text style={[
                                        styles.doctorChipText,
                                        doctorRole === role && styles.doctorChipTextActive
                                    ]}>
                                        {role === 'Médico A' ? 'Nivel A' :
                                         role === 'Médico B' ? 'Nivel B' :
                                         'Nivel C'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Paciente:</Text>
                        {criticalPatientsLimited.map((p) => (
                            <TouchableOpacity
                                key={p.id}
                                style={[
                                    styles.patientOption,
                                    selectedPatient?.id === p.id && styles.patientOptionActive
                                ]}
                                onPress={() => setSelectedPatient(p)}
                            >
                                <Text style={styles.patientName} numberOfLines={1}>{p.patient_name}</Text>
                                <View style={[styles.triageBadge, { backgroundColor: '#C7291C' }]}>
                                    <Text style={styles.triageBadgeText}>Rojo</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {normalPatientsLimited.map((p) => (
                            <TouchableOpacity
                                key={p.id}
                                style={[
                                    styles.patientOption,
                                    selectedPatient?.id === p.id && styles.patientOptionActive
                                ]}
                                onPress={() => setSelectedPatient(p)}
                            >
                                <Text style={styles.patientName} numberOfLines={1}>{p.patient_name}</Text>
                                <View style={[styles.triageBadge, { backgroundColor: '#2D9E6A' }]}>
                                    <Text style={styles.triageBadgeText}>{p.triage_level}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {criticalPatients.length === 0 && normalPatients.length === 0 && (
                            <Text style={styles.emptyText}>No hay pacientes</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Medicamento:</Text>
                        {medicationsForSelect.map((med) => {
                            const levelColor = med.required_level === 'A' ? '#C7291C' : 
                                              med.required_level === 'B' ? '#FF8C42' : '#2D9E6A';
                            return (
                                <TouchableOpacity
                                    key={`${med.id}-${med.origin || 'default'}`}
                                    style={[
                                        styles.medicationOption,
                                        selectedMedication?.id === med.id && styles.medicationOptionActive
                                    ]}
                                    onPress={() => setSelectedMedication(med)}
                                >
                                    <View style={styles.medicationOptionContent}>
                                        <Text style={styles.medicationNameSmall} numberOfLines={1}>{med.name}</Text>
                                        <View style={[styles.levelBadgeSmall, { backgroundColor: levelColor }]}>
                                            <Text style={styles.levelTextSmall}>Nivel {med.required_level}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetail}>
                                        Origen: {med.origin} | Stock: {med.stock}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        {medications.length === 0 && (
                            <Text style={styles.emptyText}>No hay medicamentos</Text>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.prescribeButton}
                        onPress={handlePrescribe}
                        disabled={prescribing}
                    >
                        <Text style={styles.prescribeButtonText}>
                            {prescribing ? 'Procesando...' : 'Intentar Prescribir'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.auditCard}>
                    <Text style={styles.recetaTitle}>Validación Reciente</Text>
                    {limitedPrescriptions.length === 0 && (
                        <Text style={styles.emptyText}>Sin prescripciones</Text>
                    )}
                    {limitedPrescriptions.map((item, index) => (
                        <View key={`presc-${index}-${item.id || 'new'}`} style={[
                            styles.prescriptionItem,
                            { borderLeftColor: item.status === 'Denegada' ? '#C7291C' : '#2D9E6A' }
                        ]}>
                            <Text style={styles.prescriptionTime}>
                                {item.created_at ? new Date(item.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </Text>
                            <Text style={styles.prescriptionMedication} numberOfLines={1}>
                                {item.medication_name} para {item.patient_name}
                            </Text>
                            <Text style={[
                                styles.prescriptionStatus,
                                { color: item.status === 'Denegada' ? '#C7291C' : '#2D9E6A' }
                            ]}>
                                {item.status} {item.is_priority ? '(PRIORIDAD ER)' : ''}
                            </Text>
                            {item.denial_reason && (
                                <Text style={styles.prescriptionReason} numberOfLines={1}>
                                    Motivo: {item.denial_reason}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Inventario completo con paginación */}
            <View style={styles.inventoryContainer}>
                <Text style={styles.inventoryTitle}>
                    Inventario ({medications.length} de {totalMedications})
                </Text>
                <View style={styles.inventoryHeader}>
                    <Text style={[styles.headerText, styles.headerName]}>Medicamento</Text>
                    <Text style={[styles.headerText, styles.headerLevel]}>Nivel</Text>
                    <Text style={[styles.headerText, styles.headerOrigin]}>Origen</Text>
                    <Text style={[styles.headerText, styles.headerStock]}>Stock</Text>
                </View>
                <FlatList
                    ref={flatListRef}
                    data={medications}
                    keyExtractor={(item, index) => `${item.id}-${index}-${item.origin || 'default'}`}
                    renderItem={renderMedicationItem}
                    scrollEnabled={false}
                    removeClippedSubviews={true}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    ListFooterComponent={renderFooter}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.1}
                />
                {hasMore && medications.length > 0 && (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore} disabled={loadingMore}>
                        <Text style={styles.loadMoreText}>
                            {loadingMore ? 'Cargando...' : 'Cargar más medicamentos'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

// Los estilos se mantienen igual...
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
    criticalAlert: {
        backgroundColor: '#C7291C',
        margin: spacing[4],
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        ...shadows.md,
    },
    criticalContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    criticalTextContainer: {
        flex: 1,
    },
    criticalTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.white,
    },
    criticalSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.white,
        opacity: 0.9,
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
    statWarning: {
        color: '#FF8C42',
    },
    statDanger: {
        color: '#C7291C',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    originGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[4],
        gap: spacing[3],
        marginBottom: spacing[4],
    },
    originCard: {
        backgroundColor: colors.white,
        padding: spacing[3],
        borderRadius: borderRadius.lg,
        borderTopWidth: 4,
        width: '48%',
        ...shadows.sm,
    },
    originTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: colors.primary,
    },
    originCount: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
        color: colors.primary,
        marginVertical: 2,
    },
    originSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    recetaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[4],
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
    },
    recetaCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        minWidth: 280,
    },
    auditCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        minWidth: 280,
    },
    recetaTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[4],
    },
    inputGroup: {
        marginBottom: spacing[3],
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray700,
        marginBottom: spacing[2],
    },
    doctorOptions: {
        flexDirection: 'row',
        gap: spacing[2],
        flexWrap: 'wrap',
    },
    doctorChip: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.gray300,
        backgroundColor: colors.white,
    },
    doctorChipActive: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },
    doctorChipText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray700,
    },
    doctorChipTextActive: {
        color: colors.white,
    },
    patientOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[2],
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginBottom: spacing[1],
    },
    patientOptionActive: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '10',
    },
    patientName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    triageBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    triageBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.white,
    },
    medicationOption: {
        padding: spacing[2],
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.gray200,
        marginBottom: spacing[1],
    },
    medicationOptionActive: {
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '10',
    },
    medicationOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    levelBadgeSmall: {
        paddingHorizontal: spacing[2],
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
    },
    levelTextSmall: {
        fontSize: 8,
        fontWeight: '700',
        color: colors.white,
    },
    medicationNameSmall: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    medicationDetail: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    prescribeButton: {
        width: '100%',
        backgroundColor: '#1E1A17',
        padding: spacing[3],
        borderRadius: borderRadius.base,
        alignItems: 'center',
        marginTop: spacing[2],
    },
    prescribeButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.base,
        fontWeight: '700',
    },
    prescriptionItem: {
        borderLeftWidth: 3,
        paddingLeft: spacing[3],
        marginBottom: spacing[2],
        paddingBottom: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    prescriptionTime: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    prescriptionMedication: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    prescriptionStatus: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    prescriptionReason: {
        fontSize: typography.fontSize.xs,
        color: '#8C1A11',
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray400,
        textAlign: 'center',
        padding: spacing[2],
    },
    inventoryContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        marginBottom: spacing[4],
    },
    inventoryTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[3],
    },
    inventoryHeader: {
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
    headerName: {
        flex: 2,
    },
    headerLevel: {
        flex: 1,
        textAlign: 'center',
    },
    headerOrigin: {
        flex: 1,
        textAlign: 'center',
    },
    headerStock: {
        flex: 0.8,
        textAlign: 'right',
    },
    medicationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    medicationName: {
        flex: 2,
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    levelBadge: {
        flex: 1,
        paddingHorizontal: spacing[1],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    levelText: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.white,
    },
    medicationOrigin: {
        flex: 1,
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        textAlign: 'center',
    },
    medicationStock: {
        flex: 0.8,
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        textAlign: 'right',
        color: colors.gray700,
    },
    lowStock: {
        color: '#C7291C',
    },
    footerLoader: {
        paddingVertical: spacing[3],
        alignItems: 'center',
    },
    footerText: {
        marginTop: spacing[1],
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    loadMoreButton: {
        paddingVertical: spacing[3],
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    loadMoreText: {
        fontSize: typography.fontSize.sm,
        color: colors.secondary,
        fontWeight: '600',
    },
});