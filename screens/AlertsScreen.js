// Pantalla de Alertas y Notificaciones
// Muestra alertas de pagos próximos, uso de crédito, etc.
// Las alertas se generan automáticamente basándose en datos reales de Firebase

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
import {
  collection, addDoc, getDocs, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { mockAlerts } from '../constants/mockData';

// Generar alertas automáticas basadas en datos reales del usuario
const generateAlerts = (creditCards, debts) => {
  const alerts = [];
  const today = new Date();

  // Alertas de pago próximo para tarjetas de crédito (próximos 7 días)
  creditCards.forEach((card) => {
    if (card.dueDate) {
      const due = new Date(card.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `card-due-${card.id}`,
          type: 'pago_proximo',
          title: `Pago próximo - ${card.name || card.bank}`,
          message: `Tu pago mínimo de $${card.minimumPayment || 0} vence ${diffDays === 0 ? 'hoy' : `en ${diffDays} día${diffDays > 1 ? 's' : ''}`} (${card.dueDate})`,
          date: today.toISOString().split('T')[0],
          dueDate: card.dueDate,
          amount: card.minimumPayment || 0,
          accountId: card.id,
          priority: diffDays <= 2 ? 'alta' : 'media',
          read: false,
        });
      }
    }

    // Alerta de utilización alta de crédito (> 70%)
    if (card.creditLimit && card.balance) {
      const utilization = (card.balance / card.creditLimit) * 100;
      if (utilization > 70) {
        alerts.push({
          id: `card-util-${card.id}`,
          type: 'limite_credito',
          title: `Uso alto de crédito - ${card.name || card.bank}`,
          message: `Has usado el ${utilization.toFixed(1)}% de tu límite en ${card.name || card.bank}`,
          date: today.toISOString().split('T')[0],
          accountId: card.id,
          priority: utilization > 90 ? 'alta' : 'media',
          read: false,
        });
      }
    }
  });

  // Alertas de próximo pago de deudas (próximos 7 días)
  debts.forEach((debt) => {
    if (debt.dueDate) {
      const due = new Date(debt.dueDate);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        alerts.push({
          id: `debt-due-${debt.id}`,
          type: 'pago_proximo',
          title: `Pago de deuda - ${debt.entityName}`,
          message: `Tu pago mensual de $${debt.monthlyPayment || 0} a "${debt.entityName}" vence ${diffDays === 0 ? 'hoy' : `en ${diffDays} día${diffDays > 1 ? 's' : ''}`}`,
          date: today.toISOString().split('T')[0],
          dueDate: debt.dueDate,
          amount: debt.monthlyPayment || 0,
          accountId: debt.id,
          priority: diffDays <= 2 ? 'alta' : 'media',
          read: false,
        });
      }
    }
  });

  return alerts;
};

const AlertsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Cargar o generar alertas al montar la pantalla
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Intentar cargar alertas guardadas en Firestore
        const alertsRef = collection(db, 'users', currentUser.uid, 'alerts');
        const q = query(alertsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        let savedAlerts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Generar alertas automáticas basadas en tarjetas y deudas
        const [cards, debts] = await Promise.all([
          getCreditCards(currentUser.uid).catch(() => []),
          getDebts(currentUser.uid).catch(() => []),
        ]);

        const autoAlerts = generateAlerts(cards, debts);

        // Combinar alertas guardadas con las automáticas (deduplicar por ID)
        const savedIds = new Set(savedAlerts.map((a) => a.id));
        const newAutoAlerts = autoAlerts.filter((a) => !savedIds.has(a.id));

        // Guardar nuevas alertas automáticas en Firestore
        for (const alert of newAutoAlerts) {
          await addDoc(alertsRef, { ...alert, createdAt: serverTimestamp() }).catch(() => {});
        }

        const allAlerts = [...savedAlerts, ...newAutoAlerts];
        // Usar mock data como fallback si no hay alertas
        setAlerts(allAlerts.length > 0 ? allAlerts : mockAlerts);
      } else {
        setAlerts(mockAlerts);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  // Recargar alertas al tirar hacia abajo
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlerts();
  }, []);

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
      {loading && <LoadingSpinner fullScreen message="Cargando alertas..." />}
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
