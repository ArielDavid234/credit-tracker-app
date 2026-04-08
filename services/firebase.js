// Configuración de Firebase para Credit Tracker App

import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAJOyzRAFXQHsBdyczxy8VH_SL7orSw4p0",
  authDomain: "credit-tracker-f132f.firebaseapp.com",
  projectId: "credit-tracker-f132f",
  storageBucket: "credit-tracker-f132f.firebasestorage.app",
  messagingSenderId: "8557416109",
  appId: "1:8557416109:web:65f8d287398b0c0a4d0024"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia AsyncStorage para React Native
// Si falla (ej. plataforma web donde AsyncStorage no está disponible), se usa getAuth() como fallback
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  console.warn('initializeAuth con AsyncStorage no disponible, usando getAuth() como fallback:', e);
  auth = getAuth(app);
}

export { auth };

// Servicios de Firebase que usaremos
export const db = getFirestore(app);     // Base de datos Firestore

export default app;
