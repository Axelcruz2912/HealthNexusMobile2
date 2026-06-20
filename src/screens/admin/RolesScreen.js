import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import { getRolesPermissions, togglePermission } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Iconos para cada módulo
const MODULE_ICONS = {
    'dashboard_ejecutivo': 'chart-bar',
    'validacion_personal': 'account-check',
    'roles_permisos': 'key-variant',
    'seguridad': 'shield-check',
    'monitor_live': 'eye',
    'actividad_sospechosa': 'alert-circle',
    'replay_sesiones': 'replay',
    'auditoria': 'file-document',
    'urgencias': 'ambulance',
    'farmacia': 'pill',
    'recursos': 'bed',
    'mapa_calor': 'fire',
    'ingesta_datos': 'database-upload',
    'limpieza_datos': 'broom',
    'etl_bigdata': 'database',
    'ia_anomalias': 'robot',
    'arbol_decisiones': 'tree',
    'score_riesgo': 'gauge',
    'reportes': 'file-pdf'
};

const ROLE_COLORS = {
    'SuperAdmin': '#F05A4E',
    'Administrador Hospitalario': '#F97316',
    'Médico A': '#2D9E6A',
    'Médico B': '#2D9E6A',
    'Médico C': '#2D9E6A',
    'Enfermera A': '#3B82F6',
    'Enfermera B': '#3B82F6',
    'Enfermera C': '#3B82F6',
    'Recepcionista': '#8B5CF6',
    'Farmacéutico': '#EC4899',
    'Admin Farmacia': '#EC4899',
    'Finanzas': '#F59E0B',
    'Laboratorista': '#14B8A6',
    'Urgenciólogo': '#DC2626'
};

export default function RolesScreen() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await getRolesPermissions();
            
            if (response.success && response.data) {
                setData(response.data);
                if (response.data.roles && response.data.roles.length > 0) {
                    setSelectedRole(response.data.roles[0]);
                }
            } else {
                Alert.alert('Error', 'No se pudieron cargar los permisos');
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            Alert.alert('Error', 'No se pudo cargar la matriz de permisos');
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

    const handleTogglePermission = async (role, moduleKey, currentValue) => {
        try {
            const response = await togglePermission(role, moduleKey);
            
            if (response.success) {
                setData(prevData => {
                    const newData = { ...prevData };
                    const moduleIndex = newData.modules.findIndex(m => m.module_key === moduleKey);
                    if (moduleIndex !== -1) {
                        newData.modules[moduleIndex].permissions[role] = response.can_access;
                    }
                    return newData;
                });
            } else {
                Alert.alert('Error', 'No se pudo actualizar el permiso');
            }
        } catch (error) {
            console.error('Error toggling permission:', error);
            Alert.alert('Error', 'No se pudo actualizar el permiso');
        }
    };

    const getModuleIcon = (moduleKey) => {
        return MODULE_ICONS[moduleKey] || 'cube-outline';
    };

    const getRoleColor = (role) => {
        return ROLE_COLORS[role] || colors.secondary;
    };

    const renderModule = ({ item }) => {
        const hasPermission = selectedRole ? item.permissions[selectedRole] !== undefined ? item.permissions[selectedRole] : true : true;
        
        return (
            <TouchableOpacity 
                style={styles.moduleCard}
                onPress={() => {
                    if (selectedRole) {
                        handleTogglePermission(selectedRole, item.module_key, hasPermission);
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={styles.moduleHeader}>
                    <View style={styles.moduleIconContainer}>
                        <MaterialCommunityIcons 
                            name={getModuleIcon(item.module_key)} 
                            size={24} 
                            color={hasPermission ? colors.secondary : colors.gray400} 
                        />
                    </View>
                    <View style={styles.moduleInfo}>
                        <Text style={styles.moduleName}>{item.module_name}</Text>
                        <Text style={styles.moduleKey}>{item.module_key}</Text>
                    </View>
                    <View style={styles.toggleContainer}>
                        <View style={[
                            styles.toggle,
                            hasPermission ? styles.toggleActive : styles.toggleInactive
                        ]}>
                            <View style={[
                                styles.toggleCircle,
                                hasPermission ? styles.toggleCircleActive : styles.toggleCircleInactive
                            ]} />
                        </View>
                    </View>
                </View>
                {hasPermission ? (
                    <View style={styles.permissionBadge}>
                        <FontAwesome5 name="check-circle" size={14} color="#2D9E6A" />
                        <Text style={styles.permissionText}>Activo</Text>
                    </View>
                ) : (
                    <View style={[styles.permissionBadge, styles.permissionBadgeInactive]}>
                        <FontAwesome5 name="times-circle" size={14} color="#C7291C" />
                        <Text style={[styles.permissionText, styles.permissionTextInactive]}>Inactivo</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderRoleChip = ({ item }) => {
        const isSelected = selectedRole === item;
        const color = getRoleColor(item);
        
        return (
            <TouchableOpacity
                style={[
                    styles.roleChip,
                    isSelected && styles.roleChipSelected,
                    { borderColor: isSelected ? color : colors.gray300 }
                ]}
                onPress={() => setSelectedRole(item)}
            >
                <View style={[styles.roleDot, { backgroundColor: color }]} />
                <Text style={[
                    styles.roleChipText,
                    isSelected && styles.roleChipTextSelected
                ]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Cargando matriz de permisos...</Text>
            </View>
        );
    }

    const roles = data?.roles || [];

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}> Matriz de Permisos</Text>
                <Text style={styles.headerSubtitle}>
                    Selecciona un rol y toca un módulo para activar/desactivar su acceso
                </Text>
            </View>

            {/* Selector de roles horizontal */}
            <View style={styles.rolesContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.rolesScrollContent}
                >
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role}
                            style={[
                                styles.roleChip,
                                selectedRole === role && styles.roleChipSelected,
                                { borderColor: selectedRole === role ? getRoleColor(role) : colors.gray300 }
                            ]}
                            onPress={() => setSelectedRole(role)}
                        >
                            <View style={[styles.roleDot, { backgroundColor: getRoleColor(role) }]} />
                            <Text style={[
                                styles.roleChipText,
                                selectedRole === role && styles.roleChipTextSelected
                            ]}>
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Lista de módulos */}
            <FlatList
                data={data?.modules || []}
                keyExtractor={(item) => item.module_key}
                renderItem={renderModule}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />
                }
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No hay módulos disponibles</Text>
                    </View>
                }
            />
        </View>
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
    rolesContainer: {
        backgroundColor: colors.white,
        paddingVertical: spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    rolesScrollContent: {
        paddingHorizontal: spacing[5],
        gap: spacing[2],
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        borderWidth: 2,
        marginRight: spacing[2],
        gap: spacing[2],
    },
    roleChipSelected: {
        backgroundColor: colors.primary + '10',
    },
    roleDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    roleChipText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray600,
    },
    roleChipTextSelected: {
        color: colors.primary,
    },
    list: {
        padding: spacing[4],
        paddingBottom: spacing[8],
    },
    moduleCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        marginBottom: spacing[3],
        ...shadows.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    moduleIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[3],
    },
    moduleInfo: {
        flex: 1,
    },
    moduleName: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.primary,
    },
    moduleKey: {
        fontSize: typography.fontSize.xs,
        color: colors.gray400,
        marginTop: 2,
    },
    toggleContainer: {
        paddingHorizontal: spacing[2],
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 3,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: '#2D9E6A',
    },
    toggleInactive: {
        backgroundColor: colors.gray300,
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleCircleActive: {
        transform: [{ translateX: 22 }],
    },
    toggleCircleInactive: {
        transform: [{ translateX: 0 }],
    },
    permissionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[1],
        paddingHorizontal: spacing[2],
        paddingVertical: spacing[1],
        borderRadius: borderRadius.sm,
        backgroundColor: '#EBF9F2',
        marginLeft: spacing[3],
    },
    permissionBadgeInactive: {
        backgroundColor: '#FFF1F0',
    },
    permissionText: {
        fontSize: typography.fontSize.xs,
        color: '#2D9E6A',
        fontWeight: '600',
    },
    permissionTextInactive: {
        color: '#C7291C',
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