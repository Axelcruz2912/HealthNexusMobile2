import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome5, 
  MaterialCommunityIcons,
  Feather 
} from '@expo/vector-icons';

// Solo importamos las pantallas que vamos a usar AHORA
import AdminMainDashboard from './admin/AdminMainDashboard';
import PersonalScreen from './admin/PersonalScreen';

//  COMENTADAS TEMPORALMENTE (para evitar errores)
 import ScoreRiesgoScreen from './admin/ScoreRiesgoScreen';
 import RolesScreen from './admin/RolesScreen';
 import PacientesScreen from './admin/PacientesScreen';
 import UrgenciasScreen from './admin/UrgenciasScreen';
 import FarmaciaScreen from './admin/FarmaciaScreen';
 import CamasScreen from './admin/CamasScreen';
 import AmbulanciasScreen from './admin/AmbulanciasScreen';
 import HospitalLiveScreen from './admin/HospitalLiveScreen';
// import AsistenteIAScreen from './admin/AsistenteIAScreen';
 import FinanzasScreen from './admin/FinanzasScreen';
import AuditoriaScreen from './admin/AuditoriaScreen';
// import BigDataScreen from './admin/BigDataScreen';
// import ActividadSospechosaScreen from './admin/ActividadSospechosaScreen';
// import MonitorLiveScreen from './admin/MonitorLiveScreen';
// import MapaCalorScreen from './admin/MapaCalorScreen';
// import IngestaScreen from './admin/IngestaScreen';
// import LimpiezaScreen from './admin/LimpiezaScreen';
// import ReportesScreen from './admin/ReportesScreen';

const Drawer = createDrawerNavigator();

// Componente personalizado del Drawer (Sidebar)
function CustomDrawerContent({ navigation, state }) {
  const { user, logout } = useAuth();

  const menuSections = [
    {
      title: 'GOBIERNO Y CONTROL',
      items: [
        { name: 'Dashboard', screen: 'MainDashboard', icon: 'tachometer-alt', iconType: 'FontAwesome5' },
        { name: 'Personal', screen: 'Personal', icon: 'user-md', iconType: 'FontAwesome5' },
         { name: 'Score Riesgo', screen: 'ScoreRiesgo', icon: 'user-tag', iconType: 'FontAwesome5' },
         { name: 'Roles', screen: 'Roles', icon: 'key', iconType: 'FontAwesome5' },
      ]
    },
    {
      title: 'OPERACIÓN HOSPITALARIA',
      items: [
         { name: 'Pacientes', screen: 'Pacientes', icon: 'procedures', iconType: 'FontAwesome5' },
         { name: 'Urgencias', screen: 'Urgencias', icon: 'ambulance', iconType: 'FontAwesome5' },
         { name: 'Farmacia', screen: 'Farmacia', icon: 'pills', iconType: 'FontAwesome5' },
         { name: 'Camas', screen: 'Camas', icon: 'bed', iconType: 'FontAwesome5' },
      ]
    },
    {
      title: 'AMBULANCIA Y TRASLADOS',
      items: [
        { name: 'Ambulancias', screen: 'Ambulancias', icon: 'truck', iconType: 'FontAwesome5' },
        {  name: 'Hospital Live', screen: 'HospitalLive', icon: 'access-point', iconType: 'MaterialCommunityIcons'}     
       ]
    },
    {
      title: 'IA MÉDICA',
      items: [
        // { name: 'Asistente IA', screen: 'AsistenteIA', icon: 'robot', iconType: 'MaterialCommunityIcons' },
      ]
    },
    {
      title: 'FINANZAS Y SEGURIDAD',
      items: [
      { name: 'Finanzas (PIN)', screen: 'Finanzas', icon: 'lock', iconType: 'Feather' },
      { name: 'Auditoría', screen: 'Auditoria', icon: 'scroll', iconType: 'FontAwesome5' },
        // { name: 'Big Data & DWH', screen: 'BigData', icon: 'database', iconType: 'FontAwesome5' },
        // { name: 'Sospechosos', screen: 'ActividadSospechosa', icon: 'skull-crossbones', iconType: 'FontAwesome5' },
        // { name: 'Monitor Live', screen: 'MonitorLive', icon: 'broadcast-tower', iconType: 'FontAwesome5' },
      ]
    },
    {
      title: 'DATOS E IA',
      items: [
        // { name: 'Mapa Calor', screen: 'MapaCalor', icon: 'fire-alt', iconType: 'FontAwesome5' },
        // { name: 'Ingesta', screen: 'Ingesta', icon: 'upload', iconType: 'Feather' },
        // { name: 'Limpieza', screen: 'Limpieza', icon: 'broom', iconType: 'FontAwesome5' },
        // { name: 'Reportes', screen: 'Reportes', icon: 'file-pdf', iconType: 'FontAwesome5' },
      ]
    },
  ];

  const getIcon = (iconName, iconType, color) => {
    const iconProps = { size: 20, color: color };
    
    switch(iconType) {
      case 'FontAwesome5':
        return <FontAwesome5 name={iconName} {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} {...iconProps} />;
      case 'Feather':
        return <Feather name={iconName} {...iconProps} />;
      default:
        return <Ionicons name={iconName} {...iconProps} />;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Image 
          source={{ uri: 'https://z-cdn-media.chatglm.cn/files/e422f718-2f1b-43b1-8d33-abab22ae033a.png?auth_key=1880130553-c96ef22a7ec1475a8024ee420ae894cb-0-01473062212a4e246495206bff72dde3' }}
          style={styles.drawerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {menuSections.map((section, idx) => (
          <View key={idx}>
            {section.items.length > 0 && (
              <Text style={styles.menuCategory}>{section.title}</Text>
            )}
            {section.items.map((item, itemIdx) => {
              const isActive = state?.index === state?.routes.findIndex(r => r.name === item.screen);
              return (
                <TouchableOpacity
                  key={itemIdx}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={styles.menuIcon}>
                    {getIcon(item.icon, item.iconType, isActive ? colors.secondaryDark : colors.gray500)}
                  </View>
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.secondaryDark} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Componente principal del Admin
export default function AdminDashboard() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray200,
        },
        headerTitleStyle: {
          fontSize: typography.fontSize.lg,
          fontWeight: '800',
          color: colors.primary,
        },
        headerTintColor: colors.primary,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen 
        name="MainDashboard" 
        component={AdminMainDashboard}
        options={{ title: 'Dashboard Ejecutivo' }}
      />
      
      <Drawer.Screen 
        name="Personal" 
        component={PersonalScreen}
        options={{ title: 'Personal' }}
      />

      {/*  TODAS LAS DEMÁS PANTALLAS ESTÁN COMENTADAS */}
       <Drawer.Screen name="ScoreRiesgo" component={ScoreRiesgoScreen} options={{ title: 'Score Riesgo' }} /> 
       <Drawer.Screen name="Roles" component={RolesScreen} options={{ title: 'Roles' }} /> 
      { <Drawer.Screen name="Pacientes" component={PacientesScreen} options={{ title: 'Pacientes' }} /> }
      { <Drawer.Screen name="Urgencias" component={UrgenciasScreen} options={{ title: 'Urgencias' }} /> }
      {<Drawer.Screen name="Farmacia" component={FarmaciaScreen} options={{ title: 'Farmacia' }} /> }
      { <Drawer.Screen name="Camas" component={CamasScreen} options={{ title: 'Camas' }} /> }
      { <Drawer.Screen name="Ambulancias" component={AmbulanciasScreen} options={{ title: 'Ambulancias' }} /> }
      { <Drawer.Screen name="HospitalLive" component={HospitalLiveScreen} options={{ title: 'Hospital Live' }} /> }
      {/* <Drawer.Screen name="AsistenteIA" component={AsistenteIAScreen} options={{ title: 'Asistente IA' }} /> */}
      { <Drawer.Screen name="Finanzas" component={FinanzasScreen} options={{ title: 'Finanzas' }} /> }
      { <Drawer.Screen name="Auditoria" component={AuditoriaScreen} options={{ title: 'Auditoría' }} /> }
      {/* <Drawer.Screen name="BigData" component={BigDataScreen} options={{ title: 'Big Data & DWH' }} /> */}
      {/* <Drawer.Screen name="ActividadSospechosa" component={ActividadSospechosaScreen} options={{ title: 'Actividad Sospechosa' }} /> */}
      {/* <Drawer.Screen name="MonitorLive" component={MonitorLiveScreen} options={{ title: 'Monitor Live' }} /> */}
      {/* <Drawer.Screen name="MapaCalor" component={MapaCalorScreen} options={{ title: 'Mapa de Calor' }} /> */}
      {/* <Drawer.Screen name="Ingesta" component={IngestaScreen} options={{ title: 'Ingesta de Datos' }} /> */}
      {/* <Drawer.Screen name="Limpieza" component={LimpiezaScreen} options={{ title: 'Limpieza de Datos' }} /> */}
      {/* <Drawer.Screen name="Reportes" component={ReportesScreen} options={{ title: 'Reportes' }} /> */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  drawerHeader: {
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    alignItems: 'center',
  },
  drawerLogo: {
    width: 140,
    height: 70,
  },
  menuCategory: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    fontSize: typography.fontSize.xs,
    fontWeight: '800',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    marginHorizontal: spacing[2],
    borderRadius: borderRadius.base,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondaryDark,
  },
  menuIcon: {
    width: 32,
    marginRight: spacing[3],
    alignItems: 'center',
  },
  menuText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.gray600,
  },
  menuTextActive: {
    color: colors.secondaryDark,
  },
  drawerFooter: {
    padding: spacing[5],
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.base,
    gap: spacing[2],
  },
  logoutText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
});