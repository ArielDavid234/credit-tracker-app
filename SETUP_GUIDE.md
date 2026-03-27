# 🔧 Guía de Configuración de Servicios Externos

Esta guía te explica paso a paso cómo configurar Firebase y Plaid para que la app funcione con datos reales.

---

## 🔥 Configuración de Firebase

Firebase te da autenticación y base de datos **gratis** con el plan Spark.

### Paso 1: Crear proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Haz clic en **"Agregar proyecto"** o **"Add project"**
3. Escribe el nombre: `credit-tracker-app`
4. Desactiva Google Analytics (opcional)
5. Haz clic en **"Crear proyecto"**

### Paso 2: Agregar tu app web

1. En la página principal del proyecto, haz clic en el ícono `</>` (Web)
2. Nombre de la app: `Credit Tracker Web`
3. **NO** actives Firebase Hosting (no lo necesitas)
4. Haz clic en **"Registrar app"**
5. Verás las credenciales así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "credit-tracker-12345.firebaseapp.com",
  projectId: "credit-tracker-12345",
  storageBucket: "credit-tracker-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

6. Copia estas credenciales en `services/firebase.js`

### Paso 3: Activar Authentication

1. En el menú izquierdo → **Authentication**
2. Haz clic en **"Comenzar"** / **"Get started"**
3. Ve a la pestaña **"Sign-in method"**
4. Haz clic en **"Email/Password"**
5. Activa el primer toggle ✅ (Email/Password)
6. Guarda los cambios

### Paso 4: Crear base de datos Firestore

1. En el menú izquierdo → **Firestore Database**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Iniciar en modo de prueba"** (por ahora)
4. Selecciona la ubicación más cercana a ti (ej. `us-east1`)
5. Haz clic en **"Listo"**

> ⚠️ **Seguridad**: El modo de prueba permite acceso público por 30 días. Antes de lanzar la app, actualiza las reglas de seguridad en Firestore → Reglas.

### Reglas de Seguridad Recomendadas para Firestore

Copia estas reglas en Firestore → Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cada usuario solo puede ver y modificar sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🏦 Configuración de Plaid (Sandbox Gratuito)

Plaid te permite conectar cuentas bancarias reales. El **sandbox es completamente gratuito** para desarrollo.

### Paso 1: Crear cuenta en Plaid

1. Ve a [dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)
2. Llena el formulario de registro (es gratis)
3. Verifica tu correo electrónico
4. Completa el perfil (puedes poner "Personal Project" como uso)

### Paso 2: Obtener credenciales del Sandbox

1. Ve a **Team Settings** (menú superior derecho)
2. Haz clic en **"Keys"** en el menú izquierdo
3. Verás tus credenciales:

```
Client ID: 5f3e7b8c9d0a1b2c3d4e5f6a
Sandbox Secret: 1234567890abcdef...
```

4. Copia estas credenciales en `services/plaid.js`

### Paso 3: Credenciales de prueba para Sandbox

Cuando la app te pida hacer login en tu banco (modo sandbox), usa estas credenciales:

| Campo | Valor |
|-------|-------|
| Usuario | `user_good` |
| Contraseña | `pass_good` |

Estas credenciales funcionan con cualquier banco en modo sandbox.

### Bancos disponibles en Sandbox

El sandbox incluye versiones de prueba de los bancos más populares de EE.UU.:
- Chase
- Bank of America
- Wells Fargo
- Citibank
- US Bank
- Capital One
- Y más de 10,000 instituciones

---

## 📱 Ejecutar en Dispositivo Real

### iOS (iPhone/iPad)

1. Instala **Expo Go** desde App Store
2. Ejecuta `npm start` en la terminal
3. Escanea el código QR con la cámara
4. La app abrirá en Expo Go

### Android

1. Instala **Expo Go** desde Google Play
2. Ejecuta `npm start` en la terminal
3. Escanea el código QR desde la app Expo Go
4. La app abrirá automáticamente

### Emuladores

Para iOS (Mac requerido):
```bash
npm run ios
# Requiere Xcode instalado
```

Para Android:
```bash
npm run android
# Requiere Android Studio con emulador configurado
```

---

## 🔧 Solución de Problemas Comunes

### Error: "Firebase: No Firebase App '[DEFAULT]'"
- Verifica que copiaste correctamente las credenciales en `services/firebase.js`
- Asegúrate de haber reemplazado todos los valores placeholder (`TU_API_KEY_AQUI`)

### Error: "auth/configuration-not-found"
- Activa Email/Password en Firebase Authentication (paso 3 arriba)

### La app no carga después de login
- Verifica que Firestore esté creado y en modo prueba
- Revisa la consola del dispositivo para errores

### Plaid no conecta
- Verifica que las credenciales sean las del **Sandbox** (no Production)
- Usa `user_good` / `pass_good` como credenciales bancarias de prueba

---

## 💰 Costos

| Servicio | Costo |
|----------|-------|
| Firebase Spark Plan | **GRATIS** (hasta 1GB Firestore, 10K auth/mes) |
| Plaid Sandbox | **GRATIS** (sin límite para desarrollo) |
| Expo | **GRATIS** para desarrollo |
| Expo Go (testing) | **GRATIS** |
| App Store / Google Play | $99/año y $25 único respectivamente (solo si publicas) |

Para un uso personal/familiar, Firebase y Plaid **no tienen ningún costo**.

---

## 📞 Soporte

Si tienes problemas con la configuración:
- Revisa la documentación de [Firebase](https://firebase.google.com/docs)
- Revisa la documentación de [Plaid](https://plaid.com/docs)
- Abre un Issue en el repositorio de GitHub
