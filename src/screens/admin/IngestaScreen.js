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
    Dimensions,
    FlatList
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadCSV, getCSVPreview } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function IngestaScreen() {
    const [headers, setHeaders] = useState([]);
    const [preview, setPreview] = useState([]);
    const [filename, setFilename] = useState(null);
    const [hasData, setHasData] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const loadPreview = async () => {
        try {
            setLoading(true);
            const response = await getCSVPreview();
            
            console.log('Preview response:', response);
            
            if (response.success && response.data) {
                const data = response.data;
                setHeaders(data.headers || []);
                setPreview(data.preview || []);
                setFilename(data.filename || null);
                setHasData(data.has_data || false);
            } else {
                setHeaders([]);
                setPreview([]);
                setFilename(null);
                setHasData(false);
            }
        } catch (error) {
            console.error('Error loading preview:', error);
            setHeaders([]);
            setPreview([]);
            setFilename(null);
            setHasData(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPreview();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPreview();
        setRefreshing(false);
    }, []);

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/plain', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const asset = result.assets[0];
            
            setUploading(true);
            const response = await uploadCSV({
                uri: asset.uri,
                type: asset.mimeType || 'text/csv',
                name: asset.name || 'archivo.csv'
            });
            
            console.log('Upload response:', response);
            
            if (response.success) {
                Alert.alert('Éxito', 'Archivo procesado correctamente');
                // Cargar previsualización con los datos recibidos
                if (response.data) {
                    setHeaders(response.data.headers || []);
                    setPreview(response.data.preview || []);
                    setFilename(response.data.filename || null);
                    setHasData(true);
                }
                // También recargar desde el servidor
                await loadPreview();
            } else {
                Alert.alert('Error', response.error || 'Error al procesar el archivo');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'No se pudo subir el archivo');
        } finally {
            setUploading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerIcon}>
                <FontAwesome5 name="upload" size={24} color={colors.white} />
            </View>
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Ingesta Masiva de Datos</Text>
                <Text style={styles.headerSubtitle}>
                    Sube archivos CSV para procesar con Pandas/Python y limpiar datos hospitalarios
                </Text>
            </View>
        </View>
    );

    const renderUploadSection = () => (
        <View style={[styles.card, styles.uploadCard]}>
            <Text style={styles.cardTitle}>Cargar Archivo Fuente</Text>
            <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleUpload}
                disabled={uploading}
                activeOpacity={0.7}
            >
                <View style={styles.uploadArea}>
                    <FontAwesome5 name="file-csv" size={40} color={colors.secondary} />
                    <Text style={styles.uploadText}>
                        {uploading ? 'Procesando...' : 'Seleccionar archivo CSV'}
                    </Text>
                    <Text style={styles.uploadSubtext}>
                        Formatos aceptados: CSV, TXT (Separado por comas)
                    </Text>
                </View>
            </TouchableOpacity>
            {uploading && (
                <View style={styles.uploadingIndicator}>
                    <ActivityIndicator size="small" color={colors.secondary} />
                    <Text style={styles.uploadingText}>Subiendo archivo...</Text>
                </View>
            )}
        </View>
    );

    const renderPreviewSection = () => (
        <View style={[styles.card, styles.previewCard]}>
            <View style={styles.previewHeader}>
                <Text style={styles.cardTitle}>Previsualización de Datos</Text>
                {filename && (
                    <View style={styles.filenameBadge}>
                        <FontAwesome5 name="file" size={12} color={colors.white} />
                        <Text style={styles.filenameText}>{filename}</Text>
                    </View>
                )}
            </View>
            
            {hasData && headers.length > 0 && preview.length > 0 ? (
                <View>
                    <View style={styles.previewInfo}>
                        <FontAwesome5 name="check-circle" size={14} color="#2D9E6A" />
                        <Text style={styles.previewInfoText}>
                            Datos leídos correctamente. {preview.length} filas previsualizadas.
                        </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={styles.tableContainer}>
                            {/* Cabeceras */}
                            <View style={styles.tableRow}>
                                {headers.map((header, index) => (
                                    <View key={index} style={[styles.tableCell, styles.tableHeaderCell]}>
                                        <Text style={styles.tableHeaderText}>{header}</Text>
                                    </View>
                                ))}
                            </View>
                            {/* Filas */}
                            {preview.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.tableRow}>
                                    {row.map((cell, cellIndex) => (
                                        <View key={cellIndex} style={styles.tableCell}>
                                            <Text style={styles.tableCellText} numberOfLines={1}>
                                                {cell || '-'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <View style={styles.emptyPreview}>
                    <FontAwesome5 name="database" size={48} color={colors.gray300} />
                    <Text style={styles.emptyPreviewText}>
                        {filename ? 'No se pudieron leer los datos del archivo' : 'Sube un archivo para ver su estructura aquí.'}
                    </Text>
                </View>
            )}
        </View>
    );

    if (loading && !hasData) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando ingesta...</Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
            showsVerticalScrollIndicator={false}
        >
            {renderHeader()}
            {renderUploadSection()}
            {renderPreviewSection()}
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
        backgroundColor: '#2D9E6A',
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
    card: {
        backgroundColor: colors.white,
        marginHorizontal: spacing[4],
        marginTop: spacing[4],
        padding: spacing[4],
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    uploadCard: {
        borderTopWidth: 4,
        borderTopColor: colors.secondary,
    },
    previewCard: {
        borderTopWidth: 4,
        borderTopColor: '#2D9E6A',
        marginBottom: spacing[4],
    },
    cardTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing[3],
    },
    uploadButton: {
        width: '100%',
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: colors.gray200,
        borderStyle: 'dashed',
        borderRadius: borderRadius.base,
        padding: spacing[5],
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray50,
        minHeight: 150,
    },
    uploadText: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.primary,
        marginTop: spacing[3],
    },
    uploadSubtext: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        marginTop: spacing[1],
    },
    uploadingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[2],
        marginTop: spacing[2],
        gap: spacing[2],
    },
    uploadingText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: spacing[3],
    },
    filenameBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.sm,
        gap: spacing[1],
    },
    filenameText: {
        fontSize: typography.fontSize.xs,
        color: colors.white,
        fontWeight: '600',
    },
    previewInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    previewInfoText: {
        fontSize: typography.fontSize.sm,
        color: '#2D9E6A',
        fontWeight: '600',
    },
    emptyPreview: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[6],
    },
    emptyPreviewText: {
        fontSize: typography.fontSize.base,
        color: colors.gray500,
        marginTop: spacing[3],
        textAlign: 'center',
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        marginBottom: spacing[2],
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    tableCell: {
        padding: spacing[2],
        borderRightWidth: 1,
        borderRightColor: colors.gray200,
        minWidth: 100,
        maxWidth: 150,
    },
    tableHeaderCell: {
        backgroundColor: colors.gray100,
    },
    tableHeaderText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: colors.gray700,
    },
    tableCellText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
});