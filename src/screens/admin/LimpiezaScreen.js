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
    Dimensions
} from 'react-native';
import { cleanData, getCleanResult } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LimpiezaScreen() {
    const [result, setResult] = useState(null);
    const [hasResult, setHasResult] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);

    const loadResult = async () => {
        try {
            setLoading(true);
            const response = await getCleanResult();
            
            if (response.success && response.data) {
                setResult(response.data.result);
                setHasResult(response.data.has_result || false);
            }
        } catch (error) {
            console.error('Error loading result:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResult();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadResult();
        setRefreshing(false);
    }, []);

    const handleClean = async (action, title) => {
        Alert.alert(
            'Confirmar',
            `¿Estás seguro de ejecutar "${title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Ejecutar',
                    onPress: async () => {
                        setExecuting(true);
                        try {
                            const response = await cleanData(action);
                            if (response.success) {
                                Alert.alert('Éxito', 'Limpieza ejecutada correctamente');
                                setResult(response.data.result);
                                setHasResult(true);
                            } else {
                                Alert.alert('Error', response.error || 'Error al ejecutar la limpieza');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo ejecutar la limpieza');
                        } finally {
                            setExecuting(false);
                        }
                    }
                }
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerIcon}>
                <FontAwesome5 name="broom" size={24} color={colors.white} />
            </View>
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Motor de Calidad de Datos</Text>
                <Text style={styles.headerSubtitle}>
                    Estandarización, validación y limpieza de la base de datos hospitalaria
                </Text>
            </View>
        </View>
    );

    const renderCleanCard = (item) => (
        <View style={[styles.card, { borderTopColor: item.color }]}>
            <View style={styles.cardHeader}>
                <FontAwesome5 name={item.icon} size={20} color={item.color} />
                <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <TouchableOpacity 
                style={[styles.executeButton, executing && styles.executeButtonDisabled]}
                onPress={() => handleClean(item.action, item.title)}
                disabled={executing}
                activeOpacity={0.7}
            >
                <Text style={styles.executeButtonText}>
                    {executing ? 'Ejecutando...' : item.buttonText}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderResultSection = () => (
        <View style={[styles.card, styles.resultCard]}>
            <View style={styles.cardHeader}>
                <FontAwesome5 name="terminal" size={20} color="#1E1A17" />
                <Text style={styles.cardTitle}>Resultado del Motor</Text>
            </View>
            {hasResult && result ? (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            ) : (
                <View style={styles.emptyResult}>
                    <FontAwesome5 name="broom" size={32} color={colors.gray300} />
                    <Text style={styles.emptyResultText}>
                        Esperando instrucciones de limpieza...
                    </Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando limpieza...</Text>
            </View>
        );
    }

    const cleanOptions = [
        {
            title: 'Estandarización de Texto',
            description: 'Convierte nombres, CURPs y RFCs a mayúsculas y elimina espacios dobles.',
            action: 'uppercase',
            icon: 'font',
            color: '#F05A4E',
            buttonText: 'Ejecutar Estandarización'
        },
        {
            title: 'Validación de Documentos',
            description: 'Busca CURPs/RFCs con formatos inválidos o registros sin documentos subidos.',
            action: 'validate_docs',
            icon: 'search',
            color: '#FF8C42',
            buttonText: 'Iniciar Validación'
        },
        {
            title: 'Eliminación de Duplicados',
            description: 'Detecta pacientes o empleados con el mismo RFC/CURP en la base de datos.',
            action: 'duplicates',
            icon: 'clone',
            color: '#2D9E6A',
            buttonText: 'Buscar Duplicados'
        }
    ];

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
            showsVerticalScrollIndicator={false}
        >
            {renderHeader()}
            
            <View style={styles.grid}>
                {cleanOptions.map((item, index) => (
                    <View key={index} style={styles.gridItem}>
                        {renderCleanCard(item)}
                    </View>
                ))}
            </View>
            
            {renderResultSection()}
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
        backgroundColor: '#1E1A17',
        padding: spacing[5],
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing[3],
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
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
        opacity: 0.8,
        flexShrink: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing[4],
        gap: spacing[4],
    },
    gridItem: {
        width: (width - spacing[4] * 2 - spacing[4]) / 2,
    },
    card: {
        backgroundColor: colors.white,
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        borderTopWidth: 4,
        ...shadows.sm,
        minHeight: 180,
    },
    resultCard: {
        marginHorizontal: spacing[4],
        marginBottom: spacing[4],
        borderTopColor: '#1E1A17',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    cardTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
    },
    cardDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        marginBottom: spacing[4],
        minHeight: 50,
    },
    executeButton: {
        backgroundColor: '#1E1A17',
        padding: spacing[3],
        borderRadius: borderRadius.base,
        alignItems: 'center',
        marginTop: 'auto',
    },
    executeButtonDisabled: {
        opacity: 0.6,
    },
    executeButtonText: {
        color: colors.white,
        fontWeight: '700',
        fontSize: typography.fontSize.sm,
    },
    resultContainer: {
        backgroundColor: '#F4F6F8',
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.base,
        padding: spacing[3],
        maxHeight: 150,
        overflow: 'hidden',
    },
    resultText: {
        fontFamily: 'monospace',
        fontSize: typography.fontSize.sm,
        color: '#2D9E6A',
        lineHeight: 22,
    },
    emptyResult: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[5],
        gap: spacing[2],
    },
    emptyResultText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
        textAlign: 'center',
    },
});