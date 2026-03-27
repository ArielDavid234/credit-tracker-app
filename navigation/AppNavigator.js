// Navegación principal de la aplicación
// Gestiona el flujo de autenticación:
// - Sin autenticación → Muestra pantallas de Login/Registro
// - Autenticado → Muestra las pantallas principales (Tab Navigator)

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';

// Pantallas de autenticación
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Navegador de la app principal
import MainTabNavigator from './MainTabNavigator';

// Servicio de autenticación
import { subscribeToAuthChanges } from '../services/authService';

// Componente de carga
import LoadingSpinner from '../components/LoadingSpinner';

// Colores
import { Colors } from '../constants/Colors';

const Stack = createStackNavigator();

// Navigator para usuarios NO autenticados (Login y Registro)
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Navegador raíz que decide qué mostrar según el estado de autenticación
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a cambios de autenticación de Firebase
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar el componente
    return unsubscribe;
  }, []);

  // Mostrar spinner mientras se verifica el estado de autenticación
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <LoadingSpinner fullScreen message="Verificando sesión..." />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // Usuario autenticado → Mostrar app principal
        <MainTabNavigator />
      ) : (
        // Usuario no autenticado → Mostrar login
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
