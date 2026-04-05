// Componente visual de una cuenta bancaria
// Muestra el banco, tipo de cuenta, últimos 4 dígitos y saldo

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants/Colors';

// Formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

// Determinar el icono según el tipo de cuenta
const getAccountIcon = (type) => {
  switch (type) {
    case 'checking': return 'bank';
    case 'savings': return 'piggy-bank';
    case 'investment': return 'chart-line';
    default: return 'bank-outline';
  }
};

// Traducir el tipo de cuenta al español
const translateAccountType = (type) => {
  switch (type) {
    case 'checking': return 'Cuenta Corriente';
    case 'savings': return 'Cuenta de Ahorros';
    case 'investment': return 'Cuenta de Inversión';
    default: return 'Cuenta Bancaria';
  }
};

const BankAccountItem = ({ account, onPress, onLongPress }) => {
  const accountColor = account.color || Colors.bankBlue;
  const icon = getAccountIcon(account.type);
  const accountType = translateAccountType(account.type);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(account)}
      onLongPress={() => onLongPress && onLongPress(account)}
      activeOpacity={0.7}
    >
      {/* Indicador de color del banco */}
      <View style={[styles.colorIndicator, { backgroundColor: accountColor }]}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.white} />
      </View>

      {/* Información de la cuenta */}
      <View style={styles.info}>
        <Text style={styles.accountName}>{account.name}</Text>
        <Text style={styles.accountType}>
          {accountType} •••• {account.lastFour}
        </Text>
        <Text style={styles.bankName}>{account.bank}</Text>
      </View>

      {/* Saldos */}
      <View style={styles.balances}>
        <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
        {account.availableBalance !== account.balance && (
          <Text style={styles.availableBalance}>
            Disp: {formatCurrency(account.availableBalance)}
          </Text>
        )}
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={Colors.textSecondary}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  colorIndicator: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  accountType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bankName: {
    fontSize: 12,
    color: Colors.textDisabled,
    marginTop: 2,
  },
  balances: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  availableBalance: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    marginTop: 4,
  },
});

export default BankAccountItem;
