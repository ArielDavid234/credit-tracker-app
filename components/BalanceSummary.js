// Componente de resumen de saldos para el Dashboard
// Muestra el resumen financiero general del usuario

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

// Componente de tarjeta de métrica individual
const MetricCard = ({ title, value, icon, color, subtitle }) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

const BalanceSummary = ({ summary, onViewDetails }) => {
  const {
    totalBalance = 0,
    totalDebt = 0,
    totalCreditLimit = 0,
    availableCredit = 0,
    creditUtilization = 0,
    nextPaymentDue = null,
    nextPaymentAmount = null,
    numberOfCards = 0,
    numberOfAccounts = 0,
  } = summary || {};

  // Determinar color según la utilización de crédito
  const utilizationColor = creditUtilization < 30
    ? Colors.success
    : creditUtilization < 60
      ? Colors.warning
      : Colors.error;

  return (
    <View style={styles.container}>
      {/* Tarjeta principal: Balance total en bancos */}
      <View style={styles.mainCard}>
        <Text style={styles.mainCardLabel}>Balance Total en Cuentas</Text>
        <Text style={styles.mainCardValue}>{formatCurrency(totalBalance)}</Text>
        <Text style={styles.mainCardSubtext}>
          {numberOfAccounts} cuenta{numberOfAccounts !== 1 ? 's' : ''} bancaria{numberOfAccounts !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Métricas secundarias */}
      <View style={styles.metricsGrid}>
        {/* Deuda total */}
        <MetricCard
          title="Deuda Total"
          value={formatCurrency(totalDebt)}
          icon="credit-card-multiple"
          color={Colors.error}
          subtitle={`${numberOfCards} tarjeta${numberOfCards !== 1 ? 's' : ''}`}
        />

        {/* Crédito disponible */}
        <MetricCard
          title="Crédito Disp."
          value={formatCurrency(availableCredit)}
          icon="credit-card-check"
          color={Colors.success}
          subtitle={`de ${formatCurrency(totalCreditLimit)}`}
        />

        {/* Utilización de crédito */}
        <MetricCard
          title="Utilización"
          value={`${creditUtilization}%`}
          icon="chart-donut"
          color={utilizationColor}
          subtitle={creditUtilization < 30 ? 'Excelente' : creditUtilization < 60 ? 'Moderado' : 'Alto'}
        />

        {/* Próximo pago */}
        {nextPaymentDue ? (
          <MetricCard
            title="Próximo Pago"
            value={formatCurrency(nextPaymentAmount)}
            icon="calendar-check"
            color={Colors.warning}
            subtitle={nextPaymentDue}
          />
        ) : (
          <MetricCard
            title="Sin Pagos"
            value="$0.00"
            icon="calendar-check"
            color={Colors.success}
            subtitle="Todo al día"
          />
        )}
      </View>

      {/* Botón para ver detalles */}
      {onViewDetails && (
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails}>
          <Text style={styles.viewDetailsText}>Ver resumen completo</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  mainCard: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.secondaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  mainCardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  mainCardValue: {
    color: Colors.primary,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  mainCardSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  metricCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  metricTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  metricSubtitle: {
    fontSize: 11,
    color: Colors.textDisabled,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default BalanceSummary;
