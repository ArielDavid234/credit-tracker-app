// Pantalla de Deudas
// Gestiona todas las deudas: autos, hipotecas, préstamos, etc.

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
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import {
  getDebts,
  deleteDebt,
  getDebtSummary,
  DEBT_TYPES,
} from '../services/debtService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

// ── Componente: tarjeta de deuda individual ──────────────────────────────────
const DebtCard = ({ debt, onDelete }) => {
  const debtType = DEBT_TYPES.find(t => t.id === debt.type) || DEBT_TYPES[DEBT_TYPES.length - 1];
  const progress = debt.originalAmount > 0 ? (debt.balance / debt.originalAmount) * 100 : 0;

  return (
    <View style={styles.debtCard}>
      <View style={styles.debtCardHeader}>
        <View style={[styles.debtIcon, { backgroundColor: `${debtType.color}20` }]}>
          <MaterialCommunityIcons name={debtType.icon} size={24} color={debtType.color} />
        </View>
        <View style={styles.debtInfo}>
          <Text style={styles.debtName}>{debt.name}</Text>
          <Text style={styles.debtType}>{debtType.label}</Text>
          {debt.lender ? <Text style={styles.debtLender}>{debt.lender}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => onDelete(debt.id)} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.debtNumbers}>
        <View style={styles.debtNumberItem}>
          <Text style={styles.debtNumberLabel}>Saldo pendiente</Text>
          <Text style={[styles.debtNumberValue, { color: Colors.error }]}>
            {formatCurrency(debt.balance)}
          </Text>
        </View>
        {debt.monthlyPayment ? (
          <View style={styles.debtNumberItem}>
            <Text style={styles.debtNumberLabel}>Pago mensual</Text>
            <Text style={[styles.debtNumberValue, { color: Colors.primary }]}>
              {formatCurrency(debt.monthlyPayment)}
            </Text>
          </View>
        ) : null}
        {debt.interestRate ? (
          <View style={styles.debtNumberItem}>
            <Text style={styles.debtNumberLabel}>Tasa de interés</Text>
            <Text style={styles.debtNumberValue}>{debt.interestRate}%</Text>
          </View>
        ) : null}
      </View>

      {debt.originalAmount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%`, backgroundColor: debtType.color },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {progress.toFixed(0)}% pendiente de {formatCurrency(debt.originalAmount)}
          </Text>
        </View>
      )}

      {debt.dueDate ? (
        <View style={styles.dueDateRow}>
          <MaterialCommunityIcons name="calendar" size={14} color={Colors.textSecondary} />
          <Text style={styles.dueDateText}>Próximo pago: {debt.dueDate}</Text>
        </View>
      ) : null}
    </View>
  );
};

// ── Pantalla principal ───────────────────────────────────────────────────────
const DebtsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState([]);
  const [userId, setUserId] = useState(null);

  const loadDebts = useCallback(async (uid) => {
    try {
      const data = await getDebts(uid);
      setDebts(data);
    } catch (error) {
      console.error('Error cargando deudas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
      loadDebts(user.uid);
    } else {
      setLoading(false);
    }
  }, [loadDebts]);

  // Reload debts whenever this screen comes into focus (e.g. returning from AddDebt)
  useFocusEffect(
    useCallback(() => {
      const user = getCurrentUser();
      if (user) loadDebts(user.uid);
    }, [loadDebts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (userId) loadDebts(userId);
  }, [userId, loadDebts]);

  const handleDelete = (debtId) => {
    Alert.alert('Eliminar deuda', '¿Estás seguro que deseas eliminar esta deuda?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDebt(userId, debtId);
            setDebts(prev => prev.filter(d => d.id !== debtId));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la deuda.');
          }
        },
      },
    ]);
  };

  const summary = getDebtSummary(debts);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando deudas..." />;
  }

  return (
    <View style={styles.container}>
      {/* Resumen de deudas */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total adeudado</Text>
          <Text style={[styles.summaryValue, { color: Colors.error }]}>
            {formatCurrency(summary.totalOwed)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pago mensual</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>
            {formatCurrency(summary.totalMonthly)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Deudas activas</Text>
          <Text style={styles.summaryValue}>{summary.count}</Text>
        </View>
      </View>

      <FlatList
        data={debts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DebtCard debt={item} onDelete={handleDelete} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-remove" size={72} color={Colors.textDisabled} />
            <Text style={styles.emptyTitle}>Sin deudas registradas</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tus préstamos, hipotecas, autos u otras deudas para hacer seguimiento
            </Text>
          </View>
        )}
      />

      {/* FAB para agregar */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddDebt')}>
        <MaterialCommunityIcons name="plus" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
  debtCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debtCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  debtIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  debtInfo: {
    flex: 1,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  debtType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  debtLender: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  debtNumbers: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  debtNumberItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  debtNumberLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  debtNumberValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default DebtsScreen;
