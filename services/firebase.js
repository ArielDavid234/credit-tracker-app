// Configuración de Firebase para Credit Tracker App

import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
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

// Inicializar Auth con la persistencia correcta según la plataforma:
// - En iOS/Android: AsyncStorage mantiene la sesión después de cerrar la app
// - En Web: localStorage del navegador mantiene la sesión
let auth;
try {
  const persistence = Platform.OS === 'web'
    ? browserLocalPersistence
    : getReactNativePersistence(AsyncStorage);
  auth = initializeAuth(app, { persistence });
} catch (e) {
  // Si auth ya fue inicializado (ej. hot-reload en desarrollo), reutilizarlo
  auth = getAuth(app);
}

export { auth };

// Servicios de Firebase que usaremos
export const db = getFirestore(app);     // Base de datos Firestore

export default app;
