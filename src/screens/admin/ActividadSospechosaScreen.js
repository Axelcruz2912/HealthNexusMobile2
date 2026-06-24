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
    FlatList,
    Dimensions
} from 'react-native';
import { getSuspiciousActivity } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ActividadSospechosaScreen() {
    const [data, setData] = useState(null);
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [perPage] = useState(10);

    const loadData = async (pageNum = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            const response = await getSuspiciousActivity(pageNum);
            
            if (response.success && response.data) {
                const newItems = response.data.items || [];
                
                if (isLoadMore) {
                    setItems(prev => [...prev, ...newItems]);
                } else {
                    setItems(newItems);
                }
                
                setData(response.data);
                setHasMore(response.data.has_more || false);
                setTotal(response.data.total || 0);
                setPage(pageNum);
            } else {
                Alert.alert('Error', 'No se pudo cargar la actividad sospechosa');
            }
        } catch (error) {
            console.error('Error loading suspicious activity:', error);
            Alert.alert('Error', 'No se pudo cargar la actividad sospechosa');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadData(1, false);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData(1, false);
        setRefreshing(false);
    }, []);

    const loadMore = useCallback(() => {
        if (hasMore && !loadingMore && !loading) {
            loadData(page + 1, true);
        }
    }, [hasMore, loadingMore, loading, page]);

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('es-MX', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
                <View style={styles.dateContainer}>
                    <FontAwesome5 name="clock" size={12} color={colors.gray500} />
                    <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
                </View>
                <View style={styles.alertBadge}>
                    <FontAwesome5 name="exclamation-triangle" size={10} color="#C7291C" />
                    <Text style={styles.alertText}>Sospechoso</Text>
                </View>
            </View>
            
            <View style={styles.userContainer}>
                <View style={styles.userAvatar}>
                    <FontAwesome5 name="user" size={14} color={colors.white} />
                </View>
                <View>
                    <Text style={styles.userName}>{item.user_name || 'Sistema'}</Text>
                    <Text style={styles.userRole}>{item.user_role || 'N/A'}</Text>
                </View>
            </View>
            
            <View style={styles.reasonContainer}>
                <FontAwesome5 name="shield-alt" size={14} color="#C7291C" />
                <Text style={styles.reasonText}>
                    {item.risk_reason || 'Comportamiento anómalo'}
                </Text>
            </View>
            
            <View style={styles.detailsContainer}>
                <FontAwesome5 name="info-circle" size={12} color={colors.gray500} />
                <Text style={styles.detailsText}>{item.details || 'Sin detalles'}</Text>
            </View>
            
            <View style={styles.moduleContainer}>
                <FontAwesome5 name="cube" size={12} color={colors.gray400} />
                <Text style={styles.moduleText}>{item.module || 'N/A'}</Text>
                <Text style={styles.actionText}>{item.action || ''}</Text>
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerIcon}>
                <FontAwesome5 name="shield-alt" size={24} color={colors.white} />
            </View>
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Centro de Ciberseguridad</Text>
                <Text style={styles.headerSubtitle}>
                    Detección automática de anomalías, accesos indebidos y comportamientos de riesgo
                </Text>
            </View>
        </View>
    );

    const renderPagination = () => {
        const currentPage = data?.current_page || 1;
        const lastPage = data?.last_page || 1;
        const from = data?.from || 0;
        const to = data?.to || 0;
        
        if (total === 0) return null;
        
        return (
            <View style={styles.paginationContainer}>
                <Text style={styles.paginationInfo}>
                    Mostrando {from}-{to} de {total}
                </Text>
                <View style={styles.paginationButtons}>
                    <TouchableOpacity
                        style={[styles.paginationButton, currentPage <= 1 && styles.paginationButtonDisabled]}
                        onPress={() => {
                            if (currentPage > 1) {
                                setItems([]);
                                loadData(currentPage - 1, false);
                            }
                        }}
                        disabled={currentPage <= 1}
                    >
                        <FontAwesome5 name="chevron-left" size={14} color={currentPage <= 1 ? colors.gray300 : colors.primary} />
                    </TouchableOpacity>
                    
                    <Text style={styles.paginationPage}>
                        {currentPage} / {lastPage}
                    </Text>
                    
                    <TouchableOpacity
                        style={[styles.paginationButton, currentPage >= lastPage && styles.paginationButtonDisabled]}
                        onPress={() => {
                            if (currentPage < lastPage) {
                                setItems([]);
                                loadData(currentPage + 1, false);
                            }
                        }}
                        disabled={currentPage >= lastPage}
                    >
                        <FontAwesome5 name="chevron-right" size={14} color={currentPage >= lastPage ? colors.gray300 : colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome5 name="check-circle" size={48} color="#2D9E6A" />
            <Text style={styles.emptyTitle}>Sistema Limpio</Text>
            <Text style={styles.emptySubtitle}>No se ha detectado actividad sospechosa reciente.</Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={styles.footerText}>Cargando más...</Text>
            </View>
        );
    };

    if (loading && items.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando actividad sospechosa...</Text>
            </View>
        );
    }

    const hasItems = items && items.length > 0;

    return (
        <View style={styles.container}>
            {renderHeader()}
            
            {hasItems ? (
                <>
                    {renderPagination()}
                    
                    <FlatList
                        data={items}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
                        }
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={renderFooter}
                    />
                    
                    {hasMore && (
                        <TouchableOpacity 
                            style={styles.loadMoreButton}
                            onPress={loadMore}
                            disabled={loadingMore}
                        >
                            <Text style={styles.loadMoreText}>
                                {loadingMore ? 'Cargando...' : 'Cargar más registros'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.emptyScroll}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
                    }
                >
                    {renderEmpty()}
                </ScrollView>
            )}
        </View>
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
        backgroundColor: '#C7291C',
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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    paginationInfo: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    paginationButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    paginationButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationButtonDisabled: {
        backgroundColor: colors.gray50,
    },
    paginationPage: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
        minWidth: 50,
        textAlign: 'center',
    },
    list: {
        padding: spacing[4],
        paddingBottom: spacing[4],
    },
    itemCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        borderLeftWidth: 4,
        borderLeftColor: '#C7291C',
        ...shadows.sm,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[2],
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
    },
    itemDate: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF1F0',
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
        gap: spacing[1],
    },
    alertText: {
        fontSize: typography.fontSize.xs,
        fontWeight: '700',
        color: '#C7291C',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        marginBottom: spacing[2],
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    userRole: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    reasonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        backgroundColor: '#FFF1F0',
        padding: spacing[2],
        borderRadius: borderRadius.base,
        marginBottom: spacing[2],
    },
    reasonText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontWeight: '700',
        color: '#C7291C',
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing[2],
        marginBottom: spacing[2],
    },
    detailsText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
    },
    moduleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        paddingTop: spacing[2],
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    moduleText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
    },
    actionText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray500,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[5],
    },
    emptyScroll: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[5],
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
        color: '#065F46',
        marginTop: spacing[3],
    },
    emptySubtitle: {
        fontSize: typography.fontSize.base,
        color: colors.gray500,
        marginTop: spacing[2],
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: spacing[3],
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[2],
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    loadMoreButton: {
        backgroundColor: colors.white,
        padding: spacing[3],
        marginHorizontal: spacing[4],
        marginBottom: spacing[4],
        borderRadius: borderRadius.base,
        alignItems: 'center',
        ...shadows.sm,
    },
    loadMoreText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.secondary,
    },
});