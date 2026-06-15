import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DoctorDashboard from './src/screens/DoctorDashboard';
import NurseDashboard from './src/screens/NurseDashboard';
import PharmacyDashboard from './src/screens/PharmacyDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { colors } from './src/styles/theme';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background || '#f5f5f5',
        }}
      >
        <ActivityIndicator size="large" color={colors.secondary || '#F05A4E'} />
      </View>
    );
  }

  const getDashboardScreen = () => {
    if (!user) return LoginScreen;

    const role = user.role || '';

    if (
      role === 'SuperAdmin' ||
      role === 'Administrador Hospitalario'
    ) {
      return AdminDashboard;
    }

    if (
      role === 'Farmacéutico' ||
      role === 'Admin Farmacia'
    ) {
      return PharmacyDashboard;
    }

    if (role.includes('Enfermera')) {
      return NurseDashboard;
    }

    if (
      role.includes('Médico') ||
      role === 'Especialista' ||
      role === 'Urgenciólogo'
    ) {
      return DoctorDashboard;
    }

    return LoginScreen;
  };

  const DashboardScreen = getDashboardScreen();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      ) : (
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary || '#1E1A17'} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}