// Configuración de Firebase para Credit Tracker App

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export default app;
