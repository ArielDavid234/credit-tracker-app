// Paleta de colores de la aplicación Credit Tracker
// Tema premium: dorado, beige cálido, carbón oscuro

export const Colors = {
  // Colores primarios (dorado premium)
  primary: '#B8974A',        // Dorado principal
  primaryLight: '#D4AF6A',   // Dorado claro
  primaryDark: '#8B6F2E',    // Dorado oscuro

  // Colores secundarios (carbón oscuro premium)
  secondary: '#2C2C2E',      // Carbón oscuro
  secondaryLight: '#48484A', // Carbón claro
  secondaryDark: '#1C1C1E',  // Carbón muy oscuro

  // Color de acento cálido
  accent: '#C9A96E',         // Dorado suave

  // Colores de estado
  success: '#5A7A4A',        // Verde oliva suave
  warning: '#C4943A',        // Ámbar cálido
  error: '#A94040',          // Rojo apagado premium
  info: '#4A6B8A',           // Azul acero suave
  // Neutros premium (beige/blanco cálido)
  white: '#FFFFFF',
  black: '#1C1C1E',
  background: '#F8F5F0',     // Beige muy claro / blanco cálido
  surface: '#FDFAF6',        // Superficie de tarjetas (blanco crema)
  surfaceCard: '#FDFAF6',    // Tarjetas
  border: '#E8DFD0',         // Bordes beige
  divider: '#F0EAE0',        // Divisores beige claro

  // Textos
  textPrimary: '#1C1C1E',    // Casi negro (carbón)
  textSecondary: '#6B6B70',  // Gris medio cálido
  textDisabled: '#AEAEB2',   // Gris claro
  textOnPrimary: '#FFFFFF',  // Texto sobre fondo dorado
  textGold: '#B8974A',       // Texto dorado

  // Tarjetas de crédito (colores premium)
  cardGold: '#B8974A',
  cardCharcoal: '#2C2C2E',
  cardCream: '#D4C5A9',
  cardBronze: '#8B6F2E',
  cardSilver: '#8E8E93',

  // Cuentas bancarias
  bankGold: '#B8974A',
  bankCharcoal: '#2C2C2E',
  bankBeige: '#C9A96E',
  bankBlue: '#4A6B8A',    // Retrocompatibilidad
};

// Tipografías
export const Typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
  small: { fontSize: 10 },
};

// Espaciados
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Bordes redondeados
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export default Colors;
