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
    Modal
} from 'react-native';
import { getFinanzasDashboard, verifyFinancePin } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function FinanzasScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [financeToken, setFinanceToken] = useState(null);

    const loadData = async (token = null) => {
        try {
            setLoading(true);
            const response = await getFinanzasDashboard(token);
            
            if (response.success && response.data) {
                setData(response.data);
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
        await loadData(financeToken);
        setRefreshing(false);
    }, [financeToken]);

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
                setFinanceToken(response.finance_token);
                await loadData(response.finance_token);
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

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando centro financiero...</Text>
            </View>
        );
    }

    const kpis = data?.kpis || {};
    const ingresosPorArea = data?.ingresos_por_area || {};
    const alertasSeguros = data?.alertas_seguros || {};
    const invoices = data?.invoices || [];
    const riskScore = data?.risk_score || 'ESTABLE';
    const riskColor = data?.risk_color || '#065F46';
    const riskBg = data?.risk_bg || '#D1FAE5';

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        >
            {/* KPIs Principales */}
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
                    <FontAwesome5 name="check-circle" size={14} color={riskColor} />
                    <Text style={[styles.riskText, { color: riskColor }]}>{riskScore}</Text>
                </View>
            </View>

            {/* Ingresos por Área */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Ingresos por Área</Text>
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

            {/* Alertas de Seguros */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Alertas de Seguros</Text>
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

            {/* Últimas Facturas */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Últimas Facturas</Text>
                {invoices.slice(0, 5).map((inv, index) => {
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
                })}
            </View>

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
                        <Text style={styles.pinModalSubtitle}>Ingresa tu PIN para acceder al módulo de finanzas</Text>
                        
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
        width: '31%',
        marginBottom: spacing[1],
        ...shadows.sm,
        alignItems: 'center',
    },
    kpiValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '800',
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
    sectionContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[3],
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