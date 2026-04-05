// Pantalla de Perfil del Usuario
// Muestra información del usuario y opciones de configuración
// Carga estadísticas reales desde Firebase

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import { getCurrentUser, logoutUser } from '../services/authService';
import { getCreditCards, getBankAccounts } from '../services/accountService';
import { getTransactions } from '../services/transactionService';
import { getDebts } from '../services/debtService';

// Componente de fila de configuración
const SettingRow = ({ icon, iconColor, title, subtitle, onPress, rightElement }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (
      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textDisabled} />
    )}
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const user = getCurrentUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Estadísticas reales del usuario
  const [stats, setStats] = useState({ cards: 0, accounts: 0, transactions: 0, debts: 0 });

  // Cargar estadísticas reales desde Firebase
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const [cards, accounts, transactions, debts] = await Promise.all([
          getCreditCards(user.uid).catch(() => []),
          getBankAccounts(user.uid).catch(() => []),
          getTransactions(user.uid, { maxResults: 100 }).catch(() => []),
          getDebts(user.uid).catch(() => []),
        ]);
        setStats({
          cards: cards.length,
          accounts: accounts.length,
          transactions: transactions.length,
          debts: debts.length,
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };
    loadStats();
  }, []);

  // Obtener iniciales del nombre para el avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Cerrar sesión
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              // La navegación se maneja automáticamente en AppNavigator
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  // Mostrar información de la app
  const showAbout = () => {
    Alert.alert(
      'Acerca de Credit Tracker',
      'Versión 1.0.0\n\nDesarrollado con React Native y Expo.\n\nServicios: Firebase y Plaid',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sección del perfil del usuario */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {getInitials(user?.displayName || 'Usuario')}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.displayName || 'Usuario'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email || 'email@ejemplo.com'}
        </Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Estadísticas del usuario */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.cards}</Text>
          <Text style={styles.statLabel}>Tarjetas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.accounts}</Text>
          <Text style={styles.statLabel}>Cuentas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.transactions}</Text>
          <Text style={styles.statLabel}>Transacciones</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.debts}</Text>
          <Text style={styles.statLabel}>Deudas</Text>
        </View>
      </View>

      {/* Sección: Notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <SettingRow
          icon="bell-outline"
          iconColor={Colors.primary}
          title="Notificaciones Push"
          subtitle="Alertas de pagos y actividad"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: `${Colors.primary}60` }}
              thumbColor={notificationsEnabled ? Colors.primary : Colors.textDisabled}
            />
          }
        />
        <SettingRow
          icon="fingerprint"
          iconColor={Colors.secondary}
          title="Autenticación Biométrica"
          subtitle="Face ID / Huella dactilar"
          rightElement={
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: Colors.border, true: `${Colors.secondary}60` }}
              thumbColor={biometricEnabled ? Colors.secondary : Colors.textDisabled}
            />
          }
        />
      </View>

      {/* Sección: Cuentas y Seguridad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta y Seguridad</Text>

        <SettingRow
          icon="lock-reset"
          iconColor={Colors.warning}
          title="Cambiar Contraseña"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
        />
        <SettingRow
          icon="shield-account"
          iconColor={Colors.success}
          title="Privacidad y Datos"
          subtitle="Gestiona tus datos personales"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
        />
        <SettingRow
          icon="bank-outline"
          iconColor={Colors.primary}
          title="Cuentas Conectadas"
          subtitle="Gestiona tus conexiones Plaid"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
        />
      </View>

      {/* Sección: Preferencias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>

        <SettingRow
          icon="currency-usd"
          iconColor={Colors.success}
          title="Moneda"
          subtitle="Dólar americano (USD)"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
        />
        <SettingRow
          icon="translate"
          iconColor={Colors.info}
          title="Idioma"
          subtitle="Español"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
        />
      </View>

      {/* Sección: Soporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>

        <SettingRow
          icon="help-circle-outline"
          iconColor={Colors.info}
          title="Ayuda y FAQ"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
        />
        <SettingRow
          icon="information-outline"
          iconColor={Colors.primary}
          title="Acerca de la App"
          subtitle="Versión 1.0.0"
          onPress={showAbout}
        />
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={22} color={Colors.error} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  editProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  editProfileText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: -20,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.error}10`,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Colors.error}25`,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
});

export default ProfileScreen;
