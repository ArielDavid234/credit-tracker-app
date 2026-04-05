// Credit Tracker App - Punto de entrada principal
// Aplicación para monitorear tarjetas de crédito y cuentas bancarias
// Desarrollado con React Native y Expo

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AppNavigator from './navigation/AppNavigator';
import { Colors } from './constants/Colors';

// Tema personalizado para React Native Paper
// Usa nuestra paleta de colores premium: dorado (#B8974A), carbón oscuro y beige
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    accent: Colors.secondary,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
    text: Colors.textPrimary,
    placeholder: Colors.textDisabled,
    disabled: Colors.textDisabled,
  },
};

export default function App() {
  return (
    // SafeAreaProvider maneja los márgenes para notch y barras del sistema
    <SafeAreaProvider>
      {/* PaperProvider proporciona componentes Material Design */}
      <PaperProvider theme={theme}>
        {/* Navegador principal que maneja autenticación y rutas */}
        <AppNavigator />
        {/* Barra de estado con estilo oscuro */}
        <StatusBar style="light" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
