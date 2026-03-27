// Servicio de Autenticación
// Maneja login, registro y logout con Firebase Auth

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Registrar un nuevo usuario con email y contraseña
export const registerUser = async (email, password, displayName) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el nombre del usuario en Firebase Auth
    await updateProfile(user, { displayName });

    // Guardar datos adicionales del usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoURL: null,
      settings: {
        notifications: true,
        currency: 'USD',
        language: 'es',
      },
    });

    return user;
  } catch (error) {
    console.error('Error en registro:', error);
    throw translateFirebaseError(error);
  }
};

// Iniciar sesión con email y contraseña
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error en login:', error);
    throw translateFirebaseError(error);
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

// Enviar email para restablecer contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error al enviar email de restablecimiento:', error);
    throw translateFirebaseError(error);
  }
};

// Obtener datos del usuario desde Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    throw error;
  }
};

// Suscribirse a cambios en el estado de autenticación
// Retorna la función para desuscribirse (llamar en useEffect cleanup)
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener el usuario actualmente autenticado
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Traducir errores de Firebase al español para mejor UX
const translateFirebaseError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Este correo electrónico ya está en uso.',
    'auth/invalid-email': 'El correo electrónico no es válido.',
    'auth/operation-not-allowed': 'Operación no permitida.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde.',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
  };

  const message = errorMessages[error.code] || 'Ocurrió un error inesperado.';
  return new Error(message);
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getUserData,
  subscribeToAuthChanges,
  getCurrentUser,
};
