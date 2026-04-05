// Pantalla de Historial de Transacciones
// Lista todas las transacciones con filtros por tipo y botón para agregar manualmente

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import TransactionItem from '../components/TransactionItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { getTransactions } from '../services/transactionService';

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

const TransactionsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userId, setUserId] = useState(null);

  const loadTransactions = useCallback(async (uid) => {
    try {
      const data = await getTransactions(uid, { maxResults: 100 });
      setTransactions(data);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
      loadTransactions(user.uid);
    } else {
      setLoading(false);
    }
  }, [loadTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    if (userId) loadTransactions(userId);
  };

  // Filtrar transacciones
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

  const currentPeriod = new Date().toLocaleDateString('es-US', { month: 'long', year: 'numeric' });
  const periodTitle = currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1);

  const renderItem = ({ item }) => <TransactionItem transaction={item} />;

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

      {/* Botón agregar transacción */}
      <TouchableOpacity
        style={styles.addTxnButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <MaterialCommunityIcons name="plus-circle" size={20} color={Colors.white} />
        <Text style={styles.addTxnText}>Agregar Transacción Manual</Text>
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

      <Text style={styles.listCountText}>
        {filteredTransactions.length} transacciones
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
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={64}
              color={Colors.textDisabled}
            />
            <Text style={styles.emptyText}>No hay transacciones</Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('AddTransaction')}
            >
              <Text style={styles.emptyAddText}>+ Agregar primera transacción</Text>
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
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
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
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.md,
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
  listCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontWeight: '500',
  },
  addTxnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  addTxnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyAddButton: {
    marginTop: Spacing.md,
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
  },
  emptyAddText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
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
});

export default TransactionsScreen;
