// Servicio de Transacciones
// Obtener y gestionar el historial de transacciones

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Obtener transacciones del usuario con filtros opcionales
export const getTransactions = async (userId, options = {}) => {
  try {
    const { maxResults = 50, accountId = null } = options;
    const txRef = collection(db, 'users', userId, 'transactions');

    let q = query(txRef, orderBy('date', 'desc'), limit(maxResults));

    // Filtrar por cuenta específica si se proporciona
    if (accountId) {
      q = query(txRef, where('accountId', '==', accountId), orderBy('date', 'desc'), limit(maxResults));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    throw error;
  }
};

// Agregar una transacción manualmente
export const addTransaction = async (userId, transactionData) => {
  try {
    const txRef = collection(db, 'users', userId, 'transactions');
    const amount = parseFloat(transactionData.amount) || 0;
    const docRef = await addDoc(txRef, {
      description: transactionData.description || '',
      amount: transactionData.type === 'debito' ? -Math.abs(amount) : Math.abs(amount),
      date: transactionData.date || new Date().toISOString().split('T')[0],
      category: transactionData.category || 'Sin categoría',
      merchant: transactionData.merchant || transactionData.description || '',
      accountId: transactionData.accountId || '',
      status: 'completada',
      type: transactionData.type || 'debito',
      manual: true,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error agregando transacción:', error);
    throw error;
  }
};

// Eliminar una transacción
export const deleteTransaction = async (userId, transactionId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'transactions', transactionId));
  } catch (error) {
    console.error('Error eliminando transacción:', error);
    throw error;
  }
};

// Guardar transacciones obtenidas de Plaid en Firestore
export const saveTransactions = async (userId, transactions) => {
  try {
    const txRef = collection(db, 'users', userId, 'transactions');
    const batch = [];

    for (const transaction of transactions) {
      batch.push(addDoc(txRef, {
        plaidTransactionId: transaction.transaction_id,
        accountId: transaction.account_id,
        description: transaction.name,
        amount: -transaction.amount, // Plaid usa positivo para débitos
        date: transaction.date,
        category: transaction.category?.[0] || 'Sin categoría',
        merchant: transaction.merchant_name || transaction.name,
        status: 'completada',
        // Después de negar el monto de Plaid: positivo = crédito (ingreso), negativo = débito (gasto)
        type: transaction.amount > 0 ? 'credito' : 'debito',
        createdAt: serverTimestamp(),
      }));
    }

    await Promise.all(batch);
    return batch.length;
  } catch (error) {
    console.error('Error guardando transacciones:', error);
    throw error;
  }
};

// Obtener el resumen de gastos por categoría
export const getSpendingSummary = (transactions) => {
  const categoryMap = {};

  transactions
    .filter(t => t.amount < 0) // Solo débitos (gastos)
    .forEach(transaction => {
      const category = transaction.category || 'Sin categoría';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += Math.abs(transaction.amount);
    });

  return Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

// Calcular el total gastado en un período
export const getTotalSpending = (transactions, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return transactions
    .filter(t => {
      const txDate = new Date(t.date);
      return txDate >= start && txDate <= end && t.amount < 0;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

// Formatear monto como moneda USD
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default {
  getTransactions,
  addTransaction,
  deleteTransaction,
  saveTransactions,
  getSpendingSummary,
  getTotalSpending,
  formatCurrency,
};

