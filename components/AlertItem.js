// Componente de una alerta individual
// Muestra el tipo de alerta, prioridad, mensaje y fecha

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants/Colors';

// Formatear fecha en español
const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Configuración visual por tipo de alerta
const getAlertConfig = (type) => {
  const configs = {
    'pago_proximo': {
      icon: 'calendar-clock',
      color: Colors.warning,
      label: 'Pago Próximo',
    },
    'limite_credito': {
      icon: 'alert-circle',
      color: Colors.error,
      label: 'Límite de Crédito',
    },
    'transaccion_grande': {
      icon: 'cash-multiple',
      color: Colors.info,
      label: 'Transacción Grande',
    },
    'pago_completado': {
      icon: 'check-circle',
      color: Colors.success,
      label: 'Pago Completado',
    },
  };
  return configs[type] || { icon: 'bell', color: Colors.primary, label: 'Alerta' };
};

// Configuración visual por prioridad
const getPriorityConfig = (priority) => {
  const configs = {
    'alta': { color: Colors.error, label: 'Alta' },
    'media': { color: Colors.warning, label: 'Media' },
    'baja': { color: Colors.info, label: 'Baja' },
  };
  return configs[priority] || { color: Colors.textSecondary, label: 'Normal' };
};

const AlertItem = ({ alert, onPress, onDismiss }) => {
  const alertConfig = getAlertConfig(alert.type);
  const priorityConfig = getPriorityConfig(alert.priority);
  const isUnread = !alert.read;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUnread && styles.unreadContainer,
      ]}
      onPress={() => onPress && onPress(alert)}
      activeOpacity={0.7}
    >
      {/* Indicador de no leída */}
      {isUnread && <View style={styles.unreadDot} />}

      {/* Icono de tipo de alerta */}
      <View style={[styles.iconContainer, { backgroundColor: `${alertConfig.color}15` }]}>
        <MaterialCommunityIcons
          name={alertConfig.icon}
          size={24}
          color={alertConfig.color}
        />
      </View>

      {/* Contenido de la alerta */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isUnread && styles.unreadTitle]} numberOfLines={1}>
            {alert.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityConfig.color}20` }]}>
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {alert.message}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(alert.date)}</Text>
          {alert.amount && (
            <Text style={styles.amount}>
              ${alert.amount.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      {/* Botón de descartar */}
      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onDismiss(alert.id)}
        >
          <MaterialCommunityIcons name="close" size={16} color={Colors.textDisabled} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadContainer: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  date: {
    fontSize: 11,
    color: Colors.textDisabled,
  },
  amount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
  dismissButton: {
    padding: 4,
    marginLeft: Spacing.xs,
  },
});

export default AlertItem;
