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
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
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
