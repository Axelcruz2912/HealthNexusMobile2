import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/theme';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';

const BACKGROUND_IMAGE = 'https://z-cdn-media.chatglm.cn/files/80c61c1e-d72e-4aec-8a08-af6eb66aace2.png?auth_key=1880130553-922cb1e48de4401cb9a3226a29954818-0-7c32a8d724f054cb81d74f8cbd64ce93';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // El dashboard se mostrará automáticamente según el rol
      Alert.alert('Éxito', 'Inicio de sesión exitoso');
    } else {
      setError(result.error || 'Credenciales incorrectas');
    }
  };

  return (
    <ImageBackground 
      source={{ uri: BACKGROUND_IMAGE }}
      style={globalStyles.container}
      resizeMode="cover"
    >
      <View style={globalStyles.overlay} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.container}
      >
        <View style={[globalStyles.centerContent, { paddingHorizontal: 20 }]}>
          <View style={globalStyles.card}>
            <Logo size="large" />
            
            <Text style={globalStyles.title}>Iniciar Sesión</Text>
            <Text style={globalStyles.subtitle}>
              Ingresa tus credenciales para acceder al sistema hospitalario.
            </Text>

            {error ? (
              <View style={globalStyles.errorContainer}>
                <Text style={globalStyles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Input
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Entrar al Sistema"
              onPress={handleLogin}
              loading={loading}
              icon="🔐"
            />

            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => Alert.alert('Recuperar', 'Función en desarrollo')}>
                <Text style={globalStyles.link}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}