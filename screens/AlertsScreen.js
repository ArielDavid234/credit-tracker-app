// Pantalla de Alertas y Notificaciones
// Genera alertas automáticas basadas en datos reales de Firebase

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

const formatMoney = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

// Calcular días hasta el próximo vencimiento por día del mes
const calculateDaysUntilDueDay = (dueDay, today) => {
  const todayDay = today.getDate();
  if (dueDay >= todayDay) {
    return dueDay - todayDay;
  }
  const nextDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  return Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
};

// Generar alertas automáticas a partir de tarjetas de crédito y deudas
const generateAlerts = (creditCards, debts) => {
  const alerts = [];
  const today = new Date();

  // Alertas de tarjetas de crédito
  creditCards.forEach((card, idx) => {
    const balance = parseFloat(card.balance) || 0;
    const creditLimit = parseFloat(card.creditLimit) || 0;
    const minimumPayment = parseFloat(card.minimumPayment) || 0;

    // Alerta de pago próximo
    if (card.dueDate) {
      const due = new Date(card.dueDate);
      const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (daysUntilDue >= 0 && daysUntilDue <= 10) {
        alerts.push({
          id: `card-due-${card.id || idx}`,
          type: 'pago_proximo',
          title: `Pago próximo - ${card.name || card.bank}`,
          message: `Tu pago mínimo de ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minimumPayment)} vence en ${daysUntilDue} día${daysUntilDue !== 1 ? 's' : ''} (${card.dueDate})`,
          date: today.toISOString().split('T')[0],
          dueDate: card.dueDate,
          amount: minimumPayment,
          accountId: card.id,
          priority: daysUntilDue <= 3 ? 'alta' : 'media',
          read: false,
        });
      }
    }

    // Alerta de uso alto de crédito
    if (creditLimit > 0) {
      const utilization = (balance / creditLimit) * 100;
      if (utilization >= 30) {
        alerts.push({
          id: `card-util-${card.id || idx}`,
          type: 'limite_credito',
          title: `Uso ${utilization >= 70 ? 'muy alto' : 'alto'} de crédito - ${card.name || card.bank}`,
          message: `Has usado el ${utilization.toFixed(1)}% de tu límite de crédito en ${card.name || card.bank}`,
          date: today.toISOString().split('T')[0],
          accountId: card.id,
          priority: utilization >= 70 ? 'alta' : 'media',
          read: false,
        });
      }
    }
  });

  // Alertas de deudas
  debts.forEach((debt, idx) => {
    if (debt.dueDay) {
      const dueDay = parseInt(debt.dueDay, 10);
      const daysLeft = calculateDaysUntilDueDay(dueDay, today);

      if (daysLeft >= 0 && daysLeft <= 7) {
        alerts.push({
          id: `debt-due-${debt.id || idx}`,
          type: 'pago_proximo',
          title: `Pago próximo - ${debt.creditorName}`,
          message: `Tu pago de ${formatMoney(debt.monthlyPayment)} vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''} (día ${debt.dueDay})`,
          date: today.toISOString().split('T')[0],
          amount: parseFloat(debt.monthlyPayment) || 0,
          accountId: debt.id,
          priority: daysLeft <= 3 ? 'alta' : 'media',
          read: false,
        });
      }
    }
  });

  // Si no hay alertas, mensaje de todo al día
  if (alerts.length === 0) {
    alerts.push({
      id: 'all-good',
      type: 'info',
      title: '¡Todo al día! ✅',
      message: 'No tienes pagos próximos ni alertas de crédito. ¡Sigue así!',
      date: today.toISOString().split('T')[0],
      priority: 'baja',
      read: true,
    });
  }

  return alerts;
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
      const generated = generateAlerts(cards, debts);
      setAlerts(generated);
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

  // Marcar todas como leídas
  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando alertas..." />;
  }

  const renderItem = ({ item }) => (
    <AlertItem
      alert={item}
      onPress={handleAlertPress}
      onDismiss={() => setAlerts(prev => prev.filter(a => a.id !== item.id))}
    />
  );

  const renderHeader = () => (
    <View>
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
            <MaterialCommunityIcons name="bell-check-outline" size={72} color={Colors.textDisabled} />
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
