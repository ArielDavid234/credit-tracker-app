// Servicio de Deudas Generales
// CRUD para deudas de autos, hipotecas, préstamos personales, etc.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Tipos de deuda soportados
export const DEBT_TYPES = [
  { id: 'auto', label: 'Préstamo de Auto', icon: 'car', color: '#B8974A' },
  { id: 'mortgage', label: 'Hipoteca', icon: 'home', color: '#2C2C2E' },
  { id: 'personal', label: 'Préstamo Personal', icon: 'account-cash', color: '#8B6F2E' },
  { id: 'student', label: 'Préstamo Estudiantil', icon: 'school', color: '#4A6B8A' },
  { id: 'medical', label: 'Deuda Médica', icon: 'hospital-box', color: '#A94040' },
  { id: 'other', label: 'Otra Deuda', icon: 'cash-multiple', color: '#6B6B70' },
];

// Obtener todas las deudas del usuario
export const getDebts = async (userId) => {
  try {
    const debtsRef = collection(db, 'users', userId, 'debts');
    const q = query(debtsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error('Error obteniendo deudas:', error);
    throw error;
  }
};

// Agregar una nueva deuda
export const addDebt = async (userId, debtData) => {
  try {
    const debtsRef = collection(db, 'users', userId, 'debts');
    const docRef = await addDoc(debtsRef, {
      ...debtData,
      originalAmount: parseFloat(debtData.originalAmount) || 0,
      remainingBalance: parseFloat(debtData.remainingBalance) || 0,
      monthlyPayment: parseFloat(debtData.monthlyPayment) || 0,
      interestRate: parseFloat(debtData.interestRate) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error agregando deuda:', error);
    throw error;
  }
};

// Actualizar una deuda existente
export const updateDebt = async (userId, debtId, debtData) => {
  try {
    const debtRef = doc(db, 'users', userId, 'debts', debtId);
    await updateDoc(debtRef, {
      ...debtData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error actualizando deuda:', error);
    throw error;
  }
};

// Eliminar una deuda
export const deleteDebt = async (userId, debtId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'debts', debtId));
  } catch (error) {
    console.error('Error eliminando deuda:', error);
    throw error;
  }
};

// Calcular el resumen total de deudas
export const getDebtSummary = (debts) => {
  const totalDebt = debts.reduce(
    (sum, d) => sum + (parseFloat(d.remainingBalance) || 0),
    0
  );
  const totalMonthlyPayment = debts.reduce(
    (sum, d) => sum + (parseFloat(d.monthlyPayment) || 0),
    0
  );
  return { totalDebt, totalMonthlyPayment, count: debts.length };
};

export default {
  getDebts,
  addDebt,
  updateDebt,
  deleteDebt,
  getDebtSummary,
  DEBT_TYPES,
};
