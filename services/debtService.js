// Servicio de Deudas Generales
// Maneja deudas generales: autos, préstamos personales, hipotecas, etc.

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Tipos de deuda disponibles con íconos y colores
export const DEBT_TYPES = [
  { id: 'auto',        label: 'Préstamo de Auto',        icon: 'car',                     color: '#4A6B8A' },
  { id: 'hipoteca',    label: 'Hipoteca / Casa',          icon: 'home',                    color: '#4A7C59' },
  { id: 'personal',   label: 'Préstamo Personal',        icon: 'account-cash',            color: '#B8974A' },
  { id: 'estudiantil',label: 'Préstamo Estudiantil',     icon: 'school',                  color: '#6B4A8A' },
  { id: 'medico',     label: 'Deuda Médica',             icon: 'hospital-box',            color: '#9B3A3A' },
  { id: 'negocio',    label: 'Préstamo de Negocio',      icon: 'briefcase',               color: '#2C2C2E' },
  { id: 'familiar',   label: 'Deuda Familiar/Personal',  icon: 'account-group',           color: '#C17D3C' },
  { id: 'otro',       label: 'Otra Deuda',               icon: 'dots-horizontal-circle',  color: '#6B5E4E' },
];

// Obtener todas las deudas del usuario
export const getDebts = async (userId) => {
  try {
    const ref = collection(db, 'users', userId, 'debts');
    const q = query(ref, orderBy('createdAt', 'desc'));
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
    const ref = collection(db, 'users', userId, 'debts');
    const docRef = await addDoc(ref, {
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
    const ref = doc(db, 'users', userId, 'debts', debtId);
    await updateDoc(ref, { ...debtData, updatedAt: serverTimestamp() });
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

// Calcular resumen total de deudas
export const getTotalDebtSummary = (debts) => {
  const totalOwed = debts.reduce((sum, d) => sum + (d.remainingBalance || 0), 0);
  const totalOriginal = debts.reduce((sum, d) => sum + (d.originalAmount || 0), 0);
  const totalMonthlyPayment = debts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);
  return { totalOwed, totalOriginal, totalMonthlyPayment, count: debts.length };
};

export default { getDebts, addDebt, updateDebt, deleteDebt, getTotalDebtSummary, DEBT_TYPES };
