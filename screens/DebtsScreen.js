// Pantalla de Deudas Generales
// Gestiona deudas de autos, hipotecas, préstamos personales, etc.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import {
  getDebts,
  addDebt,
  deleteDebt,
  getDebtSummary,
  DEBT_TYPES,
} from '../services/debtService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const CATEGORIES = [
  'Supermercado', 'Restaurantes', 'Gasolina', 'Transporte', 'Entretenimiento',
  'Salud', 'Ropa', 'Hogar', 'Servicios', 'Educación', 'Viajes', 'Otros',
];

const DebtsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos del formulario
  const [debtType, setDebtType] = useState('auto');
  const [creditorName, setCreditorName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [notes, setNotes] = useState('');

  const loadDebts = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      const data = await getDebts(user.uid);
      setDebts(data);
    } catch (error) {
      console.error('Error cargando deudas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDebts();
  };

  const resetForm = () => {
    setDebtType('auto');
    setCreditorName('');
    setOriginalAmount('');
    setRemainingBalance('');
    setMonthlyPayment('');
    setInterestRate('');
    setDueDay('');
    setNotes('');
  };

  const handleSaveDebt = async () => {
    if (!creditorName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre del acreedor.');
      return;
    }
    if (!remainingBalance || isNaN(parseFloat(remainingBalance))) {
      Alert.alert('Error', 'Por favor ingresa el saldo pendiente.');
      return;
    }
    if (!monthlyPayment || isNaN(parseFloat(monthlyPayment))) {
      Alert.alert('Error', 'Por favor ingresa el pago mensual.');
      return;
    }

    try {
      setSaving(true);
      const user = getCurrentUser();
      const typeInfo = DEBT_TYPES.find(t => t.id === debtType) || DEBT_TYPES[0];
      await addDebt(user.uid, {
        type: debtType,
        typeLabel: typeInfo.label,
        typeIcon: typeInfo.icon,
        typeColor: typeInfo.color,
        creditorName: creditorName.trim(),
        originalAmount: originalAmount || remainingBalance,
        remainingBalance,
        monthlyPayment,
        interestRate: interestRate || '0',
        dueDay: dueDay || '',
        notes: notes.trim(),
      });
      await loadDebts();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la deuda. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (debtId, debtName) => {
    Alert.alert(
      'Eliminar deuda',
      `¿Deseas eliminar "${debtName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              await deleteDebt(user.uid, debtId);
              await loadDebts();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la deuda.');
            }
          },
        },
      ]
    );
  };

  const summary = getDebtSummary(debts);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando deudas..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Resumen de deudas */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Deuda Total Pendiente</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(summary.totalDebt)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="cash-multiple" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryItemLabel}>Pago mensual</Text>
              <Text style={styles.summaryItemValue}>{formatCurrency(summary.totalMonthlyPayment)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="format-list-numbered" size={18} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryItemLabel}>Total deudas</Text>
              <Text style={styles.summaryItemValue}>{summary.count}</Text>
            </View>
          </View>
        </View>

        {/* Encabezado lista */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Mis Deudas</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de deudas */}
        {debts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-remove" size={72} color={Colors.textDisabled} />
            <Text style={styles.emptyTitle}>Sin deudas registradas</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tus préstamos de autos, hipotecas u otras deudas para hacer seguimiento
            </Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyAddButtonText}>+ Agregar Deuda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          debts.map(debt => {
            const progress = debt.originalAmount > 0
              ? Math.min(1 - (parseFloat(debt.remainingBalance) / parseFloat(debt.originalAmount)), 1)
              : 0;
            return (
              <View key={debt.id} style={styles.debtCard}>
                <View style={styles.debtCardHeader}>
                  <View style={[styles.debtIcon, { backgroundColor: `${debt.typeColor || Colors.primary}20` }]}>
                    <MaterialCommunityIcons
                      name={debt.typeIcon || 'cash-multiple'}
                      size={24}
                      color={debt.typeColor || Colors.primary}
                    />
                  </View>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{debt.creditorName}</Text>
                    <Text style={styles.debtType}>{debt.typeLabel}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(debt.id, debt.creditorName)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.debtAmounts}>
                  <View style={styles.debtAmountItem}>
                    <Text style={styles.debtAmountLabel}>Saldo pendiente</Text>
                    <Text style={[styles.debtAmountValue, { color: Colors.error }]}>
                      {formatCurrency(debt.remainingBalance)}
                    </Text>
                  </View>
                  <View style={styles.debtAmountItem}>
                    <Text style={styles.debtAmountLabel}>Pago mensual</Text>
                    <Text style={styles.debtAmountValue}>{formatCurrency(debt.monthlyPayment)}</Text>
                  </View>
                  {parseFloat(debt.interestRate) > 0 && (
                    <View style={styles.debtAmountItem}>
                      <Text style={styles.debtAmountLabel}>Tasa</Text>
                      <Text style={styles.debtAmountValue}>{debt.interestRate}%</Text>
                    </View>
                  )}
                </View>

                {/* Barra de progreso */}
                {debt.originalAmount > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{(progress * 100).toFixed(0)}% pagado</Text>
                  </View>
                )}

                {debt.dueDay ? (
                  <Text style={styles.dueText}>
                    <MaterialCommunityIcons name="calendar" size={12} color={Colors.textSecondary} />
                    {' '}Vence el día {debt.dueDay} de cada mes
                  </Text>
                ) : null}

                {debt.notes ? (
                  <Text style={styles.notesText}>{debt.notes}</Text>
                ) : null}
              </View>
            );
          })
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Modal para agregar deuda */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Deuda</Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Tipo de deuda */}
            <Text style={styles.fieldLabel}>Tipo de Deuda</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={styles.typeRow}>
                {DEBT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      debtType === type.id && { backgroundColor: type.color, borderColor: type.color },
                    ]}
                    onPress={() => setDebtType(type.id)}
                  >
                    <MaterialCommunityIcons
                      name={type.icon}
                      size={16}
                      color={debtType === type.id ? Colors.white : Colors.textSecondary}
                    />
                    <Text style={[
                      styles.typeChipText,
                      debtType === type.id && { color: Colors.white },
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Nombre del Acreedor / Institución *</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. Toyota Financial, Chase Mortgage..."
              placeholderTextColor={Colors.textDisabled}
              value={creditorName}
              onChangeText={setCreditorName}
            />

            <Text style={styles.fieldLabel}>Saldo Pendiente *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={remainingBalance}
              onChangeText={setRemainingBalance}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Monto Original del Préstamo</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={originalAmount}
              onChangeText={setOriginalAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Pago Mensual *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={monthlyPayment}
              onChangeText={setMonthlyPayment}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Tasa de Interés Anual (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Día de Vencimiento (1-31)</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. 15"
              placeholderTextColor={Colors.textDisabled}
              value={dueDay}
              onChangeText={setDueDay}
              keyboardType="numeric"
              maxLength={2}
            />

            <Text style={styles.fieldLabel}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Información adicional..."
              placeholderTextColor={Colors.textDisabled}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveDebt}
              disabled={saving}
            >
              {saving ? (
                <Text style={styles.saveButtonText}>Guardando...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color={Colors.white} />
                  <Text style={styles.saveButtonText}>Guardar Deuda</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: Spacing.xxl }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryTotal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryItemValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: Spacing.md,
  },
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
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
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
    lineHeight: 20,
  },
  emptyAddButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  emptyAddButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  debtCard: {
    backgroundColor: Colors.surface,
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
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  debtInfo: {
    flex: 1,
  },
  debtName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  debtType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  debtAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  debtAmountItem: {
    alignItems: 'center',
  },
  debtAmountLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  debtAmountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
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
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  dueText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalBody: {
    flex: 1,
    padding: Spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
    backgroundColor: Colors.surface,
  },
  typeChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebtsScreen;
