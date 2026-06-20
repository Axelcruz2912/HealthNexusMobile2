import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Linking
} from 'react-native';
import { getRiskScore } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, MaterialIonicons } from '@expo/vector-icons';

export default function ScoreRiesgoScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadRiskScore = async () => {
        try {
            setLoading(true);
            const response = await getRiskScore();
            
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading risk score:', error);
            Alert.alert('Error', 'No se pudo cargar el score de riesgo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRiskScore();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRiskScore();
        setRefreshing(false);
    };

    const getRiskIcon = (label) => {
        if (label === 'Seguro') return 'shield-check';
        if (label === 'Riesgo Medio') return 'exclamation-triangle';
        return 'skull-crossbones';
    };

    const renderRiskFactor = (factor, index) => (
        <Text key={index} style={styles.riskFactor}>• {factor}</Text>
    );

    const renderUser = ({ item }) => {
        const hasRiskFactors = item.risk_factors && item.risk_factors.length > 0;
        
        return (
            <View style={[styles.card, { backgroundColor: item.risk_bg_color || colors.white }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userRole}>{item.role}</Text>
                    </View>
                    <View style={[styles.riskBadge, { backgroundColor: item.risk_color + '20' }]}>
                        <FontAwesome5 name={getRiskIcon(item.risk_label)} size={14} color={item.risk_color} />
                        <Text style={[styles.riskLabel, { color: item.risk_color }]}>
                            {item.risk_label}
                        </Text>
                    </View>
                </View>

                {/* Barra de progreso de riesgo */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { 
                                    width: `${Math.min(item.risk_score, 100)}%`,
                                    backgroundColor: item.risk_color 
                                }
                            ]} 
                        />
                    </View>
                    <Text style={styles.progressText}>{Math.min(item.risk_score, 100)}%</Text>
                </View>

                {/* Factores de riesgo */}
                {hasRiskFactors ? (
                    <View style={styles.factorsContainer}>
                        <Text style={styles.factorsTitle}>Factores de Riesgo Detectados:</Text>
                        {item.risk_factors.map((factor, index) => renderRiskFactor(factor, index))}
                    </View>
                ) : (
                    <View style={styles.noFactorsContainer}>
                        <FontAwesome5 name="check-circle" size={16} color="#2D9E6A" />
                        <Text style={styles.noFactorsText}>Sin factores de riesgo</Text>
                    </View>
                )}

                {/* Acción correctiva */}
                <View style={styles.actionContainer}>
                    {item.needs_validation ? (
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('Personal')}
                        >
                            <Text style={styles.actionButtonText}>Requiere Validación</Text>
                        </TouchableOpacity>
                    ) : item.account_suspended ? (
                        <Text style={styles.suspendedText}>Cuenta Suspendida</Text>
                    ) : (
                        <Text style={styles.monitoringText}>Monitoreo estándar</Text>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando evaluación de riesgo...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUser}
            contentContainerStyle={styles.list}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
            }
            ListHeaderComponent={
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Evaluación Integral de Riesgo</Text>
                    <Text style={styles.headerSubtitle}>
                        Análisis basado en validaciones, intentos de acceso y comportamiento en el sistema.
                    </Text>
                </View>
            }
            ListEmptyComponent={
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No hay usuarios para evaluar</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: spacing[4],
        backgroundColor: colors.background,
    },
    headerContainer: {
        backgroundColor: colors.white,
        padding: spacing[5],
        borderRadius: borderRadius.lg,
        marginBottom: spacing[4],
        ...shadows.sm,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[2],
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    card: {
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        ...shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[3],
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
    },
    userRole: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
        gap: spacing[1],
    },
    riskLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[3],
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.gray200,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    progressText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray600,
        minWidth: 40,
        textAlign: 'right',
    },
    factorsContainer: {
        marginBottom: spacing[3],
    },
    factorsTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        marginBottom: spacing[1],
    },
    riskFactor: {
        fontSize: typography.fontSize.sm,
        color: '#8C1A11',
        marginBottom: 2,
        paddingLeft: spacing[2],
    },
    noFactorsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    noFactorsText: {
        fontSize: typography.fontSize.sm,
        color: '#2D9E6A',
    },
    actionContainer: {
        marginTop: spacing[2],
        paddingTop: spacing[3],
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    actionButton: {
        backgroundColor: colors.secondary,
        paddingVertical: spacing[2],
        paddingHorizontal: spacing[4],
        borderRadius: borderRadius.base,
        alignSelf: 'flex-start',
    },
    actionButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
    },
    suspendedText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: '#8C1A11',
    },
    monitoringText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
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
        textAlign: 'center',
        color: colors.gray500,
    },
});