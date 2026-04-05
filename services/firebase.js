// Configuración de Firebase para Credit Tracker App
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de Firebase
// Guía de configuración en SETUP_GUIDE.md

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase - USA TUS PROPIAS CREDENCIALES
// Para obtener estas credenciales:
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto nuevo
// 3. Agrega una app web
// 4. Copia las credenciales aquí
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

// Servicios de Firebase que usaremos
export const auth = getAuth(app);        // Autenticación
export const db = getFirestore(app);     // Base de datos Firestore

// Estructura de Firestore:
// users/{userId}                    - Datos del usuario
// users/{userId}/accounts           - Cuentas bancarias
// users/{userId}/creditCards        - Tarjetas de crédito
// users/{userId}/transactions       - Transacciones
// users/{userId}/alerts             - Alertas y notificaciones

export default app;
