// Navegador de pestañas inferiores (Bottom Tab Navigator)
// Contiene las 6 secciones principales de la app después de autenticarse

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Pantallas principales
import DashboardScreen from '../screens/DashboardScreen';
import CreditCardsScreen from '../screens/CreditCardsScreen';
import BankAccountsScreen from '../screens/BankAccountsScreen';
import DebtsScreen from '../screens/DebtsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Pantallas adicionales (accesibles desde las pestañas)
import AddAccountScreen from '../screens/AddAccountScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';

// Colores
import { Colors } from '../constants/Colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: Colors.secondary },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: 'bold', color: Colors.primary },
};

// Stack para la pestaña de Dashboard (incluye Transacciones y Agregar Cuenta)
const DashboardStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="DashboardMain"
      component={DashboardScreen}
      options={{ title: 'Mi Dashboard' }}
    />
    <Stack.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{ title: 'Transacciones' }}
    />
    <Stack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
      options={{ title: 'Agregar Transacción' }}
    />
    <Stack.Screen
      name="AddAccount"
      component={AddAccountScreen}
      options={{ title: 'Agregar Cuenta' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Tarjetas de Crédito
const CardsStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="CreditCardsMain"
      component={CreditCardsScreen}
      options={{ title: 'Tarjetas de Crédito' }}
    />
    <Stack.Screen
      name="AddAccount"
      component={AddAccountScreen}
      options={{ title: 'Agregar Tarjeta' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Cuentas Bancarias
const AccountsStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="BankAccountsMain"
      component={BankAccountsScreen}
      options={{ title: 'Cuentas Bancarias' }}
    />
    <Stack.Screen
      name="AddAccount"
      component={AddAccountScreen}
      options={{ title: 'Agregar Cuenta' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Deudas
const DebtsStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="DebtsMain"
      component={DebtsScreen}
      options={{ title: 'Mis Deudas' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Alertas
const AlertsStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="AlertsMain"
      component={AlertsScreen}
      options={{ title: 'Alertas' }}
    />
  </Stack.Navigator>
);

// Stack para la pestaña de Perfil
const ProfileStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Mi Perfil' }}
    />
  </Stack.Navigator>
);

// Navegador principal de pestañas
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Tarjetas':
              iconName = focused ? 'credit-card' : 'credit-card-outline';
              break;
            case 'Cuentas':
              iconName = focused ? 'bank' : 'bank-outline';
              break;
            case 'Deudas':
              iconName = focused ? 'cash-multiple' : 'cash-multiple';
              break;
            case 'Alertas':
              iconName = focused ? 'bell' : 'bell-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size || 24} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Tarjetas" component={CardsStack} />
      <Tab.Screen name="Cuentas" component={AccountsStack} />
      <Tab.Screen name="Deudas" component={DebtsStack} />
      <Tab.Screen name="Alertas" component={AlertsStack} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 8,
    paddingTop: 6,
    height: 62,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default MainTabNavigator;

