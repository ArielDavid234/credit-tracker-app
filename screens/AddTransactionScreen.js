// Pantalla: Agregar Transacción Manual
// Permite registrar ingresos y gastos manualmente

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/Colors';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentUser } from '../services/authService';
import { addManualTransaction } from '../services/transactionService';

const CATEGORIES = [
  { id: 'Comida', label: 'Comida', icon: 'food' },
  { id: 'Transporte', label: 'Transporte', icon: 'car' },
  { id: 'Compras', label: 'Compras', icon: 'shopping' },
  { id: 'Entretenimiento', label: 'Entretenimiento', icon: 'movie' },
  { id: 'Salud', label: 'Salud', icon: 'medical-bag' },
  { id: 'Servicios', label: 'Servicios', icon: 'lightning-bolt' },
  { id: 'Educación', label: 'Educación', icon: 'school' },
  { id: 'Ingreso', label: 'Ingreso', icon: 'cash-plus' },
  { id: 'Transferencia', label: 'Transferencia', icon: 'bank-transfer' },
  { id: 'Sin categoría', label: 'Otro', icon: 'tag' },
];

const AddTransactionScreen = ({ navigation }) => {
  const [type, setType] = useState('debito'); // 'debito' | 'credito'
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Sin categoría');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción.');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'No estás autenticado.');
      return;
    }

    setLoading(true);
    try {
      await addManualTransaction(user.uid, {
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date,
        notes: notes.trim(),
      });
      Alert.alert('¡Listo!', 'Transacción guardada exitosamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la transacción. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Guardando transacción..." />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tipo: Gasto / Ingreso */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'debito' && styles.typeBtnGasto]}
            onPress={() => { setType('debito'); setCategory('Sin categoría'); }}
          >
            <MaterialCommunityIcons
              name="arrow-down-circle"
              size={20}
              color={type === 'debito' ? Colors.white : Colors.error}
            />
            <Text style={[styles.typeBtnText, type === 'debito' && styles.typeBtnTextActive]}>
              Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'credito' && styles.typeBtnIngreso]}
            onPress={() => { setType('credito'); setCategory('Ingreso'); }}
          >
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={20}
              color={type === 'credito' ? Colors.white : Colors.success}
            />
            <Text style={[styles.typeBtnText, type === 'credito' && styles.typeBtnTextActive]}>
              Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        {/* Monto */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountCurrency}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.textDisabled}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Descripción */}
        <Text style={styles.fieldLabel}>Descripción *</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. Supermercado, gasolina, salario..."
          placeholderTextColor={Colors.textDisabled}
          value={description}
          onChangeText={setDescription}
        />

        {/* Categoría */}
        <Text style={styles.fieldLabel}>Categoría</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                category === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <MaterialCommunityIcons
                name={cat.icon}
                size={16}
                color={category === cat.id ? Colors.white : Colors.primary}
              />
              <Text style={[
                styles.categoryChipText,
                category === cat.id && styles.categoryChipTextActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fecha */}
        <Text style={styles.fieldLabel}>Fecha (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-02-15"
          placeholderTextColor={Colors.textDisabled}
          value={date}
          onChangeText={setDate}
        />

        {/* Notas */}
        <Text style={styles.fieldLabel}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Información adicional..."
          placeholderTextColor={Colors.textDisabled}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Botón guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialCommunityIcons name="content-save" size={22} color={Colors.white} />
          <Text style={styles.saveButtonText}>Guardar Transacción</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  typeBtnGasto: {
    backgroundColor: Colors.error,
  },
  typeBtnIngreso: {
    backgroundColor: Colors.success,
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.white,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountCurrency: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 44,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    minWidth: 120,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    gap: 4,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;
