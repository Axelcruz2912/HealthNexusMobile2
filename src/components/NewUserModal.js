import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const ROLES = [
    'SuperAdmin',
    'Administrador Hospitalario',
    'Médico A',
    'Médico B',
    'Médico C',
    'Especialista',
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

export default function NewUserModal({ visible, onClose, onUserCreated }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Médico A');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('Médico A');
    };

    const handleSubmit = async () => {
        // Validaciones
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
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const { createUser } = require('../api/users');
            const response = await createUser({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                role: role
            });

            if (response.success) {
                Alert.alert('Éxito', 'Empleado registrado correctamente');
                resetForm();
                onClose();
                if (onUserCreated) onUserCreated();
            } else {
                Alert.alert('Error', response.error || 'Error al registrar empleado');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.error || 'Error al registrar empleado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nuevo Empleado</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.gray500} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Nombre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre completo *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Dr. Juan Pérez"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor={colors.gray400}
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Correo electrónico *</Text>
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

                        {/* Rol */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rol *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rolesScroll}>
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

                        {/* Contraseña */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contraseña *</Text>
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

                        {/* Confirmar Contraseña */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirmar contraseña *</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Repite la contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholderTextColor={colors.gray400}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.gray500}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Botones */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text style={styles.submitButtonText}>Registrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '90%',
        maxHeight: '85%',
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
        backgroundColor: colors.gray100,
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
});