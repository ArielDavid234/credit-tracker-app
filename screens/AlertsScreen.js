// Pantalla de Alertas y Notificaciones
// Muestra alertas de pagos próximos, uso de crédito, etc.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import AlertItem from '../components/AlertItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { mockAlerts } from '../constants/mockData';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Contar alertas no leídas
  const unreadCount = alerts.filter(a => !a.read).length;

  // Filtros disponibles
  const filterOptions = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: `No leídas (${unreadCount})` },
    { id: 'pago_proximo', label: 'Pagos' },
    { id: 'limite_credito', label: 'Crédito' },
  ];

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !alert.read;
    return alert.type === activeFilter;
  });

  // Marcar alerta como leída
  const handleAlertPress = (alert) => {
    if (!alert.read) {
      setAlerts(prev =>
        prev.map(a => a.id === alert.id ? { ...a, read: true } : a)
      );
    }
  };

  // Descartar/eliminar una alerta
  const handleDismiss = (alertId) => {
    Alert.alert(
      'Eliminar alerta',
      '¿Deseas eliminar esta alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setAlerts(prev => prev.filter(a => a.id !== alertId)),
        },
      ]
    );
  };

  // Marcar todas como leídas
  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }) => (
    <AlertItem
      alert={item}
      onPress={handleAlertPress}
      onDismiss={handleDismiss}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Resumen de alertas */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <MaterialCommunityIcons name="bell-ring" size={20} color={Colors.warning} />
          <Text style={styles.unreadBannerText}>
            Tienes {unreadCount} alerta{unreadCount > 1 ? 's' : ''} sin leer
          </Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllReadText}>Marcar todo como leído</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {filterOptions.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[
              styles.filterChipText,
              activeFilter === filter.id && styles.filterChipTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAlerts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bell-check-outline"
              size={72}
              color={Colors.textDisabled}
            />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'unread' ? '¡Todo al día!' : 'Sin alertas'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'unread'
                ? 'No tienes alertas pendientes de leer'
                : 'No hay alertas en esta categoría'}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.warning}15`,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.warning}30`,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  unreadBannerText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '600',
    flex: 1,
  },
  markAllReadText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});

export default AlertsScreen;
