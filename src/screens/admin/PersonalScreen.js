import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
    Modal,
    TextInput,
    ScrollView,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUsers, approveUser, rejectUser, deleteUser, createUser } from '../../api/users';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

// ==========================================
// ROLES EXACTAMENTE COMO EN LA VISTA WEB
// ==========================================
const ROLES = [
    'Médico A',
    'Médico B',
    'Médico C',
    'Enfermera A',
    'Enfermera B',
    'Enfermera C',
    'Recepcionista',
    'Farmacéutico',
    'Admin Farmacia',
    'Finanzas',
    'Laboratorista',
    'Urgenciólogo'
];

export default function PersonalScreen() {
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Modal de nuevo empleado
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    
    // Modal de rechazo
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [curp, setCurp] = useState('');
    const [rfc, setRfc] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Médico A');
    const [showPassword, setShowPassword] = useState(false);
    
    // Archivos
    const [ineFile, setIneFile] = useState(null);
    const [cedulaFile, setCedulaFile] = useState(null);
    const [certificationsFile, setCertificationsFile] = useState(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers();
            
            let usersData = [];
            if (response.data && Array.isArray(response.data)) {
                usersData = response.data;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                usersData = response.data.data;
            } else if (Array.isArray(response)) {
                usersData = response;
            } else {
                usersData = [];
            }
            
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

    // ==========================================
    // APROBAR USUARIO
    // ==========================================
    const handleApprove = async (userId) => {
        Alert.alert(
            'Aprobar Usuario',
            '¿Estás seguro de aprobar este usuario?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Aprobar',
                    onPress: async () => {
                        try {
                            await approveUser(userId);
                            Alert.alert('Éxito', 'Usuario aprobado correctamente');
                            loadUsers();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo aprobar al usuario');
                        }
                    }
                }
            ]
        );
    };

    // ==========================================
    // RECHAZAR USUARIO
    // ==========================================
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            Alert.alert('Error', 'Debes ingresar un motivo de rechazo');
            return;
        }
        
        try {
            await rejectUser(selectedUserId, rejectionReason);
            Alert.alert('Éxito', 'Usuario rechazado correctamente');
            setRejectModalVisible(false);
            setRejectionReason('');
            setSelectedUserId(null);
            loadUsers();
        } catch (error) {
            Alert.alert('Error', 'No se pudo rechazar al usuario');
        }
    };

    // ==========================================
    // ELIMINAR USUARIO
    // ==========================================
    const handleDelete = (userId, userName) => {
        Alert.alert(
            'Eliminar Usuario',
            `¿Estás seguro de eliminar a ${userName}? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(userId);
                            Alert.alert('Éxito', 'Usuario eliminado correctamente');
                            loadUsers();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar al usuario');
                        }
                    }
                }
            ]
        );
    };

    // ==========================================
    // SUBIR ARCHIVOS
    // ==========================================
    const pickFile = async (setFile, fileType) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos permisos para seleccionar archivos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setFile({
                uri: asset.uri,
                type: asset.mimeType || 'application/pdf',
                name: asset.fileName || `${fileType}_${Date.now()}.${asset.uri.split('.').pop()}`
            });
        }
    };

    // ==========================================
    // RESET FORMULARIO
    // ==========================================
    const resetForm = () => {
        setName('');
        setEmail('');
        setCurp('');
        setRfc('');
        setPassword('');
        setRole('Médico A');
        setIneFile(null);
        setCedulaFile(null);
        setCertificationsFile(null);
        setShowPassword(false);
    };

    // ==========================================
    // CREAR USUARIO
    // ==========================================
    const handleCreateUser = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Error', 'El email es requerido');
            return;
        }
        if (!password) {
            Alert.alert('Error', 'La contraseña es requerida');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setModalLoading(true);
        try {
            const response = await createUser({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                role: role,
                curp: curp.toUpperCase(),
                rfc: rfc.toUpperCase(),
                ine: ineFile,
                cedula: cedulaFile,
                certifications: certificationsFile
            });

            if (response.success) {
                Alert.alert('Éxito', 'Empleado registrado correctamente');
                resetForm();
                setModalVisible(false);
                loadUsers();
            } else {
                Alert.alert('Error', response.error || 'Error al registrar empleado');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'Error al registrar empleado');
        } finally {
            setModalLoading(false);
        }
    };

    // ==========================================
    // RENDER - ICONOS POR ROL
    // ==========================================
    const getRoleIcon = (role) => {
        if (role?.includes('Médico')) return 'user-md';
        if (role?.includes('Enfermera')) return 'user-nurse';
        if (role?.includes('Farmacia')) return 'prescription-bottle';
        if (role === 'SuperAdmin' || role === 'Administrador Hospitalario') return 'user-shield';
        if (role === 'Finanzas') return 'chart-line';
        if (role === 'Laboratorista') return 'flask';
        if (role === 'Recepcionista') return 'phone-alt';
        return 'user';
    };

    // ==========================================
    // RENDER - BADGE DE VALIDACIÓN
    // ==========================================
    const getStatusBadge = (validationStatus, status) => {
        if (validationStatus === 'Aprobado') return { label: 'APROBADO', color: '#065F46', bg: '#EBF9F2' };
        if (validationStatus === 'Rechazado') return { label: 'RECHAZADO', color: '#C7291C', bg: '#FFF1F0' };
        return { label: 'PENDIENTE', color: '#9a3412', bg: '#FFF5EB' };
    };

    // ==========================================
    // RENDER - CADA USUARIO
    // ==========================================
    const renderUser = ({ item }) => {
        const status = getStatusBadge(item.validation_status, item.status);
        const isPending = item.validation_status === 'Pendiente';
        const hasCURP = !!item.curp;
        const hasRFC = !!item.rfc;
        const hasIne = !!item.ine_path;
        const hasCedula = !!item.cedula_path;
        const hasCert = !!item.certifications_path;
        const hasDocs = hasIne || hasCedula || hasCert;
        
        return (
            <View style={styles.card}>
                <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                        <FontAwesome5 name={getRoleIcon(item.role)} size={22} color={colors.white} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                        <View style={styles.docsRow}>
                            <Text style={[styles.docBadge, hasCURP ? styles.docValid : styles.docInvalid]}>
                                {hasCURP ? '✓ CURP' : '✗ CURP'}
                            </Text>
                            <Text style={[styles.docBadge, hasRFC ? styles.docValid : styles.docInvalid]}>
                                {hasRFC ? '✓ RFC' : '✗ RFC'}
                            </Text>
                            {hasDocs && (
                                <Text style={[styles.docBadge, styles.docValid]}>
                                    {hasIne && '📄'} {hasCedula && '📋'} {hasCert && '📜'}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.userRole}>{item.role}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                        {isPending && (
                            <>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.approveButton]}
                                    onPress={() => handleApprove(item.id)}
                                >
                                    <MaterialIcons name="check" size={18} color={colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={() => {
                                        setSelectedUserId(item.id);
                                        setRejectModalVisible(true);
                                    }}
                                >
                                    <MaterialIcons name="close" size={18} color={colors.white} />
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(item.id, item.name)}
                        >
                            <MaterialIcons name="delete" size={16} color={colors.white} />
                        </TouchableOpacity>
                    </View>
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
        <>
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

            {/* Botón flotante - Nuevo Empleado */}
            <TouchableOpacity 
                style={styles.fabButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <FontAwesome5 name="user-plus" size={22} color={colors.white} />
            </TouchableOpacity>

            {/* ========================================== */}
            {/* MODAL - NUEVO EMPLEADO */}
            {/* ========================================== */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    resetForm();
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Registro Nuevo Empleado</Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    resetForm();
                                    setModalVisible(false);
                                }} 
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Nombre y Email */}
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.label}>Nombre Completo *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nombre completo"
                                        value={name}
                                        onChangeText={setName}
                                        placeholderTextColor={colors.gray400}
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.label}>Correo *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="ejemplo@hospital.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholderTextColor={colors.gray400}
                                    />
                                </View>
                            </View>

                            {/* CURP y RFC */}
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.label}>CURP (18 caracteres)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="CURP"
                                        value={curp}
                                        onChangeText={setCurp}
                                        autoCapitalize="characters"
                                        maxLength={18}
                                        placeholderTextColor={colors.gray400}
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.halfInput]}>
                                    <Text style={styles.label}>RFC (12-13 caracteres)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="RFC"
                                        value={rfc}
                                        onChangeText={setRfc}
                                        autoCapitalize="characters"
                                        maxLength={13}
                                        placeholderTextColor={colors.gray400}
                                    />
                                </View>
                            </View>

                            {/* Contraseña - SOLO UN CAMPO, SIN CONFIRMAR */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contraseña Temporal *</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        placeholder="Mínimo 8 caracteres"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor={colors.gray400}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color={colors.gray500}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Rol */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Rol Asignado *</Text>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false} 
                                    style={styles.rolesScroll}
                                >
                                    {ROLES.map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            style={[
                                                styles.roleChip,
                                                role === r && styles.roleChipActive
                                            ]}
                                            onPress={() => setRole(r)}
                                        >
                                            <Text style={[
                                                styles.roleChipText,
                                                role === r && styles.roleChipTextActive
                                            ]}>
                                                {r}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.divider} />

                            {/* Documentos */}
                            <Text style={styles.sectionTitle}>Documentación Oficial</Text>
                            
                            <TouchableOpacity style={styles.fileButton} onPress={() => pickFile(setIneFile, 'ine')}>
                                <Ionicons name="document-outline" size={20} color={colors.secondary} />
                                <Text style={styles.fileButtonText}>
                                    {ineFile ? '✅ INE seleccionado' : '📄 INE / Identificación'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.fileButton} onPress={() => pickFile(setCedulaFile, 'cedula')}>
                                <Ionicons name="medical-outline" size={20} color={colors.secondary} />
                                <Text style={styles.fileButtonText}>
                                    {cedulaFile ? '✅ Cédula seleccionada' : '📄 Cédula Profesional'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.fileButton} onPress={() => pickFile(setCertificationsFile, 'cert')}>
                                <Ionicons name="ribbon-outline" size={20} color={colors.secondary} />
                                <Text style={styles.fileButtonText}>
                                    {certificationsFile ? '✅ Certificación seleccionada' : '📄 Certificaciones (ACLS/BLS)'}
                                </Text>
                            </TouchableOpacity>

                            {/* Botones */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        resetForm();
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton, modalLoading && styles.disabledButton]}
                                    onPress={handleCreateUser}
                                    disabled={modalLoading}
                                >
                                    {modalLoading ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Registrar y Validar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* ========================================== */}
            {/* MODAL - RECHAZAR SOLICITUD */}
            {/* ========================================== */}
            <Modal
                visible={rejectModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setRejectModalVisible(false);
                    setRejectionReason('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.rejectModalContent}>
                        <Text style={styles.rejectModalTitle}>Rechazar Solicitud</Text>
                        <Text style={styles.rejectModalSubtitle}>Motivo del Rechazo:</Text>
                        <TextInput
                            style={styles.rejectTextArea}
                            multiline
                            numberOfLines={4}
                            placeholder="Ej: Cédula profesional no válida, RFC incorrecto..."
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            textAlignVertical="top"
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    setRejectModalVisible(false);
                                    setRejectionReason('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.rejectConfirmButton]}
                                onPress={handleReject}
                            >
                                <Text style={styles.submitButtonText}>Confirmar Rechazo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
    list: {
        padding: spacing[4],
        backgroundColor: colors.background,
        paddingBottom: 80,
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
        width: 44,
        height: 44,
        borderRadius: 22,
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
    docsRow: {
        flexDirection: 'row',
        gap: spacing[1],
        marginTop: 2,
        flexWrap: 'wrap',
    },
    docBadge: {
        fontSize: 10,
        fontWeight: '600',
    },
    docValid: {
        color: '#2D9E6A',
    },
    docInvalid: {
        color: '#C7291C',
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
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing[1],
    },
    actionButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveButton: {
        backgroundColor: '#2D9E6A',
    },
    rejectButton: {
        backgroundColor: '#C7291C',
    },
    deleteButton: {
        backgroundColor: '#8C1A11',
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
    fabButton: {
        position: 'absolute',
        bottom: spacing[5],
        right: spacing[5],
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
        zIndex: 10,
        elevation: 5,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '92%',
        maxHeight: '88%',
        padding: spacing[5],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[5],
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        paddingBottom: spacing[3],
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '800',
        color: colors.primary,
    },
    closeButton: {
        padding: spacing[1],
    },
    row: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    halfInput: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: spacing[4],
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.gray700,
        marginBottom: spacing[2],
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: borderRadius.base,
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[3],
        fontSize: typography.fontSize.base,
        backgroundColor: colors.gray50,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: spacing[10],
    },
    eyeIcon: {
        position: 'absolute',
        right: spacing[3],
        top: spacing[3],
    },
    rolesScroll: {
        flexDirection: 'row',
        maxHeight: 100,
    },
    roleChip: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray100,
        marginRight: spacing[2],
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    roleChipActive: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },
    roleChipText: {
        fontSize: typography.fontSize.xs,
        color: colors.gray600,
    },
    roleChipTextActive: {
        color: colors.white,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        marginVertical: spacing[4],
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing[3],
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: borderRadius.base,
        padding: spacing[3],
        marginBottom: spacing[3],
        backgroundColor: colors.gray50,
    },
    fileButtonText: {
        fontSize: typography.fontSize.sm,
        color: colors.gray700,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing[3],
        marginTop: spacing[5],
        marginBottom: spacing[3],
    },
    button: {
        flex: 1,
        paddingVertical: spacing[3],
        borderRadius: borderRadius.base,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    cancelButtonText: {
        color: colors.gray700,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: colors.secondary,
    },
    submitButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    rejectConfirmButton: {
        backgroundColor: '#C7291C',
    },
    rejectModalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '85%',
        padding: spacing[5],
    },
    rejectModalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '800',
        color: '#C7291C',
        marginBottom: spacing[2],
    },
    rejectModalSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.gray600,
        marginBottom: spacing[3],
    },
    rejectTextArea: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: borderRadius.base,
        padding: spacing[3],
        fontSize: typography.fontSize.base,
        backgroundColor: colors.gray50,
        minHeight: 100,
    },
});