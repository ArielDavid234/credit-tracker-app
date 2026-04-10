// Pantalla para Agregar Nueva Cuenta o Tarjeta
// Integra con Firebase para guardar cuentas y tarjetas reales

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { addCreditCard, addBankAccount } from '../services/accountService';

// Opciones de tipo de cuenta
const accountTypes = [
  { id: 'checking', label: 'Cuenta Corriente', icon: 'bank' },
  { id: 'savings', label: 'Cuenta de Ahorro', icon: 'piggy-bank' },
  { id: 'credit', label: 'Tarjeta de Crédito', icon: 'credit-card' },
];

// Bancos populares en EE.UU. para selección rápida
const popularBanks = [
  { name: 'Chase', icon: 'bank', color: '#003087' },
  { name: 'Bank of America', icon: 'bank', color: '#E31837' },
  { name: 'Wells Fargo', icon: 'bank', color: '#D71E28' },
  { name: 'Citi', icon: 'bank', color: '#056DAE' },
  { name: 'Capital One', icon: 'bank', color: '#B03A2E' },
  { name: 'US Bank', icon: 'bank', color: '#003087' },
  { name: 'Discover', icon: 'bank', color: '#E65100' },
  { name: 'American Express', icon: 'credit-card', color: '#1A7FC1' },
];

const AddAccountScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('checking');
  const [loading, setLoading] = useState(false);

  // Campos del formulario manual
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');

  // Simular conexión con Plaid (en producción, abrir el Plaid Link)
  const handlePlaidConnect = async () => {
    setLoading(true);
    // Aquí iría la integración real con Plaid Link
    // Por ahora simulamos con un timeout
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Plaid Sandbox',
        'Para conectar con Plaid:\n\n' +
        '1. Configura tus credenciales en services/plaid.js\n' +
        '2. Usa las credenciales de prueba:\n' +
        '   Usuario: user_good\n' +
        '   Contraseña: pass_good\n\n' +
        'Ver SETUP_GUIDE.md para instrucciones completas.',
        [{ text: 'Entendido' }]
      );
    }, 1500);
  };

  // Guardar cuenta manual en Firebase
  const handleSaveManual = async () => {
    if (!bankName || !accountName || !lastFour || !balance) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos.');
      return;
    }

    if (lastFour.length !== 4) {
      Alert.alert('Error', 'Los últimos 4 dígitos deben ser exactamente 4 números.');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'No estás autenticado.');
      return;
    }

    setLoading(true);
    try {
      if (selectedType === 'credit') {
        await addCreditCard(user.uid, {
          name: accountName,
          bankName,
          lastFour,
          balance: parseFloat(balance) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
          availableCredit: (parseFloat(creditLimit) || 0) - (parseFloat(balance) || 0),
          dueDate: dueDate || null,
          minimumPayment: parseFloat(minimumPayment) || 0,
          interestRate: parseFloat(interestRate) || 0,
          type: 'credit',
        });
      } else {
        await addBankAccount(user.uid, {
          name: accountName,
          bankName,
          lastFour,
          balance: parseFloat(balance) || 0,
          type: selectedType,
        });
      }
      Alert.alert(
        'Cuenta Agregada',
        `La cuenta "${accountName}" ha sido agregada exitosamente.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Guardando cuenta..." />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Formulario Manual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agregar Cuenta o Tarjeta</Text>
        <Text style={styles.sectionSubtitle}>Ingresa los datos manualmente</Text>

        {/* Tipo de cuenta */}
        <Text style={styles.fieldLabel}>Tipo de Cuenta</Text>
        <View style={styles.typeSelector}>
          {accountTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeOption,
                selectedType === type.id && styles.typeOptionSelected,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={22}
                color={selectedType === type.id ? Colors.white : Colors.textSecondary}
              />
              <Text style={[
                styles.typeOptionText,
                selectedType === type.id && styles.typeOptionTextSelected,
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bancos populares */}
        <Text style={styles.popularBanksTitle}>Bancos disponibles:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.banksRow}>
            {popularBanks.map(bank => (
              <TouchableOpacity
                key={bank.name}
                style={[styles.bankChip, bankName === bank.name && styles.bankChipSelected]}
                onPress={() => setBankName(bank.name)}
              >
                <MaterialCommunityIcons name={bank.icon} size={16} color={bankName === bank.name ? Colors.primary : bank.color} />
                <Text style={[styles.bankChipText, bankName === bank.name && { color: Colors.primary, fontWeight: '700' }]}>
                  {bank.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Campo: Banco */}
        <Text style={styles.fieldLabel}>Banco *</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. Chase, Bank of America..."
          placeholderTextColor={Colors.textDisabled}
          value={bankName}
          onChangeText={setBankName}
        />

        {/* Campo: Nombre de la cuenta */}
        <Text style={styles.fieldLabel}>Nombre de la cuenta *</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. Chase Checking, Mi Visa..."
          placeholderTextColor={Colors.textDisabled}
          value={accountName}
          onChangeText={setAccountName}
        />

        {/* Campo: Últimos 4 dígitos */}
        <Text style={styles.fieldLabel}>Últimos 4 dígitos *</Text>
        <TextInput
          style={styles.input}
          placeholder="1234"
          placeholderTextColor={Colors.textDisabled}
          value={lastFour}
          onChangeText={setLastFour}
          keyboardType="numeric"
          maxLength={4}
        />

        {/* Campo: Saldo actual */}
        <Text style={styles.fieldLabel}>
          {selectedType === 'credit' ? 'Saldo actual (deuda) *' : 'Saldo actual *'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={Colors.textDisabled}
          value={balance}
          onChangeText={setBalance}
          keyboardType="decimal-pad"
        />

        {/* Campos exclusivos para tarjetas */}
        {selectedType === 'credit' && (
          <>
            <Text style={styles.fieldLabel}>Límite de crédito</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={creditLimit}
              onChangeText={setCreditLimit}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Pago mínimo mensual</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={minimumPayment}
              onChangeText={setMinimumPayment}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Tasa de interés anual (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.textDisabled}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Fecha de pago (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-02-15"
              placeholderTextColor={Colors.textDisabled}
              value={dueDate}
              onChangeText={setDueDate}
            />
          </>
        )}

        {/* Botón guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveManual}>
          <MaterialCommunityIcons name="content-save" size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Guardar en Firebase</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  popularBanksTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '500',
    marginTop: Spacing.md,
  },
  banksRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: 4,
  },
  bankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bankChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}12`,
  },
  bankChipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
    backgroundColor: Colors.background,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddAccountScreen;
