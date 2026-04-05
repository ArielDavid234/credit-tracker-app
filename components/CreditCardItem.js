// Componente visual de una tarjeta de crédito
// Muestra el diseño de tarjeta con saldo, límite y fechas importantes

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/Colors';

// Función para formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

// Función para calcular el porcentaje de uso del crédito
const calculateUsagePercent = (balance, limit) => {
  if (!limit || limit === 0) return 0;
  return Math.min(100, ((balance / limit) * 100)).toFixed(0);
};

// Determinar el color de la barra de progreso según el uso
const getUsageColor = (percent) => {
  if (percent < 30) return Colors.success;
  if (percent < 60) return Colors.warning;
  return Colors.error;
};

const CreditCardItem = ({ card, onPress }) => {
  const usagePercent = calculateUsagePercent(card.balance, card.creditLimit);
  const usageColor = getUsageColor(usagePercent);
  const cardColor = card.color || Colors.cardOnyx;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardColor }]}
      onPress={() => onPress && onPress(card)}
      activeOpacity={0.85}
    >
      {/* Encabezado de la tarjeta */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bankName}>{card.bank}</Text>
          <Text style={styles.cardName}>{card.name}</Text>
        </View>
        <View style={styles.networkBadge}>
          <MaterialCommunityIcons
            name="credit-card"
            size={28}
            color="rgba(255,255,255,0.8)"
          />
        </View>
      </View>

      {/* Número de tarjeta (últimos 4 dígitos) */}
      <View style={styles.cardNumberRow}>
        <Text style={styles.cardNumberDots}>•••• •••• ••••</Text>
        <Text style={styles.cardLastFour}>{card.lastFour}</Text>
      </View>

      {/* Saldo e información financiera */}
      <View style={styles.balanceRow}>
        <View>
          <Text style={styles.balanceLabel}>Saldo actual</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(card.balance)}</Text>
        </View>
        <View style={styles.rightInfo}>
          <Text style={styles.limitLabel}>Límite</Text>
          <Text style={styles.limitAmount}>{formatCurrency(card.creditLimit)}</Text>
        </View>
      </View>

      {/* Barra de progreso de utilización */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${usagePercent}%`,
                backgroundColor: usageColor,
              },
            ]}
          />
        </View>
        <Text style={styles.usageText}>{usagePercent}% utilizado</Text>
      </View>

      {/* Fechas importantes */}
      <View style={styles.datesRow}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Fecha de corte</Text>
          <Text style={styles.dateValue}>{card.closingDate || 'N/A'}</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Fecha de pago</Text>
          <Text style={[styles.dateValue, styles.dueDateValue]}>
            {card.dueDate || 'N/A'}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Pago mínimo</Text>
          <Text style={styles.dateValue}>{formatCurrency(card.minimumPayment)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  bankName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  cardName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  networkBadge: {
    opacity: 0.9,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardNumberDots: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    letterSpacing: 2,
    marginRight: Spacing.sm,
  },
  cardLastFour: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  limitLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  limitAmount: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: Spacing.sm,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  usageText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  dateItem: {
    alignItems: 'center',
  },
  dateLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  dateValue: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  dueDateValue: {
    color: Colors.primaryGlow,
  },
});

export default CreditCardItem;
