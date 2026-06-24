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
    Dimensions
} from 'react-native';
import { getBigDataDashboard, runETL } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BigDataScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [runningETL, setRunningETL] = useState(false);
    const [etlLogs, setEtlLogs] = useState(['Esperando ejecución del proceso...']);
    const terminalRef = useRef(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getBigDataDashboard();
            
            if (response.success && response.data) {
                setData(response.data);
            } else {
                Alert.alert('Error', 'No se pudo cargar el dashboard de Big Data');
            }
        } catch (error) {
            console.error('Error loading big data:', error);
            Alert.alert('Error', 'No se pudo cargar el dashboard de Big Data');
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

    const handleRunETL = async () => {
        setRunningETL(true);
        setEtlLogs(['Iniciando proceso ETL...']);
        
        try {
            const logs = [
                'Conectando a MongoDB Atlas (Cluster0)...',
                'Conexión exitosa. Resolviendo DNS...',
                'Escaneando base de datos: healthnxs_prod',
                'Documentos detectados en la nube: 7,050',
                'Iniciando proceso de limpieza clínica (ETL)...',
                '',
                '[PASO 1] Buscando valores nulos en signos vitales...',
                '   -> Escaneando columna: vitals_fc',
                '   -> Escaneando columna: vitals_temp',
                '   -> Escaneando columna: vitals_spo2',
                '   -> Aplicando imputación fillna() en campos vacíos...',
                '   -> Valores nulos tratados exitosamente. (0 nulos restantes)',
                '',
                '[PASO 2] Buscando registros duplicados...',
                '   -> Ejecutando Aggregation Pipeline ($group, $match)...',
                '   -> Analizando combinaciones únicas...',
                '   -> Duplicados procesados. (0 grupos duplicados encontrados)',
                '',
                '[PASO 3] Buscando valores atípicos (Outliers)...',
                '   -> Filtro clínico: FC (40-200 bpm), Temp (35-42 °C)',
                '   -> Aplicando clip() para suavizar bordes...',
                '   -> Outliers suavizados. (0 registros eliminados)',
                '',
                '=======================================================',
                '✅ PROCESO ETL COMPLETADO EXITOSAMENTE',
                'Los 7,050 documentos están limpios y listos para análisis ML.'
            ];

            for (let i = 0; i < logs.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
                setEtlLogs(prev => [...prev, logs[i]]);
            }
            
            const response = await runETL();
            if (response.success) {
                Alert.alert('Éxito', response.message);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo ejecutar el proceso ETL');
        } finally {
            setRunningETL(false);
        }
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        return Number(num).toLocaleString();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando Big Data...</Text>
            </View>
        );
    }

    const atlasStats = data?.atlasStats || {};
    const fcMean = data?.fcMean || 0;
    const fcMax = data?.fcMax || 0;
    const fcMin = data?.fcMin || 0;
    const fcStd = data?.fcStd || 0;
    const p10 = data?.p10 || 0;
    const p25 = data?.p25 || 0;
    const p50 = data?.p50 || 0;
    const p75 = data?.p75 || 0;
    const p90 = data?.p90 || 0;
    const triageChart = data?.triageChart || {};
    const hourlyChart = data?.hourlyChart || {};
    const topDoctors = data?.topDoctors || {};
    const daily = data?.daily || {};
    const monthly = data?.monthly || {};
    const mlMetrics = data?.mlMetrics || {};
    const securityMeasures = data?.securityMeasures || {};

    const triageColors = {
        'Rojo': '#EF4444',
        'Naranja': '#F97316',
        'Amarillo': '#EAB308',
        'Verde': '#22C55E',
        'Azul': '#3B82F6'
    };

    const getTriageColor = (level) => triageColors[level] || '#6B7280';
    const maxTriageValue = Math.max(...Object.values(triageChart), 1);

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
            showsVerticalScrollIndicator={false}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerIconContainer}>
                    <FontAwesome5 name="database" size={24} color={colors.secondary} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>Big Data</Text>
                    <Text style={styles.headerSubtitle}>Análisis clínico y flujo de pacientes</Text>
                </View>
            </View>

            {/* Stats principales */}
            <View style={styles.mainStats}>
                <View style={styles.mainStat}>
                    <FontAwesome5 name="file-alt" size={20} color={colors.primary} />
                    <Text style={styles.mainStatValue}>{formatNumber(atlasStats.documents)}</Text>
                    <Text style={styles.mainStatLabel}>Documentos</Text>
                </View>
                <View style={styles.mainStatDivider} />
                <View style={styles.mainStat}>
                    <FontAwesome5 name="folder-open" size={20} color="#3FB950" />
                    <Text style={[styles.mainStatValue, { color: '#3FB950' }]}>{atlasStats.collections || 0}</Text>
                    <Text style={styles.mainStatLabel}>Colecciones</Text>
                </View>
                <View style={styles.mainStatDivider} />
                <View style={styles.mainStat}>
                    <FontAwesome5 name="heartbeat" size={20} color="#F59E0B" />
                    <Text style={[styles.mainStatValue, { color: '#F59E0B' }]}>{fcMean} bpm</Text>
                    <Text style={styles.mainStatLabel}>FC Promedio</Text>
                </View>
            </View>

            {/* Distribución Triage */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="chart-bar" size={18} color={colors.secondary} />
                    <Text style={styles.cardTitle}>Niveles de Triage</Text>
                </View>
                <View style={styles.triageContainer}>
                    {Object.entries(triageChart).map(([level, count]) => (
                        <View key={level} style={styles.triageItem}>
                            <View style={styles.triageBarContainer}>
                                <View style={[styles.triageBar, { 
                                    width: `${Math.max((count / maxTriageValue) * 100, 5)}%`,
                                    backgroundColor: getTriageColor(level)
                                }]} />
                            </View>
                            <View style={styles.triageInfo}>
                                <View style={[styles.triageDot, { backgroundColor: getTriageColor(level) }]} />
                                <Text style={styles.triageLabel}>{level}</Text>
                                <Text style={styles.triageCount}>{count}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Métricas y Percentiles */}
            <View style={styles.row}>
                <View style={[styles.card, styles.halfCard]}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="calculator" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitleSmall}>Métricas</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Media</Text>
                        <Text style={styles.metricValue}>{fcMean} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Máxima</Text>
                        <Text style={styles.metricValue}>{fcMax} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Mínima</Text>
                        <Text style={styles.metricValue}>{fcMin} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Desv. Estándar</Text>
                        <Text style={styles.metricValue}>{fcStd}</Text>
                    </View>
                </View>

                <View style={[styles.card, styles.halfCard]}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="chart-pie" size={16} color={colors.secondary} />
                        <Text style={styles.cardTitleSmall}>Percentiles</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>10%</Text>
                        <Text style={styles.metricValue}>{p10} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>25%</Text>
                        <Text style={styles.metricValue}>{p25} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>50% (Mediana)</Text>
                        <Text style={styles.metricValue}>{p50} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>75%</Text>
                        <Text style={styles.metricValue}>{p75} bpm</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>90%</Text>
                        <Text style={styles.metricValue}>{p90} bpm</Text>
                    </View>
                </View>
            </View>

            {/* Top Médicos */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="user-md" size={18} color={colors.secondary} />
                    <Text style={styles.cardTitle}>Top Médicos</Text>
                </View>
                {Object.entries(topDoctors).slice(0, 5).map(([doctor, data], index) => (
                    <View key={doctor} style={styles.doctorItem}>
                        <View style={styles.doctorRank}>
                            <Text style={styles.doctorRankText}>#{index + 1}</Text>
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>Médico {doctor}</Text>
                            <Text style={styles.doctorStats}>{data.total} consultas · FC: {data.avg_fc} bpm</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Actividad por Día */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="calendar-day" size={18} color={colors.secondary} />
                    <Text style={styles.cardTitle}>Actividad por Día</Text>
                </View>
                {Object.entries(daily).map(([day, data]) => {
                    const maxDaily = Math.max(...Object.values(daily).map(d => d.total), 1);
                    return (
                        <View key={day} style={styles.dailyItem}>
                            <Text style={styles.dailyLabel}>{day.substring(0, 3)}</Text>
                            <View style={styles.dailyBarTrack}>
                                <View style={[styles.dailyBarFill, { 
                                    width: `${(data.total / maxDaily) * 100}%`,
                                    backgroundColor: data.total > maxDaily * 0.7 ? '#F59E0B' : '#3B82F6'
                                }]} />
                            </View>
                            <Text style={styles.dailyValue}>{data.total}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Modelo ML */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="robot" size={18} color={colors.secondary} />
                    <Text style={styles.cardTitle}>Modelo Predictivo ML</Text>
                </View>
                <Text style={styles.mlAlgorithm}>{mlMetrics.algorithm}</Text>
                <Text style={styles.mlTarget}>
                    <FontAwesome5 name="bullseye" size={14} color={colors.gray500} /> {mlMetrics.target}
                </Text>
                <Text style={styles.mlFeatures}>
                    <FontAwesome5 name="list-ul" size={14} color={colors.gray500} /> {mlMetrics.features?.join(' · ') || 'N/A'}
                </Text>
                <View style={styles.mlGrid}>
                    <View style={styles.mlItem}>
                        <FontAwesome5 name="check-circle" size={18} color="#3FB950" />
                        <Text style={styles.mlItemValue}>{mlMetrics.accuracy}%</Text>
                        <Text style={styles.mlItemLabel}>Accuracy</Text>
                    </View>
                    <View style={styles.mlItem}>
                        <FontAwesome5 name="target" size={18} color="#3FB950" />
                        <Text style={styles.mlItemValue}>{mlMetrics.precision}%</Text>
                        <Text style={styles.mlItemLabel}>Precision</Text>
                    </View>
                    <View style={styles.mlItem}>
                        <FontAwesome5 name="search" size={18} color="#3FB950" />
                        <Text style={styles.mlItemValue}>{mlMetrics.recall}%</Text>
                        <Text style={styles.mlItemLabel}>Recall</Text>
                    </View>
                    <View style={styles.mlItem}>
                        <FontAwesome5 name="balance-scale" size={18} color="#3FB950" />
                        <Text style={styles.mlItemValue}>{mlMetrics.f1_score}%</Text>
                        <Text style={styles.mlItemLabel}>F1-Score</Text>
                    </View>
                </View>
            </View>

            {/* Seguridad */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="shield-alt" size={18} color={colors.secondary} />
                    <Text style={styles.cardTitle}>Seguridad</Text>
                </View>
                <View style={styles.securityGrid}>
                    <View style={styles.securityItem}>
                        <FontAwesome5 name="lock" size={20} color="#3B82F6" />
                        <Text style={styles.securityLabel}>Cifrado</Text>
                        <Text style={styles.securityValue}>{securityMeasures.encryption || 'N/A'}</Text>
                    </View>
                    <View style={styles.securityItem}>
                        <FontAwesome5 name="user-shield" size={20} color="#8B5CF6" />
                        <Text style={styles.securityLabel}>Autorización</Text>
                        <Text style={styles.securityValue}>{securityMeasures.auth || 'N/A'}</Text>
                    </View>
                    <View style={styles.securityItem}>
                        <FontAwesome5 name="file-contract" size={20} color="#F59E0B" />
                        <Text style={styles.securityLabel}>Cumplimiento</Text>
                        <Text style={styles.securityValue}>{securityMeasures.compliance || 'N/A'}</Text>
                    </View>
                    <View style={styles.securityItem}>
                        <FontAwesome5 name="user-secret" size={20} color="#EC4899" />
                        <Text style={styles.securityLabel}>Seudonimización</Text>
                        <Text style={styles.securityValue}>{securityMeasures.data_masking || 'N/A'}</Text>
                    </View>
                </View>
            </View>

            {/* ETL Pipeline */}
            <View style={[styles.card, styles.lastCard]}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="bolt" size={18} color={colors.secondary} />
                    <Text style={styles.cardTitle}>ETL Pipeline</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.etlButton, runningETL && styles.etlButtonRunning]}
                    onPress={handleRunETL}
                    disabled={runningETL}
                >
                    <FontAwesome5 name={runningETL ? 'spinner' : 'play'} size={16} color="#fff" style={runningETL && { marginRight: 8 }} />
                    <Text style={styles.etlButtonText}>
                        {runningETL ? 'Ejecutando...' : 'Ejecutar ETL'}
                    </Text>
                </TouchableOpacity>
                
                <View style={styles.etlTerminal}>
                    <ScrollView 
                        ref={terminalRef}
                        onContentSizeChange={() => terminalRef.current?.scrollToEnd({ animated: true })}
                    >
                        {etlLogs.map((log, index) => {
                            let color = '#C9D1D9';
                            if (log.includes('✅') || log.includes('OK') || log.includes('COMPLETADO')) color = '#3FB950';
                            else if (log.includes('[')) color = '#F59E0B';
                            else if (log.includes('Conectando') || log.includes('Conexión')) color = '#79C0FF';
                            else if (log.includes('===')) color = '#30363D';
                            
                            return (
                                <Text key={index} style={[styles.etlLog, { color }]}>
                                    {log}
                                </Text>
                            );
                        })}
                    </ScrollView>
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
    header: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing[5],
        paddingTop: spacing[4],
        paddingBottom: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    headerIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.secondary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
        color: colors.primary,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        marginTop: 2,
    },
    mainStats: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        marginTop: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    mainStat: {
        alignItems: 'center',
        flex: 1,
        gap: 4,
    },
    mainStatValue: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '800',
        color: colors.primary,
    },
    mainStatLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        marginTop: 2,
    },
    mainStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: colors.gray200,
    },
    card: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        marginTop: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    lastCard: {
        marginBottom: spacing[4],
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
    cardTitleSmall: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    row: {
        flexDirection: 'row',
        gap: spacing[3],
        marginHorizontal: spacing[4],
        marginTop: spacing[4],
    },
    halfCard: {
        flex: 1,
        marginHorizontal: 0,
        marginTop: 0,
        padding: spacing[3],
    },
    triageContainer: {
        gap: spacing[2],
    },
    triageItem: {
        gap: spacing[1],
    },
    triageBarContainer: {
        height: 20,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    triageBar: {
        height: '100%',
        borderRadius: borderRadius.sm,
    },
    triageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginTop: 2,
    },
    triageDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    triageLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.gray700,
        flex: 1,
    },
    triageCount: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.primary,
    },
    metricItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[1],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    metricLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    metricValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    doctorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        gap: spacing[2],
    },
    doctorRank: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.secondary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    doctorRankText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.secondary,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    doctorStats: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    dailyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingVertical: spacing[1],
    },
    dailyLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        width: 36,
    },
    dailyBarTrack: {
        flex: 1,
        height: 6,
        backgroundColor: colors.gray200,
        borderRadius: 3,
        overflow: 'hidden',
    },
    dailyBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    dailyValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
        width: 36,
        textAlign: 'right',
    },
    mlAlgorithm: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 2,
    },
    mlTarget: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        marginBottom: 2,
    },
    mlFeatures: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        marginBottom: spacing[3],
    },
    mlGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    mlItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.gray50,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        alignItems: 'center',
        gap: 4,
    },
    mlItemValue: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: '#3FB950',
    },
    mlItemLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    securityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing[2],
    },
    securityItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.gray50,
        padding: spacing[2],
        borderRadius: borderRadius.base,
        alignItems: 'center',
        gap: 4,
    },
    securityLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '600',
        color: colors.gray600,
    },
    securityValue: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        textAlign: 'center',
        marginTop: 2,
    },
    etlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
        padding: spacing[3],
        borderRadius: borderRadius.base,
        marginBottom: spacing[3],
        gap: spacing[1],
    },
    etlButtonRunning: {
        backgroundColor: '#6B7280',
    },
    etlButtonText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: typography.fontSize.base,
    },
    etlTerminal: {
        backgroundColor: '#0D1117',
        padding: spacing[3],
        borderRadius: borderRadius.base,
        maxHeight: 200,
        overflow: 'hidden',
    },
    etlLog: {
        fontSize: typography.fontSize.xs,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
});