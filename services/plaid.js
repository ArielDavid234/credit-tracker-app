// Configuración de Plaid para Credit Tracker App
// Plaid permite conectar cuentas bancarias reales de EE.UU.
// Sandbox es GRATUITO para desarrollo y testing
// Para producción, requiere cuenta de pago
// Guía de configuración en SETUP_GUIDE.md

// Credenciales de Plaid Sandbox - USA TUS PROPIAS CREDENCIALES
// Para obtener estas credenciales:
// 1. Ve a https://dashboard.plaid.com/signup
// 2. Crea una cuenta gratuita
// 3. Ve a Team Settings > Keys
// 4. Copia el Client ID y Sandbox Secret
export const plaidConfig = {
  clientId: 'TU_PLAID_CLIENT_ID',
  secret: 'TU_PLAID_SANDBOX_SECRET',
  env: 'sandbox',              // Usar 'sandbox' para desarrollo (GRATIS)
  // Cambiar a 'development' o 'production' cuando estés listo para bancos reales
  baseUrl: 'https://sandbox.plaid.com',
};

// Productos de Plaid que necesitamos
// auth: números de cuenta y routing
// transactions: historial de transacciones
// liabilities: deudas de tarjetas de crédito
// identity: información del titular
export const plaidProducts = ['auth', 'transactions', 'liabilities'];

// Tipos de cuenta que conectaremos
export const plaidAccountTypes = ['depository', 'credit'];

// País (EE.UU.)
export const plaidCountryCodes = ['US'];

// Lenguaje de la interfaz de Plaid Link
export const plaidLanguage = 'es'; // Español

// Función para crear un Link Token (necesaria para abrir Plaid Link)
// Esto normalmente se hace desde el servidor backend
// Para sandbox podemos hacerlo desde el cliente con precaución
export const createLinkToken = async (userId) => {
  try {
    const response = await fetch(`${plaidConfig.baseUrl}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: plaidConfig.clientId,
        secret: plaidConfig.secret,
        client_name: 'Credit Tracker',
        country_codes: plaidCountryCodes,
        language: plaidLanguage,
        user: {
          client_user_id: userId,
        },
        products: plaidProducts,
      }),
    });

    const data = await response.json();
    return data.link_token;
  } catch (error) {
    console.error('Error creando Link Token de Plaid:', error);
    throw error;
  }
};

// Función para intercambiar el public token por un access token
// El access token se guarda en Firestore y se usa para consultar datos
export const exchangePublicToken = async (publicToken) => {
  try {
    const response = await fetch(`${plaidConfig.baseUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: plaidConfig.clientId,
        secret: plaidConfig.secret,
        public_token: publicToken,
      }),
    });

    const data = await response.json();
    return {
      accessToken: data.access_token,
      itemId: data.item_id,
    };
  } catch (error) {
    console.error('Error intercambiando token de Plaid:', error);
    throw error;
  }
};

// Función para obtener saldos de cuentas
export const getAccountBalances = async (accessToken) => {
  try {
    const response = await fetch(`${plaidConfig.baseUrl}/accounts/balance/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: plaidConfig.clientId,
        secret: plaidConfig.secret,
        access_token: accessToken,
      }),
    });

    const data = await response.json();
    return data.accounts;
  } catch (error) {
    console.error('Error obteniendo saldos de Plaid:', error);
    throw error;
  }
};

// Función para obtener transacciones
// startDate y endDate en formato 'YYYY-MM-DD'
export const getTransactions = async (accessToken, startDate, endDate) => {
  try {
    const response = await fetch(`${plaidConfig.baseUrl}/transactions/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: plaidConfig.clientId,
        secret: plaidConfig.secret,
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 100,  // Máximo de transacciones a obtener
          offset: 0,
        },
      }),
    });

    const data = await response.json();
    return data.transactions;
  } catch (error) {
    console.error('Error obteniendo transacciones de Plaid:', error);
    throw error;
  }
};

// Credenciales de prueba para Plaid Sandbox
// Usa estas credenciales cuando Plaid te pida login bancario en modo sandbox
export const sandboxTestCredentials = {
  username: 'user_good',
  password: 'pass_good',
  // Bancos de prueba disponibles en sandbox:
  // Chase, Bank of America, Wells Fargo, Citi, y más
};

export default plaidConfig;
