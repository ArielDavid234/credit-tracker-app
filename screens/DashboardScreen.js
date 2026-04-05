// Pantalla Principal - Dashboard
// Vista central con resumen financiero del usuario
// Conectada a Firebase Firestore para datos reales

import React, { useState, useEffect, useCallback } from 'react';
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
import BalanceSummary from '../components/BalanceSummary';
import CreditCardItem from '../components/CreditCardItem';
import TransactionItem from '../components/TransactionItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { getCreditCards, getBankAccounts, getFinancialSummary } from '../services/accountService';
import { getTransactions } from '../services/transactionService';
import { getDebts, getTotalDebtSummary } from '../services/debtService';
import {
  mockCreditCards,
  mockBankAccounts,
  mockTransactions,
  mockFinancialSummary,
} from '../constants/mockData';

// Formatear moneda en USD
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(mockFinancialSummary);
  const [recentCards, setRecentCards] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [debtSummary, setDebtSummary] = useState(null);

  // Cargar datos al montar la pantalla
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Cargar datos reales de Firebase en paralelo
        const [cards, transactions, accounts, debts] = await Promise.all([
          getCreditCards(currentUser.uid).catch(() => []),
          getTransactions(currentUser.uid, { maxResults: 5 }).catch(() => []),
          getBankAccounts(currentUser.uid).catch(() => []),
          getDebts(currentUser.uid).catch(() => []),
        ]);

        // Usar mock data como fallback si no hay datos
        const finalCards = cards.length > 0 ? cards : mockCreditCards;
        const finalTransactions = transactions.length > 0 ? transactions : mockTransactions.slice(0, 5);
        const finalAccounts = accounts.length > 0 ? accounts : mockBankAccounts;

        const calculatedSummary = getFinancialSummary(finalCards, finalAccounts);
        setSummary(calculatedSummary);
        setRecentCards(finalCards.slice(0, 2));
        setRecentTransactions(finalTransactions);
        setDebtSummary(getTotalDebtSummary(debts));
      } else {
        // Sin usuario: usar mock data
        setRecentCards(mockCreditCards.slice(0, 2));
        setRecentTransactions(mockTransactions.slice(0, 5));
        const calculatedSummary = getFinancialSummary(mockCreditCards, mockBankAccounts);
        setSummary(calculatedSummary);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      // Fallback a mock data en caso de error
      setRecentCards(mockCreditCards.slice(0, 2));
      setRecentTransactions(mockTransactions.slice(0, 5));
      const calculatedSummary = getFinancialSummary(mockCreditCards, mockBankAccounts);
      setSummary(calculatedSummary);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualizar al tirar hacia abajo
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando tu resumen..." />;
  }

  return (
    <ScrollView
      style={styles.container}
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
      {/* Saludo al usuario */}
      <View style={styles.greetingContainer}>
        <View>
          <Text style={styles.greeting}>
            ¡Hola, {user?.displayName?.split(' ')[0] || 'Usuario'}! 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            Aquí está tu resumen financiero
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <MaterialCommunityIcons name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Resumen de saldos */}
      <BalanceSummary
        summary={summary}
        onViewDetails={() => navigation.navigate('Transactions')}
      />

      {/* Sección: Mis Tarjetas de Crédito */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Tarjetas</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tarjetas')}>
            <Text style={styles.seeAllText}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {recentCards.length > 0 ? (
          recentCards.map(card => (
            <CreditCardItem
              key={card.id}
              card={card}
              onPress={() => navigation.navigate('Tarjetas')}
            />
          ))
        ) : (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('AddAccount')}
          >
            <MaterialCommunityIcons
              name="credit-card-plus-outline"
              size={40}
              color={Colors.textDisabled}
            />
            <Text style={styles.emptyCardText}>
              Agrega tu primera tarjeta
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sección: Transacciones recientes */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsCard}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map(txn => (
              <TransactionItem key={txn.id} transaction={txn} />
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={36}
                color={Colors.textDisabled}
              />
              <Text style={styles.emptyText}>
                No hay transacciones recientes
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Sección: Resumen de Deudas */}
      {debtSummary && debtSummary.count > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deudas</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Deudas')}>
              <Text style={styles.seeAllText}>Ver todas →</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.debtSummaryCard}
            onPress={() => navigation.navigate('Deudas')}
          >
            <View style={styles.debtSummaryLeft}>
              <MaterialCommunityIcons name="file-document-outline" size={28} color={Colors.error} />
              <View style={styles.debtSummaryText}>
                <Text style={styles.debtSummaryLabel}>Total adeudado</Text>
                <Text style={styles.debtSummaryAmount}>{formatCurrency(debtSummary.totalOwed)}</Text>
              </View>
            </View>
            <View style={styles.debtSummaryRight}>
              <Text style={styles.debtSummarySmall}>{debtSummary.count} deuda{debtSummary.count !== 1 ? 's' : ''}</Text>
              <Text style={styles.debtSummarySmall}>Pago mensual: {formatCurrency(debtSummary.totalMonthlyPayment)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Sección: Conectar nueva cuenta */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.connectAccountCard}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <MaterialCommunityIcons name="bank-plus" size={32} color={Colors.primary} />
          <View style={styles.connectAccountText}>
            <Text style={styles.connectAccountTitle}>
              Conectar Cuenta Bancaria
            </Text>
            <Text style={styles.connectAccountSubtitle}>
              Usa Plaid para conectar tu banco de forma segura
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Espaciado al final */}
      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sectionContainer: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyCardText: {
    fontSize: 14,
    color: Colors.textDisabled,
    marginTop: Spacing.sm,
  },
  transactionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTransactions: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textDisabled,
    marginTop: Spacing.sm,
  },
  connectAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  connectAccountText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  connectAccountTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  connectAccountSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Tarjeta de resumen de deudas en el Dashboard
  debtSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.error}08`,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.error}20`,
  },
  debtSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtSummaryText: {
    marginLeft: Spacing.sm,
  },
  debtSummaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  debtSummaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.error,
  },
  debtSummaryRight: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  debtSummarySmall: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
});

export default DashboardScreen;
