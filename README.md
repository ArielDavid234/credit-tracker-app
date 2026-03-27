# 💳 Credit Tracker App

Aplicación móvil para **iOS y Android** que permite monitorear todas tus tarjetas de crédito y cuentas bancarias en un solo lugar.

## 🚀 Características

- 📊 **Dashboard** - Resumen financiero completo con saldos, deudas y utilización de crédito
- 💳 **Tarjetas de Crédito** - Lista con saldo, límite, fecha de corte y pago mínimo
- 🏦 **Cuentas Bancarias** - Saldos de cuentas corrientes y de ahorro
- 💰 **Transacciones** - Historial de movimientos con categorías
- 🔔 **Alertas** - Notificaciones de pagos próximos y límites de crédito
- 👤 **Perfil** - Configuración del usuario
- 🔗 **Plaid Integration** - Conexión bancaria segura (sandbox gratuito)
- 🔐 **Firebase Auth** - Autenticación con email y contraseña

## 🛠️ Tecnologías (todas gratuitas)

| Tecnología | Uso |
|-----------|-----|
| React Native + Expo | Framework móvil (iOS & Android) |
| Firebase (Spark Plan) | Autenticación y base de datos |
| Plaid Sandbox | Conexión bancaria (gratuito para desarrollo) |
| React Navigation v6 | Navegación entre pantallas |
| React Native Paper | Componentes Material Design |
| @expo/vector-icons | Iconografía |

## 📋 Requisitos Previos

Antes de comenzar, necesitas tener instalado:

- **Node.js** versión 18 o superior → [nodejs.org](https://nodejs.org)
- **npm** o **yarn** (viene con Node.js)
- **Expo CLI** → Se instala con: `npm install -g @expo/cli`
- **Expo Go** (app en tu teléfono) → [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## ⚙️ Instalación

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/ArielDavid234/credit-tracker-app.git
cd credit-tracker-app
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un proyecto nuevo (gratis, plan Spark)
3. Agrega una **app web** en el proyecto
4. Copia las credenciales en `services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

5. En Firebase Console, activa:
   - **Authentication** → Sign-in providers → Email/Password ✅
   - **Firestore Database** → Crear base de datos (modo test por ahora)

### Paso 4: Configurar Plaid (opcional para desarrollo)

1. Crea cuenta gratuita en [dashboard.plaid.com](https://dashboard.plaid.com/signup)
2. Ve a **Team Settings → Keys**
3. Copia el **Client ID** y **Sandbox Secret** en `services/plaid.js`:

```javascript
export const plaidConfig = {
  clientId: 'tu-client-id',
  secret: 'tu-sandbox-secret',
  env: 'sandbox',
};
```

> ⚠️ El sandbox de Plaid es **completamente gratuito** para desarrollo y testing.

### Paso 5: Ejecutar la aplicación

```bash
# Iniciar el servidor de desarrollo
npm start

# Para iOS específicamente
npm run ios

# Para Android específicamente
npm run android
```

Luego escanea el código QR con la app **Expo Go** en tu teléfono.

## 📱 Cómo Usar la App

### Primera vez:
1. Abre la app y toca **"Regístrate aquí"**
2. Ingresa tu nombre, email y contraseña
3. ¡Listo! Verás el dashboard con datos de ejemplo

### Conectar tu banco:
1. Ve al Dashboard y toca el botón **"+"** arriba a la derecha
2. Selecciona **"Conectar con Plaid"**
3. Selecciona tu banco y ingresa tus credenciales bancarias
4. ¡Tus cuentas aparecerán automáticamente!

> 📝 **Nota**: Para usar Plaid con bancos reales necesitas configurar el ambiente de "production" (tiene costo). El sandbox usa cuentas de prueba.

## 📁 Estructura del Proyecto

```
credit-tracker-app/
├── App.js                    # Punto de entrada principal
├── app.json                  # Configuración de Expo
├── package.json              # Dependencias
├── babel.config.js           # Configuración de Babel
├── .gitignore                # Archivos ignorados por git
│
├── navigation/               # Navegación
│   ├── AppNavigator.js       # Navegador raíz (auth check)
│   └── MainTabNavigator.js   # Bottom Tab Navigator
│
├── screens/                  # Pantallas de la app
│   ├── LoginScreen.js        # Inicio de sesión
│   ├── RegisterScreen.js     # Registro de usuario
│   ├── DashboardScreen.js    # Dashboard principal
│   ├── CreditCardsScreen.js  # Lista de tarjetas
│   ├── BankAccountsScreen.js # Lista de cuentas bancarias
│   ├── AddAccountScreen.js   # Agregar cuenta/tarjeta
│   ├── TransactionsScreen.js # Historial de transacciones
│   ├── AlertsScreen.js       # Alertas y notificaciones
│   └── ProfileScreen.js      # Perfil y configuración
│
├── components/               # Componentes reutilizables
│   ├── CreditCardItem.js     # Tarjeta de crédito visual
│   ├── BankAccountItem.js    # Cuenta bancaria
│   ├── TransactionItem.js    # Fila de transacción
│   ├── AlertItem.js          # Fila de alerta
│   ├── BalanceSummary.js     # Resumen de saldos
│   └── LoadingSpinner.js     # Indicador de carga
│
├── services/                 # Servicios externos
│   ├── firebase.js           # Configuración Firebase ⚙️
│   ├── plaid.js              # Configuración Plaid ⚙️
│   ├── authService.js        # Login, registro, logout
│   ├── accountService.js     # CRUD cuentas y tarjetas
│   └── transactionService.js # Transacciones
│
└── constants/                # Constantes de la app
    ├── Colors.js             # Paleta de colores y tipografía
    └── mockData.js           # Datos de ejemplo/demo
```

## 🔥 Estructura de Firestore

Los datos se guardan en Firestore con esta estructura:

```
users/
  {userId}/
    ├── displayName, email, createdAt...
    ├── accounts/             # Cuentas bancarias
    │   └── {accountId}/
    ├── creditCards/          # Tarjetas de crédito
    │   └── {cardId}/
    ├── transactions/         # Transacciones
    │   └── {transactionId}/
    ├── alerts/               # Alertas
    │   └── {alertId}/
    └── plaidTokens/          # Tokens de conexión Plaid
        └── {tokenId}/
```

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

MIT License - Libre de usar y modificar.

---

⭐ Si este proyecto te fue útil, ¡dale una estrella en GitHub!
