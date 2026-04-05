// Pantalla de Historial de Transacciones
// Lista todas las transacciones con filtros + formulario para agregar manualmente

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import TransactionItem from '../components/TransactionItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { getTransactions, addTransaction, deleteTransaction } from '../services/transactionService';

// Formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount || 0));
};

// Filtros disponibles
const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'debito', label: 'Gastos' },
  { id: 'credito', label: 'Ingresos' },
];

// Categorías disponibles
const categories = [
  'Supermercado', 'Restaurantes', 'Gasolina', 'Transporte', 'Entretenimiento',
  'Salud', 'Ropa', 'Hogar', 'Servicios', 'Educación', 'Viajes', 'Ingresos', 'Otros',
];

const TransactionsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Campos del formulario
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState('debito');
  const [txCategory, setTxCategory] = useState('Otros');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const loadTransactions = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      const data = await getTransactions(user.uid, { maxResults: 100 });
      setTransactions(data);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Filtrar transacciones según el filtro activo
  const filteredTransactions = transactions.filter(txn => {
    if (activeFilter === 'all') return true;
    return txn.type === activeFilter;
  });

  // Calcular resumen
  const totalGastos = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalIngresos = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const periodTitle = (() => {
    const p = new Date().toLocaleDateString('es-US', { month: 'long', year: 'numeric' });
    return p.charAt(0).toUpperCase() + p.slice(1);
  })();

  const resetForm = () => {
    setTxDescription('');
    setTxAmount('');
    setTxType('debito');
    setTxCategory('Otros');
    setTxDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveTransaction = async () => {
    if (!txDescription.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción.');
      return;
    }
    if (!txAmount || isNaN(parseFloat(txAmount))) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    try {
      setSaving(true);
      const user = getCurrentUser();
      await addTransaction(user.uid, {
        description: txDescription.trim(),
        amount: parseFloat(txAmount),
        type: txType,
        category: txCategory,
        date: txDate,
      });
      await loadTransactions();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la transacción.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = (txId) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Deseas eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              await deleteTransaction(user.uid, txId);
              await loadTransactions();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la transacción.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onLongPress={() => handleDeleteTransaction(item.id)}>
      <TransactionItem transaction={item} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Resumen del mes */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de {periodTitle}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="arrow-down-circle" size={24} color={Colors.error} />
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>
              -{formatCurrency(totalGastos)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="arrow-up-circle" size={24} color={Colors.success} />
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              +{formatCurrency(totalIngresos)}
            </Text>
          </View>
        </View>
      </View>

      {/* Botón agregar */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
        <MaterialCommunityIcons name="plus-circle" size={20} color={Colors.white} />
        <Text style={styles.addButtonText}>Agregar Transacción</Text>
      </TouchableOpacity>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {filters.map(filter => (
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

      <Text style={styles.listHeader}>
        {filteredTransactions.length} transacciones · Mantén presionado para eliminar
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando transacciones..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="format-list-bulleted" size={64} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyAddBtnText}>+ Agregar ahora</Text>
            </TouchableOpacity>
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
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal para agregar transacción */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Transacción</Text>
            <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Tipo: Gasto / Ingreso */}
            <Text style={styles.fieldLabel}>Tipo</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, txType === 'debito' && styles.typeOptionDebit]}
                onPress={() => setTxType('debito')}
              >
                <MaterialCommunityIcons
                  name="arrow-down-circle"
                  size={20}
                  color={txType === 'debito' ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.typeOptionText, txType === 'debito' && { color: Colors.white }]}>
                  Gasto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, txType === 'credito' && styles.typeOptionCredit]}
                onPress={() => setTxType('credito')}
              >
                <MaterialCommunityIcons
                  name="arrow-up-circle"
                  size={20}
                  color={txType === 'credito' ? Colors.white : Colors.textSecondary}
                />
                <Text style={[styles.typeOptionText, txType === 'credito' && { color: Colors.white }]}>
                  Ingreso
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Descripción *</Text>
            <TextInput
              style={styles.input}
              placeholder="ej. Supermercado, Nómina, Gasolina..."
              placeholderTextColor={Colors.textDisabled}
              value={txDescription}
              onChangeText={setTxDescription}
            />

            <Text style={styles.fieldLabel}>Monto (USD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={txAmount}
              onChangeText={setTxAmount}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-01-15"
              placeholderTextColor={Colors.textDisabled}
              value={txDate}
              onChangeText={setTxDate}
            />

            <Text style={styles.fieldLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={styles.categoriesRow}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      txCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setTxCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      txCategory === cat && styles.categoryChipTextActive,
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveTransaction}
              disabled={saving}
            >
              {saving ? (
                <Text style={styles.saveButtonText}>Guardando...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color={Colors.white} />
                  <Text style={styles.saveButtonText}>Guardar Transacción</Text>
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.secondary,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: Spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
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
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  listHeader: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textDisabled,
    marginTop: Spacing.md,
  },
  emptyAddBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
    backgroundColor: `${Colors.primary}18`,
  },
  emptyAddBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  typeOptionDebit: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  typeOptionCredit: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
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
  categoriesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
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

export default TransactionsScreen;
