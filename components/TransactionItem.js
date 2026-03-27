// Componente de una transacción individual
// Muestra descripción, categoría, fecha y monto con color según tipo

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants/Colors';

// Formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount || 0));
};

// Formatear fecha en español
const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Determinar el icono según la categoría de la transacción
const getCategoryIcon = (category) => {
  const iconMap = {
    'Supermercado': 'cart',
    'Restaurantes': 'food',
    'Gasolina': 'gas-station',
    'Entretenimiento': 'television-play',
    'Compras en línea': 'laptop',
    'Compras': 'shopping',
    'Transferencia': 'bank-transfer',
    'Ingresos': 'cash-plus',
    'Sin categoría': 'help-circle-outline',
  };
  return iconMap[category] || 'credit-card-outline';
};

// Color del icono según la categoría
const getCategoryColor = (category) => {
  const colorMap = {
    'Supermercado': '#4CAF50',
    'Restaurantes': '#FF9800',
    'Gasolina': '#F44336',
    'Entretenimiento': '#9C27B0',
    'Compras en línea': '#2196F3',
    'Compras': '#00BCD4',
    'Transferencia': '#607D8B',
    'Ingresos': '#4CAF50',
  };
  return colorMap[category] || Colors.primary;
};

const TransactionItem = ({ transaction }) => {
  const isCredit = transaction.amount > 0;
  const amountColor = isCredit ? Colors.success : Colors.textPrimary;
  const amountPrefix = isCredit ? '+' : '-';
  const icon = getCategoryIcon(transaction.category);
  const iconColor = getCategoryColor(transaction.category);

  return (
    <View style={styles.container}>
      {/* Icono de categoría */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>

      {/* Descripción y categoría */}
      <View style={styles.details}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={styles.category}>{transaction.category}</Text>
      </View>

      {/* Fecha y monto */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  category: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default TransactionItem;
