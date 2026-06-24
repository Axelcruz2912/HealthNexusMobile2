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
    TextInput,
    Modal,
    Dimensions
} from 'react-native';
import { getFinanzasDashboard, verifyFinancePin } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function FinanzasScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [enteredPin, setEnteredPin] = useState(null);
    const [activeTab, setActiveTab] = useState('resumen');

    const tabs = [
        { key: 'resumen', label: 'Resumen', icon: 'chart-pie' },
        { key: 'facturas', label: 'Facturas', icon: 'file-invoice' },
        { key: 'seguros', label: 'Seguros', icon: 'shield-alt' },
        { key: 'fraude', label: 'Fraude', icon: 'exclamation-triangle' },
        { key: 'costos', label: 'Costos', icon: 'coins' },
        { key: 'aprobaciones', label: 'Aprobaciones', icon: 'check-double' },
    ];

    const loadData = async (pinCode = null) => {
        try {
            setLoading(true);
            const response = await getFinanzasDashboard(pinCode);
            
            if (response.success && response.data) {
                setData(response.data);
                if (pinCode) setEnteredPin(pinCode);
            } else if (response.requires_pin) {
                setPinModalVisible(true);
            } else {
                Alert.alert('Error', 'No se pudo cargar el centro financiero');
            }
        } catch (error) {
            console.error('Error loading finanzas:', error);
            if (error.response?.data?.requires_pin) {
                setPinModalVisible(true);
            } else {
                Alert.alert('Error', error.response?.data?.message || 'No se pudo cargar el centro financiero');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData(enteredPin);
        setRefreshing(false);
    }, [enteredPin]);

    const handleVerifyPin = async () => {
        if (!pin || pin.length < 4) {
            setPinError('Ingresa un PIN de 4 dígitos');
            return;
        }

        setVerifying(true);
        setPinError('');
        try {
            const response = await verifyFinancePin(pin);
            if (response.success) {
                setPinModalVisible(false);
                setPin('');
                await loadData(pin);
            } else {
                setPinError(response.error || 'PIN incorrecto');
            }
        } catch (error) {
            setPinError(error.response?.data?.error || 'Error al verificar el PIN');
        } finally {
            setVerifying(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '$0';
        return '$' + Number(value).toLocaleString('es-MX');
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Pagado': return { label: 'Pagado', color: '#065F46', bg: '#D1FAE5' };
            case 'Pendiente': return { label: 'Pendiente', color: '#C2410C', bg: '#FFEDD5' };
            case 'Seguro': return { label: 'Seguro', color: '#EA580C', bg: '#FFF7ED' };
            case 'Vencido': return { label: 'Vencido', color: '#991B1B', bg: '#FEE2E2' };
            default: return { label: status, color: '#78716C', bg: '#F5F5F4' };
        }
    };

    const renderTab = (tab) => {
        const isActive = activeTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
            >
                <FontAwesome5 name={tab.icon} size={12} color={isActive ? '#E85D3A' : colors.gray500} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
        );
    };

    const renderResumen = () => {
        const ingresosPorArea = data?.ingresos_por_area || {};
        const ingresosDiarios = data?.ingresos_diarios || [];
        const segurosPorProveedor = data?.seguros_por_proveedor || [];
        const alertasSeguros = data?.alertas_seguros || {};
        const topConceptos = data?.top_conceptos || [];

        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="chart-pie" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Ingresos por Área</Text>
                    </View>
                    <View style={styles.areaGrid}>
                        <View style={styles.areaItem}>
                            <Text style={styles.areaLabel}>Urgencias</Text>
                            <Text style={styles.areaValue}>{formatCurrency(ingresosPorArea.urgencias)}</Text>
                        </View>
                        <View style={styles.areaItem}>
                            <Text style={styles.areaLabel}>Cirugías</Text>
                            <Text style={styles.areaValue}>{formatCurrency(ingresosPorArea.cirugia)}</Text>
                        </View>
                        <View style={styles.areaItem}>
                            <Text style={styles.areaLabel}>Hospitalización</Text>
                            <Text style={styles.areaValue}>{formatCurrency(ingresosPorArea.hospitalizacion)}</Text>
                        </View>
                        <View style={styles.areaItem}>
                            <Text style={styles.areaLabel}>Farmacia</Text>
                            <Text style={styles.areaValue}>{formatCurrency(ingresosPorArea.farmacia)}</Text>
                        </View>
                        <View style={styles.areaItem}>
                            <Text style={styles.areaLabel}>Estudios</Text>
                            <Text style={styles.areaValue}>{formatCurrency(ingresosPorArea.estudios)}</Text>
                        </View>
                        <View style={styles.areaItem}>
                            <Text style={styles.areaLabel}>UCI</Text>
                            <Text style={styles.areaValue}>{formatCurrency(ingresosPorArea.uci)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="calendar-day" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Ingresos Últimos 7 Días</Text>
                    </View>
                    {ingresosDiarios.length > 0 ? (
                        ingresosDiarios.map((item, index) => (
                            <View key={index} style={styles.dailyItem}>
                                <Text style={styles.dailyLabel}>{item.fecha}</Text>
                                <Text style={styles.dailyQty}>{item.qty} facturas</Text>
                                <Text style={styles.dailyTotal}>{formatCurrency(item.total)}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Sin datos</Text>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="building" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Seguros por Proveedor</Text>
                    </View>
                    {segurosPorProveedor.length > 0 ? (
                        segurosPorProveedor.map((item, index) => (
                            <View key={index} style={styles.providerItem}>
                                <Text style={styles.providerName}>{item.provider}</Text>
                                <Text style={styles.providerTotal}>Total: {item.total}</Text>
                                <Text style={styles.providerVigentes}>Vigentes: {item.vigentes}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Sin datos</Text>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="bell" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Alertas de Seguros</Text>
                    </View>
                    <View style={styles.alertGrid}>
                        <View style={[styles.alertCard, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={[styles.alertValue, { color: '#DC2626' }]}>{alertasSeguros.polizas_falsas || 0}</Text>
                            <Text style={styles.alertLabel}>Pólizas Falsas</Text>
                        </View>
                        <View style={[styles.alertCard, { backgroundColor: '#FFEDD5' }]}>
                            <Text style={[styles.alertValue, { color: '#C2410C' }]}>{alertasSeguros.sin_cobertura || 0}</Text>
                            <Text style={styles.alertLabel}>Sin Cobertura</Text>
                        </View>
                        <View style={[styles.alertCard, { backgroundColor: '#FEF3C7' }]}>
                            <Text style={[styles.alertValue, { color: '#92400E' }]}>{alertasSeguros.seguros_vencidos || 0}</Text>
                            <Text style={styles.alertLabel}>Vencidos</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="star" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Top Conceptos por Costo</Text>
                    </View>
                    {topConceptos.length > 0 ? (
                        topConceptos.map((item, index) => (
                            <View key={index} style={styles.topItem}>
                                <Text style={styles.topName}>{item.concept}</Text>
                                <Text style={styles.topQty}>{item.qty} facturas</Text>
                                <Text style={styles.topTotal}>{formatCurrency(item.total)}</Text>
                                <View style={styles.topBarTrack}>
                                    <View style={[styles.topBarFill, { width: `${Math.min((item.total / (data?.kpis?.total || 1)) * 100, 100)}%` }]} />
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Sin datos</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderFacturas = () => {
        const invoices = data?.invoices || [];
        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="file-invoice" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Todas las Facturas</Text>
                    </View>
                    {invoices.length > 0 ? (
                        invoices.map((inv, index) => {
                            const status = getStatusBadge(inv.status);
                            return (
                                <View key={index} style={styles.invoiceItem}>
                                    <View style={styles.invoiceLeft}>
                                        <Text style={styles.invoicePatient}>{inv.patient_name}</Text>
                                        <Text style={styles.invoiceConcept}>{inv.concept}</Text>
                                    </View>
                                    <View style={styles.invoiceRight}>
                                        <Text style={styles.invoiceAmount}>{formatCurrency(inv.amount)}</Text>
                                        <View style={[styles.invoiceBadge, { backgroundColor: status.bg }]}>
                                            <Text style={[styles.invoiceBadgeText, { color: status.color }]}>{status.label}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={styles.emptyText}>No hay facturas</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderSeguros = () => {
        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="shield-alt" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Seguros / Pólizas</Text>
                    </View>
                    <Text style={styles.emptyText}>Módulo en desarrollo</Text>
                </View>
            </View>
        );
    };

    const renderFraude = () => {
        const pacientesDeuda = data?.pacientes_deuda || [];

        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="copy" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Pacientes con Deuda</Text>
                    </View>
                    {pacientesDeuda.length > 0 ? (
                        pacientesDeuda.map((item, index) => (
                            <View key={index} style={styles.fraudeItem}>
                                <Text style={styles.fraudeName}>{item.patient_name}</Text>
                                <Text style={[styles.fraudeAmount, { color: '#DC2626' }]}>{formatCurrency(item.deuda)}</Text>
                                <Text style={styles.fraudeQty}>{item.facturas} facturas</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Sin pacientes con deuda</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderCostos = () => {
        const farmaciaCostosa = data?.farmacia_costosa || [];
        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="pills" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Medicamentos Costosos</Text>
                    </View>
                    {farmaciaCostosa.length > 0 ? (
                        farmaciaCostosa.map((item, index) => (
                            <View key={index} style={styles.costoItem}>
                                <Text style={styles.costoName}>{item.name}</Text>
                                <Text style={styles.costoPrice}>{formatCurrency(item.price)}</Text>
                                <Text style={styles.costoStock}>Stock: {item.stock}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Sin medicamentos costosos</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderAprobaciones = () => {
        const aprobaciones = data?.aprobaciones || {};
        const alertasSeguros = data?.alertas_seguros || {};
        const kpis = data?.kpis || {};

        return (
            <View style={styles.tabContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="stamp" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Aprobaciones Pendientes</Text>
                    </View>
                    <View style={styles.aprobacionGrid}>
                        <View style={[styles.aprobacionCard, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={[styles.aprobacionValue, { color: '#DC2626' }]}>{aprobaciones.cirugias_costosas || 0}</Text>
                            <Text style={styles.aprobacionLabel}>Cirugías Costosas</Text>
                            <Text style={styles.aprobacionSubtext}>Pendientes &gt; $20,000</Text>
                        </View>
                        <View style={[styles.aprobacionCard, { backgroundColor: '#FFEDD5' }]}>
                            <Text style={[styles.aprobacionValue, { color: '#EA580C' }]}>{aprobaciones.meds_caros || 0}</Text>
                            <Text style={styles.aprobacionLabel}>Medicamentos Caros</Text>
                            <Text style={styles.aprobacionSubtext}>Pendientes &gt; $500</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="list-check" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Acciones Requeridas</Text>
                    </View>
                    {aprobaciones.cirugias_costosas > 0 && (
                        <View style={styles.actionItem}>
                            <FontAwesome5 name="scissors" size={14} color="#DC2626" />
                            <Text style={styles.actionText}>
                                <Text style={styles.actionStrong}>{aprobaciones.cirugias_costosas} cirugías</Text> requieren autorización por monto superior a $20,000
                            </Text>
                        </View>
                    )}
                    {aprobaciones.meds_caros > 0 && (
                        <View style={styles.actionItem}>
                            <FontAwesome5 name="pills" size={14} color="#EA580C" />
                            <Text style={styles.actionText}>
                                <Text style={styles.actionStrong}>{aprobaciones.meds_caros} recetas</Text> con medicamentos de alto costo pendientes
                            </Text>
                        </View>
                    )}
                    {alertasSeguros.polizas_falsas > 0 && (
                        <View style={styles.actionItem}>
                            <FontAwesome5 name="shield-alt" size={14} color="#DC2626" />
                            <Text style={styles.actionText}>
                                <Text style={styles.actionStrong}>{alertasSeguros.polizas_falsas} pólizas</Text> marcadas como fraude requieren investigación
                            </Text>
                        </View>
                    )}
                    {kpis.vencido > 0 && (
                        <View style={styles.actionItem}>
                            <FontAwesome5 name="clock" size={14} color="#92400E" />
                            <Text style={styles.actionText}>
                                <Text style={styles.actionStrong}>{formatCurrency(kpis.vencido)}</Text> en facturas vencidas requieren seguimiento
                            </Text>
                        </View>
                    )}
                    {aprobaciones.cirugias_costosas === 0 && aprobaciones.meds_caros === 0 && alertasSeguros.polizas_falsas === 0 && kpis.vencido === 0 && (
                        <Text style={styles.emptyText}>No hay acciones requeridas</Text>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando centro financiero...</Text>
            </View>
        );
    }

    const kpis = data?.kpis || {};
    const riskScore = data?.risk_score || 'ESTABLE';
    const riskColor = data?.risk_color || '#065F46';
    const riskBg = data?.risk_bg || '#D1FAE5';

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerIcon}>
                    <FontAwesome5 name="coins" size={24} color={colors.white} />
                </View>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Centro Financiero</Text>
                    <Text style={styles.headerSubtitle}>Gestión de ingresos, facturas y seguros</Text>
                </View>
            </View>

            {/* KPIs */}
            <View style={styles.kpiGrid}>
                <View style={[styles.kpiCard, { borderLeftColor: '#059669' }]}>
                    <Text style={[styles.kpiValue, { color: '#059669' }]}>{formatCurrency(kpis.paid)}</Text>
                    <Text style={styles.kpiLabel}>Cobrado</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#EA580C' }]}>
                    <Text style={[styles.kpiValue, { color: '#EA580C' }]}>{formatCurrency(kpis.pending)}</Text>
                    <Text style={styles.kpiLabel}>Pendiente</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#DC2626' }]}>
                    <Text style={[styles.kpiValue, { color: '#DC2626' }]}>{formatCurrency(kpis.insurance)}</Text>
                    <Text style={styles.kpiLabel}>Seguros</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#F59E0B' }]}>
                    <Text style={[styles.kpiValue, { color: '#F59E0B' }]}>{formatCurrency(kpis.vencido)}</Text>
                    <Text style={styles.kpiLabel}>Vencido</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#E85D3A' }]}>
                    <Text style={[styles.kpiValue, { color: '#E85D3A' }]}>{formatCurrency(kpis.total)}</Text>
                    <Text style={styles.kpiLabel}>Total</Text>
                </View>
                <View style={[styles.kpiCard, { borderLeftColor: '#FB923C' }]}>
                    <Text style={[styles.kpiValue, { color: '#FB923C' }]}>{formatCurrency(kpis.pharma_value)}</Text>
                    <Text style={styles.kpiLabel}>Farmacia</Text>
                </View>
            </View>

            {/* Riesgo */}
            <View style={styles.riskContainer}>
                <Text style={styles.riskTitle}>Riesgo Financiero</Text>
                <View style={[styles.riskBadge, { backgroundColor: riskBg }]}>
                    <FontAwesome5 name="exclamation-circle" size={14} color={riskColor} />
                    <Text style={[styles.riskText, { color: riskColor }]}>{riskScore}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                {tabs.map(tab => renderTab(tab))}
            </View>

            {/* Tab Content */}
            {activeTab === 'resumen' && renderResumen()}
            {activeTab === 'facturas' && renderFacturas()}
            {activeTab === 'seguros' && renderSeguros()}
            {activeTab === 'fraude' && renderFraude()}
            {activeTab === 'costos' && renderCostos()}
            {activeTab === 'aprobaciones' && renderAprobaciones()}

            {/* Modal PIN */}
            <Modal
                visible={pinModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {}}
            >
                <View style={styles.pinModalOverlay}>
                    <View style={styles.pinModalContent}>
                        <FontAwesome5 name="lock" size={40} color={colors.secondary} />
                        <Text style={styles.pinModalTitle}>Verificación Financiera</Text>
                        <Text style={styles.pinModalSubtitle}>Ingresa tu PIN para acceder al módulo de finanzas (1111 por defecto)</Text>
                        
                        <TextInput
                            style={styles.pinInput}
                            placeholder="PIN de 4 dígitos"
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={4}
                            value={pin}
                            onChangeText={setPin}
                            onSubmitEditing={handleVerifyPin}
                        />
                        
                        {pinError ? (
                            <Text style={styles.pinError}>{pinError}</Text>
                        ) : null}
                        
                        <TouchableOpacity 
                            style={styles.pinButton}
                            onPress={handleVerifyPin}
                            disabled={verifying}
                        >
                            <Text style={styles.pinButtonText}>
                                {verifying ? 'Verificando...' : 'Verificar PIN'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#E85D3A',
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
        width: '31%',
        marginBottom: spacing[1],
        ...shadows.sm,
        alignItems: 'center',
    },
    kpiValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        marginTop: 2,
    },
    kpiLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        fontWeight: '600',
        marginTop: 1,
    },
    riskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
        gap: spacing[2],
    },
    riskTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.gray600,
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.sm,
        gap: spacing[1],
    },
    riskText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
    },
    tabBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing[4],
        marginBottom: spacing[4],
        gap: spacing[1],
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.sm,
        gap: spacing[1],
        backgroundColor: colors.gray100,
    },
    tabActive: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    tabText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.gray600,
    },
    tabTextActive: {
        color: '#E85D3A',
    },
    tabContent: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
        gap: spacing[4],
    },
    card: {
        backgroundColor: colors.white,
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    cardTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
    },
    areaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    areaItem: {
        width: '48%',
        padding: spacing[2],
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.sm,
    },
    areaLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    areaValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    dailyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    dailyLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    dailyQty: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    dailyTotal: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    providerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    providerName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    providerTotal: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    providerVigentes: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: '#059669',
    },
    alertGrid: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    alertCard: {
        flex: 1,
        padding: spacing[2],
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    alertValue: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
    },
    alertLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
        fontWeight: '700',
    },
    topItem: {
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    topName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    topQty: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    topTotal: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
        marginTop: 2,
    },
    topBarTrack: {
        height: 4,
        backgroundColor: colors.gray200,
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 4,
    },
    topBarFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: 'linear-gradient(to right, #E85D3A, #FB923C)',
    },
    invoiceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    invoiceLeft: {
        flex: 1,
    },
    invoicePatient: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
    },
    invoiceConcept: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    invoiceRight: {
        alignItems: 'flex-end',
    },
    invoiceAmount: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    invoiceBadge: {
        paddingHorizontal: spacing[2],
        paddingVertical: 1,
        borderRadius: borderRadius.sm,
        marginTop: 2,
    },
    invoiceBadgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    fraudeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    fraudeName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    fraudeConcept: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    fraudeAmount: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    fraudeQty: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
        color: '#DC2626',
    },
    costoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    costoName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    costoPrice: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    costoStock: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    aprobacionGrid: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    aprobacionCard: {
        flex: 1,
        padding: spacing[3],
        borderRadius: borderRadius.sm,
        alignItems: 'center',
    },
    aprobacionValue: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: '800',
    },
    aprobacionLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray600,
    },
    aprobacionSubtext: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        marginTop: 2,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[2],
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.sm,
        marginBottom: spacing[2],
        gap: spacing[2],
    },
    actionText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        flex: 1,
    },
    actionStrong: {
        fontWeight: '700',
        color: colors.primary,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.gray400,
        padding: spacing[3],
    },
    pinModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinModalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing[6],
        width: '85%',
        alignItems: 'center',
        ...shadows.lg,
    },
    pinModalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.primary,
        marginTop: spacing[3],
    },
    pinModalSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        textAlign: 'center',
        marginTop: spacing[1],
        marginBottom: spacing[4],
    },
    pinInput: {
        width: '100%',
        borderWidth: 2,
        borderColor: colors.gray300,
        borderRadius: borderRadius.base,
        padding: spacing[3],
        fontSize: typography.fontSize.xl,
        textAlign: 'center',
        letterSpacing: 8,
        backgroundColor: colors.gray50,
    },
    pinError: {
        color: '#DC2626',
        fontSize: typography.fontSize.sm,
        marginTop: spacing[2],
    },
    pinButton: {
        width: '100%',
        backgroundColor: colors.secondary,
        padding: spacing[3],
        borderRadius: borderRadius.base,
        alignItems: 'center',
        marginTop: spacing[4],
    },
    pinButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.base,
        fontWeight: '700',
    },
});