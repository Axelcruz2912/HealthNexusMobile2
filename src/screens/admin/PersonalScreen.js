import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { getUsers, approveUser } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export default function PersonalScreen() {
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers();
            
            // La respuesta viene como { success: true, data: [...], count: 24 }
            let usersData = [];
            if (response.data && Array.isArray(response.data)) {
                // Si la respuesta tiene data como array
                usersData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                // Si la respuesta es { success: true, data: [...] }
                usersData = response.data.data;
            } else if (Array.isArray(response)) {
                // Si la respuesta es directamente el array
                usersData = response;
            } else if (response.data && response.data.users) {
                usersData = response.data.users;
            } else {
                usersData = [];
            }
            
            console.log('Usuarios cargados:', usersData.length);
            setUsers(usersData);
        } catch (error) {
            console.error('Error loading users:', error);
            Alert.alert('Error', 'No se pudo cargar el personal');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    };

    const handleApprove = async (userId) => {
        try {
            await approveUser(userId);
            Alert.alert('Éxito', 'Usuario aprobado correctamente');
            loadUsers();
        } catch (error) {
            Alert.alert('Error', 'No se pudo aprobar al usuario');
        }
    };

    const getRoleIcon = (role) => {
        if (role?.includes('Médico')) return 'user-md';
        if (role?.includes('Enfermera')) return 'user-nurse';
        if (role?.includes('Farmacia')) return 'prescription-bottle';
        if (role === 'SuperAdmin') return 'user-shield';
        return 'user';
    };

    const getStatusBadge = (validationStatus, status) => {
        if (validationStatus === 'Pendiente') return { label: 'Pendiente', color: '#FF8C42' };
        if (validationStatus === 'Aprobado' && status === 1) return { label: 'Activo', color: '#2D9E6A' };
        if (validationStatus === 'Rechazado') return { label: 'Rechazado', color: '#C7291C' };
        return { label: 'Inactivo', color: '#C7291C' };
    };

    const renderUser = ({ item }) => {
        const status = getStatusBadge(item.validation_status, item.status);
        const isPending = item.validation_status === 'Pendiente';
        
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                        <FontAwesome5 name={getRoleIcon(item.role)} size={24} color={colors.white} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.userRole}>{item.role}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                    {isPending && (
                        <TouchableOpacity
                            style={styles.approveButton}
                            onPress={() => handleApprove(item.id)}
                        >
                            <MaterialIcons name="check-circle" size={28} color={colors.success} />
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
                <Text style={styles.loadingText}>Cargando personal...</Text>
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
            ListEmptyComponent={
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No hay usuarios registrados</Text>
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
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadows.sm,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
    },
    userEmail: {
        fontSize: typography.fontSize.sm,
        color: colors.gray500,
    },
    userRole: {
        fontSize: typography.fontSize.xs,
        color: colors.secondary,
        marginTop: 2,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: spacing[2],
    },
    badge: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.full,
    },
    badgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: 'bold',
    },
    approveButton: {
        padding: spacing[1],
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