// Pantalla para Agregar Nueva Deuda
// Formulario completo para registrar deudas: autos, hipotecas, préstamos, etc.

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
import { addDebt, DEBT_TYPES } from '../services/debtService';

const AddDebtScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [selectedType, setSelectedType] = useState('auto');
  const [entityName, setEntityName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [remainingBalance, setRemainingBalance] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');

  // Guardar la deuda en Firebase
  const handleSave = async () => {
    // Validar campos requeridos
    if (!entityName.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el nombre de la entidad.');
      return;
    }
    if (!originalAmount || isNaN(parseFloat(originalAmount))) {
      Alert.alert('Campo requerido', 'Por favor ingresa un monto original válido.');
      return;
    }
    if (!remainingBalance || isNaN(parseFloat(remainingBalance))) {
      Alert.alert('Campo requerido', 'Por favor ingresa un saldo restante válido.');
      return;
    }
    if (!monthlyPayment || isNaN(parseFloat(monthlyPayment))) {
      Alert.alert('Campo requerido', 'Por favor ingresa un pago mensual válido.');
      return;
    }

    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      if (!currentUser) {
        Alert.alert('Error', 'No hay sesión activa.');
        return;
      }

      // Construir objeto de deuda
      const debtData = {
        entityName: entityName.trim(),
        debtType: selectedType,
        originalAmount: parseFloat(originalAmount),
        remainingBalance: parseFloat(remainingBalance),
        monthlyPayment: parseFloat(monthlyPayment),
        interestRate: interestRate ? parseFloat(interestRate) : 0,
        dueDate: dueDate.trim() || null,
        startDate: startDate.trim() || null,
        notes: notes.trim() || null,
      };

      await addDebt(currentUser.uid, debtData);

      Alert.alert(
        '¡Deuda Agregada!',
        `La deuda con "${entityName}" fue registrada exitosamente.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error guardando deuda:', error);
      Alert.alert('Error', 'No se pudo guardar la deuda. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Guardando deuda..." />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Selector de tipo de deuda */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Deuda</Text>
        <View style={styles.typeGrid}>
          {DEBT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeOption,
                selectedType === type.id && { borderColor: type.color, backgroundColor: `${type.color}15` },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={24}
                color={selectedType === type.id ? type.color : Colors.textDisabled}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  selectedType === type.id && { color: type.color, fontWeight: '600' },
                ]}
                numberOfLines={2}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Formulario de datos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Deuda</Text>

        {/* Nombre de la entidad */}
        <Text style={styles.fieldLabel}>Entidad / Acreedor *</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. Toyota Financial, Banco Popular..."
          placeholderTextColor={Colors.textDisabled}
          value={entityName}
          onChangeText={setEntityName}
        />

        {/* Monto original */}
        <Text style={styles.fieldLabel}>Monto Original del Préstamo *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={Colors.textDisabled}
          value={originalAmount}
          onChangeText={setOriginalAmount}
          keyboardType="decimal-pad"
        />

        {/* Saldo restante */}
        <Text style={styles.fieldLabel}>Saldo Restante *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={Colors.textDisabled}
          value={remainingBalance}
          onChangeText={setRemainingBalance}
          keyboardType="decimal-pad"
        />

        {/* Pago mensual */}
        <Text style={styles.fieldLabel}>Pago Mensual *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={Colors.textDisabled}
          value={monthlyPayment}
          onChangeText={setMonthlyPayment}
          keyboardType="decimal-pad"
        />

        {/* Tasa de interés */}
        <Text style={styles.fieldLabel}>Tasa de Interés Anual (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. 4.9"
          placeholderTextColor={Colors.textDisabled}
          value={interestRate}
          onChangeText={setInterestRate}
          keyboardType="decimal-pad"
        />

        {/* Fecha del próximo pago */}
        <Text style={styles.fieldLabel}>Fecha del Próximo Pago (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-02-15"
          placeholderTextColor={Colors.textDisabled}
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Fecha de inicio */}
        <Text style={styles.fieldLabel}>Fecha de Inicio (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2022-01-01"
          placeholderTextColor={Colors.textDisabled}
          value={startDate}
          onChangeText={setStartDate}
        />

        {/* Notas opcionales */}
        <Text style={styles.fieldLabel}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="ej. Toyota Camry 2022, consolidación de deuda..."
          placeholderTextColor={Colors.textDisabled}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Botón guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialCommunityIcons name="content-save" size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Guardar Deuda</Text>
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
    marginBottom: Spacing.md,
  },
  // Grid de tipos de deuda
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeOption: {
    width: '23%',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
  },
  typeOptionText: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Campos del formulario
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Botón guardar
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: Colors.primaryDark,
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

export default AddDebtScreen;
