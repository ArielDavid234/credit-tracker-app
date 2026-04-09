# 🔧 Guía de Configuración de Servicios Externos

Esta guía te explica paso a paso cómo configurar Firebase y Plaid para que la app funcione con datos reales.

---

## 🚀 Inicio Rápido — Cómo Levantar la App (Paso a Paso para Principiantes)

> **¿Por qué mi app no arranca con `npx expo start`?**
> El motivo más frecuente es uno de estos tres problemas (están ordenados del más al menos común):

### ✅ Paso 1: Instalar dependencias (OBLIGATORIO antes del primer arranque)

Después de clonar el repositorio, **siempre** debes instalar las dependencias. Sin este paso, la app no puede correr:

```bash
cd credit-tracker-app
npm install
```

Espera hasta que termine (puede tardar 1-3 minutos). Verás algo como `added 1200 packages`.

### ✅ Paso 2: Levantar Expo con el modo correcto

**Para ver la app en el navegador (Chrome, Safari, etc.):**

```bash
npx expo start --web
```

Esto abre automáticamente `http://localhost:19006` en tu navegador.

**Para ver la app en iPad o iPhone (con Expo Go):**

```bash
npx expo start --lan --clear
```

> ⚠️ **Importante para iPad/iPhone:** Usa siempre `--lan` (no solo `npx expo start`). Sin `--lan`, Expo usa `127.0.0.1` (solo tu computadora) y el iPad no puede conectarse.

### ✅ Paso 3: Conectar el iPad (con Expo Go)

1. Instala **Expo Go** desde el App Store en tu iPad: [enlace directo](https://apps.apple.com/app/expo-go/id982107779)
2. Asegúrate de que el iPad y tu computadora estén en **la misma red Wi-Fi**
3. Ejecuta `npx expo start --lan --clear` en la terminal
4. Escanea el código QR que aparece en la terminal con la **cámara del iPad** (o desde la app Expo Go en iOS 16+)
5. La app abrirá automáticamente en Expo Go

### ❌ Errores más comunes y sus soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'expo/AppEntry'` | No se ejecutó `npm install` | Ejecutar `npm install` primero |
| `exp://127.0.0.1:8081` no conecta en iPad | Usando localhost en vez de LAN | Usar `npx expo start --lan --clear` |
| `Network response timed out` en iPad | iPad y PC en redes distintas | Conectar ambos al mismo Wi-Fi |
| Puerto 8081 ocupado | Otro proceso usa ese puerto | Ejecutar `npx expo start --port 8082` |
| App en blanco / pantalla negra | Caché de Metro corrupta | Ejecutar `npx expo start --clear` |

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

### Error: "Could not connect to the server. exp://127.0.0.1:8081"

Este es el error más frecuente al usar Expo Go desde un iPad/iPhone o emulador. Sigue este checklist:

1. **Instalar dependencias primero** — Luego de clonar el repo, siempre ejecutar:
   ```bash
   npm install
   ```
   Si `node_modules/` no existe, Metro no puede arrancar.

2. **Limpiar caché y levantar con LAN** — Usar red local (LAN) en vez de localhost:
   ```bash
   npx expo start --lan --clear
   ```
   Con `--lan`, Expo usa la IP real de tu computadora (ej. `192.168.x.x`) en lugar de `127.0.0.1`, lo que permite que dispositivos físicos (iPad, iPhone) se conecten.

3. **Misma red Wi-Fi** — El iPad y la computadora deben estar en **la misma red Wi-Fi**. Las redes separadas (ej. 5GHz vs 2.4GHz) pueden bloquear la conexión.

4. **Firewall del sistema** — Si hay un firewall activo (macOS, Windows), debe permitir conexiones en el puerto **8081 (TCP)**. En macOS, al ejecutar Metro por primera vez aparece un diálogo de permiso — hacer clic en **"Permitir"**.

5. **Puerto 8081 ocupado** — Verificar si otro proceso usa el puerto:
   ```bash
   lsof -i :8081
   # Si hay un proceso, terminarlo:
   kill -9 <PID>
   ```
   Luego volver a ejecutar `npx expo start --clear`.

6. **Alternativa — modo tunnel** — Si el LAN sigue fallando, usar ngrok tunnel (requiere cuenta gratuita en ngrok.com):
   ```bash
   npx expo start --tunnel --clear
   ```
   Esto funciona aunque el iPad esté en otra red.

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
