// Pantalla de Cuentas Bancarias
// Lista todas las cuentas bancarias conectadas con sus saldos

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import BankAccountItem from '../components/BankAccountItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { getBankAccounts, deleteBankAccount } from '../services/accountService';

// Formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const BankAccountsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [userId, setUserId] = useState(null);

  const loadAccounts = useCallback(async (uid) => {
    try {
      const data = await getBankAccounts(uid);
      setAccounts(data);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.uid);
      loadAccounts(user.uid);
    } else {
      setLoading(false);
    }
  }, [loadAccounts]);

  const onRefresh = () => {
    setRefreshing(true);
    if (userId) loadAccounts(userId);
  };

  const handleDelete = (accountId) => {
    Alert.alert('Eliminar cuenta', '¿Estás seguro que deseas eliminar esta cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBankAccount(userId, accountId);
            setAccounts(prev => prev.filter(a => a.id !== accountId));
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la cuenta.');
          }
        },
      },
    ]);
  };

  // Separar por tipo de cuenta
  const checkingAccounts = accounts.filter(a => a.type === 'checking');
  const savingsAccounts = accounts.filter(a => a.type === 'savings');

  // Calcular totales
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalChecking = checkingAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalSavings = savingsAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando cuentas..." />;
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
        {/* Resumen de saldos */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Balance Total</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(totalBalance)}</Text>

          <View style={styles.summaryBreakdown}>
            <View style={styles.breakdownItem}>
              <MaterialCommunityIcons name="bank" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.breakdownLabel}>Corriente</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(totalChecking)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <MaterialCommunityIcons name="piggy-bank" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.breakdownLabel}>Ahorros</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(totalSavings)}</Text>
            </View>
          </View>
        </View>

        {/* Encabezado */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Mis Cuentas ({accounts.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Cuentas Corrientes */}
        {checkingAccounts.length > 0 && (
          <View style={styles.typeSection}>
            <Text style={styles.typeSectionTitle}>
              <MaterialCommunityIcons name="bank" size={14} color={Colors.textSecondary} />
              {' '}Cuentas Corrientes
            </Text>
            {checkingAccounts.map(account => (
              <BankAccountItem
                key={account.id}
                account={account}
                onLongPress={() => handleDelete(account.id)}
              />
            ))}
          </View>
        )}

        {/* Cuentas de Ahorro */}
        {savingsAccounts.length > 0 && (
          <View style={styles.typeSection}>
            <Text style={styles.typeSectionTitle}>
              <MaterialCommunityIcons name="piggy-bank" size={14} color={Colors.textSecondary} />
              {' '}Cuentas de Ahorro
            </Text>
            {savingsAccounts.map(account => (
              <BankAccountItem
                key={account.id}
                account={account}
                onLongPress={() => handleDelete(account.id)}
              />
            ))}
          </View>
        )}

        {/* Estado vacío */}
        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bank-outline"
              size={72}
              color={Colors.textDisabled}
            />
            <Text style={styles.emptyTitle}>Sin cuentas bancarias</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tus cuentas manualmente para ver tus saldos
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddAccount')}
            >
              <Text style={styles.emptyButtonText}>+ Agregar Cuenta</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
  summaryTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryTotal: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  summaryBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
  },
  breakdownDivider: {
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
  typeSection: {
    marginBottom: Spacing.md,
  },
  typeSectionTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountWrapper: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 24,
    backgroundColor: `${Colors.error}15`,
    borderRadius: BorderRadius.md,
    padding: 6,
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
});

export default BankAccountsScreen;
