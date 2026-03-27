// Datos de ejemplo (mock) para demostración de la app
// Estos datos simulan lo que vendría de Firebase/Plaid

// Usuario de ejemplo
export const mockUser = {
  uid: 'user123',
  email: 'demo@credittracker.com',
  displayName: 'Juan García',
  photoURL: null,
  createdAt: '2024-01-15',
};

// Tarjetas de crédito de ejemplo
export const mockCreditCards = [
  {
    id: 'card1',
    name: 'Chase Sapphire Preferred',
    bank: 'Chase',
    lastFour: '4532',
    balance: 1250.75,
    creditLimit: 10000,
    availableCredit: 8749.25,
    minimumPayment: 35.00,
    dueDate: '2024-02-15',
    closingDate: '2024-02-08',
    interestRate: 21.49,
    color: '#1565C0',
    network: 'Visa',
    rewards: 'Chase Ultimate Rewards',
  },
  {
    id: 'card2',
    name: 'Capital One Venture',
    bank: 'Capital One',
    lastFour: '7891',
    balance: 3420.00,
    creditLimit: 8000,
    availableCredit: 4580.00,
    minimumPayment: 68.00,
    dueDate: '2024-02-20',
    closingDate: '2024-02-13',
    interestRate: 19.99,
    color: '#C62828',
    network: 'Mastercard',
    rewards: 'Miles',
  },
  {
    id: 'card3',
    name: 'Discover it Cash Back',
    bank: 'Discover',
    lastFour: '2234',
    balance: 780.50,
    creditLimit: 5000,
    availableCredit: 4219.50,
    minimumPayment: 25.00,
    dueDate: '2024-02-25',
    closingDate: '2024-02-18',
    interestRate: 17.99,
    color: '#E65100',
    network: 'Discover',
    rewards: 'Cash Back 5%',
  },
];

// Cuentas bancarias de ejemplo
export const mockBankAccounts = [
  {
    id: 'account1',
    name: 'Chase Checking',
    bank: 'Chase',
    type: 'checking',
    lastFour: '9012',
    balance: 5432.18,
    availableBalance: 5432.18,
    routingNumber: '021000021',
    color: '#0277BD',
  },
  {
    id: 'account2',
    name: 'Chase Savings',
    bank: 'Chase',
    type: 'savings',
    lastFour: '3456',
    balance: 12750.00,
    availableBalance: 12750.00,
    routingNumber: '021000021',
    color: '#00695C',
  },
  {
    id: 'account3',
    name: 'Bank of America Checking',
    bank: 'Bank of America',
    type: 'checking',
    lastFour: '6789',
    balance: 2100.45,
    availableBalance: 1900.45,
    routingNumber: '026009593',
    color: '#B71C1C',
  },
];

// Transacciones de ejemplo
export const mockTransactions = [
  {
    id: 'txn1',
    accountId: 'card1',
    description: 'Amazon.com',
    amount: -85.99,
    date: '2024-01-28',
    category: 'Compras en línea',
    merchant: 'Amazon',
    status: 'completada',
    type: 'debito',
  },
  {
    id: 'txn2',
    accountId: 'card1',
    description: 'Starbucks',
    amount: -6.75,
    date: '2024-01-27',
    category: 'Restaurantes',
    merchant: 'Starbucks',
    status: 'completada',
    type: 'debito',
  },
  {
    id: 'txn3',
    accountId: 'account1',
    description: 'Nómina Directa',
    amount: 2500.00,
    date: '2024-01-26',
    category: 'Ingresos',
    merchant: 'Empleador XYZ',
    status: 'completada',
    type: 'credito',
  },
  {
    id: 'txn4',
    accountId: 'card2',
    description: 'Shell Gas Station',
    amount: -65.20,
    date: '2024-01-25',
    category: 'Gasolina',
    merchant: 'Shell',
    status: 'completada',
    type: 'debito',
  },
  {
    id: 'txn5',
    accountId: 'card1',
    description: 'Netflix',
    amount: -15.99,
    date: '2024-01-24',
    category: 'Entretenimiento',
    merchant: 'Netflix',
    status: 'completada',
    type: 'debito',
  },
  {
    id: 'txn6',
    accountId: 'account1',
    description: 'Walmart Grocery',
    amount: -125.43,
    date: '2024-01-23',
    category: 'Supermercado',
    merchant: 'Walmart',
    status: 'completada',
    type: 'debito',
  },
  {
    id: 'txn7',
    accountId: 'card3',
    description: 'Target',
    amount: -45.67,
    date: '2024-01-22',
    category: 'Compras',
    merchant: 'Target',
    status: 'completada',
    type: 'debito',
  },
  {
    id: 'txn8',
    accountId: 'account2',
    description: 'Transferencia a Ahorros',
    amount: -500.00,
    date: '2024-01-20',
    category: 'Transferencia',
    merchant: 'Chase',
    status: 'completada',
    type: 'debito',
  },
];

// Alertas de ejemplo
export const mockAlerts = [
  {
    id: 'alert1',
    type: 'pago_proximo',
    title: 'Pago próximo - Chase Sapphire',
    message: 'Tu pago mínimo de $35.00 vence en 3 días (15 Feb)',
    date: '2024-02-12',
    dueDate: '2024-02-15',
    amount: 35.00,
    accountId: 'card1',
    priority: 'alta',
    read: false,
  },
  {
    id: 'alert2',
    type: 'limite_credito',
    title: 'Uso alto de crédito - Capital One',
    message: 'Has usado el 42.75% de tu límite de crédito en Capital One Venture',
    date: '2024-02-10',
    accountId: 'card2',
    priority: 'media',
    read: false,
  },
  {
    id: 'alert3',
    type: 'pago_proximo',
    title: 'Pago próximo - Capital One',
    message: 'Tu pago mínimo de $68.00 vence el 20 Feb',
    date: '2024-02-08',
    dueDate: '2024-02-20',
    amount: 68.00,
    accountId: 'card2',
    priority: 'media',
    read: true,
  },
  {
    id: 'alert4',
    type: 'transaccion_grande',
    title: 'Transacción grande detectada',
    message: 'Se detectó una transacción de $500.00 en tu cuenta Chase Savings',
    date: '2024-01-20',
    accountId: 'account2',
    priority: 'baja',
    read: true,
  },
];

// Resumen financiero de ejemplo
export const mockFinancialSummary = {
  totalBalance: 20282.63,        // Total en cuentas bancarias
  totalDebt: 5451.25,            // Total deuda en tarjetas
  totalCreditLimit: 23000,       // Total límite de crédito
  availableCredit: 17548.75,     // Crédito disponible
  creditUtilization: 23.7,       // Porcentaje de utilización
  nextPaymentDue: '2024-02-15',  // Próximo pago
  nextPaymentAmount: 35.00,      // Monto del próximo pago
  monthlySpending: 345.03,       // Gasto del mes actual
};

// Categorías de gastos con iconos y colores
export const spendingCategories = [
  { name: 'Supermercado', icon: 'cart', color: '#4CAF50', amount: 125.43 },
  { name: 'Restaurantes', icon: 'food', color: '#FF9800', amount: 6.75 },
  { name: 'Gasolina', icon: 'car', color: '#F44336', amount: 65.20 },
  { name: 'Entretenimiento', icon: 'television', color: '#9C27B0', amount: 15.99 },
  { name: 'Compras', icon: 'shopping', color: '#2196F3', amount: 131.66 },
];

export default {
  mockUser,
  mockCreditCards,
  mockBankAccounts,
  mockTransactions,
  mockAlerts,
  mockFinancialSummary,
  spendingCategories,
};
