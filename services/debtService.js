// Servicio de Deudas
// CRUD para deudas generales: autos, hipotecas, préstamos personales, etc.

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

// Tipos de deuda disponibles
export const DEBT_TYPES = [
  { id: 'auto', label: 'Préstamo de Auto', icon: 'car', color: '#4A6B8A' },
  { id: 'mortgage', label: 'Hipoteca', icon: 'home', color: '#2D6A4F' },
  { id: 'personal', label: 'Préstamo Personal', icon: 'account', color: '#B8974A' },
  { id: 'student', label: 'Préstamo Estudiantil', icon: 'school', color: '#6A4A8A' },
  { id: 'medical', label: 'Deuda Médica', icon: 'medical-bag', color: '#C0392B' },
  { id: 'business', label: 'Préstamo Empresarial', icon: 'briefcase', color: '#2C2C2E' },
  { id: 'other', label: 'Otra Deuda', icon: 'cash', color: '#6B6B7A' },
];

// Obtener todas las deudas del usuario
export const getDebts = async (userId) => {
  try {
    const debtsRef = collection(db, 'users', userId, 'debts');
    const q = query(debtsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

// Calcular el resumen de deudas
export const getDebtSummary = (debts) => {
  const totalOwed = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const totalMonthly = debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
  return { totalOwed, totalMonthly, count: debts.length };
};

export default {
  getDebts,
  addDebt,
  updateDebt,
  deleteDebt,
  getDebtSummary,
  DEBT_TYPES,
};
