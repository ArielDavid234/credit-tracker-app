// Servicio de Cuentas y Tarjetas de Crédito
// CRUD completo para cuentas bancarias y tarjetas

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== TARJETAS DE CRÉDITO ====================

// Obtener todas las tarjetas de crédito del usuario
export const getCreditCards = async (userId) => {
  try {
    const cardsRef = collection(db, 'users', userId, 'creditCards');
    const q = query(cardsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error obteniendo tarjetas:', error);
    throw error;
  }
};

// Agregar una nueva tarjeta de crédito
export const addCreditCard = async (userId, cardData) => {
  try {
    const cardsRef = collection(db, 'users', userId, 'creditCards');
    const docRef = await addDoc(cardsRef, {
      ...cardData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error agregando tarjeta:', error);
    throw error;
  }
};

// Actualizar datos de una tarjeta de crédito
export const updateCreditCard = async (userId, cardId, cardData) => {
  try {
    const cardRef = doc(db, 'users', userId, 'creditCards', cardId);
    await updateDoc(cardRef, {
      ...cardData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error actualizando tarjeta:', error);
    throw error;
  }
};

// Eliminar una tarjeta de crédito
export const deleteCreditCard = async (userId, cardId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'creditCards', cardId));
  } catch (error) {
    console.error('Error eliminando tarjeta:', error);
    throw error;
  }
};

// ==================== CUENTAS BANCARIAS ====================

// Obtener todas las cuentas bancarias del usuario
export const getBankAccounts = async (userId) => {
  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const q = query(accountsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error obteniendo cuentas:', error);
    throw error;
  }
};

// Agregar una nueva cuenta bancaria
export const addBankAccount = async (userId, accountData) => {
  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const docRef = await addDoc(accountsRef, {
      ...accountData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error agregando cuenta:', error);
    throw error;
  }
};

// Actualizar datos de una cuenta bancaria
export const updateBankAccount = async (userId, accountId, accountData) => {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    await updateDoc(accountRef, {
      ...accountData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error actualizando cuenta:', error);
    throw error;
  }
};

// Eliminar una cuenta bancaria
export const deleteBankAccount = async (userId, accountId) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'accounts', accountId));
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    throw error;
  }
};

// ==================== INTEGRACIÓN PLAID ====================

// Guardar el access token de Plaid para una institución
export const savePlaidToken = async (userId, plaidData) => {
  try {
    const accountsRef = collection(db, 'users', userId, 'plaidTokens');
    const docRef = await addDoc(accountsRef, {
      accessToken: plaidData.accessToken,
      itemId: plaidData.itemId,
      institutionName: plaidData.institutionName,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error guardando token de Plaid:', error);
    throw error;
  }
};

// Obtener todos los tokens de Plaid del usuario
export const getPlaidTokens = async (userId) => {
  try {
    const tokensRef = collection(db, 'users', userId, 'plaidTokens');
    const snapshot = await getDocs(tokensRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error obteniendo tokens de Plaid:', error);
    throw error;
  }
};

// Calcular el resumen financiero del usuario
export const getFinancialSummary = (creditCards, bankAccounts) => {
  // Total en cuentas bancarias
  const totalBalance = bankAccounts.reduce(
    (sum, account) => sum + (account.balance || 0),
    0
  );

  // Total de deuda en tarjetas
  const totalDebt = creditCards.reduce(
    (sum, card) => sum + (card.balance || 0),
    0
  );

  // Límite total de crédito
  const totalCreditLimit = creditCards.reduce(
    (sum, card) => sum + (card.creditLimit || 0),
    0
  );

  // Crédito disponible
  const availableCredit = totalCreditLimit - totalDebt;

  // Porcentaje de utilización de crédito
  const creditUtilization = totalCreditLimit > 0
    ? ((totalDebt / totalCreditLimit) * 100).toFixed(1)
    : 0;

  // Próximo pago (fecha más cercana)
  const upcomingPayments = creditCards
    .filter(card => card.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const nextPayment = upcomingPayments[0] || null;

  return {
    totalBalance,
    totalDebt,
    totalCreditLimit,
    availableCredit,
    creditUtilization: parseFloat(creditUtilization),
    nextPaymentDue: nextPayment?.dueDate || null,
    nextPaymentAmount: nextPayment?.minimumPayment || null,
    numberOfCards: creditCards.length,
    numberOfAccounts: bankAccounts.length,
  };
};

export default {
  getCreditCards,
  addCreditCard,
  updateCreditCard,
  deleteCreditCard,
  getBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  savePlaidToken,
  getPlaidTokens,
  getFinancialSummary,
};
