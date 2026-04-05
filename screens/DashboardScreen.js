// Pantalla Principal - Dashboard
// Vista central con resumen financiero del usuario
// Muestra: balance total, tarjetas, cuentas, próximos pagos

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

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentCards, setRecentCards] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (!currentUser) return;

      const [cards, accounts, transactions] = await Promise.all([
        getCreditCards(currentUser.uid),
        getBankAccounts(currentUser.uid),
        getTransactions(currentUser.uid, { maxResults: 5 }),
      ]);

      setRecentCards(cards.slice(0, 2));
      setRecentTransactions(transactions);
      setSummary(getFinancialSummary(cards, accounts));
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <MaterialCommunityIcons name="plus" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Resumen de saldos */}
      {summary && (
        <BalanceSummary
          summary={summary}
          onViewDetails={() => navigation.navigate('Transactions')}
        />
      )}

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
              <TouchableOpacity
                style={styles.addTxnButton}
                onPress={() => navigation.navigate('AddTransaction')}
              >
                <Text style={styles.addTxnText}>+ Agregar transacción</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Sección: Acceso rápido */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.connectAccountCard}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <MaterialCommunityIcons name="bank-plus" size={32} color={Colors.primary} />
          <View style={styles.connectAccountText}>
            <Text style={styles.connectAccountTitle}>
              Agregar Cuenta / Tarjeta
            </Text>
            <Text style={styles.connectAccountSubtitle}>
              Registra una nueva cuenta bancaria o tarjeta
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
    borderWidth: 1,
    borderColor: Colors.border,
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
  addTxnButton: {
    marginTop: Spacing.md,
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
  },
  addTxnText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  connectAccountCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: `${Colors.primary}12`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DashboardScreen;
