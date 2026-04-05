// Paleta de colores de la aplicación Credit Tracker
// Tema premium: dorado, beige cálido, carbón

export const Colors = {
  // Colores primarios — dorado premium
  primary: '#B8974A',        // Dorado principal
  primaryLight: '#CEB06A',   // Dorado claro
  primaryDark: '#8B6E2E',    // Dorado oscuro

  // Colores secundarios — carbón elegante
  secondary: '#2C2C2E',      // Carbón oscuro
  secondaryLight: '#48484A', // Carbón claro
  secondaryDark: '#1C1C1E',  // Casi negro

  // Colores de acento
  accent: '#B8974A',         // Dorado (igual que primary)

  // Colores de estado
  success: '#4CAF7A',        // Verde salvia
  warning: '#E8A740',        // Ámbar cálido
  error: '#C0392B',          // Rojo profundo
  info: '#4A6B8A',           // Azul marino suave

  // Neutros cálidos
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8F5F0',     // Beige muy claro (fondo principal)
  surface: '#FDFAF6',        // Blanco cálido (tarjetas)
  surfaceCard: '#FFFFFF',    // Blanco puro
  border: '#E8DFD0',         // Beige borde
  divider: '#EDE8E0',        // Divisores beige

  // Textos
  textPrimary: '#1A1A2E',    // Casi negro azulado
  textSecondary: '#6B6B7A',  // Gris medio
  textDisabled: '#B0AEBB',   // Gris claro
  textOnPrimary: '#FFFFFF',  // Texto sobre dorado

  // Tarjetas de crédito
  cardBlue: '#1A3A5C',
  cardGreen: '#2D6A4F',
  cardPurple: '#4A1942',
  cardOrange: '#A0522D',
  cardGold: '#B8974A',

  // Cuentas bancarias
  bankBlue: '#1A3A5C',
  bankGreen: '#2D6A4F',
  bankGray: '#48484A',

  // Beige y crema para fondos especiales
  beige: '#F0E8DA',
  cream: '#FAF7F2',
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
