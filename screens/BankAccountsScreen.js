// Pantalla de Cuentas Bancarias
// Lista todas las cuentas bancarias conectadas con sus saldos

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import BankAccountItem from '../components/BankAccountItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { mockBankAccounts } from '../constants/mockData';

// Formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const BankAccountsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [accounts, setAccounts] = useState(mockBankAccounts);

  // Separar por tipo de cuenta
  const checkingAccounts = accounts.filter(a => a.type === 'checking');
  const savingsAccounts = accounts.filter(a => a.type === 'savings');

  // Calcular totales
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalChecking = checkingAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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
          <TouchableOpacity style={styles.addButton}>
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
              <BankAccountItem key={account.id} account={account} />
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
              <BankAccountItem key={account.id} account={account} />
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
              Conecta tu banco usando Plaid para ver tus saldos automáticamente
            </Text>
          </View>
        )}

        {/* Botón de conectar banco con Plaid */}
        <TouchableOpacity style={styles.plaidCard}>
          <View style={styles.plaidIconContainer}>
            <MaterialCommunityIcons name="shield-check" size={28} color={Colors.primary} />
          </View>
          <View style={styles.plaidText}>
            <Text style={styles.plaidTitle}>Conectar con Plaid</Text>
            <Text style={styles.plaidSubtitle}>
              Conexión bancaria segura y encriptada
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} />
        </TouchableOpacity>

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
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  summaryTotal: {
    fontSize: 38,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  summaryBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    color: 'rgba(255,255,255,0.8)',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    backgroundColor: `${Colors.primary}15`,
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
  plaidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}08`,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
  },
  plaidIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  plaidText: {
    flex: 1,
  },
  plaidTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  plaidSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default BankAccountsScreen;
