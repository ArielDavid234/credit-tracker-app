// Componente indicador de carga
// Muestra un spinner animado mientras se cargan los datos

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../constants/Colors';

const LoadingSpinner = ({ message = 'Cargando...', size = 'large', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={Colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message && <Text style={styles.inlineMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // Pantalla completa con fondo semitransparente
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  // Contenedor en línea dentro de otro componente
  container: {
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inlineMessage: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default LoadingSpinner;
