// Pantalla de Alertas y Notificaciones
// Genera alertas automáticas basadas en fechas reales de tarjetas y deudas

import React, { useState, useEffect, useCallback } from 'react';
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
import { getCurrentUser } from '../services/authService';
import { getCreditCards } from '../services/accountService';
import { getDebts } from '../services/debtService';

// Genera alertas automáticas a partir de tarjetas y deudas reales
const generateAlerts = (cards, debts) => {
  const alerts = [];
  const today = new Date();

  cards.forEach((card, i) => {
    // Alerta si el pago es en los próximos 7 días
    if (card.dueDate) {
      const due = new Date(card.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `card_due_${card.id || i}`,
          type: 'pago_proximo',
          title: `Pago próximo: ${card.name || card.bankName}`,
          message: `Tu pago de ${card.name || 'tarjeta'} vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}. Monto mínimo: $${(card.minimumPayment || 0).toFixed(2)}`,
          read: false,
          date: card.dueDate,
          icon: 'credit-card-clock',
          color: diffDays <= 2 ? Colors.error : Colors.warning,
        });
      }
    }
    // Alerta si el uso de crédito supera el 70%
    if (card.creditLimit > 0 && card.balance / card.creditLimit > 0.7) {
      const utilization = ((card.balance / card.creditLimit) * 100).toFixed(0);
      alerts.push({
        id: `card_util_${card.id || i}`,
        type: 'limite_credito',
        title: `Uso de crédito alto: ${card.name || card.bankName}`,
        message: `Estás usando el ${utilization}% de tu límite. Se recomienda mantenerlo por debajo del 30%.`,
        read: false,
        date: new Date().toISOString().slice(0, 10),
        icon: 'chart-line',
        color: Colors.warning,
      });
    }
  });

  debts.forEach((debt, i) => {
    if (debt.dueDate) {
      const due = new Date(debt.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `debt_due_${debt.id || i}`,
          type: 'pago_proximo',
          title: `Pago de deuda próximo: ${debt.name}`,
          message: `El pago de "${debt.name}" vence en ${diffDays} día${diffDays !== 1 ? 's' : ''}. Monto: $${(debt.monthlyPayment || 0).toFixed(2)}`,
          read: false,
          date: debt.dueDate,
          icon: 'cash-clock',
          color: diffDays <= 2 ? Colors.error : Colors.warning,
        });
      }
    }
  });

  return alerts.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const AlertsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadAlerts = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      const [cards, debts] = await Promise.all([
        getCreditCards(user.uid),
        getDebts(user.uid),
      ]);
      setAlerts(generateAlerts(cards, debts));
    } catch (error) {
      console.error('Error generando alertas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

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
      {loading && <LoadingSpinner fullScreen message="Generando alertas..." />}
      <FlatList
        data={filteredAlerts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => !loading && (
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
                : 'Agrega tarjetas o deudas con fechas de pago para ver alertas'}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
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
