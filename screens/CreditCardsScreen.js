// Pantalla de Tarjetas de Crédito
// Lista todas las tarjetas con saldo, límite, fecha de corte y pago mínimo
// Conectada a Firebase Firestore para datos reales

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import CreditCardItem from '../components/CreditCardItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { getCreditCards, deleteCreditCard } from '../services/accountService';
import { mockCreditCards } from '../constants/mockData';

// Formatear moneda en USD
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const CreditCardsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cards, setCards] = useState([]);

  // Cargar tarjetas desde Firebase al montar
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const data = await getCreditCards(currentUser.uid);
        // Usar mock data como fallback si no hay datos en Firebase
        setCards(data.length > 0 ? data : mockCreditCards);
      } else {
        setCards(mockCreditCards);
      }
    } catch (error) {
      console.error('Error cargando tarjetas:', error);
      setCards(mockCreditCards);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualizar al tirar hacia abajo
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCards();
  }, []);

  // Confirmar y eliminar una tarjeta
  const handleDeleteCard = (cardId, cardName) => {
    Alert.alert(
      'Eliminar Tarjeta',
      `¿Deseas eliminar la tarjeta "${cardName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUser = getCurrentUser();
              if (currentUser) {
                await deleteCreditCard(currentUser.uid, cardId);
                setCards((prev) => prev.filter((c) => c.id !== cardId));
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la tarjeta.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando tarjetas..." />;
  }

  // Calcular totales con los datos cargados
  const totalDebt = cards.reduce((sum, card) => sum + (card.balance || 0), 0);
  const totalLimit = cards.reduce((sum, card) => sum + (card.creditLimit || 0), 0);
  const totalAvailable = cards.reduce((sum, card) => sum + (card.availableCredit || 0), 0);

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
        {/* Resumen de tarjetas */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Deuda Total</Text>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>
                {formatCurrency(totalDebt)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Límite Total</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalLimit)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Disponible</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                {formatCurrency(totalAvailable)}
              </Text>
            </View>
          </View>
        </View>

        {/* Encabezado de la lista */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Mis Tarjetas ({cards.length})
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('Dashboard', {
              screen: 'AddAccount',
            })}
          >
            <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de tarjetas */}
        {cards.length > 0 ? (
          cards.map(card => (
            <View key={card.id} style={styles.cardWrapper}>
              <CreditCardItem card={card} />
              <TouchableOpacity
                style={styles.cardDeleteBtn}
                onPress={() => handleDeleteCard(card.id, card.name)}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={72}
              color={Colors.textDisabled}
            />
            <Text style={styles.emptyTitle}>Sin tarjetas de crédito</Text>
            <Text style={styles.emptySubtitle}>
              Agrega tus tarjetas para monitorear tus saldos y fechas de pago
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>+ Agregar Tarjeta</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección: Consejos de crédito */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Consejo de Crédito</Text>
          <Text style={styles.tipsText}>
            Mantén tu utilización de crédito por debajo del 30% para mantener
            un buen puntaje crediticio. Actualmente tu utilización es:{' '}
            <Text style={styles.tipsBold}>
              {totalLimit > 0 ? ((totalDebt / totalLimit) * 100).toFixed(1) : 0}%
            </Text>
          </Text>
        </View>

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
  // Wrapper para cada tarjeta con botón de eliminar
  cardWrapper: {
    position: 'relative',
  },
  cardDeleteBtn: {
    position: 'absolute',
    top: 12,
    right: 24,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryContainer: {
    backgroundColor: Colors.secondary,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
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
  tipsSection: {
    backgroundColor: `${Colors.info}10`,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.info,
    marginBottom: Spacing.xs,
  },
  tipsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipsBold: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

export default CreditCardsScreen;
