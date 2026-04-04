// Pantalla de Deudas Generales
// Lista y gestiona todas las deudas: autos, préstamos, hipotecas, etc.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import {
  getDebts,
  deleteDebt,
  getTotalDebtSummary,
  DEBT_TYPES,
} from '../services/debtService';
import { mockDebts } from '../constants/mockData';

// Formatear moneda en USD
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

// Obtener información del tipo de deuda por id
const getDebtTypeInfo = (typeId) =>
  DEBT_TYPES.find((t) => t.id === typeId) || DEBT_TYPES[DEBT_TYPES.length - 1];

const DebtsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ totalOwed: 0, totalOriginal: 0, totalMonthlyPayment: 0, count: 0 });

  // Cargar deudas desde Firebase al montar la pantalla
  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const data = await getDebts(currentUser.uid);
        // Usar mock data como fallback si no hay datos en Firebase
        const finalData = data.length > 0 ? data : mockDebts;
        setDebts(finalData);
        setSummary(getTotalDebtSummary(finalData));
      }
    } catch (error) {
      console.error('Error cargando deudas:', error);
      // En caso de error, mostrar datos mock
      setDebts(mockDebts);
      setSummary(getTotalDebtSummary(mockDebts));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualizar al tirar hacia abajo
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDebts();
  }, []);

  // Confirmar y eliminar una deuda
  const handleDeleteDebt = (debtId, entityName) => {
    Alert.alert(
      'Eliminar Deuda',
      `¿Estás seguro de que quieres eliminar la deuda con "${entityName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = getCurrentUser();
              if (currentUser) {
                await deleteDebt(currentUser.uid, debtId);
                // Actualizar lista local
                const updated = debts.filter((d) => d.id !== debtId);
                setDebts(updated);
                setSummary(getTotalDebtSummary(updated));
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la deuda. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando deudas..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Resumen total de deudas */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Adeudado</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(summary.totalOwed)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="cash-multiple" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryLabel}>Pago Mensual</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalMonthlyPayment)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryLabel}>Deudas</Text>
              <Text style={styles.summaryValue}>{summary.count}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="chart-pie" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryLabel}>Original</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalOriginal)}</Text>
            </View>
          </View>
        </View>

        {/* Encabezado de lista con botón agregar */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Mis Deudas ({debts.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddDebt')}
          >
            <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de deudas */}
        {debts.length > 0 ? (
          debts.map((debt) => {
            const typeInfo = getDebtTypeInfo(debt.debtType);
            const progress = debt.originalAmount > 0
              ? ((debt.originalAmount - debt.remainingBalance) / debt.originalAmount) * 100
              : 0;

            return (
              <View key={debt.id} style={styles.debtCard}>
                {/* Encabezado de la tarjeta de deuda */}
                <View style={styles.debtCardHeader}>
                  <View style={[styles.debtIcon, { backgroundColor: `${typeInfo.color}20` }]}>
                    <MaterialCommunityIcons
                      name={typeInfo.icon}
                      size={24}
                      color={typeInfo.color}
                    />
                  </View>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtEntity}>{debt.entityName}</Text>
                    <Text style={[styles.debtType, { color: typeInfo.color }]}>
                      {typeInfo.label}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteDebt(debt.id, debt.entityName)}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                {/* Montos de la deuda */}
                <View style={styles.debtAmounts}>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Saldo Restante</Text>
                    <Text style={[styles.amountValue, { color: Colors.error }]}>
                      {formatCurrency(debt.remainingBalance)}
                    </Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Pago Mensual</Text>
                    <Text style={styles.amountValue}>{formatCurrency(debt.monthlyPayment)}</Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Tasa Anual</Text>
                    <Text style={styles.amountValue}>{debt.interestRate || 0}%</Text>
                  </View>
                </View>

                {/* Barra de progreso de pago */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(progress, 100)}%`, backgroundColor: typeInfo.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress.toFixed(1)}% pagado</Text>
                </View>

                {/* Próximo pago y notas */}
                {(debt.dueDate || debt.notes) ? (
                  <View style={styles.debtFooter}>
                    {debt.dueDate && (
                      <View style={styles.dueDateBadge}>
                        <MaterialCommunityIcons name="calendar-clock" size={13} color={Colors.warning} />
                        <Text style={styles.dueDateText}>Próx. pago: {debt.dueDate}</Text>
                      </View>
                    )}
                    {debt.notes ? (
                      <Text style={styles.debtNotes} numberOfLines={1}>{debt.notes}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          // Estado vacío
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={72} color={Colors.textDisabled} />
            <Text style={styles.emptyTitle}>Sin deudas registradas</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tus préstamos de auto, hipoteca u otras deudas para rastrear tu progreso de pago.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddDebt')}
            >
              <Text style={styles.emptyButtonText}>+ Agregar Deuda</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Botón flotante para agregar deuda */}
      {debts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddDebt')}
        >
          <MaterialCommunityIcons name="plus" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Tarjeta de resumen superior
  summaryCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: Spacing.sm,
  },
  // Encabezado de lista
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Tarjeta de deuda individual
  debtCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  debtInfo: {
    flex: 1,
  },
  debtEntity: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  debtType: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  // Montos
  debtAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  amountItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  // Barra de progreso
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
  progressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  // Pie de tarjeta
  debtFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: Spacing.xs,
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  debtNotes: {
    fontSize: 11,
    color: Colors.textDisabled,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.sm,
  },
  // Estado vacío
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
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
    lineHeight: 21,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  // Botón flotante
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default DebtsScreen;
